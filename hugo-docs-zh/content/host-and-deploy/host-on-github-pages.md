+++
title = "部署到 GitHub Pages"
linkTitle = "部署到 GitHub Pages"
description = "用 GitHub Actions 把 Hugo 站点持续部署到 GitHub Pages：发布源设置、工作流、子路径与 baseURL，附权限与 404 的排查入口。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/host-and-deploy/host-on-github-pages/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "拥有仓库的 Settings 权限（能修改 Pages 设置）",
]
outcomes = [
  "把仓库的 Pages 发布源改为 GitHub Actions，并写出可用的工作流",
  "说清 `actions/configure-pages`、`--baseURL` 与 `public` 三者在流程里的位置",
  "判断项目站点在子路径下链接出错的原因，并知道该改配置还是改模板",
  "工作流报权限错误或站点 404 时，按日志与 Pages 状态定位问题",
]
next = ["/host-and-deploy/host-on-gitlab-pages/", "/host-and-deploy/host-on-cloudflare/", "/configuration/caches/", "/troubleshooting/"]
+++

下面的步骤用 GitHub 仓库实现到 GitHub Pages 的持续部署。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**把仓库的发布源改成 GitHub Actions → 写一个工作流 → 推送 → 从部署记录里拿到网址**。

GitHub Pages 有一个别处没有的特点：**项目站点部署在子路径下**（`https://<用户名>.github.io/<仓库名>/`）。所以除了「能不能构建」，还有一个必答题「链接指向对不对」。示例工作流用 `actions/configure-pages` 算出地址再传给 Hugo，正是为了解决这个问题——你不需要手工改 `baseURL`。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 改发布源 | 仓库 **Settings** > **Pages**，把 **Source** 改为 `GitHub Actions`（第 1 步） | 页面刷新后 Source 显示为 `GitHub Actions`，改动立即生效 |
| 3. 写工作流 | 创建 `.github/workflows/hugo.yaml`（第 2 步） | 文件已推送；仓库 **Actions** 里出现 `Build and deploy` |
| 4. 配置缓存 | 设置 `[caches.images]`（第 3 步） | 本地再跑一次 `hugo` 仍成功 |
| 5. 推送 | 提交并推送（第 4 步） | 推送后 **Actions** 自动开始一次运行 |
| 6. 观察 | 在 **Actions** 里跟踪进度（第 5–6 步） | 状态指示器变绿，`build` 与 `deploy` 都通过 |
| 7. 取链接 | 点开提交信息，看 deploy 步骤（第 7 步） | 该步骤下有站点链接，形如 `https://<用户名>.github.io/<仓库名>/` |
| 8. 访问 | 打开该链接 | 首页正常显示，样式与图片都在；抽查一个内页也正常 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| Pages **Source** | 仓库 **Settings** > **Pages** | `GitHub Actions` | 工作流跑完也不会发布，站点持续 404 |
| `HUGO_VERSION` | 工作流 `env` | 与本地一致的版本，例如 `0.167.0` | 线上报模板或参数不存在 |
| `DART_SASS_VERSION` | 工作流 `env` | 需要 Sass 时填 | 站点用了 Sass 时构建报找不到 `sass` |
| `GO_VERSION` / `NODE_VERSION` | 工作流 `env` | 有 `go.mod` / `package-lock.json` 时才需要 | 依赖 Hugo Modules 或 npm 时构建失败 |
| `TZ` | 工作流 `env` | 构建时区 | 时间相关输出与预期不符 |
| `permissions` | 工作流顶层 | 至少含 `pages: write` 与 `id-token: write` | 部署时报权限不足 |
| `baseURL` | 项目配置文件 | 只有**本地构建**时才需要设成最终地址；线上由工作流的 `--baseURL` 覆盖 | 本地预览链接与线上不一致 |

## 站点类型

GitHub Pages 站点分三种：项目站点、用户站点和组织站点。项目站点与 GitHub 上的某个具体项目绑定；用户站点和组织站点与 GitHub.com 上的某个账号绑定。

