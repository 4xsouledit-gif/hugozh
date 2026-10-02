# 覆盖率审计：逐节对比上游 en 目录与本站同路径目录，列出缺失/多余文件。幂等，随时可跑。
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$enRoot = Join-Path $root 'hugoDocs\content\en'
$zhRoot = Join-Path $root 'hugo-docs-zh\content'

$sections = @('functions', 'methods', 'news', 'quick-reference\glossary')
$totalMissing = 0
foreach ($s in $sections) {
  $en = Join-Path $enRoot $s
  if (-not (Test-Path $en)) { continue }
  $enFiles = @(Get-ChildItem $en -Recurse -File -Filter '*.md' | ForEach-Object { $_.FullName.Substring($en.Length).TrimStart('\') } | Sort-Object)
  $zhDir = Join-Path $zhRoot $s
  $zhFiles = @()
  if (Test-Path $zhDir) {
    $zhFiles = @(Get-ChildItem $zhDir -Recurse -File -Filter '*.md' | ForEach-Object { $_.FullName.Substring($zhDir.Length).TrimStart('\') } | Sort-Object)
  }
  $missing = @($enFiles | Where-Object { $zhFiles -notcontains $_ })
  $extra = @($zhFiles | Where-Object { $enFiles -notcontains $_ })
  $totalMissing += $missing.Count
  Write-Output ("{0,-26} 上游 {1,3}  已译 {2,3}  缺 {3,3}  多 {4}" -f $s, $enFiles.Count, $zhFiles.Count, $missing.Count, $extra.Count)
  if ($missing.Count) { $missing | Select-Object -First 15 | ForEach-Object { "    缺: $_" } }
  if ($extra.Count) { $extra | Select-Object -First 8 | ForEach-Object { "    多: $_" } }
}
Write-Output ""
Write-Output "四节合计缺失: $totalMissing"
