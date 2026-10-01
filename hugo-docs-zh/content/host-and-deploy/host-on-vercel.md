+++
title = "部署到 Vercel"
linkTitle = "部署到 Vercel"
description = "用 Vercel 的 Git 集成持续部署 Hugo 静态站点。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/host-and-deploy/host-on-vercel/"
+++

下面的步骤以 GitHub 仓库为例说明 Vercel 的持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 前置条件

继续之前请先完成以下事项：

1. [注册](https://vercel.com/signup) Vercel 账号。
1. [登录](https://vercel.com/login) Vercel 账号。
1. [注册](https://github.com/signup) GitHub 账号。
1. [登录](https://github.com/login) GitHub 账号。
1. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
1. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
1. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
1. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

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

在 Vercel 仪表板右上角点击 **Add New** 按钮，在下拉菜单中选择 “Project”。

### 第 6 步：使用 GitHub 登录

点击 “Continue with GitHub” 按钮。

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

在 “New Project” 页面上保留默认设置，点击 **Deploy** 按钮。构建命令与输出目录来自仓库里的 `vercel.json`，无需在此手工填写。

### 第 13 步：返回仪表板

部署完成后，点击页面底部的 **Continue to Dashboard** 按钮。

### 第 14 步：访问站点

在 “Production Deployment” 页面上，点击指向已发布站点的链接即可访问。

之后每次从本地仓库推送改动，Vercel 都会重新构建并部署站点。拉取请求同样会生成预览部署。

## 后续配置

**自定义域名**：在项目的 **Settings** > **Domains** 中添加域名，按提示配置 DNS，证书由 Vercel 自动签发。

**重定向与子路径**：Vercel 支持在 `vercel.json` 中用 `redirects`、`rewrites` 声明跳转与代理规则；Hugo 的页面别名也会生成对应的跳转页面。若站点部署在子路径下，请确认配置中的 `baseURL` 与之一致。

## 相关资源

- [Vercel 通用文档](https://vercel.com/docs)
- [自定义域名设置](https://vercel.com/docs/domains/overview)
