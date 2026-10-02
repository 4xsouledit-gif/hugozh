+++
title = "部署到 Firebase"
linkTitle = "部署到 Firebase"
description = "用 GitHub Actions 把 Hugo 站点部署到 Firebase Hosting：服务账号密钥、工作流、Project ID 与 baseURL，附认证失败的排查入口。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/host-and-deploy/host-on-firebase/"

[params.teach]
difficulty = "进阶"
time = "40–50 分钟"
prereq = [
  "一个 Google 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在 GitHub 仓库中新增 Secrets 与工作流文件",
]
outcomes = [
  "创建 Firebase 项目，取到 Project ID 与服务账号私钥",
  "把私钥存为 GitHub Secret，并写出可用的工作流文件",
  "填对 `FIREBASE_PROJECT_ID` 与 `baseURL`，让站点发布到正确的项目与地址",
  "部署报认证或权限错误时，知道先检查 Secret 与 Project ID 哪一项",
]
next = ["/host-and-deploy/host-on-azure-static-web-apps/", "/host-and-deploy/host-on-netlify/", "/configuration/caches/", "/troubleshooting/"]
+++

下面的步骤用 GitHub 仓库实现持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**建 Firebase 项目 → 取一对「Project ID + 服务账号私钥」→ 存到 GitHub → 让 Actions 构建并发布**。

Firebase 这条路线的关键是**两样东西都要对上**：

- **Project ID** 决定部署到哪个 Firebase 项目（写在 `FIREBASE_PROJECT_ID`）；
- **服务账号私钥**决定 Actions 有没有权限部署（存在 Secret 里，内容是一整份 JSON）。

只有一样对不上时，报错都出现在 `firebase deploy` 那一步，因此排查时要同时核对这两项。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 建项目 | 在 Firebase 控制台创建项目（第 1 步） | **Settings** > **General** 页面能看到 Project ID |
| 3. 取私钥 | 生成服务账号私钥 JSON（第 1 步） | 下载到项目目录**之外**；文件内容是含 `private_key` 的 JSON |
| 4. 存 Secret | 把 JSON 内容存为 `FIREBASE_SERVICE_ACCOUNT_KEY`（第 2 步） | Secret 列表里出现该名称；本地下载的 JSON 已删除 |
| 5. 写工作流 | 创建 `.github/workflows/hugo.yaml`（第 3 步） | 文件已推送；`FIREBASE_PROJECT_ID` 是第 2 步记下的值 |
| 6. 回填地址 | 把 `baseURL` 设为 `https://<项目ID>.web.app/`（第 4 步） | 本地重新构建后，`public/index.html` 里的绝对地址就是该网址 |
| 7. 配置缓存 | 设置 `[caches.images]`（第 5 步） | 本地再跑一次 `hugo` 仍成功 |
| 8. 推送并观察 | 推送后看 **Actions**（第 6–8 步） | build 与 deploy 两个任务都变绿 |
| 9. 访问 | 打开 `https://<项目ID>.web.app/` | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `FIREBASE_PROJECT_ID` | 工作流 `env` | 第 1 步记下的 Project ID（形如 `hosting-firebase-17fe0`） | 部署到错误的项目，或报权限错误 |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | GitHub 仓库 Secrets | 私钥 JSON 的**完整内容** | `firebase deploy` 报认证失败 |
| `baseURL` | 项目配置文件 | `https://<项目ID>.web.app/`（末尾斜杠不能省） | 页面能打开但样式、站内链接指向错误地址 |
| `HUGO_VERSION` | 工作流 `env` | 与本地一致的版本 | 线上报模板或参数不存在 |
| `DART_SASS_VERSION` | 工作流 `env` | 需要 Sass 时填 | 站点用了 Sass 时构建报找不到 `sass` |
| `GO_VERSION` / `NODE_VERSION` | 工作流 `env` | 有 `go.mod` / `package-lock.json` 时才需要 | 依赖 Hugo Modules 或 npm 时构建失败 |
| `TZ` | 工作流 `env` | 构建时区 | 时间相关输出与预期不符 |

## 前提条件

继续之前请先完成以下事项：

