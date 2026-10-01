# 回填上游 params.functions_and_methods 到译文页。说明见同目录 backfill-signatures.md
# 幂等策略：总是删除旧的 [params.functions_and_methods] 块再重建，因此可反复运行（也可用于修正数据）。
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$enRoot = Join-Path $root 'hugoDocs\content\en'
$zhRoot = Join-Path $root 'hugo-docs-zh\content'

function Parse-FlowList([string]$raw) {
  $s = $raw.Trim()
  if ($s.StartsWith('[')) { $s = $s.Substring(1) }
  if ($s.EndsWith(']')) { $s = $s.Substring(0, $s.Length - 1) }
  $items = New-Object System.Collections.Generic.List[string]
  $cur = ''
  $inQuote = $false
  foreach ($ch in $s.ToCharArray()) {
    if ($ch -eq "'") { $inQuote = -not $inQuote; $cur += $ch; continue }
    if ($ch -eq ',' -and -not $inQuote) { if ($cur.Trim()) { $items.Add($cur.Trim()) }; $cur = ''; continue }
    $cur += $ch
  }
  if ($cur.Trim()) { $items.Add($cur.Trim()) }
  $out = @()
  foreach ($it in $items) {
    $v = $it.Trim()
    if ($v.Length -ge 2 -and $v.StartsWith("'") -and $v.EndsWith("'")) { $v = $v.Substring(1, $v.Length - 2).Replace("''", "'") }
    elseif ($v.Length -ge 2 -and $v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Substring(1, $v.Length - 2) }
    $out += $v
  }
  # 必须用 ,$out 强制返回数组：单元素时 PowerShell 会退化成字符串，[0] 会取到首字母
  return ,$out
}

function To-TomlString([string]$v) { '"' + ($v -replace '"', '\"') + '"' }

$updated = 0
foreach ($section in @('functions', 'methods')) {
  $enDir = Join-Path $enRoot $section
  if (-not (Test-Path $enDir)) { continue }
  Get-ChildItem $enDir -Recurse -File -Filter '*.md' | ForEach-Object {
    $en = $_
    $rel = $en.FullName.Substring($enRoot.Length).TrimStart('\')
    $zhPath = Join-Path $zhRoot $rel
    if (-not (Test-Path $zhPath)) { return }

    $enLines = @(Get-Content -LiteralPath $en.FullName -Encoding UTF8)
    $sig = $null; $ret = $null; $al = $null
    $limit = [Math]::Min(40, $enLines.Count)
    for ($i = 0; $i -lt $limit; $i++) {
      $l = $enLines[$i]
      if ($l -match "^\s{4}signatures:\s*(.+)$") { $sig = Parse-FlowList $Matches[1] }
      elseif ($l -match "^\s{4}returnType:\s*(.+)$") { $ret = (Parse-FlowList $Matches[1])[0] }
      elseif ($l -match "^\s{4}aliases:\s*(.+)$") { $al = Parse-FlowList $Matches[1] }
    }
    if (-not $sig -and -not $ret -and -not $al) { return }

    $zhLines = @(Get-Content -LiteralPath $zhPath -Encoding UTF8)
    $close = -1
    for ($i = 1; $i -lt $zhLines.Count; $i++) { if ($zhLines[$i].Trim() -eq '+++') { $close = $i; break } }
    if ($close -lt 0) { Write-Warning "front matter 未闭合: $rel"; return }

    # 取前置元数据主体，剔除旧的签名块
    $fm = @($zhLines[0..($close - 1)])
    $kept = New-Object System.Collections.Generic.List[string]
    $skipping = $false
    foreach ($line in $fm) {
      if ($line -match '^\[params\.functions_and_methods\]') { $skipping = $true; continue }
      if ($skipping -and $line -match '^\s*\[') { $skipping = $false }
      if (-not $skipping) { $kept.Add($line) }
    }
    while ($kept.Count -gt 0 -and $kept[$kept.Count - 1].Trim() -eq '') { $kept.RemoveAt($kept.Count - 1) }

    $toml = @('[params.functions_and_methods]')
    if ($sig) { $toml += 'signatures = [' + (($sig | ForEach-Object { To-TomlString $_ }) -join ', ') + ']' }
    if ($ret) { $toml += 'returnType = ' + (To-TomlString $ret) }
    if ($al) { $toml += 'aliases = [' + (($al | ForEach-Object { To-TomlString $_ }) -join ', ') + ']' }

    $new = @()
    $new += $kept
    $new += ''
    $new += $toml
    $new += $zhLines[$close]
    if ($close + 1 -lt $zhLines.Count) { $new += $zhLines[($close + 1)..($zhLines.Count - 1)] }
    Set-Content -LiteralPath $zhPath -Value $new -Encoding UTF8
    $updated++
  }
}
Write-Output "已处理页面: $updated"
