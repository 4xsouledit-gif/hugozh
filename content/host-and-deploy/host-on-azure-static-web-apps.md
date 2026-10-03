+++
title = "部署到 Azure Static Web Apps"
linkTitle = "部署到 Azure Static Web Apps"
description = "用 GitHub Actions 把 Hugo 站点部署到 Azure Static Web Apps：部署令牌、工作流、发布目录、404 重写，以及失败时的排查入口。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/host-and-deploy/host-on-azure-static-web-apps/"

[params.teach]
difficulty = "进阶"
time = "40–50 分钟"
prereq = [
  "一个 Microsoft/Azure 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在 GitHub 仓库中新增 Secrets 与工作流文件",
]
outcomes = [
  "在 Azure 门户创建 Static Web App（部署来源选 Other），并取到分配网址与部署令牌",
  "把部署令牌存为 GitHub Secret，并写出可用的工作流文件",
  "说清 `baseURL`、`AZURE_STATIC_WEB_APPS_API_TOKEN`、`public` 三个值在流程里的位置",
  "Actions 运行失败时，分清是构建阶段、令牌认证还是产物路径的问题",
]
next = ["/host-and-deploy/host-on-aws-amplify/", "/host-and-deploy/host-on-cloudflare/", "/configuration/caches/", "/troubleshooting/"]
+++

下面这些步骤用于实现从 GitHub 仓库持续部署。其他 Git 服务商（例如 GitLab、Bitbucket）的总体流程相同。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**在 Azure 门户建一个 Static Web App → 把部署令牌交给 GitHub → 让 GitHub Actions 构建并发布**。

本页的流程比多数平台多一个「钥匙」环节：Azure 不直接读你的仓库，而是给你一个**部署令牌**，只有带着正确令牌的 Actions 才能把产物推上去。所以失败时分两步判断——**Actions 里的 build 步骤失败是构建问题，deploy 步骤失败通常是令牌问题**。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 建应用 | 在 Azure 门户创建 Static Web App（第 1 步） | 门户给出一个网址形如 `https://<随机名>.<编号>.azurestaticapps.net/` |
| 3. 回填地址 | 把该网址写进配置文件的 `baseURL`（第 1 步第 10 小步） | 本地重新构建后，`public/index.html` 里的绝对地址就是该网址 |
| 4. 存令牌 | 把部署令牌存成 GitHub Secret（第 2 步） | 仓库的 **Settings** > **Secrets and variables** > **Actions** 列表里有 `AZURE_STATIC_WEB_APPS_API_TOKEN` |
| 5. 写工作流 | 创建 `.github/workflows/hugo.yaml`（第 3 步） | 文件已推送到仓库，且 YAML 缩进没有报错 |
| 6. 配置缓存 | 设置 `[caches.images]`（第 4 步） | 本地再跑一次 `hugo` 仍成功 |
| 7. 推送并观察 | 推送后看 **Actions**（第 5–7 步） | 工作流先绿，再在 deploy 步骤下看到线上站点链接 |
| 8. 访问 | 打开分配到的网址 | 首页正常显示，样式与图片都在；不存在的路径返回自定义 404 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `baseURL` | 项目配置文件 | Azure 分配给你的完整网址（含末尾 `/`） | 页面能打开但样式、站内链接指向错误地址 |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | GitHub 仓库 Secrets | 门户里 **Manage deployment token** 复制到的令牌 | deploy 步骤认证失败 |
| `HUGO_VERSION` | 工作流 `env` | 与本地一致的版本，例如 `0.167.0` | 线上报模板或参数不存在 |
| `DART_SASS_VERSION` | 工作流 `env` | 需要 Sass 时填 | 站点用了 Sass 时构建报找不到 `sass` |
| `GO_VERSION` / `NODE_VERSION` | 工作流 `env` | 有 `go.mod` / `package-lock.json` 时才需要 | 依赖 Hugo Modules 或 npm 时构建失败 |
| `TZ` | 工作流 `env` | 构建时区 | 时间相关输出与预期不符 |

## 前提条件

继续之前，请先完成以下任务：

