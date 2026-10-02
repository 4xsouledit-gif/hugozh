# 教学层审计：统计教学块的覆盖率与完整度。
# 只读，不写任何文件；幂等，随时可跑。
# 用法：
#   pwsh -NoProfile -File .translation/audit-teach.ps1              # 全站概览 + 按章节明细
#   pwsh -NoProfile -File .translation/audit-teach.ps1 -Section getting-started
#   pwsh -NoProfile -File .translation/audit-teach.ps1 -List         # 列出每一页的明细
# 退出码：0 = 通过；1 = 用 -Strict 且教程章节存在缺教学块的页面。
#
# 计数口径注意：数组元素里允许写 Markdown 链接（如 ["见 [入门](/getting-started/)"]），
# 因此**不能用非贪婪正则找第一个 `]`**——那会在链接的 `]` 处提前结束、把整页误判为「无前置」。
# 这里用逐字符扫描找配对的 `]`，并跳过字符串内部的括号。
param(
  [string]$Section = '',
  [switch]$Strict,
  [switch]$List
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$zhRoot = Join-Path $root 'hugo-docs-zh\content'

# 「教程 / 上手」性质章节：教学块覆盖按严格口径要求
$tutorialSections = @('getting-started', 'installation', 'troubleshooting')

function Get-FrontMatter {
  param([string]$Raw)
  if (-not $Raw.StartsWith('+++')) { return $null }
  $i = $Raw.IndexOf("`n")
  if ($i -lt 0) { return $null }
  $j = $Raw.IndexOf("`n+++", $i)
  if ($j -lt 0) { return $null }
  return $Raw.Substring($i + 1, $j - $i - 1)
}

# 求 `key =[ ... ]` 中数组的元素个数：从 `[` 起逐字符找配对的 `]`
function Get-ArrayCount {
  param([string]$Fm, [string]$Key)
  $m = [regex]::Match($Fm, "(?m)^\s*" + [regex]::Escape($Key) + "\s*=\s*\[")
  if (-not $m.Success) { return 0 }
  $k = $m.Index + $m.Length - 1        # 指向 `[`
  $depth = 0; $inStr = $false; $esc = $false; $count = 0; $sawNonWs = $false
  for ($p = $k; $p -lt $Fm.Length; $p++) {
    $c = $Fm[$p]
    if ($inStr) {
      if ($esc) { $esc = $false; continue }
      if ($c -eq '\') { $esc = $true; continue }
      if ($c -eq '"') { $inStr = $false; $count++ }
      continue
    }
    if ($c -eq '"') { $inStr = $true; $sawNonWs = $true; continue }
    if ($c -eq '[') { $depth++; continue }
    if ($c -eq ']') { $depth--; if ($depth -eq 0) { break }; continue }
    if ($c -match '[^,\s]') { $sawNonWs = $true }
  }
  return $count
}

function Get-TeachInfo {
  param([string]$Path)
  $raw = Get-Content -LiteralPath $Path -Raw -Encoding utf8
  $fm = Get-FrontMatter $raw
  if (-not $fm) { return [pscustomobject]@{ HasTeach = $false; Difficulty = $false; Time = $false; Prereq = 0; Outcomes = 0; Next = 0; Legacy = $false } }
  $hasTeach = [bool]([regex]::IsMatch($fm, '(?m)^\s*\[(params\.)?teach\]\s*$'))
  $legacy = [bool]([regex]::IsMatch($fm, '(?m)^\s*\[teach\]\s*$'))
  [pscustomobject]@{
    HasTeach   = $hasTeach
    Difficulty = [bool]([regex]::IsMatch($fm, '(?m)^\s*difficulty\s*='))
    Time       = [bool]([regex]::IsMatch($fm, '(?m)^\s*time\s*='))
    Prereq     = Get-ArrayCount $fm 'prereq'
    Outcomes   = Get-ArrayCount $fm 'outcomes'
    Next       = (Get-ArrayCount $fm 'next') + (Get-ArrayCount $fm 'readAfter')
    Legacy     = $legacy
  }
}

$dirs = Get-ChildItem $zhRoot -Directory | Sort-Object Name
if ($Section) { $dirs = $dirs | Where-Object { $_.Name -eq $Section } }

$rows = @()
foreach ($d in $dirs) {
  $files = @(Get-ChildItem $d.FullName -Recurse -File -Filter '*.md')
  $teach = 0; $withDiff = 0; $withTime = 0; $withPrereq = 0; $withOutcome = 0; $withNext = 0; $legacy = 0
  foreach ($f in $files) {
    $i = Get-TeachInfo $f.FullName
    if ($i.HasTeach) { $teach++ }
    if ($i.Difficulty) { $withDiff++ }
    if ($i.Time) { $withTime++ }
    if ($i.Prereq -gt 0) { $withPrereq++ }
    if ($i.Outcomes -gt 0) { $withOutcome++ }
    if ($i.Next -gt 0) { $withNext++ }
    if ($i.Legacy) { $legacy++ }
    if ($List -and $i.HasTeach) {
      Write-Output ("  {0,-58} 前{1} 目{2} 次{3}{4}" -f $f.FullName.Substring($d.FullName.Length + 1), $i.Prereq, $i.Outcomes, $i.Next, $(if ($i.Legacy) { '  [旧写法]' } else { '' }))
    }
  }
  $rows += [pscustomobject]@{
    Section = $d.Name; Pages = $files.Count; Teach = $teach
    Diff = $withDiff; Time = $withTime; Prereq = $withPrereq; Outcome = $withOutcome; Next = $withNext; Legacy = $legacy
  }
}

Write-Output "章节                  页数  教学块  难度  用时  前置  目标 接着读 旧写法"
Write-Output ("-" * 76)
foreach ($r in $rows) {
  Write-Output ("{0,-20} {1,4} {2,6} {3,5} {4,5} {5,5} {6,5} {7,6} {8,6}" -f $r.Section, $r.Pages, $r.Teach, $r.Diff, $r.Time, $r.Prereq, $r.Outcome, $r.Next, $r.Legacy)
}
$tp = ($rows | Measure-Object -Property Pages -Sum).Sum
$tt = ($rows | Measure-Object -Property Teach -Sum).Sum
$tl = ($rows | Measure-Object -Property Legacy -Sum).Sum
Write-Output ("-" * 76)
Write-Output ("{0,-20} {1,4} {2,6}   覆盖率 {3:P1}；旧写法 [teach] {4} 页" -f '合计', $tp, $tt, ($(if ($tp) { $tt / $tp } else { 0 })), $tl)

$fail = 0
foreach ($s in $tutorialSections) {
  $r = $rows | Where-Object { $_.Section -eq $s }
  if (-not $r) { continue }
  $missing = $r.Pages - $r.Teach
  if ($missing -gt 0) {
    $fail += $missing
    Write-Output ("[教程章节] {0}: {1}/{2} 页缺教学块" -f $s, $missing, $r.Pages)
  }
}
if ($Strict -and $fail -gt 0) {
  Write-Output "严格模式：教程章节仍有 $fail 页缺教学块 → 失败"
  exit 1
}
exit 0
