+++
title = "部署到 Codeberg Pages"
linkTitle = "部署到 Codeberg Pages"
description = "用 Forgejo Actions 把 Hugo 站点发布到 Codeberg Pages：工作流、HUGO_BASEURL 的三种站点形态、runner 选择与常见失败排查。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/host-and-deploy/host-on-codeberg-pages/"

[params.teach]
difficulty = "进阶"
time = "35–45 分钟"
prereq = [
  "一个 Codeberg 账号，项目已推送到 Codeberg 仓库",
  "本地 `hugo` 能构建成功，知道自己的 Hugo 版本（`hugo version`）",
  "能在仓库中新增 `.forgejo/workflows/hugo.yaml` 并提交推送",
]
outcomes = [
  "在 Codeberg 仓库中启用 Actions，并写出可用的工作流文件",
  "按站点形态（项目站点 / 用户站点 / 自定义域名）填对 `HUGO_BASEURL` 与 `server` 参数",
  "根据图片处理量选择合适的 runner，并理解排队时间的取舍",
  "流水线变红或网址错误时，分清是 Actions 未启用、runner 超时还是部署参数的问题",
]
next = ["/host-and-deploy/host-on-gitlab-pages/", "/host-and-deploy/host-on-github-pages/", "/configuration/caches/", "/troubleshooting/"]
+++

下面这些步骤用于实现从 Codeberg 仓库到 Codeberg Pages 的持续部署。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址，而且以后每次 `git push` 都自动更新。这一页给出的就是这条路径：**仓库里启用 Actions → 写一个工作流文件 → 推送 → 在构建日志里拿到站点链接**。

Codeberg 这条路线的两个特点值得先记住：

1. **Actions 默认是关的**，必须在仓库设置里手动启用，否则推送后什么都不会发生——这是新手最常卡住的第一步；
2. **站点地址由仓库名和所有者决定**，所以 `HUGO_BASEURL` 必须按站点形态填写，否则页面能构建成功、链接却全错。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 启用 Actions | 仓库 **Settings** > **Units** > **Overview** 打开 **Actions**（第 1 步） | 保存后仓库顶部出现 **Actions** 入口 |
| 3. 写工作流 | 创建 `.forgejo/workflows/hugo.yaml`（第 2 步） | 文件已推送；仓库 **Actions** 列表出现工作流名 `Build and deploy` |
| 4. 配置缓存 | 设置 `[caches.images]`（第 3 步） | 本地再跑一次 `hugo` 仍成功 |
| 5. 推送 | 提交并推送（第 4 步） | 推送后 **Actions** 里自动出现一次运行 |
| 6. 观察 | 在 **Actions** 里跟踪进度（第 5–6 步） | 状态指示器变绿，两个任务都通过 |
| 7. 取链接 | 点开提交信息，看 "Print base URL" 步骤（第 7 步） | 日志里出现 `Base URL: https://<用户名>.codeberg.page/<仓库名>/` |
| 8. 访问 | 打开该地址 | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `HUGO_BASEURL` | 工作流 `env` | 站点最终地址（见本页「Base URL」三种形态） | 站点能构建，但样式、站内链接全部指向错误地址 |
| `server` | 工作流 Deploy 步骤 | 自定义域名时填 `codeberg.page` | 自定义域名场景下发布到错误的目标 |
| `HUGO_VERSION` 等 | 工作流 `env` | 与本地一致的版本 | 线上报模板或参数不存在 |
| `TZ` | 工作流 `env` | 构建时区 | 时间相关输出与预期不符 |
| `runs-on` | 工作流 `jobs.build_and_deploy` | `codeberg-small`（默认示例值） | runner 太小会超时，太大则排队很久 |
| 部署令牌 | 由 `actions/git-pages` 通过 `forgejo.token` 自动取得 | 无需手工填写 | — |

## 前提条件

继续之前，请先完成以下任务：

