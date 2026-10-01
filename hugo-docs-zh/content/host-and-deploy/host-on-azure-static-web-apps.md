+++
title = "部署到 Azure Static Web Apps"
linkTitle = "部署到 Azure Static Web Apps"
description = "在 Azure Static Web Apps 上托管 Hugo 站点。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/host-and-deploy/host-on-azure-static-web-apps/"
+++

下面这些步骤用于实现从 GitHub 仓库持续部署。其他 Git 服务商（例如 GitLab、Bitbucket）的总体流程相同。

> **注意：** 不要把发布目录（`public`）的内容提交到仓库，Hugo 会在构建项目时重新创建它。

## 前提条件

继续之前，请先完成以下任务：

1. 创建一个 Microsoft 账号。
2. 创建一个 Azure 账号。
3. 登录 Azure 门户。
4. 创建一个 GitHub 账号。
5. 登录你的 GitHub 账号。
6. 为你的项目创建一个 GitHub 仓库。
7. 为项目创建一个本地 Git 仓库，并添加指向该 GitHub 仓库的远端（remote）引用。
8. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
9. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

**第 1 步：创建 Azure 静态 Web 应用**

1. 在 Azure 门户中进入 **Static Web Apps**。
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

**第 2 步：把部署令牌加入 GitHub Secrets**

1. 进入你的 GitHub 仓库。
2. 依次进入 **Settings** > **Secrets and variables** > **Actions**。
3. 点击 **New repository secret** 按钮。
4. 在 Name 中填入 `AZURE_STATIC_WEB_APPS_API_TOKEN`。
5. 把部署令牌粘贴到 Secret 字段中。
6. 按下 **Add secret** 按钮。

**第 3 步：创建工作流文件**

在 `.github/workflows` 目录下创建 `hugo.yaml` 文件，按需要调整工具版本和时区：

```yaml
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

      # 站点根目录存在 go.mod 时，用 actions/setup-go@v7 安装 Go（${GO_VERSION}）；
      # 存在 package-lock.json 时，用 actions/setup-node@v7 安装 Node.js（${NODE_VERSION}）。

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

      - name: Configure Git
        run: |
          git config --global core.quotepath false
          if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
            git fetch --unshallow
          fi
          if [[ -f .gitmodules ]]; then
            git submodule update --init --recursive
          fi
          if [[ -f package-lock.json ]]; then
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

工作流中的 `staticwebapp.config.json` 把 404 响应重写到 `/404.html`，这依赖 Hugo 生成 404 页面。

**第 4 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅官方文档的「配置文件缓存」章节。

**第 5 步：提交并推送**

把改动提交到本地 Git 仓库，并推送到你的 GitHub 仓库。

**第 6 步：查看 Actions**

在 GitHub 的主菜单中选择 **Actions**，你会看到构建与部署的进度。

**第 7 步：确认状态为绿**

当 GitHub 完成站点构建与部署后，状态指示器的颜色会变成绿色。

此后，只要你从本地 Git 仓库推送改动，GitHub 就会重新构建并部署你的站点。

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
