+++
title = "部署到 AWS Amplify"
linkTitle = "部署到 AWS Amplify"
description = "把 GitHub 仓库接到 AWS Amplify 持续部署：写 amplify.yml、填对工具版本与发布目录、确认站点上线，以及构建失败时的排查入口。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/host-and-deploy/host-on-aws-amplify/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "一个 AWS 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "仓库根目录可以新增文件（`amplify.yml`）并提交推送",
]
outcomes = [
  "在仓库根目录写出可用的 `amplify.yml`，让 Amplify 在构建机上装好 Hugo 并构建站点",
  "说清 `HUGO_VERSION`、`HUGO_CACHEDIR`、`artifacts.baseDirectory` 三个值各自控制什么",
  "在 Amplify 控制台完成从仓库到线上站点的全流程，并找到已发布网址",
  "构建失败或页面 404 时，按日志定位是版本、路径还是 `baseURL` 的问题",
]
next = ["/host-and-deploy/host-on-azure-static-web-apps/", "/host-and-deploy/host-on-cloudflare/", "/configuration/caches/", "/troubleshooting/"]
+++

下面这些步骤用于实现从 GitHub 仓库持续部署。其他 Git 服务商（例如 GitLab、Bitbucket）的总体流程相同。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里写一个 `amplify.yml` → 在控制台把仓库接进来 → 等构建完成 → 拿到网址**。

分工要说清楚：**构建在 AWS 的机器上发生**，不在你的电脑上。所以「本地能构建」不等于「线上能构建」——线上缺少的 Hugo、Dart Sass、Go、Node.js，都要由 `amplify.yml` 现装。这也是最常见的失败来源。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 写构建配置 | 在仓库根目录创建 `amplify.yml`（第 1 步） | 文件与 `hugo.toml` 同级；`git status` 能看到它是新增文件 |
| 3. 配置缓存 | 在项目配置中设置 `[caches.images]`（第 2 步） | 配置保存后本地再跑一次 `hugo` 仍成功 |
| 4. 推送 | `git add -A && git commit && git push`（第 3 步） | GitHub 仓库页面上能看到这两个文件 |
| 5. 接入 Amplify | 控制台创建应用并选择仓库与分支（第 4–9 步） | 「App settings」页面出现后，说明仓库已连上 |
| 6. 部署 | 确认后按 **Save and deploy**（第 10–11 步） | Amplify 页面进入构建进度，日志里能看到 `Installing Hugo` 与 `hugo version` 输出 |
| 7. 访问 | 按 **Visit deployed URL**（第 12 步） | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `HUGO_VERSION` | `amplify.yml` 的 `env.variables` | 与本地一致的版本，例如 `0.167.0` | 构建机上装到你没测过的版本，可能报模板或参数不存在 |
| `DART_SASS_VERSION` | 同上 | 需要 Sass 时填，例如 `1.105.0` | 站点用了 Sass 时构建报找不到 `sass` |
| `GO_VERSION` / `NODE_VERSION` | 同上 | 站点用了 Hugo Modules / npm 依赖时才需要 | 用到 `go.mod` 或 `package-lock.json` 时构建失败 |
| `TZ` | 同上 | 构建时区，例如 `Europe/Oslo` | `date` 相关的输出与预期差几个小时 |
| `HUGO_CACHEDIR` | 同上 | 缓存目录路径，需与 `cache.paths` 一致 | 缓存不生效，每次构建都重新处理图片 |
| `artifacts.baseDirectory` | `amplify.yml` 的 `artifacts` | `public` | 部署成功但网址 404 |
| `baseURL` | 项目配置文件 | 最终访问地址 | 页面能打开但样式、站内链接指向错误地址 |

## 前提条件

继续之前，请先完成以下任务：

