# 归一化章节首页（*/*/_index.md）的 weight：父目录下按字母序 10×n，幂等。
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$contentRoot = Join-Path $root 'hugo-docs-zh\content'

$changed = 0
foreach ($parent in @('functions', 'methods', 'quick-reference', 'content-management', 'configuration')) {
  $pdir = Join-Path $contentRoot $parent
  if (-not (Test-Path $pdir)) { continue }
  $dirs = @(Get-ChildItem $pdir -Directory | Sort-Object Name)
  if ($dirs.Count -lt 2) { continue }
  $i = 0
  foreach ($d in $dirs) {
    $i++
    $idx = Join-Path $d.FullName '_index.md'
    if (-not (Test-Path $idx)) { continue }
    $w = $i * 10
    $lines = @(Get-Content -LiteralPath $idx -Encoding UTF8)
    $hit = $false
    for ($j = 0; $j -lt $lines.Count; $j++) {
      if ($lines[$j] -match '^weight\s*=\s*\d+\s*$') {
        if ($lines[$j] -ne "weight = $w") { $lines[$j] = "weight = $w"; $hit = $true }
      }
    }
    if ($hit) { Set-Content -LiteralPath $idx -Value $lines -Encoding UTF8; $changed++; Write-Output ("  {0}/{1} -> {2}" -f $parent, $d.Name, $w) }
  }
}
Write-Output "已调整 $changed 个章节首页 weight"
