+++
title = "部署到 GitLab Pages"
linkTitle = "部署到 GitLab Pages"
description = "用 GitLab CI 把 Hugo 站点持续部署到 GitLab Pages：.gitlab-ci.yml、build.sh、baseURL 与压缩产物，附流水线失败的排查入口。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/host-and-deploy/host-on-gitlab-pages/"

[params.teach]
difficulty = "进阶"
time = "35–45 分钟"
prereq = [
  "一个 GitLab 账号，项目已推送到 GitLab 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在仓库根目录新增 `.gitlab-ci.yml` 与 `build.sh` 并提交推送",
]
outcomes = [
  "写出可用的 `.gitlab-ci.yml`，让名为 `pages` 的任务把 `public` 作为产物发布",
  "写出 `build.sh`，让它按需安装 Dart Sass、Go、Hugo、Node.js 并完成构建",
  "说清 `CI_PAGES_URL` 为什么要传给 `--baseURL`，以及子路径下链接为什么不会错",
  "流水线失败或网址 404 时，按 job 日志与 artifacts 定位问题",
]
next = ["/host-and-deploy/host-on-codeberg-pages/", "/host-and-deploy/host-on-github-pages/", "/configuration/caches/", "/troubleshooting/"]
+++

下面的步骤用 GitLab 仓库实现到 GitLab Pages 的持续部署。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里放 `.gitlab-ci.yml` 与 `build.sh` → 推送 → 看流水线 → 拿到网址**。

GitLab 这条路线的三个要点：

1. **发布靠约定**：GitLab 只把名为 `pages` 的任务（job）的产物当作站点发布，任务名和 `artifacts.paths` 都不能随意改；
2. **地址由 GitLab 给**：`CI_PAGES_URL` 是 GitLab 注入的完整站点地址，示例脚本把它传给 `--baseURL`，所以无论默认子路径还是自定义域名，链接都不会错；
3. **工具要现装**：构建机镜像里不保证有 Hugo 与 Dart Sass，`build.sh` 负责按需安装。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 写 CI 配置 | 创建 `.gitlab-ci.yml`（第 1 步） | 文件在仓库根目录；推送后 CI/CD 里出现流水线 |
| 3. 写构建脚本 | 创建 `build.sh`（第 2 步） | 本地能执行 `bash build.sh`（需要网络下载工具），或至少确认脚本语法正确 |
| 4. 配置缓存 | 设置 `[caches.images]`（第 3 步） | 本地再跑一次 `hugo` 仍成功 |
| 5. 推送 | 提交并推送到 GitLab（第 4 步） | 推送后 **Build** > **Pipelines** 自动出现一次流水线 |
| 6. 观察 | 在 **Build** > **Pipelines** 里跟踪（第 5 步） | `pages` 任务变绿，日志里出现 `Building the project...` 与压缩输出 |
| 7. 访问 | 打开 `https://<用户名>.gitlab.io/<仓库名>/`（第 6 步） | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `HUGO_CACHEDIR` | `.gitlab-ci.yml` 的 `variables` | `${CI_PROJECT_DIR}/.cache/hugo` | 缓存与 Hugo 用的目录不一致，缓存失效 |
| `cache.paths` | `.gitlab-ci.yml` | 与 `HUGO_CACHEDIR` 相同的目录 | 缓存不生效，每次重新处理图片 |
| `HUGO_VERSION` 等 | `.gitlab-ci.yml` 的 `variables` | 与本地一致的版本 | 线上报模板或参数不存在 |
| `GIT_DEPTH` / `GIT_STRATEGY` / `GIT_SUBMODULE_STRATEGY` | `.gitlab-ci.yml` 的 `variables` | 示例值 `0` / `clone` / `recursive` | `.GitInfo`、`lastmod` 失效，或主题子模块拉不下来 |
| `image.name` | `.gitlab-ci.yml` | `buildpack-deps:bookworm` | 基础镜像缺少脚本依赖的命令 |
| 任务名 `pages` | `.gitlab-ci.yml` | 必须叫 `pages` | 产物不会被发布，站点 404 |
| `artifacts.paths` | `.gitlab-ci.yml` | `public` | 产物为空，站点 404 |
| `baseURL` | 项目配置文件 | 默认地址的完整 URL（本地构建用） | 本地预览链接与线上不一致 |

