# 站内链接检查（大小写敏感）。
# 动机：Hugo 生成的 URL 全小写，而内容里若写 /functions/urls/absURL/ 会 404；
# 大小写不敏感的检查器会漏报（本仓库此前就漏了 6 条）。
# 用法：pwsh -File .translation/audit-links-case.ps1
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root 'hugo-docs-zh\public'
if (-not (Test-Path $pub)) { Write-Output "没有 public/，先构建：cd hugo-docs-zh; hugo"; exit 2 }

# 1) 已发布路径的「精确大小写」集合：目录（含 index.html）与文件
$dirs = [System.Collections.Generic.HashSet[string]]::new()
$files = [System.Collections.Generic.HashSet[string]]::new()
Get-ChildItem $pub -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
  $rel = '/' + $_.FullName.Substring($pub.Length).TrimStart('\').Replace('\', '/')
  [void]$files.Add($rel)
  if ($_.Name -eq 'index.html') { [void]$dirs.Add($rel.Substring(0, $rel.Length - 'index.html'.Length)) }
}
$lower = @{}
foreach ($d in $dirs) { $lower[$d.ToLower()] = $d }

# 2) 扫 HTML 里的站内链接
$bad = @{}
$checked = 0
Get-ChildItem $pub -Recurse -File -Filter '*.html' | ForEach-Object {
  $html = Get-Content $_.FullName -Raw
  $src = '/' + $_.FullName.Substring($pub.Length).TrimStart('\').Replace('\', '/')
  foreach ($m in [regex]::Matches($html, '(?:href|src)="(/[^"#?]*)(?:[#?][^"]*)?"')) {
    $u = $m.Groups[1].Value
    $checked++
    if ($dirs.Contains($u) -or $files.Contains($u)) { continue }
    $alt = if ($u.EndsWith('/')) { $u } else { "$u/" }
    if ($dirs.Contains($alt)) { continue }
    # 大小写不敏感地找正确写法，便于直接改
    $fix = $null
    if ($lower.ContainsKey($u.ToLower())) { $fix = $lower[$u.ToLower()] }
    elseif ($lower.ContainsKey($alt.ToLower())) { $fix = $lower[$alt.ToLower()] }
    $key = "$u|$fix"
    if (-not $bad.ContainsKey($key)) { $bad[$key] = @{ url = $u; fix = $fix; pages = [System.Collections.Generic.List[string]]::new() } }
    [void]$bad[$key].pages.Add($src)
  }
}

Write-Output "扫描 HTML $((Get-ChildItem $pub -Recurse -File -Filter '*.html' | Measure-Object).Count) 个；站内链接 $checked 条"
Write-Output "大小写/存在性问题：$($bad.Count) 条"
Write-Output ""
foreach ($k in $bad.Keys | Sort-Object) {
  $e = $bad[$k]
  Write-Output ("  ✗ {0}" -f $e.url)
  Write-Output ("      应为: {0}" -f $(if ($e.fix) { $e.fix } else { '（无同名目标，是真死链）' }))
  Write-Output ("      出现于: {0}" -f (($e.pages | Select-Object -Unique | Select-Object -First 3) -join '  '))
}
if ($bad.Count -eq 0) { Write-Output "  全部站内链接大小写与存在性均正确 ✓" }
