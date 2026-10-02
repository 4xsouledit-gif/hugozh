# 把技能包同步到站点静态目录，供 https://hugozh.cn/skill/… 直接取用；并生成机器可读清单。
# 用法：
#   pwsh -File .translation/sync-skill-static.ps1            # 同步 + 生成清单
#   pwsh -File .translation/sync-skill-static.ps1 -Verify    # 只校验镜像与源是否一致（CI/验收用）
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root '.dsh\skills\hugo-static-site'
$dst = Join-Path $root 'hugo-docs-zh\static\skill'
$verifyOnly = $PSBoundParameters.ContainsKey('Verify')

if (-not (Test-Path $src)) { Write-Output "找不到技能包目录: $src"; exit 2 }

$srcFiles = @(Get-ChildItem $src -Recurse -File | Sort-Object FullName)

if ($verifyOnly) {
  $bad = 0
  foreach ($f in $srcFiles) {
    $rel = $f.FullName.Substring($src.Length).TrimStart('\')
    $mirror = Join-Path $dst $rel
    if (-not (Test-Path $mirror)) { Write-Output "缺: $rel"; $bad++; continue }
    if ((Get-FileHash $f.FullName -Algorithm SHA256).Hash -ne (Get-FileHash $mirror -Algorithm SHA256).Hash) { Write-Output "不一致: $rel"; $bad++ }
  }
  Write-Output ("镜像校验：源 {0} 个文件，问题 {1} 处" -f $srcFiles.Count, $bad)
  if ($bad -gt 0) { exit 1 }
  exit 0
}

if (Test-Path $dst) { Remove-Item $dst -Recurse -Force }
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$files = @()
foreach ($f in $srcFiles) {
  $rel = $f.FullName.Substring($src.Length).TrimStart('\')
  $target = Join-Path $dst $rel
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item -LiteralPath $f.FullName -Destination $target -Force
  $files += [pscustomobject]@{
    path   = ($rel -replace '\\', '/')
    bytes  = $f.Length
    sha256 = (Get-FileHash $f.FullName -Algorithm SHA256).Hash.ToLower()
    url    = ("https://hugozh.cn/skill/" + ($rel -replace '\\', '/'))
    rawUrl = ("https://raw.githubusercontent.com/hencter/hugozh/main/.dsh/skills/hugo-static-site/" + ($rel -replace '\\', '/'))
  }
}

# README.md 会被 Hugo 当页面渲染，这里另存一份纯文本副本，保证按原样取用
if (Test-Path (Join-Path $dst 'README.md')) {
  Copy-Item (Join-Path $dst 'README.md') (Join-Path $dst 'README.txt') -Force
}

$manifest = [pscustomobject]@{
  name        = 'hugo-static-site'
  description = 'A DSH skill for building, updating, and verifying Hugo static sites.'
  source      = 'https://github.com/hencter/hugozh/tree/main/.dsh/skills/hugo-static-site'
  rawBase     = 'https://raw.githubusercontent.com/hencter/hugozh/main/.dsh/skills/hugo-static-site'
  install     = [pscustomobject]@{
    dsh_project = '<项目>/.dsh/skills/hugo-static-site/'
    dsh_user    = '~/.dsh/skills/hugo-static-site/'
    note        = '目录名必须是 hugo-static-site；技能目录在会话启动时扫描，装好后重开会话即可加载。'
  }
  files       = $files
}
[System.IO.File]::WriteAllText((Join-Path $dst 'skill-manifest.json'), ($manifest | ConvertTo-Json -Depth 5))
Write-Output ("已同步 {0} 个文件到 static/skill/，并生成 skill-manifest.json" -f $srcFiles.Count)
