+++
title = "部署到 Render"
linkTitle = "部署到 Render"
description = "用 Render Blueprint 持续部署 Hugo 静态站点。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/host-and-deploy/host-on-render/"
+++

下面的步骤以 GitHub 仓库为例说明 Render 的持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 前置条件

继续之前请先完成以下事项：

1. [注册](https://dashboard.render.com/register) Render 账号。
1. [登录](https://dashboard.render.com/login) Render 账号。
1. [注册](https://github.com/signup) GitHub 账号。
1. [登录](https://github.com/login) GitHub 账号。
1. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
1. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
1. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
1. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：创建 Blueprint 配置

在项目根目录创建 `render.yaml`，按需调整工具版本与时区。把 `repo` 换成你自己的仓库地址。

```yaml {file="render.yaml"}
services:
  - type: web
    name: hosting-render
    repo: https://github.com/jmooring/hosting-render
    runtime: static
    buildCommand: chmod a+x build.sh && ./build.sh
    staticPublishPath: public
    envVars:
      - key: DART_SASS_VERSION
        value: 1.105.0
      - key: GO_VERSION
        value: 1.27.1
      - key: HUGO_VERSION
        value: 0.167.0
      - key: NODE_VERSION
        value: 24.21.0
      - key: TZ
        value: Europe/Oslo
```

`runtime: static` 声明这是静态站点，`staticPublishPath: public` 把发布目录指向 Hugo 的输出目录，`buildCommand` 调用下面的构建脚本。工具版本通过 `envVars` 注入，脚本直接读取这些环境变量。

### 第 2 步：创建构建脚本

在项目根目录创建 `build.sh`。

```sh {file="build.sh"}
#!/usr/bin/env bash

#------------------------------------------------------------------------------
# @file
# Builds a Hugo project hosted on Render.
#
# Render automatically installs Node.js and any Node.js dependencies.
#------------------------------------------------------------------------------

# Exit on error, undefined variables, or pipe failures
set -euo pipefail

# Set the build cache directory
HUGO_CACHEDIR="${PWD}/.cache/hugo"

# Perform cleanup
cleanup() {
  if [[ -n "${build_temp_dir:-}" && -d "${build_temp_dir}" ]]; then
    rm -rf "${build_temp_dir}"
  fi
}

# Register the cleanup trap
trap cleanup EXIT SIGINT SIGTERM

main() {
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

  # Build the project
  echo "Building the project..."
  hugo build --gc --minify
}

main "$@"
```

Render 会自动安装 Node.js 及其依赖，脚本因此只安装 Dart Sass、Hugo，并在检测到 `go.mod` 时安装 Go。构建缓存写入 `.cache/hugo`，构建命令为 `hugo build --gc --minify`；站点地址由 Render 在构建时注入，无需在脚本里手工指定。

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

这样本地构建与 Render 构建都会把处理过的图片缓存到 `.cache/hugo/images`。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送代码

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。

### 第 5 步：新建 Blueprint

在 Render [仪表板](https://dashboard.render.com/)上点击 **Add new** 按钮，在下拉菜单中选择 “Blueprint”。

### 第 6 步：连接 GitHub

点击 **GitHub** 按钮，连接到你的 GitHub 账号。

### 第 7 步：授权 Render

点击 **Authorize Render** 按钮，允许 Render 应用访问你的 GitHub 账号。

### 第 8 步：选择账号

选择你希望安装 Render 应用的 GitHub 账号。

### 第 9 步：选择仓库范围

授权 Render 应用访问全部仓库或仅访问选定仓库，然后点击 **Install** 按钮。

### 第 10 步：连接仓库

在 “Create a new Blueprint Instance in My Workspace” 页面上，点击你的 GitHub 仓库名称右侧的 **Connect** 按钮。

### 第 11 步：部署 Blueprint

为 Blueprint 输入一个唯一名称，然后点击页面底部的 **Deploy Blueprint** 按钮。

### 第 12 步：查看资源

等待站点构建并部署完成，然后点击页面左侧的 “Resources” 链接。

### 第 13 步：打开静态站点

点击静态站点资源对应的链接。

### 第 14 步：访问站点

点击指向已发布站点的链接即可访问。

之后每次从本地仓库推送改动，Render 都会重新构建并部署站点。

## 后续配置

**自定义域名**：在 Render 的站点设置中添加自定义域名，按提示在 DNS 侧添加记录，证书由 Render 自动签发；域名生效后如果站点内链接出现异常，请检查配置中的 `baseURL` 是否需要改为该域名。

**重定向**：Render 支持在站点设置或 Blueprint 配置中声明重定向规则；站点内部的页面跳转仍建议使用 Hugo 的 aliases。

## 相关资源

- [Render 静态站点文档](https://render.com/docs/static-sites)
- [自定义域名设置](https://render.com/docs/custom-domains)