1. [创建](https://signup.live.com/)一个 Microsoft 账号。
2. [创建](https://azure.microsoft.com/free/)一个 Azure 账号。
3. [登录](https://portal.azure.com/) Azure 门户。
4. [创建](https://github.com/signup)一个 GitHub 账号。
5. [登录](https://github.com/login)你的 GitHub 账号。
6. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
7. 为项目[创建](https://git-scm.com/docs/git-init)一个本地 Git 仓库，并添加指向该 GitHub 仓库的[远端（remote）](https://git-scm.com/docs/git-remote)引用。
8. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
9. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

**第 1 步：创建 Azure 静态 Web 应用**

1. 在 Azure 门户中进入 [Static Web Apps](https://portal.azure.com/#browse/Microsoft.Web%2FStaticSites)。
2. 按下 **Create** 按钮。
3. 在 **Project details** 下选择订阅（Subscription），并选择或新建一个资源组（Resource Group）。
4. 在 **Static Web App details** 下为站点输入一个名称（Name）。
5. 在 **Hosting plan** 下选择 **Free**。
6. 在 **Deployment details** 下把部署来源（deployment source）选为 **Other**，然后按下 **Review + create** 按钮。这样可以改用 GitHub Actions 令牌来部署，而不会自动生成默认的工作流文件。
7. 等待验证完成，然后按下 **Create** 按钮。
8. 部署完成后，按下 **Go to resource** 按钮。
9. 把分配给你的 URL 复制到剪贴板。
10. 在本地 Git 仓库根目录的项目配置文件中，把 `baseURL` 设置为这个分配到的 URL，如下所示：

    ```toml
    baseURL = 'https://salmon-desert-04c512910.4.azurestaticapps.net/'
    locale  = 'en-US'
    title   = 'Hosting Test - Azure'
    ```

11. 点击页面顶部的 **Manage deployment token** 链接，把部署令牌复制到剪贴板。

> [!TIP]
> 第 6 小步的 **Other** 是关键：选成 GitHub 的话，Azure 会自动生成一份它自己的工作流文件，和你第 3 步写的那份并存，容易出现「改了一份、生效的是另一份」的错觉。

**第 2 步：把部署令牌加入 GitHub Secrets**

1. 进入你的 GitHub 仓库。
2. 依次进入 **Settings** > **Secrets and variables** > **Actions**。
3. 点击 **New repository secret** 按钮。
4. 在 Name 中填入 `AZURE_STATIC_WEB_APPS_API_TOKEN`。
5. 把部署令牌粘贴到 Secret 字段中。
6. 按下 **Add secret** 按钮。

**你应当看到什么**：保存后 Secret 列表里出现 `AZURE_STATIC_WEB_APPS_API_TOKEN`，值显示为一串被隐藏的字符。Secret 保存后无法再查看原值，只能重新生成令牌并覆盖。

**第 3 步：创建工作流文件**

在 `.github/workflows` 目录下创建 `hugo.yaml` 文件，按需要调整工具版本和时区：

```yaml {file=".github/workflows/hugo.yaml"}
name: Build and deploy
env:
  # 定义工具版本
  DART_SASS_VERSION: 1.105.0
  GO_VERSION: 1.27.1
  HUGO_VERSION: 0.167.0
  NODE_VERSION: 24.21.0

  # 设置构建时区
  TZ: Europe/Oslo
on:
  push:
    branches:
      - main
  workflow_dispatch:
permissions:
  contents: read
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

      - name: Create Azure Static Web Apps config
        run: |
          cat << 'EOF' > staticwebapp.config.json
          {
            "responseOverrides": {
              "404": {
                "rewrite": "/404.html",
                "statusCode": 404
              }
            }
          }
          EOF

      - name: Setup Node.js
        uses: actions/setup-node@v7
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Install SWA CLI
        run: npm install -g @azure/static-web-apps-cli --no-fund --no-audit --quiet

      - name: Deploy
        env:
          SWA_CLI_DEPLOYMENT_TOKEN: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        run: swa deploy ./public --env production --api-location "" --swa-config-location ./
```

工作流分为两个任务：`build` 构建站点并把 `public` 作为构建产物上传（`actions/upload-artifact`），`deploy` 取回该产物后用 SWA CLI 发布。分工的好处是：构建失败时不会浪费一次部署，产物也能在 Actions 页面直接下载检查。

工作流中的 `staticwebapp.config.json` 把 404 响应重写到 `/404.html`，这依赖 Hugo 生成 404 页面。

**你应当看到什么**：工作流跑完之后，打开 Actions 里那次运行的摘要页，`build` 与 `deploy` 两个任务都应当是绿色；`deploy` 任务的日志里会出现 `swa deploy` 的输出与站点地址。同时，可以在该次运行的 Artifacts 区下载 `build-artifact`，解压后应当就是完整的 `public/`。

**第 4 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅[配置文件缓存](/configuration/caches/)。

**第 5 步：提交并推送**

把改动提交到本地 Git 仓库，并推送到你的 GitHub 仓库。

**第 6 步：查看 Actions**

在 GitHub 的主菜单中选择 **Actions**，你会看到构建与部署的进度。

**第 7 步：确认状态为绿**

当 GitHub 完成站点构建与部署后，状态指示器的颜色会变成绿色。

此后，只要你从本地 Git 仓库推送改动，GitHub 就会重新构建并部署你的站点。

## 失败时：典型报错与排查入口

排查入口是 **GitHub 仓库 → Actions → 点开那次运行**：`build` 与 `deploy` 是两个独立的任务，先看哪个变红。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 推送后 Actions 里没有新运行 | 分支名与 `on.push.branches` 不符（这里写的是 `main`） | 改工作流里的分支名，或在 Actions 页面手动触发 `workflow_dispatch` |
| 工作流根本不出现 | 文件不在 `.github/workflows/` 下，或 YAML 缩进错误 | 核对路径与文件内容；GitHub 对 YAML 语法错误会直接报在该文件上 |
| build 任务报 `hugo: not found` 或模板报错 | 安装 Hugo 的步骤没生效，或版本与本地不同 | 看 `Log tool versions` 的输出确认版本；把 `HUGO_VERSION` 改成与本地一致 |
| deploy 任务报令牌无效 / 认证失败 | Secret 名字拼错（必须完全一致）、令牌已重置，或没建 Secret | 重命名或重新生成令牌并更新 Secret，再重跑工作流 |
| 部署成功但站点 404 或只有默认页 | 产物路径不对：`swa deploy ./public` 要求产物确实在 `public/` | 检查 `build` 任务里 Artifacts 的大小是否为 0；为零说明构建没产出文件 |
| 不存在的路径返回平台默认错误页 | `staticwebapp.config.json` 没被识别，或 Hugo 没有生成 `404.html` | 确认 `--swa-config-location ./` 指向该文件所在目录；确认 `public/404.html` 存在 |
| 页面能打开但样式丢失 | `baseURL` 与实际访问地址不一致 | 把 `baseURL` 改成门户里显示的那个地址（含末尾斜杠），重新推送 |
| 每次构建都重新处理图片 | 配置里的 `[caches.images].dir` 与工作流缓存路径不一致 | 两边统一指向 `:cacheDir/images` 与 `.cache/hugo` |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 域名与重定向

创建静态 Web 应用时 Azure 会分配一个域名，前面第 1 步就是把它写进 `baseURL`，第 3 步的工作流又用它来部署。

- **绑定自定义域名后要改 `baseURL`。** 把项目配置中的 `baseURL` 改成自定义域名，重新提交推送后页面内的绝对链接、站点地图与 RSS 才会指向新地址。
- **404 页面。** 工作流会生成 `staticwebapp.config.json`，把 404 响应重写到 `/404.html`，因此需要 Hugo 实际生成 404 页面。若改成其它文件名，记得同步修改该配置。
- **尾斜杠与重定向。** Hugo 默认输出以 `/` 结尾的 URL。如果平台侧同时配置了强制去除尾斜杠或其它重定向规则，请确认两者不冲突。
- **缓存。** 重新部署不等于所有访客立刻拿到新文件，更新样式或图片后要留意旧缓存的影响。

## 相关资源

要进一步了解如何用 Azure Static Web Apps 托管和管理站点，请查阅官方文档：

- [通用文档](https://learn.microsoft.com/en-us/azure/static-web-apps/overview)
- [自定义域名设置](https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-external)
