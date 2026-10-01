+++
title = "部署到 GitLab Pages"
linkTitle = "部署到 GitLab Pages"
description = "用 GitLab CI 把 Hugo 站点持续部署到 GitLab Pages。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/host-and-deploy/host-on-gitlab-pages/"
+++

下面的步骤用 GitLab 仓库实现到 GitLab Pages 的持续部署。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 前置条件

继续之前请先完成以下事项：

1. [注册](https://gitlab.com/users/sign_up) GitLab 账号。
1. [登录](https://gitlab.com/users/sign_in) GitLab 账号。
1. 为你的项目[创建](https://gitlab.com/projects/new)一个 GitLab 仓库。
1. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitLab 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
1. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
1. 把改动提交到本地 Git 仓库，并推送到 GitLab 仓库。

## baseURL 注意事项

如果你使用 GitLab Pages 的默认地址而不是自定义域名，项目配置中的 `baseURL` 必须写成 Pages 仓库的完整 URL，例如 `https://<你的用户名>.gitlab.io/<你的-hugo-站点>/`，其中末段子路径对应仓库名。下面的构建脚本会用 GitLab 提供的 `CI_PAGES_URL` 覆盖它，但本地构建时仍以配置文件中的值为准。

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

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

这样本地构建与流水线构建都会把处理过的图片缓存到 `.cache/hugo/images`，与 CI 配置里的缓存路径一致。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送并观察流水线

把改动提交到本地 Git 仓库并推送到 GitLab 仓库。在 GitLab 仓库中依次进入 **Build** > **Pipelines**，即可跟踪 CI 流水线的构建过程。

流水线通过后，站点会发布在 `https://<你的用户名>.gitlab.io/<你的-hugo-站点>/`。之后每次推送改动，GitLab Pages 都会重新构建并部署站点。

## 后续配置

**自定义域名**：在仓库的 **Settings** > **Pages** 中添加域名并完成 DNS 验证，GitLab 会自动申请 Let's Encrypt 证书；域名生效后 `CI_PAGES_URL` 会自动变为该域名，无需改动配置文件。

**重定向**：GitLab Pages 没有单独的重定向配置层，页面级跳转应使用 Hugo 的 aliases，或在站点中放置相应的静态文件。

## 相关资源

- [GitLab Pages 通用文档](https://docs.gitlab.com/ee/user/project/pages/)
- [自定义域名设置](https://docs.gitlab.com/ee/user/project/pages/custom_domains_ssl_tls_certificates/)