1. [创建](https://codeberg.org/user/sign_up)一个 Codeberg 账号。
2. [登录](https://codeberg.org/user/login)你的 Codeberg 账号。
3. 为你的项目[创建](https://codeberg.org/repo/create)一个 Codeberg 仓库。
4. 为项目[创建](https://git-scm.com/docs/git-init)一个本地 Git 仓库，并添加指向该 Codeberg 仓库的[远端（remote）](https://git-scm.com/docs/git-remote)引用。
5. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
6. 把改动提交到本地 Git 仓库，并推送到你的 Codeberg 仓库。

## 操作步骤

**第 1 步：启用 Actions**

进入你的 Codeberg 仓库，依次进入 **Settings** > **Units** > **Overview**。启用 **Actions**，然后按下 **Save Settings** 按钮。

**你应当看到什么**：保存后刷新页面，仓库顶部的标签栏里出现 **Actions**；如果之后推送代码仍看不到任何运行记录，先回到这一步确认开关是打开的。

**第 2 步：创建工作流文件**

在 `.forgejo/workflows` 目录下创建 `hugo.yaml` 文件，按需要调整工具版本和时区：

```yaml {file=".forgejo/workflows/hugo.yaml"}
name: Build and deploy
on:
  push:
    branches:
      - main
  workflow_dispatch:
concurrency:
  group: ${{ forgejo.workflow }}-${{ forgejo.ref }}
  cancel-in-progress: true
jobs:
  build_and_deploy:
    name: Build and deploy
    runs-on: codeberg-small
    env:
      # 定义工具版本
      DART_SASS_VERSION: 1.105.0
      GO_VERSION: 1.27.1
      HUGO_VERSION: 0.167.0
      NODE_VERSION: 24.21.0

      # 设置构建时区
      TZ: Europe/Oslo

      # 设置 Hugo 的 base URL
      HUGO_BASEURL: https://${{ forgejo.event.repository.owner.username }}.codeberg.page/${{ forgejo.event.repository.name }}/
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

      - name: Install Dart Sass
        run: |
          echo "Installing Dart Sass ${DART_SASS_VERSION}..."
          curl -sfL --output-dir "${{ runner.temp }}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          tar -C "${HOME}/.local" -xf "${{ runner.temp }}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          echo "${HOME}/.local/dart-sass" >> "${FORGEJO_PATH}"

      - name: Install Go
        run: |
          if [[ -f "go.mod" ]]; then
            echo "Installing Go ${GO_VERSION}..."
            curl -sfL --output-dir "${{ runner.temp }}" -O "https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz"
            tar -C "${HOME}/.local" -xf "${{ runner.temp }}/go${GO_VERSION}.linux-amd64.tar.gz"
            echo "${HOME}/.local/go/bin" >> "${FORGEJO_PATH}"
          fi

      - name: Install Hugo
        run: |
          echo "Installing Hugo ${HUGO_VERSION}..."
          curl -sfL --output-dir "${{ runner.temp }}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          mkdir "${HOME}/.local/hugo"
          tar -C "${HOME}/.local/hugo" -xf "${{ runner.temp }}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          echo "${HOME}/.local/hugo" >> "${FORGEJO_PATH}"

      - name: Install Node.js
        run: |
          if [[ -f "package-lock.json" ]]; then
            echo "Installing Node.js ${NODE_VERSION}..."
            curl -sfL --output-dir "${{ runner.temp }}" -O "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz"
            tar -C "${HOME}/.local" -xf "${{ runner.temp }}/node-v${NODE_VERSION}-linux-x64.tar.gz"
            echo "${HOME}/.local/node-v${NODE_VERSION}-linux-x64/bin" >> "${FORGEJO_PATH}"
          fi

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
          key: hugo-${{ forgejo.run_id }}
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

      - name: Deploy
        uses: actions/git-pages@v2
        with:
          site: ${{ env.HUGO_BASEURL }}
          token: ${{ forgejo.token }}
          source: public/

      - name: Print base URL
        run: |
          echo "Base URL: ${HUGO_BASEURL}"
```

工作流只用一个任务完成构建与部署，几个关键点：

- `HUGO_BASEURL` 由 `forgejo.event.repository.owner.username` 与 `forgejo.event.repository.name` 拼出，因此仓库改名或改所有者后它会自动跟着变——这是它比你手写地址更可靠的地方；
- 构建命令里**没有** `--baseURL`：站点地址靠 `HUGO_BASEURL` 生效。Hugo 会把 `HUGO_` 前缀的环境变量当作配置项读取，因此它在构建时覆盖项目配置里的 `baseURL`（详见[配置 Hugo](/configuration/)）；本地构建时没有这个变量，仍以配置文件为准。两处填成同一个地址最省事；
- `actions/git-pages@v2` 的 `source: public/` 决定上传哪个目录，末尾的斜杠不要漏。

**你应当看到什么**：构建日志里应当出现 `Installing Hugo ...`、`Hugo: hugo v...`、`Building the project...`，随后 `Print base URL` 步骤打印出完整的站点地址。

**第 3 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅[配置文件缓存](/configuration/caches/)。

**第 4 步：提交并推送**

把改动提交到本地 Git 仓库，并推送到你的 Codeberg 仓库。

**第 5 步：查看 Actions**

在 Codeberg 的主菜单中选择 **Actions**，你会看到构建与部署的进度。

**第 6 步：确认状态为绿**

当 Codeberg 完成站点构建与部署后，状态指示器的颜色会变成绿色。

**第 7 步：找到站点链接**

点击上一步中的提交信息。在 "Print base URL" 这一步下，你会看到指向线上站点的链接。

此后，只要你从本地 Git 仓库推送改动，Codeberg Pages 就会重新构建并部署你的站点。

## Base URL

Codeberg Pages 的站点 URL 有三种形式：

| 站点类型 | URL | 说明 |
| --- | --- | --- |
| 项目站点 | `https://owner.codeberg.page/repo/` | 默认形式；无需修改工作流 |
| 用户/组织站点 | `https://owner.codeberg.page/` | 仓库必须命名为 `pages` |
| 自定义域名 | `https://custom-domain.org/` | 需要额外修改工作流，见下文 |

示例工作流中的 `HUGO_BASEURL` 环境变量针对的是项目站点，它会根据仓库所有者的用户名和仓库名自动计算 URL。其他配置需要按下文说明调整工作流。

对于用户/组织站点，把 `HUGO_BASEURL` 设置为：

```text
https://${{ forgejo.event.repository.owner.username }}.codeberg.page/
```

对于自定义域名，把 `HUGO_BASEURL` 设置为：

```text
https://custom-domain.org/
```

同时给 Deploy 步骤加上 `server` 参数：

```yaml
- name: Deploy
  uses: actions/git-pages@v2
  with:
    site: ${{ env.HUGO_BASEURL }}
    server: codeberg.page
    token: ${{ forgejo.token }}
    source: public/
```

更多信息请参阅 [Codeberg 的官方文档](https://docs.codeberg.org/codeberg-pages/forgejo-actions/)。

**你应当看到什么**：无论哪种形态，`Print base URL` 打印的值都应当与你在浏览器里最终使用的地址一致。若站点能打开但样式丢失，几乎总是这两者不一致——把 `HUGO_BASEURL`（以及配置文件里的 `baseURL`）改成实际地址即可。

## 选择 runner

Codeberg 提供三种[托管 runner](https://codeberg.org/actions/meta#available-runners)，每种都有一个对应的 `-lazy` 变体：排队时间可能更长，但有助于平衡共享基础设施的负载。上面的示例工作流出于以下原因选择了 `codeberg-small`：

| Runner | 说明 |
| --- | --- |
| `codeberg-tiny` | 最长 2 分钟的运行时间不足以完成图片处理。Hugo 会缓存处理过的图片，但首次运行以预热该缓存时可能超出这一限制。 |
| `codeberg-small` | 对于图片处理量适中的项目是合理的折中选择。高负载时排队时间可能超过 30 分钟。如果部署对时间不敏感，可以考虑改用 `codeberg-small-lazy`。 |
| `codeberg-medium` | 这类 runner 需求很高，排队时间对日常部署来说不切实际。 |

## 失败时：典型报错与排查入口

排查入口是 **Codeberg 仓库 → Actions → 点开那次运行 → 具体任务日志**。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 推送后 **Actions** 里什么都没有 | 仓库没有启用 Actions | 回到第 1 步：**Settings** > **Units** > **Overview** 打开 **Actions** 并保存 |
| 运行一直排队，最后超时 | runner 类型太小（`codeberg-tiny` 最长 2 分钟），或高峰排队 | 把 `runs-on` 改成 `codeberg-small`；对时间不敏感时用 `codeberg-small-lazy` |
| 日志报 `hugo: command not found` | 安装 Hugo 的步骤失败，或 `FORGEJO_PATH` 没生效 | 检查日志中 `Installing Hugo ...` 与 `Hugo: ...` 两行；确认每步都把目录写进 `FORGEJO_PATH` |
| 构建报模板或参数不存在 | 线上 Hugo 版本与本地不同 | 把 `HUGO_VERSION` 改成 `hugo version` 显示的版本 |
| Deploy 步骤失败 | 部署目标地址不对（自定义域名缺 `server`），或工作流没有发布权限 | 按「Base URL」一节核对 `site` 与 `server`；确认 `oauth`/令牌权限包含 Pages 写权限 |
| 站点能打开但样式、图片丢失 | `HUGO_BASEURL` 与实际访问地址不一致 | 统一两处地址：工作流的 `HUGO_BASEURL` 与项目配置的 `baseURL` |
| 网址 404，但流水线是绿的 | 站点形态与地址形式不匹配（例如用了用户站点地址，仓库却不叫 `pages`） | 按「Base URL」表格确认仓库命名与地址形式 |
| 图片每次重新处理 | 缓存路径与 `[caches.images].dir` 不一致 | 让 `HUGO_CACHEDIR`（或工作流缓存路径）与 `:cacheDir/images` 指向同一处 |

更一般的症状分诊见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 域名与重定向

Codeberg Pages 的站点地址由仓库名和所有者决定（见上一节），部署完成后可以直接用那个地址访问。

- **换用自定义域名后要改 `HUGO_BASEURL`。** 页面里的绝对链接、站点地图和 RSS 都基于 base URL 生成，因此改动域名后必须同步修改工作流中的 `HUGO_BASEURL` 并重新推送。
- **404 页面。** Hugo 可以生成 `public/404.html`。若希望访问不存在的地址时返回自己的错误页，请按 [Codeberg Pages 的说明](https://docs.codeberg.org/codeberg-pages/)配置错误页。
- **尾斜杠与重定向。** Hugo 默认输出以 `/` 结尾的 URL。如果平台侧同时配置了强制去除尾斜杠或其它重定向规则，请确认两者不冲突。
- **缓存。** 重新部署不等于所有访客立刻拿到新文件，更新样式或图片后要留意旧缓存的影响。

## 相关资源

要进一步了解如何用 Codeberg Pages 托管和管理站点，请查阅官方文档：

- [通用文档](https://docs.codeberg.org/codeberg-pages/)
- [自定义域名设置](https://docs.codeberg.org/codeberg-pages/using-custom-domain/)
