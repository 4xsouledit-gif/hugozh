+++
title = "部署到 Render"
linkTitle = "部署到 Render"
description = "用 Render Blueprint 持续部署 Hugo 静态站点：render.yaml、build.sh、发布目录与工具版本，附构建失败的排查入口。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/host-and-deploy/host-on-render/"

[params.teach]
difficulty = "入门"
time = "25–35 分钟"
prereq = [
  "一个 Render 账号与一个 GitHub 账号，项目已推送到 GitHub 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在仓库根目录新增 `render.yaml` 与 `build.sh` 并提交推送",
]
outcomes = [
  "写出可用的 `render.yaml`，并记得把示例里的 `repo` 换成自己的仓库地址",
  "说清 `buildCommand`、`staticPublishPath`、`envVars` 三者在流程里的位置",
  "用 Blueprint 完成从仓库到线上站点的全流程，并找到已发布网址",
  "构建失败或页面 404 时，按 Render 的构建日志定位问题",
]
next = ["/host-and-deploy/host-on-vercel/", "/host-and-deploy/host-on-netlify/", "/configuration/caches/", "/troubleshooting/"]
+++

下面的步骤以 GitHub 仓库为例说明 Render 的持续部署。换成 GitLab、Bitbucket 等其他 Git 服务商时，整体思路基本相同。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里放一个 `render.yaml`（Blueprint）与一个 `build.sh` → 在 Render 里创建 Blueprint 实例 → 等构建完成 → 拿到网址**。

Render 的 `render.yaml` 是「基础设施即代码」式的配置：它同时声明**服务类型、构建命令、发布目录与工具版本**。因此排查时先看这三项有没有填对，再看构建日志：

- `runtime: static` + `staticPublishPath: public` 决定产物从哪里取；
- `buildCommand` 决定执行什么（示例里会先 `chmod a+x` 再跑脚本）；
- `envVars` 把工具版本传给脚本。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 写 Blueprint | 创建 `render.yaml`，**把 `repo` 换成自己的仓库**（第 1 步） | 文件中不再出现示例仓库地址 |
| 3. 写构建脚本 | 创建 `build.sh`（第 2 步） | 本地 `bash build.sh` 能成功产出 `public/` |
| 4. 配置缓存 | 设置 `[caches.images]`（第 3 步） | 本地再跑一次 `hugo` 仍成功 |
| 5. 推送 | 提交并推送（第 4 步） | GitHub 仓库里能看到这两个新文件 |
| 6. 建 Blueprint | 在仪表板创建并连接仓库（第 5–11 步） | 部署日志里出现 `Installing Hugo ...` 与 `Building the project...` |
| 7. 找资源 | 通过 Resources 页面找到静态站点（第 12–13 步） | 能看到静态站点资源及其地址 |
| 8. 访问 | 点击已发布站点的链接（第 14 步） | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `repo` | `render.yaml` | **你自己的仓库地址** | Blueprint 找不到仓库，创建失败 |
| `name` | `render.yaml` | 服务名，例如 `hosting-render` | 同一工作区重名时创建失败 |
| `buildCommand` | `render.yaml` | `chmod a+x build.sh && ./build.sh` | 脚本无执行权限或不被执行 |
| `staticPublishPath` | `render.yaml` | `public` | 部署成功但站点 404 |
| `HUGO_VERSION` 等 | `render.yaml` 的 `envVars` | 与本地一致的版本 | 线上报模板或参数不存在 |
| `TZ` | 同上 | 构建时区 | 时间相关输出与预期不符 |
| Blueprint 名称 | 仪表板创建页面 | 任意唯一名称 | 创建被拒绝 |
| `baseURL` | 项目配置文件 | 最终访问地址 | 页面能打开但样式、站内链接指向错误地址 |

## 前提条件

继续之前请先完成以下事项：

