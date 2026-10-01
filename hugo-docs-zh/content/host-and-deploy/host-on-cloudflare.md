+++
title = "部署到 Cloudflare Pages"
linkTitle = "部署到 Cloudflare Pages"
description = "在 Cloudflare 上托管 Hugo 站点并定时重建。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/host-and-deploy/host-on-cloudflare/"
+++

下面这些步骤用于实现从 GitHub 仓库持续部署。其他 Git 服务商（例如 GitLab、Bitbucket）的总体流程相同。控制台入口位于 Cloudflare 的 **Workers & Pages** 之下。

> **注意：** 不要把发布目录（`public`）的内容提交到仓库，Hugo 会在构建项目时重新创建它。

## 前提条件

继续之前，请先完成以下任务：

1. 创建一个 Cloudflare 账号。
2. 登录你的 Cloudflare 账号。
3. 创建一个 GitHub 账号。
4. 登录你的 GitHub 账号。
5. 为你的项目创建一个 GitHub 仓库。
6. 为项目创建一个本地 Git 仓库，并添加指向该 GitHub 仓库的远端（remote）引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

**第 1 步：创建 `wrangler.jsonc`**

在项目根目录下创建 `wrangler.jsonc` 文件：

```text
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

```bash
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

  # 存在 go.mod 时安装 Go（${GO_VERSION}），
  # 存在 package-lock.json 时安装 Node.js（${NODE_VERSION}）。

  # 安装 Hugo
  echo "Installing Hugo ${HUGO_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  mkdir -p "${HOME}/.local/hugo"
  tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  export PATH="${HOME}/.local/hugo:${PATH}"

  # 配置 Git
  git config --global core.quotepath false

  # 获取完整的 Git 历史
  if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
    git fetch --unshallow
  fi

  # 初始化 Git 子模块
  if [[ -f .gitmodules ]]; then
    git submodule update --init --recursive
  fi

  # 安装 Node.js 依赖
  if [[ -f package-lock.json ]]; then
    npm ci
  fi

  # 构建项目
  echo "Building the project..."
  hugo build --gc --minify
}

main "$@"
```

**第 3 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅官方文档的「配置文件缓存」章节。

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

**第 12 步：查看站点**

等待站点构建并部署完成，然后按下屏幕左上角的 **Visit** 按钮。

此后，只要你从本地 Git 仓库推送改动，Cloudflare 就会重新构建并部署你的站点。

## 构建缓存

第 2 步中的构建脚本把 Hugo 的 `cacheDir` 设置为 Cloudflare 构建缓存要求的路径，而该缓存默认是关闭的。要启用 Cloudflare 构建缓存，需要完成两件事。

第一，项目根目录下必须同时存在 `package.json` 和 `package-lock.json`。如果你只有 `package.json`，执行 `npm install` 生成对应的 `package-lock.json`。如果你的项目不需要任何 Node.js 包，执行 `npm init -y && npm install` 生成这两个文件。

第二，在项目控制台中启用构建缓存：

1. 在控制台中进入 **Workers & Pages** 概览页。
2. 找到你的 Workers 项目。
3. 进入 **Settings** > **Build** > **Build cache**。
4. 按下 **Enable** 按钮。

## 定时构建

如果你的站点使用 `resources.GetRemote` 在构建时获取外部数据，这些数据会在构建时嵌入静态 HTML。没有定时构建的话，数据只会在有人向仓库提交代码时刷新。为了让内容保持最新，可以创建 Cloudflare 部署钩子（deploy hook），并由 GitHub Actions 工作流按计划调用它。

**第 1 步：创建部署钩子**

在 Cloudflare 控制台中进入 **Workers & Pages**，选择你的项目，然后进入 **Settings** > **Builds** > **Deploy Hooks**。按下 **Create deploy hook**，填写一个名称（例如 `github-cron`），然后复制生成的 URL。

**第 2 步：保存为仓库机密**

在你的 GitHub 仓库中进入 **Settings** > **Secrets and variables** > **Actions**。按下 **New repository secret**，命名为 `CLOUDFLARE_DEPLOY_HOOK`，把部署钩子 URL 粘贴为值，然后保存。

**第 3 步：创建工作流文件**

在仓库中创建 GitHub Actions 工作流文件：

```yaml
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

调整 `cron` 表达式即可设定所需的构建计划。上面的例子把任务安排在每天 UTC 时间 7:42 运行。

**第 4 步：提交并推送**

把改动提交到本地 Git 仓库，并推送到你的 GitHub 仓库。

> **说明：** 在 GitHub Actions 工作流运行的高峰时段，schedule 事件可能会被延迟，整点前后尤其明显。如果负载足够高，部分排队中的任务可能被丢弃。为降低延迟概率，可以把工作流安排在每小时的其它时间，或者使用 Google Cloud Scheduler、cron-job.org 这类第三方定时服务。

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
