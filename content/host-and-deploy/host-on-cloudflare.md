+++
title = "部署到 Cloudflare Pages"
linkTitle = "部署到 Cloudflare Pages"
description = "用 Wrangler 把 Hugo 站点部署到 Cloudflare：wrangler.jsonc、构建脚本、构建缓存与定时重建，附构建失败与 404 的排查入口。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/host-and-deploy/host-on-cloudflare/"

[params.teach]
difficulty = "进阶"
time = "35–45 分钟"
prereq = [
  "一个 Cloudflare 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在仓库根目录新增 `wrangler.jsonc` 与 `build.sh` 并提交推送",
]
outcomes = [
  "用 `wrangler.jsonc` 声明构建命令与静态资源目录，让 Cloudflare 在构建机上跑你自己的 `build.sh`",
  "说清「Build command 留空、Deploy command 是 npx wrangler deploy」的原因，避开重复构建",
  "启用 Cloudflare 构建缓存，让图片处理不必每次重跑",
  "用部署钩子 + GitHub Actions 实现定时重建，并知道定时任务延迟时怎么办",
]
next = ["/host-and-deploy/host-on-netlify/", "/host-and-deploy/host-on-vercel/", "/functions/resources/getremote/", "/troubleshooting/"]
+++

下面这些步骤用于实现从 GitHub 仓库持续部署。其他 Git 服务商（例如 GitLab、Bitbucket）的总体流程相同。控制台入口位于 Cloudflare 的 **Workers & Pages** 之下。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里放一个 `wrangler.jsonc` 与一个 `build.sh` → 在控制台把仓库接进来 → 等构建完成 → 拿到 `workers.dev` 网址**。

Cloudflare 这条路线的分工与多数平台不同，理解这一点能省下大量排查时间：

- **真正的构建由你写的 `build.sh` 完成**，它负责把 Hugo 等工具装好再执行 `hugo build`；
- Cloudflare 侧的 **Build command 要留空**，**Deploy command 保持 `npx wrangler deploy`**；
- `wrangler.jsonc` 里的 `build.command` 才是触发 `build.sh` 的地方。

三处任意一处填错，表现都是「构建日志很短就结束」或「找不到 public 目录」。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 写 Wrangler 配置 | 创建 `wrangler.jsonc`（第 1 步） | 文件在仓库根目录，`assets.directory` 是 `./public` |
| 3. 写构建脚本 | 创建 `build.sh`（第 2 步） | 本地能执行 `bash build.sh` 并成功产出 `public/` |
| 4. 配置缓存 | 设置 `[caches.images]`（第 3 步） | 本地再跑一次 `hugo` 仍成功 |
| 5. 推送 | 提交并推送到 GitHub（第 4 步） | 仓库页面上能看到这两个新文件 |
| 6. 接入 Worker | 控制台创建 Worker 并连接仓库（第 5–10 步） | 「Set up your application」页面出现，说明仓库已连上 |
| 7. 设置并部署 | 关掉 Build command、设置 `SKIP_DEPENDENCY_INSTALL`，按 **Deploy**（第 11 步） | 构建日志里出现 `Installing Hugo ...` 与 `Building the project...` |
| 8. 访问 | 按 **Visit**（第 12 步） | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `name` | `wrangler.jsonc` | 项目名（会出现在 Workers 项目列表里） | 名称冲突或难以辨认 |
| `compatibility_date` | `wrangler.jsonc` | 今天的日期，格式 `YYYY-MM-DD` | 使用较旧或未定义的运行时行为 |
| `assets.directory` | `wrangler.jsonc` | `./public` | 部署成功但站点 404 |
| `not_found_handling` | `wrangler.jsonc` | `404-page` | 找不到的路径不返回你的 404 页 |
| `HUGO_VERSION` 等 | `build.sh` 顶部 | 与本地一致的版本 | 线上报模板或参数不存在 |
| `HUGO_CACHEDIR` | `build.sh` 顶部 | 缓存目录，需与 Cloudflare 构建缓存路径一致 | 缓存不生效 |
| **Build command** | 控制台应用设置 | **留空** | 构建重复执行或直接失败 |
| **Deploy command** | 控制台应用设置 | `npx wrangler deploy` | 产物不发布 |
| `SKIP_DEPENDENCY_INSTALL` | 控制台环境变量 | `true` | 平台额外的依赖安装与脚本互相干扰 |
| `baseURL` | 项目配置文件 | 最终访问地址 | 页面能打开但样式、站内链接指向错误地址 |

## 前提条件

继续之前，请先完成以下任务：