> [!NOTE]
> 仓库的归属与命名要求请查阅 [GitHub Pages 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages#types-of-github-pages-sites)。

## 前提条件

继续之前请先完成以下事项：

1. [注册](https://github.com/signup) GitHub 账号。
2. [登录](https://github.com/login) GitHub 账号。
3. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
4. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
5. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
6. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：把发布源改为 GitHub Actions

打开你的 GitHub 仓库，在主菜单中依次选择 **Settings** > **Pages**。把 **Source** 改为 `GitHub Actions`。改动立即生效，不需要点击保存按钮。

**你应当看到什么**：页面刷新后 Source 一栏显示 `GitHub Actions`。如果这里仍是「Deploy from a branch」，那么无论工作流成功多少次，站点都不会更新——这是最容易忽略的一步。

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

**你应当看到什么**：`build` 任务的日志里，`Setup Pages` 一步会输出 `base_url`；构建完成后 Artifacts 区能找到名为 `github-pages` 的产物。`deploy` 任务的日志末尾给出 `page_url`，那才是最终网址。

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

图片会落在**当前 `cacheDir`** 下的 `images/`，而不是固定的项目路径。第 2 步工作流里的 `--cacheDir "${{ runner.temp }}/.cache/hugo"` 把 CI 侧的缓存目录定在这里，`actions/cache/restore`、`actions/cache/save` 也按同一路径保存与恢复，因此 CI 上处理过的图片位于 `${{ runner.temp }}/.cache/hugo/images`。

**本地**未设置 `HUGO_CACHEDIR`、也未传 `--cacheDir` 时，用的是系统用户缓存目录（实测 v0.167.0 + Windows 为 `%LocalAppData%\hugo_cache`；上游文档说明 macOS 为 `$HOME/Library/Caches`，Linux 为 `$XDG_CACHE_HOME` 或 `$HOME/.cache`）。想确认当前值，运行 `hugo config` 查看 `cachedir` 一行即可。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送并观察部署

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。

### 第 5 步：查看 Actions

在 GitHub 主菜单中点击 **Actions**，可以看到工作流开始运行。

### 第 6 步：确认状态为绿

构建与部署结束后，状态指示器的颜色会变为绿色。

### 第 7 步：找到站点链接

点击对应的提交信息，在 deploy 步骤下会看到指向线上站点的链接。之后每次推送改动，GitHub Pages 都会重新构建并部署站点。

## 失败时：典型报错与排查入口

排查入口是 **GitHub 仓库 → Actions → 点开那次运行**，以及 **Settings** > **Pages** 顶部的当前发布状态。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 工作流全绿，但网址一直 404 | Pages 的 Source 仍是「Deploy from a branch」 | 回到第 1 步，把 Source 改成 `GitHub Actions`，然后重跑一次工作流 |
| `Setup Pages` 一步失败 | 仓库没有开启 Pages，或账号/组织策略禁止 | 先在 **Settings** > **Pages** 里手动开启一次；组织仓库需确认策略允许 |
| deploy 任务报权限不足（形如 `Resource not accessible by integration`） | 工作流缺少 Pages 写权限 | 确认顶层有 `permissions: pages: write` 与 `id-token: write`，不要被仓库的默认权限设置覆盖 |
| deploy 任务报环境相关错误或一直等待 | `github-pages` 环境设置了保护规则（需人工批准） | 到 **Settings** > **Environments** 检查 `github-pages` 的审批设置 |
| 首页能开，内页或样式的地址指向了域名根 | 站点在子路径下，但模板里硬编码了以 `/` 开头的绝对地址 | 用 Hugo 生成的相对地址（`relURL`、`relref`），或确认 `--baseURL` 已带上子路径；见下文「子路径与相对链接」 |
| 不存在的路径没有返回你的 404 页 | 仓库里没有 `public/404.html` | 在 `layouts/` 下添加 404 模板并重新部署 |
| 构建报模板或参数不存在 | 线上 Hugo 版本与本地不同 | 把 `HUGO_VERSION` 改成 `hugo version` 显示的版本 |
| 每次构建都重新处理图片 | 缓存路径不一致 | 让 `--cacheDir` 与 `[caches.images].dir` 指向同一处 |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在仓库的 **Settings** > **Pages** 中填入自定义域名，并按 GitHub 的提示在 DNS 侧添加记录。域名不需要写进配置文件：该域名启用后，第 2 步中的 `actions/configure-pages` 会把 `base_url` 输出为该自定义域名，工作流再通过 `--baseURL` 在构建时覆盖站点地址，因此项目站点、用户站点与组织站点都无需手工修改 `baseURL`。只有当你跳过该工作流、在本机直接运行 `hugo` 构建时，才需要自己把 `baseURL` 设成最终对外地址。

**子路径与相对链接**：项目站点的默认地址带有仓库名这一段子路径，而构建时覆盖的 `baseURL` 已经包含该子路径，因此站点内链接与静态资源引用应尽量使用 Hugo 生成的相对地址，避免硬编码以 `/` 开头的绝对路径。判断方法：部署后打开首页查看源码，`<link href="...">`、`<img src="...">` 里如果出现 `https://<用户名>.github.io/css/...`（缺了仓库名一段），就是这里错了。

## 相关资源

- [GitHub Pages 通用文档](https://docs.github.com/en/pages)
- [自定义域名设置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