1. [创建](https://aws.amazon.com/resources/create-account/)一个 AWS 账号。
2. [登录](https://console.aws.amazon.com/)你的 AWS 账号。
3. [创建](https://github.com/signup)一个 GitHub 账号。
4. [登录](https://github.com/login)你的 GitHub 账号。
5. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
6. 为项目[创建](https://git-scm.com/docs/git-init)一个本地 Git 仓库，并添加指向该 GitHub 仓库的[远端（remote）](https://git-scm.com/docs/git-remote)引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

**第 1 步：创建 `amplify.yml`**

在项目根目录下创建 `amplify.yml` 文件，按需要调整工具版本和时区。`HUGO_VERSION` 等变量的值要与站点实际需要的版本一致：

```yaml {file="amplify.yml"}
version: 1
env:
  variables:
    # 定义工具版本
    DART_SASS_VERSION: 1.105.0
    GO_VERSION: 1.27.1
    HUGO_VERSION: 0.167.0
    NODE_VERSION: 24.21.0

    # 设置构建时区
    TZ: Europe/Oslo

    # 设置构建缓存目录
    HUGO_CACHEDIR: ${PWD}/.cache/hugo
frontend:
  phases:
    preBuild:
      commands:
        # 创建用于下载的临时目录
        - build_temp_dir=$(mktemp -d)

        # 创建本地工具目录
        - mkdir -p "${HOME}/.local"

        # 安装 Dart Sass
        - |
          echo "Installing Dart Sass ${DART_SASS_VERSION}..."
          curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          tar -C "${HOME}/.local" -xf "${build_temp_dir}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          export PATH="${HOME}/.local/dart-sass:${PATH}"

        # 安装 Go
        - |
          if [[ -f "go.mod" ]]; then
            echo "Installing Go ${GO_VERSION}..."
            curl -sfL --output-dir "${build_temp_dir}" -O "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
            tar -C "${HOME}/.local" -xf "${build_temp_dir}/go${GO_VERSION}.linux-amd64.tar.gz"
            export PATH="${HOME}/.local/go/bin:${PATH}"
          fi

        # 安装 Hugo
        - |
          echo "Installing Hugo ${HUGO_VERSION}..."
          curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          mkdir -p "${HOME}/.local/hugo"
          tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          export PATH="${HOME}/.local/hugo:${PATH}"

        # 安装 Node.js
        - |
          if [[ -f "package-lock.json" ]]; then
            echo "Installing Node.js ${NODE_VERSION}..."
            curl -sfL --output-dir "${build_temp_dir}" -O "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz"
            tar -C "${HOME}/.local" -xf "${build_temp_dir}/node-v${NODE_VERSION}-linux-x64.tar.gz"
            export PATH="${HOME}/.local/node-v${NODE_VERSION}-linux-x64/bin:${PATH}"
          fi

        # 在构建日志中打印各工具的版本，便于排查问题
        - |
          echo "Logging tool versions..."
          command -v sass &> /dev/null && echo "Dart Sass: $(sass --version)" || echo "Dart Sass: not installed"
          command -v go &> /dev/null && echo "Go: $(go version)" || echo "Go: not installed"
          command -v hugo &> /dev/null && echo "Hugo: $(hugo version)" || echo "Hugo: not installed"
          command -v node &> /dev/null && echo "Node.js: $(node --version)" || echo "Node.js: not installed"

        # 配置 Git
        - |
          echo "Configuring Git..."
          git config --global core.quotepath false

        # 获取完整的 Git 历史
        - |
          if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
            echo "Fetching full Git history..."
            git fetch --unshallow
          fi

        # 初始化 Git 子模块
        - |
          if [[ -f .gitmodules ]]; then
            echo "Initializing Git submodules..."
            git submodule update --init --recursive
          fi

        # 安装 Node.js 依赖
        - |
          if [[ -f package-lock.json ]]; then
            echo "Installing Node.js dependencies..."
            npm ci
          fi
    build:
      commands:
        # 构建项目
        - |
          echo "Building the project..."
          hugo build --gc --minify
  artifacts:
    baseDirectory: public
    files:
      - '**/*'
  cache:
    paths:
      - .cache/hugo/**/*
```

**你应当看到什么**：把文件保存好之后，本地执行 `hugo build --gc --minify` 仍然成功。真正的验证在部署日志里——构建开始后，日志中会出现 `Installing Hugo 0.167.0...`、`Hugo: hugo v0.167.0...` 与 `Building the project...` 三处输出；只要版本号与你填的一致，就说明配置生效了。

关于 `hugo build --gc --minify` 这段构建命令：

- `hugo build` 是带子命令的构建写法，与本页它处的 `hugo` 等价；`--gc` 构建后清理无用缓存，`--minify` 压缩输出的 HTML/CSS/JS；
- 脚本自己下载指定版本的 Hugo，所以**实际生效的版本就是 `HUGO_VERSION`**，与平台镜像里带的版本无关；
- `artifacts.baseDirectory: public` 告诉 Amplify 从哪里取产物，这个值必须是 `public`（或你自定义的 `publishDir`）。

**第 2 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅[配置文件缓存](/configuration/caches/)。

> [!TIP]
> 这里的 `HUGO_CACHEDIR`（构建时）与 `[caches.images].dir`（Hugo 配置）指向的是**同一份缓存**：Hugo 按 `cacheDir` 决定把处理过的图片放哪，Amplify 按 `cache.paths` 决定把哪些目录在多次构建之间保留下来。两边对不上时，缓存会「看起来配了但没用」。

**第 3 步：提交并推送改动**

```bash
git add -A
git commit -m "Create amplify.yml"
git push
```

**第 4 步：进入 Amplify 控制台**

登录 AWS 账号，进入 [Amplify 控制台](https://console.aws.amazon.com/amplify/apps)，然后按下 **Deploy an app**（部署应用）按钮。

**第 5 步：选择源码提供商**

选择源码提供商（source code provider），然后按下 **Next** 按钮。

**第 6 步：授权访问 GitHub**

授权 AWS Amplify 访问你的 GitHub 账号。

**第 7 步：选择账号或组织**

选择你的个人账号或所属的组织。

**第 8 步：授权仓库**

授权 Amplify 访问一个或多个仓库。

**第 9 步：选择仓库与分支**

选择要部署的仓库和分支，然后按下 **Next** 按钮。

**第 10 步：应用设置**

在 "App settings" 页面上滚动到底部，然后按下 **Next** 按钮。Amplify 会读取你在第 1 至 3 步创建的 `amplify.yml`，而不是使用本页填写的值。

**第 11 步：确认并部署**

在 "Review" 页面上滚动到底部，然后按下 **Save and deploy** 按钮。

**第 12 步：查看站点**

站点部署完成后，按下 **Visit deployed URL** 按钮查看已发布的站点。

**你应当看到什么**：第 12 步的页面地址由 Amplify 分配（形如 `https://main.xxxxxx.amplifyapp.com`）。打开后应当是完整的站点，而不只是一句欢迎语；如果只有平台默认页，说明 `artifacts.baseDirectory` 或 `publishDir` 不一致。

## 失败时：典型报错与排查入口

排查 Deployment 的入口始终是同一个：**Amplify 控制台 → 你的应用 → 对应分支 → 构建详情页的日志**。日志按 `preBuild` / `build` 分节，报错行会标明是哪一个命令失败。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 日志里 `hugo: command not found` | 安装 Hugo 的那一段没执行，或 `PATH` 没导出到后续命令 | 确认日志里出现过 `Installing Hugo ...`；安装那一段所在的同一个多行命令块内必须 `export PATH`，跨块使用依赖前一步的 `PATH` 会丢失 |
| 构建报 Dart Sass 相关错误 | 站点用到 Sass，但 `DART_SASS_VERSION` 缺失或安装失败 | 检查日志里 `Dart Sass: ...` 一行；填上版本号，网络超时则重试构建 |
| 构建报模板或参数不存在 | 线上 Hugo 版本与本地不同 | 把 `HUGO_VERSION` 改成 `hugo version` 显示的版本并重新推送 |
| 构建成功，但网址 404 或只有默认页 | `artifacts.baseDirectory` 不是真正的发布目录 | 改成 `public`（或你配置的 `publishDir`），重新部署 |
| 页面能打开，样式与图片丢失 | `baseURL` 仍是本地地址或旧的临时域名 | 把 `baseURL` 改成最终访问地址后重新推送 |
| 日志里 `Dart Sass: not installed` 但构建通过 | 站点其实没用到 Sass | 无需处理：这段输出只是版本记录 |
| 图片每次都重新处理，构建很慢 | 缓存路径与 `HUGO_CACHEDIR` 不一致 | 核对 `cache.paths` 与 `HUGO_CACHEDIR` 指向同一目录 |

更一般的症状分诊（命令找不到 / 没报错但结果不对 / 报错看不懂）见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 域名与重定向

首次部署完成后，Amplify 会为应用分配一个默认域名。它适合用来验证站点是否正常，但不适合作为对外发布的地址。

- **绑定自定义域名后要改 `baseURL`。** 页面里的绝对链接、站点地图和 RSS 都基于 `baseURL` 生成。绑定自定义域名后，把项目配置中的 `baseURL` 改成该域名并重新提交推送，否则这些地址仍会指向默认域名。
- **404 页面。** Hugo 可以生成 `public/404.html`。如果希望自定义域名下返回自己的错误页，需要在 Amplify 控制台中配置重定向与重写规则，具体入口以官方文档为准。
- **尾斜杠与重定向。** Hugo 默认输出以 `/` 结尾的 URL。如果平台侧同时配置了强制去除尾斜杠或其它重定向规则，请确认两者不冲突，避免出现多余的跳转链。
- **缓存。** 重新部署不等于所有访客立刻拿到新文件，更新样式或图片后要留意旧缓存的影响。

## 相关资源

要进一步了解如何用 AWS Amplify 托管和管理站点，请查阅官方文档：

- [通用文档](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [自定义域名设置](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)