1. [创建](https://dash.cloudflare.com/sign-up)一个 Cloudflare 账号。
2. [登录](https://dash.cloudflare.com/login)你的 Cloudflare 账号。
3. [创建](https://github.com/signup)一个 GitHub 账号。
4. [登录](https://github.com/login)你的 GitHub 账号。
5. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
6. 为项目[创建](https://git-scm.com/docs/git-init)一个本地 Git 仓库，并添加指向该 GitHub 仓库的[远端（remote）](https://git-scm.com/docs/git-remote)引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

**第 1 步：创建 `wrangler.jsonc`**

在项目根目录下创建 `wrangler.jsonc` 文件：

```jsonc {file="wrangler.jsonc"}
{
  // 设置为你项目的名称。
  "name": "test",
  // 设置为今天的日期，格式为 YYYY-MM-DD。
  "compatibility_date": "2026-06-19",
  "build": {
    "command": "chmod a+x build.sh && ./build.sh"
  },
  "assets": {
    "directory": "./public",
    "not_found_handling": "404-page"
  }
}
```

其中 `assets.directory` 指向 Hugo 的发布目录 `./public`，`not_found_handling` 设为 `404-page`，表示找不到资源时返回 404 页面。

**第 2 步：创建 `build.sh`**

在项目根目录下创建 `build.sh` 文件，按需要调整工具版本和时区：

```sh {file="build.sh"}
#!/usr/bin/env bash

#------------------------------------------------------------------------------
# 在 Cloudflare Worker 上构建 Hugo 项目。
#------------------------------------------------------------------------------

# 出错、使用未定义变量或管道失败时立即退出
set -euo pipefail

# 定义工具版本
DART_SASS_VERSION=1.105.0
GO_VERSION=1.27.1
HUGO_VERSION=0.167.0
NODE_VERSION=24.21.0

# 设置构建时区
TZ=Europe/Oslo

# 设置构建缓存目录
HUGO_CACHEDIR="${PWD}/.cache/hugo"

# 清理临时目录
cleanup() {
  if [[ -n "${build_temp_dir:-}" && -d "${build_temp_dir}" ]]; then
    rm -rf "${build_temp_dir}"
  fi
}

# 注册清理钩子
trap cleanup EXIT SIGINT SIGTERM

main() {
  # 导出构建时区与构建缓存目录
  export TZ
  export HUGO_CACHEDIR

  # 创建用于下载的临时目录
  build_temp_dir=$(mktemp -d)

  # 创建本地工具目录
  mkdir -p "${HOME}/.local"

  # 安装 Dart Sass
  echo "Installing Dart Sass ${DART_SASS_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  tar -C "${HOME}/.local" -xf "${build_temp_dir}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  export PATH="${HOME}/.local/dart-sass:${PATH}"

  # 安装 Go
  if [[ -f "go.mod" ]]; then
    echo "Installing Go ${GO_VERSION}..."
    curl -sfL --output-dir "${build_temp_dir}" -O "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
    tar -C "${HOME}/.local" -xf "${build_temp_dir}/go${GO_VERSION}.linux-amd64.tar.gz"
    export PATH="${HOME}/.local/go/bin:${PATH}"
  fi

  # 安装 Hugo
  echo "Installing Hugo ${HUGO_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  mkdir -p "${HOME}/.local/hugo"
  tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  export PATH="${HOME}/.local/hugo:${PATH}"

  # 安装 Node.js
  if [[ -f "package-lock.json" ]]; then
    echo "Installing Node.js ${NODE_VERSION}..."
    curl -sfL --output-dir "${build_temp_dir}" -O "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz"
    tar -C "${HOME}/.local" -xf "${build_temp_dir}/node-v${NODE_VERSION}-linux-x64.tar.gz"
    export PATH="${HOME}/.local/node-v${NODE_VERSION}-linux-x64/bin:${PATH}"
  fi

  # 在构建日志中打印各工具的版本
  echo "Logging tool versions..."
  command -v sass &> /dev/null && echo "Dart Sass: $(sass --version)" || echo "Dart Sass: not installed"
  command -v go &> /dev/null && echo "Go: $(go version)" || echo "Go: not installed"
  command -v hugo &> /dev/null && echo "Hugo: $(hugo version)" || echo "Hugo: not installed"
  command -v node &> /dev/null && echo "Node.js: $(node --version)" || echo "Node.js: not installed"

  # 配置 Git
  echo "Configuring Git..."
  git config --global core.quotepath false

  # 获取完整的 Git 历史
  if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
    echo "Fetching full Git history..."
    git fetch --unshallow
  fi

  # 初始化 Git 子模块
  if [[ -f .gitmodules ]]; then
    echo "Initializing Git submodules..."
    git submodule update --init --recursive
  fi

  # 安装 Node.js 依赖
  if [[ -f package-lock.json ]]; then
    echo "Installing Node.js dependencies..."
    npm ci
  fi

  # 构建项目
  echo "Building the project..."
  hugo build --gc --minify
}

main "$@"
```

**你应当看到什么**：本地用 `bash build.sh` 跑一遍，它应当打印 `Installing Hugo ...`，最后成功产出 `public/`。这一步能在本地验证的，就不要留到云端——脚本里的下载地址、`PATH` 导出顺序都在这里暴露。

**第 3 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅[配置文件缓存](/configuration/caches/)。

**第 4 步：提交并推送**

把改动提交到本地 Git 仓库，并推送到你的 GitHub 仓库。

**第 5 步：新建 Worker**

在 [Cloudflare 控制台](https://dash.cloudflare.com/)的右上角按下 **Add** 按钮，然后在下拉菜单中选择 "Workers"。

**第 6 步：验证账号**

如果系统提示，请先完成账号验证。

**第 7 步：连接 GitHub**

在 "Create a Worker" 页面中，找到 "Ship something new" 标题，按下 **Connect GitHub** 按钮。

**第 8 步：选择 GitHub 账号**

选择你要安装 Cloudflare Workers and Pages 应用的 GitHub 账号。

**第 9 步：授权**

授权 Cloudflare Workers and Pages 应用访问全部仓库或仅访问选定仓库，然后按下 **Install & Authorize** 按钮。

**第 10 步：选择仓库**

在 "Create a Worker" 页面的 "Select a repository" 标题下选择要部署的仓库，然后按下 **Next** 按钮。

**第 11 步：设置应用**

在 "Create a Worker" 页面的 "Set up your application" 标题下完成以下操作：

1. 填写 **Project name**（项目名称）。
2. 把 **Build command** 留空，并确认 **Deploy command** 为 `npx wrangler deploy`。
3. 展开 **Advanced settings** 面板。
4. 在 **Variable name** 字段中填入 `SKIP_DEPENDENCY_INSTALL`。
5. 在 **Variable value** 字段中填入 `true`。
6. 按下 **Deploy** 按钮。

> [!TIP]
> 第 2 小步的「**Build command 留空**」不是漏填。构建由 `wrangler.jsonc` 的 `build.command` 触发，在你的机器上跑 `build.sh`；如果这里也填一条构建命令，就会出现两次构建，或者在一个没装 Hugo 的环境里先失败。

**第 12 步：查看站点**

等待站点构建并部署完成，然后按下屏幕左上角的 **Visit** 按钮。

**你应当看到什么**：构建日志里应当依次出现 `Installing Hugo ...`、`Hugo: hugo v...`、`Building the project...`，最后是 wrangler 上传资源的输出；访问网址时首页正常，随便打开一个不存在的路径应当返回你的 404 页面。此后，只要你从本地 Git 仓库推送改动，Cloudflare 就会重新构建并部署你的站点。

## 构建缓存

第 2 步中的构建脚本把 Hugo 的 `cacheDir` 设置为 Cloudflare 构建缓存要求的路径，而该缓存默认是关闭的。要启用 Cloudflare 构建缓存，需要完成两件事。

第一，项目根目录下必须同时存在 `package.json` 和 `package-lock.json`。如果你只有 `package.json`，执行 `npm install` 生成对应的 `package-lock.json`。如果你的项目不需要任何 Node.js 包，执行 `npm init -y && npm install` 生成这两个文件。

第二，在项目控制台中启用构建缓存：

1. 在控制台中进入 **Workers & Pages** 概览页。
2. 找到你的 Workers 项目。
3. 进入 **Settings** > **Build** > **Build cache**。
4. 按下 **Enable** 按钮。

**你应当看到什么**：缓存启用后，第二次部署的日志里不会再重新处理所有图片；构建耗时会明显下降。若毫无变化，先回到第一点——缺少 `package-lock.json` 时缓存不会生效。

## 定时构建

如果你的站点使用 `resources.GetRemote` 在构建时获取外部数据，这些数据会在构建时嵌入静态 HTML。没有定时构建的话，数据只会在有人向仓库提交代码时刷新。为了让内容保持最新，可以创建 Cloudflare 部署钩子（deploy hook），并由 GitHub Actions 工作流按计划调用它。

**第 1 步：创建部署钩子**

在 Cloudflare 控制台中进入 **Workers & Pages**，选择你的项目，然后进入 **Settings** > **Builds** > **Deploy Hooks**。按下 **Create deploy hook**，填写一个名称（例如 `github-cron`），然后复制生成的 URL。

**第 2 步：保存为仓库机密**

在你的 GitHub 仓库中进入 **Settings** > **Secrets and variables** > **Actions**。按下 **New repository secret**，命名为 `CLOUDFLARE_DEPLOY_HOOK`，把部署钩子 URL 粘贴为值，然后保存。

**第 3 步：创建工作流文件**

在仓库中创建 GitHub Actions 工作流文件：

```yaml {file=".github/workflows/scheduled-cloudflare-deploy.yaml"}
name: github-cron
on:
  schedule:
    - cron: "42 7 * * *"
      timezone: Etc/UTC

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cloudflare deploy hook
        run: curl -X POST "${{ secrets.CLOUDFLARE_DEPLOY_HOOK }}"
```

调整 [`cron`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) 表达式即可设定所需的构建计划。上面的例子把任务安排在每天 UTC 时间 7:42 运行。

**第 4 步：提交并推送**

把改动提交到本地 Git 仓库，并推送到你的 GitHub 仓库。

> [!NOTE]
> 在 GitHub Actions 工作流运行的高峰时段，schedule 事件可能会被延迟，整点前后尤其明显。如果负载足够高，部分排队中的任务可能被丢弃。为降低延迟概率，可以把工作流安排在每小时的其它时间，或者使用 [Google Cloud Scheduler](https://docs.cloud.google.com/scheduler/docs/overview)、[cron-job.org](https://cron-job.org/en/) 这类第三方定时服务。

**你应当看到什么**：定时任务到点后，GitHub Actions 里出现一次运行记录，Cloudflare 项目的部署列表中多出一次由 `github-cron` 触发的部署。也可以先在 Actions 页面手动触发一次 `workflow_dispatch`（若你加了）或直接执行一次，确认部署钩子本身可用。

## 失败时：典型报错与排查入口

排查入口两个：**Cloudflare 控制台 → Workers & Pages → 你的项目 → 部署记录（看构建日志）**，以及 **GitHub 仓库 → Actions（看定时任务）**。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 构建日志很短就结束，报 `build.sh: not found` 或权限错误 | `build.sh` 不在仓库根目录，或没提交推送 | 确认文件在根目录且已在仓库中；`wrangler.jsonc` 里用的是 `chmod a+x build.sh && ./build.sh` |
| 日志报 `hugo: command not found` | `build.sh` 没被执行，或 Hugo 下载失败 | 看日志开头是否出现 `Installing Hugo`；没有就是触发方式不对（回到第 11 步的 Build command 设置） |
| 构建重复执行两次 | 控制台的 Build command 也填了命令 | 把 Build command 清空，只留 `wrangler.jsonc` 的 `build.command` |
| 部署成功但访问 404 | `assets.directory` 不是真正的发布目录，或 `build.sh` 没生成 `public/` | 核对 `assets.directory` 为 `./public`；看构建日志末尾是否成功产出文件 |
| 不存在的路径不显示你的 404 页 | `not_found_handling` 不是 `404-page`，或 Hugo 没生成 `404.html` | 修正配置；确认 `public/404.html` 存在 |
| 页面能打开但样式、图片丢失 | `baseURL` 与最终地址不一致 | 把 `baseURL` 改成最终域名后重新推送 |
| 构建每次都很慢，图片重新处理 | 构建缓存没启用，或缺 `package.json`/`package-lock.json` | 按本页「构建缓存」两件事逐条检查 |
| 定时任务没触发 | GitHub Actions schedule 被延迟或丢弃；Secret 名不符 | 换到非整点时间或改用第三方定时服务；核对 Secret 名为 `CLOUDFLARE_DEPLOY_HOOK` |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 域名与重定向

项目部署完成后会得到一个以 `workers.dev` 结尾的地址，它适合用来验证站点，但不适合作为对外发布的地址。

- **绑定自定义域名后要改 `baseURL`。** 页面里的绝对链接、站点地图和 RSS 都基于 `baseURL` 生成。绑定自定义域名后，把项目配置中的 `baseURL` 改成该域名并重新推送。
- **404 页面。** `wrangler.jsonc` 中的 `not_found_handling` 设为 `404-page`，表示找不到资源时返回 404 页面，因此需要 Hugo 生成对应的 404 页面。
- **尾斜杠与重定向。** Hugo 默认输出以 `/` 结尾的 URL。如果平台侧同时配置了强制去除尾斜杠或其它重定向规则，请确认两者不冲突。
- **缓存。** 重新部署不等于所有访客立刻拿到新文件，更新样式或图片后要留意旧缓存的影响。

## 相关资源

要进一步了解如何用 Cloudflare Workers 托管和管理站点，请查阅官方文档：

- [通用文档](https://developers.cloudflare.com/workers/)
- [自定义域名设置](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
