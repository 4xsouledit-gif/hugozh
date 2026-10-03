# 一键验收：覆盖率 → 权重归一 → 签名回填 → 严格构建 → 站内链接 → 铁律扫描
# 用法：pwsh -File .translation/accept.ps1
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Output "══════ 1. 覆盖率（与上游 1:1）══════"
& (Join-Path $PSScriptRoot 'audit-coverage.ps1') | Select-Object -First 5

Write-Output "`n══════ 2. 章节首页权重归一 + 签名回填（幂等）══════"
& (Join-Path $PSScriptRoot 'normalize-section-weights.ps1') | Select-Object -Last 1
& (Join-Path $PSScriptRoot 'backfill-signatures.ps1')

Write-Output "`n══════ 3. 严格构建 ══════"
Push-Location $root
hugo --cleanDestinationDir --ignoreCache --printPathWarnings --printUnusedTemplates 2>$null | Select-Object -Last 6
$buildExit = $LASTEXITCODE
Write-Output "build exit=$buildExit"
Pop-Location

Write-Output "`n══════ 4. 站内链接 ══════"
& (Join-Path $PSScriptRoot 'audit-links.ps1') | Select-Object -First 6

Write-Output "`n══════ 5. 铁律扫描（未转义定界符 / 禁用字面串）══════"
$content = Join-Path $root 'content'
$hits = Select-String -Path (Join-Path $content '*.md'), (Join-Path $content '*\*.md'), (Join-Path $content '*\*\*.md'), (Join-Path $content '*\*\*\*.md') -Pattern '\{\{[<%]\s*/*\s*([a-zA-Z0-9_.-]+)' -AllMatches -ErrorAction SilentlyContinue
$names = @($hits | ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
Write-Output ("短代码调用名（本站自有：banner / demo / note / quick-reference / wrap；其余须是 Hugo 内置）: {0}" -f ($names -join ', '))
$lit = @(Select-String -Path (Join-Path $content '*.md'), (Join-Path $content '*\*.md'), (Join-Path $content '*\*\*.md'), (Join-Path $content '*\*\*\*.md') -Pattern 'HAHAHUGOSHORTCODE' -ErrorAction SilentlyContinue)
Write-Output ("HAHAHUGOSHORTCODE 命中: {0}" -f $lit.Count)

Write-Output "`n══════ 6. 技能包镜像与站点保持一致 ══════"
& (Join-Path $PSScriptRoot 'sync-skill-static.ps1') -Verify

Write-Output "`n══════ 7. 教学层覆盖度 ══════"
& (Join-Path $PSScriptRoot 'audit-teach.ps1') | Select-Object -Last 6

Write-Output "`n══════ 8. 规模 ══════"
$md = @(Get-ChildItem (Join-Path $root 'content') -Recurse -File -Filter '*.md')
$html = @(Get-ChildItem (Join-Path $root 'public') -Recurse -File -Filter '*.html' -ErrorAction SilentlyContinue)
Write-Output ("content .md: {0} 个；public .html: {1} 个" -f $md.Count, $html.Count)
