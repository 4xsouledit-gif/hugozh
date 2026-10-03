+++
title = "部署到 Vercel"
linkTitle = "部署到 Vercel"
description = "用 Vercel 的 Git 集成持续部署 Hugo 静态站点：vercel.json、build.sh、输出目录与工具版本，附构建失败的排查入口。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/host-and-deploy/host-on-vercel/"

[params.teach]
difficulty = "入门"
time = "25–35 分钟"
prereq = [
  "一个 Vercel 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在仓库根目录新增 `vercel.json` 与 `build.sh` 并提交推送",
]
outcomes = [
  "用 `vercel.json` 声明构建命令与输出目录，让 Vercel 执行你自己的构建脚本",
  "说清 `installCommand` 留空、`outputDirectory`、`--gc --minify` 各自的作用",
  "完成从导入仓库到拿到线上地址的全流程，并会区分正式部署与预览部署",
  "构建失败或页面 404 时，按 Vercel 的部署日志定位问题",
]
next = ["/host-and-deploy/host-on-netlify/", "/host-and-deploy/host-on-render/", "/configuration/caches/", "/troubleshooting/"]
+++

下面的步骤以 GitHub 仓库为例说明 Vercel 的持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里放一个 `vercel.json` 与一个 `build.sh` → 在 Vercel 导入仓库 → 等首次部署完成 → 拿到网址**。

Vercel 这条路线的关键只有三个字段，都在 `vercel.json` 里：

- `installCommand: ""` 跳过 Vercel 默认的依赖安装（我们不需要 npm 依赖，装了反而浪费时间）；
- `buildCommand` 调用 `build.sh`，由脚本自己装 Hugo 等工具并构建；
- `outputDirectory` 告诉 Vercel 从 `public` 取产物。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 写 Vercel 配置 | 创建 `vercel.json`（第 1 步） | 文件在仓库根目录；JSON 能被解析 |
| 3. 写构建脚本 | 创建 `build.sh`（第 2 步） | 本地 `bash build.sh` 能成功产出 `public/` |
| 4. 配置缓存 | 设置 `[caches.images]`（第 3 步） | 本地再跑一次 `hugo` 仍成功 |
| 5. 推送 | 提交并推送（第 4 步） | GitHub 仓库里能看到这两个新文件 |
| 6. 导入仓库 | 在 Vercel 仪表板新建项目并导入（第 5–11 步） | "New Project" 页面出现，且未提示缺少配置 |
| 7. 部署 | 保留默认值按 **Deploy**（第 12 步） | 部署日志里出现 `Installing Hugo ...` 与 `Building the project...` |
| 8. 访问 | 从仪表板点开已发布站点（第 13–14 步） | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `installCommand` | `vercel.json` | `""`（空字符串） | 不填则 Vercel 会尝试安装依赖，浪费构建时间甚至失败 |
| `buildCommand` | `vercel.json` | `chmod a+x build.sh && ./build.sh` | 脚本无执行权限或不被执行 |
| `outputDirectory` | `vercel.json` | `public` | 部署成功但站点 404 |
| `HUGO_VERSION` 等 | `build.sh` 顶部 | 与本地一致的版本 | 线上报模板或参数不存在 |
| `HUGO_CACHEDIR` | `build.sh` 顶部 | `.vercel/cache/hugo` | 缓存失效，每次重新处理图片 |
| 项目名 | 仪表板导入页面 | 任意可辨认的名字 | 多个项目重名 |
| `baseURL` | 项目配置文件 | 最终访问地址 | 页面能打开但样式、站内链接指向错误地址 |

## 前提条件

继续之前请先完成以下事项：