1. [注册](https://accounts.google.com/) Google 账号。
2. [登录](https://accounts.google.com/) Google 账号。
3. [注册](https://github.com/signup) GitHub 账号。
4. [登录](https://github.com/login) GitHub 账号。
5. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
6. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：创建 Firebase 项目

1. 打开 [Firebase 控制台](https://console.firebase.google.com/)。
2. 点击 **Get started by setting up a Firebase project**。
3. 输入项目名称；如果你的 Google 账号归属于某个 Google Workspace 或 Cloud Identity 组织，还需要选择父级资源。然后点击 **Continue** 按钮。
4. 为该项目停用 Gemini，然后点击 **Continue** 按钮。
5. 为该项目停用 Google Analytics，然后点击 **Create project** 按钮。
6. Firebase 项目就绪后，点击 **Continue** 按钮。
7. 在侧边栏菜单中依次选择 **Settings** > **General**，记下 Project ID，后面的步骤会用到。
8. 在侧边栏菜单中依次选择 **Settings** > **Service accounts**。在页面底部点击 **Generate new private key** 按钮，再点击 **Generate key** 按钮。
9. 把生成的 JSON 文件下载到项目目录之外的任意位置。

> [!WARNING]
> 那份 JSON 是服务账号的私钥，等同于密码。它**不能**放进 Git 仓库，也不要长期留在下载目录；第 2 步存进 GitHub Secrets 之后就把本地文件删掉。若不慎提交，请立刻在 Firebase 控制台删除该密钥并重新生成。

### 第 2 步：把私钥添加到 GitHub Secrets

1. 打开你的 GitHub 仓库。
2. 进入 **Settings** > **Secrets and variables** > **Actions**。
3. 点击 **New repository secret** 按钮。
4. 在 Name 中填入 `FIREBASE_SERVICE_ACCOUNT_KEY`。
5. 把下载的 JSON 文件内容粘贴到 Secret 字段。
6. 点击 **Add secret** 按钮。
7. 删除已下载的 JSON 文件。

**你应当看到什么**：Secret 列表中出现 `FIREBASE_SERVICE_ACCOUNT_KEY`，值被隐藏。粘贴时要包含完整的一整份 JSON（从第一个 `{` 到最后一个 `}`），少一行都会在部署时报认证失败。

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

**你应当看到什么**：`deploy` 任务的日志末尾会出现 Firebase CLI 的 `Deploy complete!` 与 `Hosting URL: https://<项目ID>.web.app`。这两行同时出现，说明项目 ID 与凭据都对上了。

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

### 第 7 步：在 Actions 里找到这次运行

点击 **Actions** 后选中最近一次运行，页面会列出 `build` 与 `deploy` 两个任务及各自耗时。

### 第 8 步：确认状态为绿

当 GitHub 完成站点构建与部署后，状态指示器的颜色会变为绿色，说明本次部署成功。

## 失败时：典型报错与排查入口

排查入口是 **GitHub 仓库 → Actions → 点开那次运行**：先看红的是 `build` 还是 `deploy`，再到对应任务的日志里找最后一个报错行。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `firebase deploy` 报认证失败（提示未登录或找不到凭据） | Secret 没建、名称拼错，或粘贴的 JSON 不完整 | 重新粘贴**完整** JSON（从 `{` 到 `}`），确认 Secret 名为 `FIREBASE_SERVICE_ACCOUNT_KEY` |
| 报权限不足（403 / permission denied） | 服务账号没有该项目权限，或 `FIREBASE_PROJECT_ID` 不是这个项目的 ID | 核对控制台 **Settings** > **General** 里的 Project ID；确认私钥来自同一项目 |
| 报找不到 `firebase.json` | 生成配置的那一步没执行成功 | 看 `Create Firebase Hosting config` 一步是否成功；`public` 字段要与产物目录一致 |
| 部署成功，但访问的地址还是旧内容 | 部署到了另一个项目，或浏览器/CDN 缓存 | 看日志里的 `Hosting URL` 是否与你打开的地址一致；强制刷新 |
| 站点 404 或只显示 Firebase 欢迎页 | `firebase.json` 的 `public` 与实际产物目录不一致 | 保持 `"public": "public"`，并确认 `build` 任务里 `path: public` |
| 页面能打开但样式、图片丢失 | `baseURL` 与 `Hosting URL` 不一致 | 把配置里的 `baseURL` 改成 `https://<项目ID>.web.app/`（含末尾斜杠） |
| 构建报模板或参数不存在 | 线上 Hugo 版本与本地不同 | 把 `HUGO_VERSION` 改成 `hugo version` 显示的版本 |
| 每次构建都重新处理图片 | 缓存路径不一致 | 让 `--cacheDir` 与 `[caches.images].dir` 指向同一处 |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在 Firebase 控制台的 Hosting 页面添加自定义域名并按其提示完成 DNS 验证，Firebase 会自动签发 TLS 证书；域名生效后记得把配置里的 `baseURL` 改成新域名。

**重定向与响应头**：Firebase Hosting 通过 `firebase.json` 中的 `redirects`、`rewrites`、`headers` 字段配置，可以随工作流一起写入仓库，不必手工在控制台维护。若要自定义 404，可在 Hosting 配置中把 `rewrites` 指到 `/404.html`，并确认 Hugo 已生成该页面。

## 相关资源

- [Firebase Hosting 通用文档](https://firebase.google.com/docs/hosting)
- [自定义域名设置](https://firebase.google.com/docs/hosting/custom-domain)