## baseURL 注意事项

如果你使用 GitLab Pages 的默认地址而不是自定义域名，项目配置中的 `baseURL` 必须写成 Pages 仓库的完整 URL，例如 `https://<你的用户名>.gitlab.io/<你的-hugo-站点>/`，其中末段子路径对应仓库名。下面的构建脚本会用 GitLab 提供的 `CI_PAGES_URL` 覆盖它，但本地构建时仍以配置文件中的值为准。

## 前提条件

继续之前请先完成以下事项：

1. [注册](https://gitlab.com/users/sign_up) GitLab 账号。
2. [登录](https://gitlab.com/users/sign_in) GitLab 账号。
3. 为你的项目[创建](https://gitlab.com/projects/new)一个 GitLab 仓库。
4. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitLab 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
5. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
6. 把改动提交到本地 Git 仓库，并推送到 GitLab 仓库。

## 操作步骤

### 第 1 步：创建 GitLab CI 配置

在项目根目录创建 `.gitlab-ci.yml`，按需调整工具版本与时区。

```yaml {file=".gitlab-ci.yml"}
variables:
  # Define tool versions
  DART_SASS_VERSION: 1.105.0
  GO_VERSION: 1.27.1
  HUGO_VERSION: 0.167.0
  NODE_VERSION: 24.21.0

  # Set the build timezone
  TZ: Europe/Oslo

  # Set the build cache directory
  HUGO_CACHEDIR: ${CI_PROJECT_DIR}/.cache/hugo

  # Set the repository clone and fetch strategy
  GIT_DEPTH: 0
  GIT_STRATEGY: clone
  GIT_SUBMODULE_STRATEGY: recursive
cache:
  key: ${CI_COMMIT_REF_SLUG}
  fallback_keys:
    - ${CI_DEFAULT_BRANCH}
  paths:
    - .cache/hugo
image:
  name: buildpack-deps:bookworm
pages:
  stage: deploy
  script:
    - chmod a+x build.sh && ./build.sh
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

`GIT_DEPTH: 0` 与 `GIT_STRATEGY: clone` 保证流水线拿到完整历史，`.GitInfo`、`lastmod` 之类的功能才能正常工作；`GIT_SUBMODULE_STRATEGY: recursive` 用于拉取主题子模块。缓存路径 `.cache/hugo` 与下文的图片缓存目录一致。任务命名为 `pages`，并把 `public` 作为产物上传，GitLab Pages 才能识别并发布。

**你应当看到什么**：推送后 **Build** > **Pipelines** 里出现一条新的流水线，其中有一个名为 `pages` 的 job。如果流水线根本没出现，先怀疑这一步的文件路径与 YAML 缩进。

### 第 2 步：创建构建脚本

在项目根目录创建 `build.sh`。

```sh {file="build.sh"}
#!/usr/bin/env bash

#------------------------------------------------------------------------------
# @file
# Builds a Hugo project hosted on GitLab Pages.
#------------------------------------------------------------------------------

# Exit on error, undefined variables, or pipe failures
set -euo pipefail

# Perform cleanup
cleanup() {
  if [[ -n "${build_temp_dir:-}" && -d "${build_temp_dir}" ]]; then
    rm -rf "${build_temp_dir}"
  fi
}

# Register the cleanup trap
trap cleanup EXIT SIGINT SIGTERM

main() {
  # Create a temporary directory for downloads
  build_temp_dir=$(mktemp -d)

  # Create a local tools directory
  mkdir -p "${HOME}/.local"

  # Install utilities
  echo "Installing utilities..."
  apt-get update > /dev/null
  apt-get install -y brotli > /dev/null

  # Install Dart Sass
  echo "Installing Dart Sass ${DART_SASS_VERSION}..."
  curl -sfLO --output-dir "${build_temp_dir}" "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  tar -C "${HOME}/.local" -xf "${build_temp_dir}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  export PATH="${HOME}/.local/dart-sass:${PATH}"

  # Install Go
  if [[ -f "${CI_PROJECT_DIR}/go.mod" ]]; then
    echo "Installing Go ${GO_VERSION}..."
    curl -sfLO --output-dir "${build_temp_dir}" "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
    tar -C "${HOME}/.local" -xf "${build_temp_dir}/go${GO_VERSION}.linux-amd64.tar.gz"
    export PATH="${HOME}/.local/go/bin:${PATH}"
  fi

  # Install Hugo
  echo "Installing Hugo ${HUGO_VERSION}..."
  curl -sfLO --output-dir "${build_temp_dir}" "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  mkdir -p "${HOME}/.local/hugo"
  tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  export PATH="${HOME}/.local/hugo:${PATH}"

  # Install Node.js
  if [[ -f "${CI_PROJECT_DIR}/package-lock.json" ]]; then
    echo "Installing Node.js ${NODE_VERSION}..."
    curl -sfLO --output-dir "${build_temp_dir}" "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz"
    tar -C "${HOME}/.local" -xf "${build_temp_dir}/node-v${NODE_VERSION}-linux-x64.tar.gz"
    export PATH="${HOME}/.local/node-v${NODE_VERSION}-linux-x64/bin:${PATH}"
  fi

  # Log tool versions
  echo "Logging tool versions..."
  command -v sass &> /dev/null && echo "Dart Sass: $(sass --version)" || echo "Dart Sass: not installed"
  command -v go &> /dev/null && echo "Go: $(go version)" || echo "Go: not installed"
  command -v hugo &> /dev/null && echo "Hugo: $(hugo version)" || echo "Hugo: not installed"
  command -v node &> /dev/null && echo "Node.js: $(node --version)" || echo "Node.js: not installed"

  # Configure Git
  echo "Configuring Git..."
  git config --global core.quotepath false

  # Fetch full Git history
  if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
    echo "Fetching full Git history..."
    git fetch --unshallow
  fi

  # Initialize Git submodules
  if [[ -f .gitmodules ]]; then
    echo "Initializing Git submodules..."
    git submodule update --init --recursive
  fi

  # Install Node.js dependencies
  if [[ -f package-lock.json ]]; then
    echo "Installing Node.js dependencies..."
    npm ci
  fi

  # Build the project
  echo "Building the project..."
  hugo build --gc --minify --baseURL "${CI_PAGES_URL}"

  # Compress published files
  echo "Compressing published files..."
  find public/ -type f -regextype posix-extended -regex '.+\.(cjs|css|html|js|json|mjs|svg|txt|xml)$' -print0 > "${build_temp_dir}/files.txt"
  xargs --null --max-procs=0 --max-args=1 brotli --quality=10 --force --keep < "${build_temp_dir}/files.txt"
  xargs --null --max-procs=0 --max-args=1 gzip -9 --force --keep < "${build_temp_dir}/files.txt"
}

main "$@"
```

脚本按需安装 Dart Sass、Go、Hugo 与 Node.js：只有在仓库里存在 `go.mod` 或 `package-lock.json` 时才安装对应的工具链。构建命令用 `CI_PAGES_URL` 覆盖 `baseURL`，因此无论默认子路径还是自定义域名都能生成正确的绝对地址。构建完成后还会对 `public` 下的 HTML、CSS、JS、JSON、SVG、XML 等文本文件同时生成 brotli 与 gzip 压缩副本，供 GitLab Pages 直接下发。

**你应当看到什么**：job 日志里出现 `Installing utilities...`、`Installing Hugo ...`、`Hugo: hugo v...`、`Building the project...`、`Compressing published files...`，最后 job 显示绿色并带一个 `pages` 产物（artifacts）。可以点开 artifacts 浏览，确认 `public/index.html` 在里面。

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

图片会落在**当前 `cacheDir`** 下的 `images/`。`.gitlab-ci.yml` 里的 `HUGO_CACHEDIR: ${CI_PROJECT_DIR}/.cache/hugo` 把流水线侧的缓存目录固定为项目下的 `.cache/hugo`，与 `cache.paths` 指向同一处，因此流水线上处理过的图片位于 `.cache/hugo/images`。

**本地**未设置 `HUGO_CACHEDIR`、也未传 `--cacheDir` 时，用的是系统用户缓存目录（实测 v0.167.0 + Windows 为 `%LocalAppData%\hugo_cache`；上游文档说明 macOS 为 `$HOME/Library/Caches`，Linux 为 `$XDG_CACHE_HOME` 或 `$HOME/.cache`）。想确认当前值，运行 `hugo config` 查看 `cachedir` 一行即可。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送并观察流水线

把改动提交到本地 Git 仓库并推送到 GitLab 仓库。在 GitLab 仓库中依次进入 **Build** > **Pipelines**，即可跟踪 CI 流水线的构建过程。

### 第 5 步：确认流水线通过

流水线通过后，站点会发布在 `https://<你的用户名>.gitlab.io/<你的-hugo-站点>/`。之后每次推送改动，GitLab Pages 都会重新构建并部署站点。

### 第 6 步：打开站点

用上面的地址打开站点；如果绑定了自定义域名，则用自定义域名访问。

## 失败时：典型报错与排查入口

排查入口是 **GitLab 仓库 → Build → Pipelines → 点开那条流水线 → `pages` job 的日志**，以及 job 页面上的 artifacts。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 推送后没有流水线 | `.gitlab-ci.yml` 不在仓库根目录，或 YAML 语法错误 | 确认路径；语法错误会直接显示在 **CI/CD** > **Editor** 的校验里 |
| 流水线只有默认的检查 job，没有 `pages` | 任务名不是 `pages` | 任务名必须是 `pages`，GitLab 只发布它的产物 |
| job 失败在 `apt-get` 或下载工具 | 基础镜像或网络问题 | 确认 `image.name` 为 `buildpack-deps:bookworm`；网络受限时重试或改用镜像源 |
| job 报 `hugo: command not found` | 安装 Hugo 的步骤失败，或 `PATH` 未生效 | 看日志中 `Installing Hugo ...` 与 `Hugo: ...` 两行；确认同一次脚本执行内已 `export PATH` |
| 构建报模板或参数不存在 | 线上 Hugo 版本与本地不同 | 把 `HUGO_VERSION` 改成 `hugo version` 显示的版本 |
| 流水线绿了但站点 404 | `artifacts.paths` 不是 `public`，或构建没产出文件 | 打开 job 的 artifacts 确认 `public/index.html` 存在 |
| 站点能打开但链接指向错误地址 | 自定义域名与 `CI_PAGES_URL` 不一致 | 域名生效后 `CI_PAGES_URL` 会自动更新，重新跑一次流水线即可 |
| 图片每次重新处理 | `.cache/hugo` 与 `[caches.images].dir` 不一致 | 让 `HUGO_CACHEDIR` 与 `:cacheDir/images` 指向同一处 |
| `.GitInfo` 或 `lastmod` 为空 | 浅克隆导致历史不完整 | 确认 `GIT_DEPTH: 0` 与 `GIT_STRATEGY: clone` 生效 |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在仓库的 **Settings** > **Pages** 中添加域名并完成 DNS 验证，GitLab 会自动申请 Let's Encrypt 证书；域名生效后 `CI_PAGES_URL` 会自动变为该域名，无需改动配置文件。

**重定向**：GitLab Pages 没有单独的重定向配置层，页面级跳转应使用 Hugo 的 aliases，或在站点中放置相应的静态文件。

**404 页面**：Hugo 生成的 `public/404.html` 会随产物一起发布，GitLab Pages 在找不到路径时会使用它。

## 相关资源

- [GitLab Pages 通用文档](https://docs.gitlab.com/ee/user/project/pages/)
- [自定义域名设置](https://docs.gitlab.com/ee/user/project/pages/custom_domains_ssl_tls_certificates/)