1. [注册](https://vercel.com/signup) Vercel 账号。
2. [登录](https://vercel.com/login) Vercel 账号。
3. [注册](https://github.com/signup) GitHub 账号。
4. [登录](https://github.com/login) GitHub 账号。
5. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
6. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：创建 Vercel 配置

在项目根目录创建 `vercel.json`。

```json {file="vercel.json"}
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "",
  "buildCommand": "chmod a+x build.sh && ./build.sh",
  "outputDirectory": "public"
}
```

`installCommand` 留空表示跳过 Vercel 默认的依赖安装步骤，`buildCommand` 调用下面的构建脚本，`outputDirectory` 指向 Hugo 的输出目录 `public`。

**你应当看到什么**：把 `vercel.json` 交给编辑器或 `$schema` 指向的地址校验，不应有语法错误。Vercel 对该文件是严格解析的：多一个逗号就会让整个部署在读取配置阶段失败。

### 第 2 步：创建构建脚本

在项目根目录创建 `build.sh`，按需调整工具版本与时区。

```sh {file="build.sh"}
#!/usr/bin/env bash

#------------------------------------------------------------------------------
# @file
# Builds a Hugo project hosted on Vercel.
#------------------------------------------------------------------------------

# Exit on error, undefined variables, or pipe failures
set -euo pipefail

# Define tool versions
DART_SASS_VERSION=1.105.0
GO_VERSION=1.27.1
HUGO_VERSION=0.167.0
NODE_VERSION=24.21.0

# Set the build time zone
TZ=Europe/Oslo

# Set the build cache directory
HUGO_CACHEDIR="${PWD}/.vercel/cache/hugo"

# Perform cleanup
cleanup() {
  if [[ -n "${build_temp_dir:-}" && -d "${build_temp_dir}" ]]; then
    rm -rf "${build_temp_dir}"
  fi
}

# Register the cleanup trap
trap cleanup EXIT SIGINT SIGTERM

main() {
  # Export the build time zone
  export TZ

  # Export the build cache directory
  export HUGO_CACHEDIR

  # Create a temporary directory for downloads
  build_temp_dir=$(mktemp -d)

  # Create a local tools directory
  mkdir -p "${HOME}/.local"

  # Install Dart Sass
  echo "Installing Dart Sass ${DART_SASS_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  tar -C "${HOME}/.local" -xf "${build_temp_dir}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  export PATH="${HOME}/.local/dart-sass:${PATH}"

  # Install Go
  if [[ -f "go.mod" ]]; then
    echo "Installing Go ${GO_VERSION}..."
    curl -sfL --output-dir "${build_temp_dir}" -O "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
    tar -C "${HOME}/.local" -xf "${build_temp_dir}/go${GO_VERSION}.linux-amd64.tar.gz"
    export PATH="${HOME}/.local/go/bin:${PATH}"
  fi

  # Install Hugo
  echo "Installing Hugo ${HUGO_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  mkdir -p "${HOME}/.local/hugo"
  tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  export PATH="${HOME}/.local/hugo:${PATH}"

  # Install Node.js
  if [[ -f "package-lock.json" ]]; then
    echo "Installing Node.js ${NODE_VERSION}..."
    curl -sfL --output-dir "${build_temp_dir}" -O "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz"
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
  hugo build --gc --minify
}

main "$@"
```

脚本自行安装 Dart Sass、Hugo，并在需要时安装 Go 与 Node.js，工具版本与构建时区都写在脚本顶部。构建缓存放在 `.vercel/cache/hugo`，构建命令为 `hugo build --gc --minify`。

这条构建命令**没有传 `--baseURL`**，所以站点地址以项目配置里的 `baseURL` 为准：绑定自定义域名后，记得同步修改它并重新部署。

**你应当看到什么**：本地执行 `bash build.sh` 应当打印 `Installing Hugo ...`、`Hugo: hugo v...`、`Building the project...` 并产出 `public/`。云端部署日志里会出现同样几行。

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送代码

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。

### 第 5 步：新建项目

在 Vercel 仪表板右上角点击 **Add New** 按钮，在下拉菜单中选择 "Project"。

### 第 6 步：使用 GitHub 登录

点击 "Continue with GitHub" 按钮。

### 第 7 步：授权 Vercel

点击 **Authorize Vercel** 按钮，允许 Vercel 应用访问你的 GitHub 账号。

### 第 8 步：安装应用

点击 **Install** 按钮安装 Vercel 应用。

### 第 9 步：选择账号

选择你希望安装 Vercel 应用的 GitHub 账号。

### 第 10 步：选择仓库范围

授权 Vercel 应用访问全部仓库或仅访问选定仓库，然后点击 **Install** 按钮。浏览器会跳转到 Vercel 仪表板。

### 第 11 步：导入仓库

点击你的 GitHub 仓库名称右侧的 **Import** 按钮。

### 第 12 步：部署

在 "New Project" 页面上保留默认设置，点击 **Deploy** 按钮。构建命令与输出目录来自仓库里的 `vercel.json`，无需在此手工填写。

> [!TIP]
> 如果这个页面要求你手工选择 Framework Preset 或填 Output Directory，说明 Vercel 没读到 `vercel.json`——先确认该文件在仓库根目录且已经推送。

### 第 13 步：返回仪表板

部署完成后，点击页面底部的 **Continue to Dashboard** 按钮。

### 第 14 步：访问站点

在 "Production Deployment" 页面上，点击指向已发布站点的链接即可访问。

**你应当看到什么**：站点地址形如 `https://<项目名>.vercel.app`；首页正常显示，样式与图片都在。之后每次从本地仓库推送改动，Vercel 都会重新构建并部署站点。拉取请求同样会生成预览部署，其地址与正式地址不同，链接会自动指向预览地址本身。

## 失败时：典型报错与排查入口

排查入口是 **Vercel 仪表板 → 你的项目 → Deployments → 点开某次部署 → Build Logs**。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 部署在读取配置阶段就失败，提示 `vercel.json` 无效 | JSON 语法错误，或字段名拼错 | 用 `$schema` 指向的规范校验；注意不能有多余逗号 |
| 构建报 `./build.sh: Permission denied` | 脚本没有执行权限 | 保留 `buildCommand` 里的 `chmod a+x build.sh &&` |
| 构建日志很短就结束，几乎没输出 | `buildCommand` 没被读到，或 `vercel.json` 不在根目录 | 确认文件位置与内容；必要时在部署日志里查看生效的配置 |
| 构建报 `hugo: command not found` | 脚本没被执行，或 Hugo 下载失败 | 看日志中有没有 `Installing Hugo ...` |
| 站点需要 npm 包却报模块找不到 | `installCommand` 被清空后又没有自行安装依赖 | 站点确实需要 Node 依赖时，去掉空的 `installCommand`，或让 `build.sh` 自己执行 `npm ci` |
| 部署成功但访问 404 | `outputDirectory` 不是真正的发布目录 | 改成 `public`（或你配置的 `publishDir`） |
| 页面能打开但样式、图片丢失 | `baseURL` 与实际访问地址不一致 | 把配置里的 `baseURL` 改成最终域名后重新部署 |
| 预览部署里链接指向正式域名 | 配置里写死了 `baseURL`，构建时又没有覆盖 | 让构建按访问地址生成链接，或按环境区分 `baseURL`（见[配置 Hugo](/configuration/)） |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在项目的 **Settings** > **Domains** 中添加域名，按提示配置 DNS，证书由 Vercel 自动签发；域名生效后把配置里的 `baseURL` 改成该域名并重新部署。

**重定向与子路径**：Vercel 支持在 `vercel.json` 中用 `redirects`、`rewrites` 声明跳转与代理规则；Hugo 的页面别名也会生成对应的跳转页面。若站点部署在子路径下，请确认配置中的 `baseURL` 与之一致。

**404 页面**：Hugo 生成的 `public/404.html` 会随产物发布，可作为自定义错误页使用。

## 相关资源

- [Vercel 通用文档](https://vercel.com/docs)
- [自定义域名设置](https://vercel.com/docs/domains/overview)
