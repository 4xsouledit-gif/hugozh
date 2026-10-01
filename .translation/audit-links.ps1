# 站内链接检查：扫描 public 下 HTML 的根相对链接，验证目标文件/目录是否存在（不校验锚点）。
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'hugo-docs-zh\public'
if (-not (Test-Path $pub)) { Write-Output "public/ 不存在，请先构建"; exit 1 }

$files = @(Get-ChildItem $pub -Recurse -File -Filter '*.html')
$bad = @{}
$total = 0
foreach ($f in $files) {
  $html = Get-Content -LiteralPath $f.FullName -Raw
  foreach ($m in [regex]::Matches($html, 'href="(/[^"#?]*)(#[^"]*)?"')) {
    $path = $m.Groups[1].Value
    $total++
    $rel = $path.TrimStart('/') -replace '/', '\'
    $cand = Join-Path $pub $rel
    $ok = $false
    if (Test-Path -LiteralPath $cand -PathType Leaf) { $ok = $true }
    elseif (Test-Path -LiteralPath (Join-Path $cand 'index.html')) { $ok = $true }
    if (-not $ok) {
      $parts = $path.Trim('/') -split '/'
      $key = if ($parts.Count -ge 2) { ($parts[0..1] -join '/') } else { $parts[0] }
      if (-not $bad.ContainsKey($key)) { $bad[$key] = New-Object System.Collections.Generic.List[string] }
      $bad[$key].Add($path)
    }
  }
}
$badTotal = 0
foreach ($v in $bad.Values) { $badTotal += $v.Count }
Write-Output "扫描 HTML $($files.Count) 个；内部链接 $total 条；指向不存在目标 $badTotal 条"
Write-Output ""
if ($badTotal -eq 0) { Write-Output "全部站内链接均可解析 ✓" }
else {
  $bad.GetEnumerator() | Sort-Object { -($_.Value.Count) } | Select-Object -First 15 | ForEach-Object {
    "  {0,-26} {1,4} 条   例: {2}" -f $_.Key, $_.Value.Count, $_.Value[0]
  }
}
