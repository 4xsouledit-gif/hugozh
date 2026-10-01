+++
title = "部署到 Firebase"
linkTitle = "部署到 Firebase"
description = "用 GitHub Actions 把 Hugo 站点持续部署到 Firebase Hosting。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/host-and-deploy/host-on-firebase/"
+++

下面的步骤用 GitHub 仓库实现持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 前置条件

继续之前请先完成以下事项：

1. [注册](https://accounts.google.com/) Google 账号。
1. [登录](https://accounts.google.com/) Google 账号。
1. [注册](https://github.com/signup) GitHub 账号。
1. [登录](https://github.com/login) GitHub 账号。
1. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
1. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
1. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
1. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：创建 Firebase 项目

1. 打开 [Firebase 控制台](https://console.firebase.google.com/)。
1. 点击 **Get started by setting up a Firebase project**。
1. 输入项目名称；如果你的 Google 账号归属于某个 Google Workspace 或 Cloud Identity 组织，还需要选择父级资源。然后点击 **Continue** 按钮。
1. 为该项目停用 Gemini，然后点击 **Continue** 按钮。
1. 为该项目停用 Google Analytics，然后点击 **Create project** 按钮。
1. Firebase 项目就绪后，点击 **Continue** 按钮。
1. 在侧边栏菜单中依次选择 **Settings** > **General**，记下 Project ID，后面的步骤会用到。
1. 在侧边栏菜单中依次选择 **Settings** > **Service accounts**。在页面底部点击 **Generate new private key** 按钮，再点击 **Generate key** 按钮。
1. 把生成的 JSON 文件下载到项目目录之外的任意位置。

### 第 2 步：把私钥添加到 GitHub Secrets

1. 打开你的 GitHub 仓库。
1. 进入 **Settings** > **Secrets and variables** > **Actions**。
1. 点击 **New repository secret** 按钮。
1. 在 Name 中填入 `FIREBASE_SERVICE_ACCOUNT_KEY`。
1. 把下载的 JSON 文件内容粘贴到 Secret 字段。
1. 点击 **Add secret** 按钮。
1. 删除已下载的 JSON 文件。

### 第 3 步：创建 GitHub Actions 工作流

在 `.github/workflows` 目录中创建 `hugo.yaml`，按需调整工具版本与时区。把 `FIREBASE_PROJECT_ID` 设为第 1 步记下的 Project ID。

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

  # Set the Firebase Project ID.
  FIREBASE_PROJECT_ID: hosting-firebase-17fe0
on:
  push:
    branches:
      - main
  workflow_dispatch:
permissions:
  contents: read
  pull-requests: write
concurrency:
  group: deployment
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
            --cacheDir "${{ runner.temp }}/.cache/hugo"

      - name: Cache save
        uses: actions/cache/save@v6
        with:
          path: ${{ runner.temp }}/.cache/hugo
          key: ${{ steps.cache-restore.outputs.cache-primary-key }}

      - name: Upload build artifact
        uses: actions/upload-artifact@v7
        with:
          name: build-artifact
          path: public
          retention-days: 1
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v8
        with:
          name: build-artifact
          path: public

      - name: Create Firebase Hosting config
        run: |
          cat << 'EOF' > firebase.json
          {
            "hosting": {
              "public": "public"
            }
          }
          EOF

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install Firebase CLI
        run: npm install -g firebase-tools --no-fund --no-audit --quiet

      - name: Deploy
        env:
          FIREBASE_SERVICE_ACCOUNT_KEY: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}
        run: |
          echo "$FIREBASE_SERVICE_ACCOUNT_KEY" > "${RUNNER_TEMP}/gcp_key.json"
          export GOOGLE_APPLICATION_CREDENTIALS="${RUNNER_TEMP}/gcp_key.json"
          firebase deploy --only hosting --project "${FIREBASE_PROJECT_ID}"
```

工作流分为两个任务：`build` 构建站点并把 `public` 目录作为构建产物上传，`deploy` 取回该产物后执行 `firebase deploy`。部署阶段会临时写出 `firebase.json`，把 Firebase Hosting 的发布目录指向 `public`；认证凭据来自上一步保存的 secret。构建命令只做 `--gc` 与 `--minify`，因此站点地址完全由配置文件中的 `baseURL` 决定。

### 第 4 步：设置 baseURL

在本地 Git 仓库根目录的项目配置文件中，把 `baseURL` 设为 Firebase 分配的网址。该网址由第 1 步记下的 Project ID 加上 `web.app` 域名组成。

```toml
baseURL = 'https://hosting-firebase-17fe0.web.app/'
locale  = 'en-US'
title   = 'Hosting Test - Firebase'
```

如果你在 Firebase Hosting 中绑定了自定义域名，或把站点放在域名的子路径下，这里的值也要相应改写，末尾的斜杠不能省略。

### 第 5 步：设置图片缓存目录

在项目配置文件中把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

这样本地构建与 CI 构建都会把处理过的图片缓存到 `.cache/hugo/images`。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 6 步：推送并观察部署

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。在 GitHub 主菜单中点击 **Actions**，即可看到工作流运行状态；当构建与部署完成后，状态指示器会变为绿色。

之后每次从本地仓库推送改动，GitHub 都会重新构建并部署站点。

## 后续配置

**自定义域名**：在 Firebase 控制台的 Hosting 页面添加自定义域名并按其提示完成 DNS 验证，Firebase 会自动签发 TLS 证书；域名生效后记得把配置里的 `baseURL` 改成新域名。

**重定向与响应头**：Firebase Hosting 通过 `firebase.json` 中的 `redirects`、`rewrites`、`headers` 字段配置，可以随工作流一起写入仓库，不必手工在控制台维护。

## 相关资源

- [Firebase Hosting 通用文档](https://firebase.google.com/docs/hosting)
- [自定义域名设置](https://firebase.google.com/docs/hosting/custom-domain)
