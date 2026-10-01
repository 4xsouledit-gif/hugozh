+++
title = "部署到 Codeberg Pages"
linkTitle = "部署到 Codeberg Pages"
description = "在 Codeberg Pages 上托管 Hugo 站点。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/host-and-deploy/host-on-codeberg-pages/"
+++

下面这些步骤用于实现从 Codeberg 仓库到 Codeberg Pages 的持续部署。

> **注意：** 不要把发布目录（`public`）的内容提交到仓库，Hugo 会在构建项目时重新创建它。

## 前提条件

继续之前，请先完成以下任务：

1. 创建一个 Codeberg 账号。
2. 登录你的 Codeberg 账号。
3. 为你的项目创建一个 Codeberg 仓库。
4. 为项目创建一个本地 Git 仓库，并添加指向该 Codeberg 仓库的远端（remote）引用。
5. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
6. 把改动提交到本地 Git 仓库，并推送到你的 Codeberg 仓库。

## 操作步骤

**第 1 步：启用 Actions**

进入你的 Codeberg 仓库，依次进入 **Settings** > **Units** > **Overview**。启用 **Actions**，然后按下 **Save Settings** 按钮。

**第 2 步：创建工作流文件**

在 `.forgejo/workflows` 目录下创建 `hugo.yaml` 文件，按需要调整工具版本和时区：

```yaml
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

      - name: Install Hugo
        run: |
          echo "Installing Hugo ${HUGO_VERSION}..."
          curl -sfL --output-dir "${{ runner.temp }}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          mkdir "${HOME}/.local/hugo"
          tar -C "${HOME}/.local/hugo" -xf "${{ runner.temp }}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          echo "${HOME}/.local/hugo" >> "${FORGEJO_PATH}"

      # 存在 go.mod 时按同样方式安装 Go（${GO_VERSION}）；
      # 存在 package-lock.json 时按同样方式安装 Node.js（${NODE_VERSION}）并执行 npm ci。

      - name: Configure Git
        run: |
          git config --global core.quotepath false
          if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
            git fetch --unshallow
          fi
          if [[ -f .gitmodules ]]; then
            git submodule update --init --recursive
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

**第 3 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅官方文档的「配置文件缓存」章节。

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

更多信息请参阅 Codeberg 的官方文档。

## 选择 runner

Codeberg 提供三种[托管 runner](https://codeberg.org/actions/meta#available-runners)，每种都有一个对应的 `-lazy` 变体：排队时间可能更长，但有助于平衡共享基础设施的负载。上面的示例工作流出于以下原因选择了 `codeberg-small`：

| Runner | 说明 |
| --- | --- |
| `codeberg-tiny` | 最长 2 分钟的运行时间不足以完成图片处理。Hugo 会缓存处理过的图片，但首次运行以预热该缓存时可能超出这一限制。 |
| `codeberg-small` | 对于图片处理量适中的项目是合理的折中选择。高负载时排队时间可能超过 30 分钟。如果部署对时间不敏感，可以考虑改用 `codeberg-small-lazy`。 |
| `codeberg-medium` | 这类 runner 需求很高，排队时间对日常部署来说不切实际。 |

## 域名与重定向

Codeberg Pages 的站点地址由仓库名和所有者决定（见上一节），部署完成后可以直接用那个地址访问。

- **换用自定义域名后要改 `HUGO_BASEURL`。** 页面里的绝对链接、站点地图和 RSS 都基于 base URL 生成，因此改动域名后必须同步修改工作流中的 `HUGO_BASEURL` 并重新推送。
- **404 页面。** Hugo 可以生成 `public/404.html`。若希望访问不存在的地址时返回自己的错误页，请按 Codeberg Pages 的说明配置错误页。
- **尾斜杠与重定向。** Hugo 默认输出以 `/` 结尾的 URL。如果平台侧同时配置了强制去除尾斜杠或其它重定向规则，请确认两者不冲突。
- **缓存。** 重新部署不等于所有访客立刻拿到新文件，更新样式或图片后要留意旧缓存的影响。

## 相关资源

要进一步了解如何用 Codeberg Pages 托管和管理站点，请查阅官方文档：

- [通用文档](https://docs.codeberg.org/codeberg-pages/)
- [自定义域名设置](https://docs.codeberg.org/codeberg-pages/using-custom-domain/)