1. [注册](https://dashboard.render.com/register) Render 账号。
2. [登录](https://dashboard.render.com/login) Render 账号。
3. [注册](https://github.com/signup) GitHub 账号。
4. [登录](https://github.com/login) GitHub 账号。
5. 为你的项目[创建](https://github.com/new)一个 GitHub 仓库。
6. 为项目[创建](https://git-scm.com/docs/git-init)本地 Git 仓库，并把 GitHub 仓库添加为[远程](https://git-scm.com/docs/git-remote)引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

### 第 1 步：创建 Blueprint 配置

在项目根目录创建 `render.yaml`，按需调整工具版本与时区。把 `repo` 换成你自己的仓库地址。

```yaml {file="render.yaml"}
services:
  - type: web
    name: hosting-render
    repo: https://github.com/jmooring/hosting-render
    runtime: static
    buildCommand: chmod a+x build.sh && ./build.sh
    staticPublishPath: public
    envVars:
      - key: DART_SASS_VERSION
        value: 1.105.0
      - key: GO_VERSION
        value: 1.27.1
      - key: HUGO_VERSION
        value: 0.167.0
      - key: NODE_VERSION
        value: 24.21.0
      - key: TZ
        value: Europe/Oslo
```

`runtime: static` 声明这是静态站点，`staticPublishPath: public` 把发布目录指向 Hugo 的输出目录，`buildCommand` 调用下面的构建脚本。工具版本通过 `envVars` 注入，脚本直接读取这些环境变量。

> [!WARNING]
> 上面的 `repo` 是文档示例地址，**必须换成你自己的仓库**。忘了改的典型现象是：Blueprint 页面上找不到要连接的仓库，或连接后部署的是别人的示例站点。

### 第 2 步：创建构建脚本

在项目根目录创建 `build.sh`。

```sh {file="build.sh"}
#!/usr/bin/env bash

#------------------------------------------------------------------------------
# @file
# Builds a Hugo project hosted on Render.
#
# Render automatically installs Node.js and any Node.js dependencies.
#------------------------------------------------------------------------------

# Exit on error, undefined variables, or pipe failures
set -euo pipefail

# Set the build cache directory
HUGO_CACHEDIR="${PWD}/.cache/hugo"

# Perform cleanup
cleanup() {
  if [[ -n "${build_temp_dir:-}" && -d "${build_temp_dir}" ]]; then
    rm -rf "${build_temp_dir}"
  fi
}

# Register the cleanup trap
trap cleanup EXIT SIGINT SIGTERM

main() {
  # Export the build cache directory
  export HUGO_CACHEDIR

  # Create a temporary directory for downloads
  build_temp_dir=$(mktemp -d)

  # Create a local tools directory
  mkdir -p "${HOME}/.local"

  # Install Dart Sass
  echo "Installing Dart Sass ${DART_SASS_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  tar -C "${HOME}/.local" -xf "${build_temp_dir}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
  export PATH="${HOME}/.local/dart-sass:${PATH}"

  # Install Go
  if [[ -f "go.mod" ]]; then
    echo "Installing Go ${GO_VERSION}..."
    curl -sfL --output-dir "${build_temp_dir}" -O "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
    tar -C "${HOME}/.local" -xf "${build_temp_dir}/go${GO_VERSION}.linux-amd64.tar.gz"
    export PATH="${HOME}/.local/go/bin:${PATH}"
  fi

  # Install Hugo
  echo "Installing Hugo ${HUGO_VERSION}..."
  curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  mkdir -p "${HOME}/.local/hugo"
  tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
  export PATH="${HOME}/.local/hugo:${PATH}"

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

  # Build the project
  echo "Building the project..."
  hugo build --gc --minify
}

main "$@"
```

Render 会自动安装 Node.js 及其依赖，脚本因此只安装 Dart Sass、Hugo，并在检测到 `go.mod` 时安装 Go。构建缓存写入 `.cache/hugo`，构建命令为 `hugo build --gc --minify`。

这条构建命令**没有传 `--baseURL`**，所以站点地址以项目配置里的 `baseURL` 为准：绑定自定义域名后，记得同步修改它并重新部署。

**你应当看到什么**：本地执行 `bash build.sh` 应当打印 `Installing Hugo ...`、`Hugo: hugo v...`、`Building the project...` 并产出 `public/`。云端构建日志里会出现同样几行，最后显示部署成功。

### 第 3 步：设置图片缓存目录

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置指向 `cacheDir`：

```toml
[caches.images]
dir = ':cacheDir/images'
```

这样本地构建与 Render 构建都会把处理过的图片缓存到 `.cache/hugo/images`。使用 YAML 配置时等价写法是 `caches.images.dir = ":cacheDir/images"`。

### 第 4 步：推送代码

把改动提交到本地 Git 仓库并推送到 GitHub 仓库。

### 第 5 步：新建 Blueprint

在 Render [仪表板](https://dashboard.render.com/)上点击 **Add new** 按钮，在下拉菜单中选择 "Blueprint"。

### 第 6 步：连接 GitHub

点击 **GitHub** 按钮，连接到你的 GitHub 账号。

### 第 7 步：授权 Render

点击 **Authorize Render** 按钮，允许 Render 应用访问你的 GitHub 账号。

### 第 8 步：选择账号

选择你希望安装 Render 应用的 GitHub 账号。

### 第 9 步：选择仓库范围

授权 Render 应用访问全部仓库或仅访问选定仓库，然后点击 **Install** 按钮。

### 第 10 步：连接仓库

在 "Create a new Blueprint Instance in My Workspace" 页面上，点击你的 GitHub 仓库名称右侧的 **Connect** 按钮。

**你应当看到什么**：如果这里看不到自己的仓库，先回到第 1 步检查 `repo` 是否还是示例地址。

### 第 11 步：部署 Blueprint

为 Blueprint 输入一个唯一名称，然后点击页面底部的 **Deploy Blueprint** 按钮。

### 第 12 步：查看资源

等待站点构建并部署完成，然后点击页面左侧的 "Resources" 链接。

### 第 13 步：打开静态站点

点击静态站点资源对应的链接。

### 第 14 步：访问站点

点击指向已发布站点的链接即可访问。

**你应当看到什么**：站点地址形如 `https://<服务名>.onrender.com`；首页正常显示，样式与图片都在。之后每次从本地仓库推送改动，Render 都会重新构建并部署站点。

## 失败时：典型报错与排查入口

排查入口是 **Render 仪表板 → 你的服务 → Logs / Events**，构建阶段的日志会标明是哪条命令失败。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| Blueprint 创建时提示找不到仓库 | `render.yaml` 的 `repo` 还是示例地址 | 改成你自己的仓库地址后重新推送，再新建一次 Blueprint |
| 构建报 `./build.sh: Permission denied` | 脚本没有执行权限 | 保留 `buildCommand` 里的 `chmod a+x build.sh &&` |
| 构建报 `hugo: command not found` | 脚本没被执行，或 Hugo 下载失败 | 看日志中有没有 `Installing Hugo ...`；确认 `buildCommand` 与文件位置 |
| 构建报 `DART_SASS_VERSION: unbound variable` | `envVars` 里没有该变量，而脚本用了 `set -u` | 在 `render.yaml` 的 `envVars` 中补上，或在脚本里给默认值 |
| 部署成功但访问 404 | `staticPublishPath` 不是真正的发布目录 | 改成 `public`（或你配置的 `publishDir`） |
| 页面能打开但样式、图片丢失 | `baseURL` 与实际访问地址不一致 | 把配置里的 `baseURL` 改成最终域名后重新部署 |
| 改了 `envVars` 但构建行为没变 | 修改未推送，或没有触发新的部署 | 推送后用仪表板手动触发一次部署，确认日志里的版本号已更新 |
| 每次构建都重新处理图片 | 缓存目录未被保留 | 与 Render 的构建缓存策略核对；Hugo 侧保持 `:cacheDir/images` |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在 Render 的站点设置中添加自定义域名，按提示在 DNS 侧添加记录，证书由 Render 自动签发；域名生效后把配置里的 `baseURL` 改成该域名并重新部署。

**重定向**：Render 支持在站点设置或 Blueprint 配置中声明重定向规则；站点内部的页面跳转仍建议使用 Hugo 的 aliases。

**404 页面**：Hugo 生成的 `public/404.html` 会随产物发布，可作为自定义错误页使用。

## 相关资源

- [Render 静态站点文档](https://render.com/docs/static-sites)
- [自定义域名设置](https://render.com/docs/custom-domains)
