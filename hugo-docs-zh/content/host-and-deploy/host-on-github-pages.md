+++
title = "部署到 GitHub Pages"
linkTitle = "部署到 GitHub Pages"
description = "用 GitHub Actions 把 Hugo 站点持续部署到 GitHub Pages。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/host-and-deploy/host-on-github-pages/"
+++

下面的步骤用 GitHub 仓库实现到 GitHub Pages 的持续部署。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 站点类型

GitHub Pages 站点分三种：项目站点、用户站点和组织站点。项目站点与 GitHub 上的某个具体项目绑定；用户站点和组织站点与 GitHub.com 上的某个账号绑定。

> **说明**
> 仓库的归属与命名要求请查阅 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites)。

## 前置条件

继续之前请先完成以下事项：

1. [注册](https://github.com/signup) GitHub 账号。
1. [登录](https://github.com/login) GitHub 账号。
1. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
1. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
1. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
1. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：把发布源改为 GitHub Actions

打开你的 GitHub 仓库，在主菜单中依次选择 **Settings** > **Pages**。把 **Source** 改为 `GitHub Actions`。改动立即生效，不需要点击保存按钮。

### 第 2 步：创建 GitHub Actions 工作流

在 `.github/workflows` 目录中创建 `hugo.yaml`，按需调整工具版本与时区。

```yaml {file=".github/workflows/hugo.yaml"}
name: Build and deploy
env:
  # Define tool versions
  DART_SASS_VERSION: 1.105.0
  GO_VERSION: 1.27.1
  HUGO_VERSION: 0.167.0
  NODE_VERSION: 24.21.0

  # Set the build time zone
  TZ: Europe/Oslo
on:
  push:
    branches:
      - main
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
defaults:
  run:
    shell: bash
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
        with:
          submodules: recursive
          fetch-depth: 0
          lfs: false

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v6

      - name: Create a local tools directory
        run: |
          mkdir -p "${HOME}/.local"

      - name: Install Go
        if: hashFiles('go.mod') != ''
        uses: actions/setup-go@v7
        with:
          go-version: ${{ env.GO_VERSION }}
          cache: false

      - name: Install Node.js
        if: hashFiles('package-lock.json') != ''
        uses: actions/setup-node@v7
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Dart Sass
        run: |
          echo "Installing Dart Sass ${DART_SASS_VERSION}..."
          curl -sfL --output-dir "${{ runner.temp }}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          tar -C "${HOME}/.local" -xf "${{ runner.temp }}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          echo "${HOME}/.local/dart-sass" >> "${GITHUB_PATH}"

      - name: Install Hugo
        run: |
          echo "Installing Hugo ${HUGO_VERSION}..."
          curl -sfL --output-dir "${{ runner.temp }}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          mkdir "${HOME}/.local/hugo"
          tar -C "${HOME}/.local/hugo" -xf "${{ runner.temp }}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          echo "${HOME}/.local/hugo" >> "${GITHUB_PATH}"

      - name: Log tool versions
        run: |
          echo "Logging tool versions..."
          command -v sass &> /dev/null && echo "Dart Sass: $(sass --version)" || echo "Dart Sass: not installed"
          command -v go &> /dev/null && echo "Go: $(go version)" || echo "Go: not installed"
          command -v hugo &> /dev/null && echo "Hugo: $(hugo version)" || echo "Hugo: not installed"
          command -v node &> /dev/null && echo "Node.js: $(node --version)" || echo "Node.js: not installed"

      - name: Configure Git
        run: |
          echo "Configuring Git..."
          git config --global core.quotepath false

      - name: Fetch full Git history
        run: |
          if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
            echo "Fetching full Git history..."
            git fetch --unshallow
          fi

      - name: Initialize Git submodules
        run: |
          if [[ -f .gitmodules ]]; then
            echo "Initializing Git submodules..."
            git submodule update --init --recursive
          fi

      - name: Install Node.js dependencies
        run: |
          if [[ -f package-lock.json ]]; then
            echo "Installing Node.js dependencies..."
            npm ci
          fi

      - name: Cache restore
        id: cache-restore
        uses: actions/cache/restore@v6
        with:
          path: ${{ runner.temp }}/.cache/hugo
          key: hugo-${{ github.run_id }}
          restore-keys: hugo-

      - name: Build
        run: |
          echo "Building the project..."
          hugo build \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/" \
            --cacheDir "${{ runner.temp }}/.cache/hugo"

      - name: Cache save
        uses: actions/cache/save@v6
        with:
          path: ${{ runner.temp }}/.cache/hugo
          key: ${{ steps.cache-restore.outputs.cache-primary-key }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5
        with:
          include-hidden-files: false
          path: ./public
  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

工作流分两个任务：`build` 检出代码、安装工具、构建站点，并把 `public` 目录打包成 Pages 产物上传；`deploy` 使用 `actions/deploy-pages` 把该产物发布到 Pages 环境。

构建命令中的 `--baseURL "${{ steps.pages.outputs.base_url }}/"` 来自上一步的 `actions/configure-pages`。它会在构建时覆盖配置文件里的站点地址，因此项目站点即使部署在 `https://<用户名>.github.io/<仓库名>/` 这样的子路径下也能正确生成链接，无需手工改配置。

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

这样本地构建与 CI 构建都会把处理过的图片缓存到 `.cache/hugo/images`。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送并观察部署

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。在 GitHub 主菜单中点击 **Actions**，可以看到工作流开始运行；构建与部署结束后，状态指示器的颜色会变为绿色。

点击对应的提交信息，在 deploy 步骤下会看到指向线上站点的链接。之后每次推送改动，GitHub Pages 都会重新构建并部署站点。

## 后续配置

**自定义域名**：在仓库的 **Settings** > **Pages** 中填入自定义域名，并按 GitHub 的提示在 DNS 侧添加记录。域名不需要写进配置文件：该域名启用后，第 2 步中的 `actions/configure-pages` 会把 `base_url` 输出为该自定义域名，工作流再通过 `--baseURL` 在构建时覆盖站点地址，因此项目站点、用户站点与组织站点都无需手工修改 `baseURL`。只有当你跳过该工作流、在本机直接运行 `hugo` 构建时，才需要自己把 `baseURL` 设成最终对外地址。

**子路径与相对链接**：项目站点的默认地址带有仓库名这一段子路径，而构建时覆盖的 `baseURL` 已经包含该子路径，因此站点内链接与静态资源引用应尽量使用 Hugo 生成的相对地址，避免硬编码以 `/` 开头的绝对路径。

## 相关资源

- [GitHub Pages 通用文档](https://docs.github.com/en/pages)
- [自定义域名设置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
