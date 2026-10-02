# 一次性迁移脚本：把教学块归一为规范写法。
#
# 背景：教学块刚落地时存在两种写法，且其中一种会把 `source` 吞进表里：
#   A) 顶层 [teach] 表，且 source 写在表之后 → source 变成 teach.source（页脚丢失原文链接）
#   B) 顶层 [teach] 表，source 在表之前 → 能渲染，但键名不统一
#   C) 裸键 difficulty/time/prereq/outcomes/readAfter 直接跟在 source 之后 → 这些键落在
#      front matter 根部（成为 .Params.difficulty），教学面板读 .Params.teach 会取不到
# 本脚本把 A/B/C 统一成：
#   [params.teach]（位置在最后一个标量键之后） + 键名 next（readAfter 的规范名）
#
# 安全措施：
#   - 先把改动前的所有文件复制到 -Backup 目录；
#   - 每个文件改完后校验：六个标量键齐全、恰好一个 teach 表、括号内的标量键已全部移出；
#   - 任何一项不满足就跳过该文件并在报告里列出（不写入）。
# 用法：
#   pwsh -NoProfile -File .translation/normalize-teach.ps1            # 预览（默认不写）
#   pwsh -NoProfile -File .translation/normalize-teach.ps1 -Apply     # 实际写入
param(
  [switch]$Apply
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$contentRoot = Join-Path $root 'hugo-docs-zh\content'
$backupRoot = Join-Path $root '.translation\.teach-migration-backup'
$scalarKeys = @('title', 'linkTitle', 'description', 'date', 'weight', 'source', 'aliases', 'draft', 'publishDate', 'expiryDate', 'lastmod', 'noindex')
$teachKeys = @('difficulty', 'time', 'prereq', 'outcomes', 'readAfter', 'next')

# 去掉数组两端的空行。
# 注意：不能用 `$a = $a[0..($a.Count-2)]` —— 只剩 1 个元素时，`$a[0..-1]` 在 PowerShell 里会
# 索引到最后一个元素（返回原数组），循环永不结束。这正是本脚本第一版卡死的原因。
function Trim-Blank {
  param([string[]]$Lines)
  $out = @($Lines)
  while ($out.Count -gt 0 -and [string]::IsNullOrWhiteSpace([string]$out[0])) { $out = if ($out.Count -le 1) { @() } else { $out[1..($out.Count - 1)] } }
  while ($out.Count -gt 0 -and [string]::IsNullOrWhiteSpace([string]$out[-1])) { $out = if ($out.Count -le 1) { @() } else { $out[0..($out.Count - 2)] } }
  return $out
}

function Split-Front {
  param([string]$Raw)
  if (-not $Raw.StartsWith('+++')) { return $null }
  $i = $Raw.IndexOf("`n")
  if ($i -lt 0) { return $null }
  $j = $Raw.IndexOf("`n+++", $i)
  if ($j -lt 0) { return $null }
  return [pscustomobject]@{
    Fm   = $Raw.Substring($i + 1, $j - $i - 1)
    Rest = $Raw.Substring($j)      # 含结尾的 \n+++
  }
}

$files = Get-ChildItem $contentRoot -Recurse -File -Filter '*.md'
# 性能：先把范围缩到「含教学块」的文件（用 Select-String 一次扫完全树），
# 否则对 948 个文件逐个做 PowerShell 字符串循环会慢到不可接受。
$candidates = @(Select-String -Path (Join-Path $contentRoot '*.md'), (Join-Path $contentRoot '*\*.md'), (Join-Path $contentRoot '*\*\*.md'), (Join-Path $contentRoot '*\*\*\*.md') -Pattern '(?m)^\[(params\.)?teach\]' -List -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty Path -Unique)
Write-Output ("扫描范围：{0} 个含教学块的文件（全树 {1} 个 .md）" -f $candidates.Count, $files.Count)
$files = $files | Where-Object { $candidates -contains $_.FullName }
$changed = @(); $skipped = @()

foreach ($f in $files) {
  $raw = [System.IO.File]::ReadAllText($f.FullName)
  $parts = Split-Front $raw
  if (-not $parts) { continue }
  $fm = $parts.Fm
  $lines = $fm -split "`n"

  # 解析出「标量键行」与「教学键行」，其余（表头/空行/其它表）保持相对顺序
  $scalarLines = New-Object System.Collections.ArrayList
  $teachLines = New-Object System.Collections.ArrayList
  $otherLines = New-Object System.Collections.ArrayList
  $hasLegacyTable = $false
  $hasParamsTable = $false
  $inTeach = $false
  $inOtherTable = $false
  foreach ($line in $lines) {
    $t = $line.Trim()
    if ($t -match '^\[(.+)\]\s*$') {
      $name = $Matches[1].Trim()
      if ($name -eq 'teach') { $inTeach = $true; $inOtherTable = $false; $hasLegacyTable = $true; continue }
      if ($name -eq 'params.teach') { $inTeach = $true; $inOtherTable = $false; $hasParamsTable = $true; continue }
      $inTeach = $false; $inOtherTable = $true
      [void]$otherLines.Add($line); continue
    }
    $km = [regex]::Match($t, '^([A-Za-z_][A-Za-z0-9_-]*)\s*=')
    if ($km.Success -and -not $inOtherTable) {
      $key = $km.Groups[1].Value
      if ($teachKeys -contains $key) { [void]$teachLines.Add($line); continue }
      if ($inTeach) { [void]$teachLines.Add($line); continue }   # 表内未知键一并搬进教学表
      if ($scalarKeys -contains $key) { [void]$scalarLines.Add($line); continue }
      # 既非已知标量也非教学键：保守起见，属于 teach 表内则搬走，否则留在原位
      if ($inTeach) { [void]$teachLines.Add($line) } else { [void]$scalarLines.Add($line) }
      continue
    }
    if ($inTeach) { [void]$teachLines.Add($line); continue }
    [void]$otherLines.Add($line)
  }

  if ($teachLines.Count -eq 0) { continue }               # 没有教学块

  # 键名归一并去掉行尾空白
  $teachOut = @()
  foreach ($line in $teachLines) {
    $norm = ($line -replace '^(\s*)readAfter(\s*=)', '$1next$2').TrimEnd()
    $teachOut += $norm
  }
  # 去掉教学块前后的空行，并统一去掉行尾空白，稍后统一补一个空行
  $scalarOut = @($scalarLines | ForEach-Object { ([string]$_).TrimEnd() })
  $otherOut = @($otherLines | ForEach-Object { ([string]$_).TrimEnd() })
  $teachOut = @(Trim-Blank $teachOut)
  $scalarOut = @(Trim-Blank $scalarOut)
  $otherOut = @(Trim-Blank $otherOut)

  $newFm = (@($scalarOut) + @('') + @('[params.teach]') + @($teachOut) + @($otherOut)) -join "`n"
  $newFm = $newFm.TrimEnd("`n") + "`n"
  $newRaw = "+++`n" + $newFm + $parts.Rest.Substring($parts.Rest.IndexOf("`n"))   # Rest 从 \n+++ 开始，保留尾部

  # ---- 校验 ----
  $problems = @()
  foreach ($k in @('title', 'linkTitle', 'description', 'date', 'weight', 'source')) {
    if (-not [regex]::IsMatch($newFm, "(?m)^\s*$([regex]::Escape($k))\s*=")) { $problems += "缺标量键 $k" }
  }
  if (([regex]::Matches($newFm, '(?m)^\[(params\.)?teach\]\s*$')).Count -ne 1) { $problems += "teach 表数量不为 1" }
  if ([regex]::IsMatch($newFm, '(?m)^\[teach\]\s*$')) { $problems += "仍存在顶层 [teach]" }
  if ([regex]::IsMatch($newFm, '(?m)^\s*readAfter\s*=')) { $problems += "仍存在 readAfter" }
  # 表头之前不得出现教学键（否则说明还有裸键漏在教学键区外）
  $firstTable = $newFm.IndexOf('[params.teach]')
  $head = $newFm.Substring(0, $firstTable)
  foreach ($k in $teachKeys) {
    if ([regex]::IsMatch($head, "(?m)^\s*$([regex]::Escape($k))\s*=")) { $problems += "标量区残留 $k" }
  }
  if ($problems.Count) { $skipped += "{0}: {1}" -f $f.FullName.Substring($contentRoot.Length + 1), ($problems -join '；'); continue }

  if ($newRaw -ne $raw) { $changed += [pscustomobject]@{ Path = $f.FullName; New = $newRaw; Old = $raw } }
}

Write-Output ("需要迁移: {0} 个文件；跳过: {1} 个" -f $changed.Count, $skipped.Count)
foreach ($s in $skipped) { Write-Output ("  跳过 $s") }
if (-not $Apply) {
  Write-Output "预览模式：未写入任何文件。加 -Apply 执行。"
  foreach ($c in $changed) { Write-Output ("  待改: " + $c.Path.Substring($contentRoot.Length + 1)) }
  exit 0
}

New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
foreach ($c in $changed) {
  $rel = $c.Path.Substring($contentRoot.Length + 1)
  $bak = Join-Path $backupRoot $rel
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $bak) | Out-Null
  [System.IO.File]::WriteAllText($bak, $c.Old, (New-Object System.Text.UTF8Encoding($false)))
  [System.IO.File]::WriteAllText($c.Path, $c.New, (New-Object System.Text.UTF8Encoding($false)))
}
Write-Output ("已迁移 {0} 个文件；改动前副本在 {1}" -f $changed.Count, $backupRoot)
