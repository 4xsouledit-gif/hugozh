+++
title = "部署到 AWS Amplify"
linkTitle = "部署到 AWS Amplify"
description = "在 AWS Amplify 上托管 Hugo 站点并持续部署。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/host-and-deploy/host-on-aws-amplify/"
+++

下面这些步骤用于实现从 GitHub 仓库持续部署。其他 Git 服务商（例如 GitLab、Bitbucket）的总体流程相同。

> **注意：** 不要把发布目录（`public`）的内容提交到仓库，Hugo 会在构建项目时重新创建它。

## 前提条件

继续之前，请先完成以下任务：

1. 创建一个 AWS 账号。
2. 登录你的 AWS 账号。
3. 创建一个 GitHub 账号。
4. 登录你的 GitHub 账号。
5. 为你的项目创建一个 GitHub 仓库。
6. 为项目创建一个本地 Git 仓库，并添加指向该 GitHub 仓库的远端（remote）引用。
7. 在本地 Git 仓库中创建 Hugo 项目，并用 `hugo server` 命令测试它。
8. 把改动提交到本地 Git 仓库，并推送到 GitHub 仓库。

## 操作步骤

**第 1 步：创建 `amplify.yml`**

在项目根目录下创建 `amplify.yml` 文件，按需要调整工具版本和时区。`HUGO_VERSION` 等变量的值要与站点实际需要的版本一致：

```yaml
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
          curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          tar -C "${HOME}/.local" -xf "${build_temp_dir}/dart-sass-${DART_SASS_VERSION}-linux-x64.tar.gz"
          export PATH="${HOME}/.local/dart-sass:${PATH}"

        # 安装 Hugo
        - |
          curl -sfL --output-dir "${build_temp_dir}" -O "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          mkdir -p "${HOME}/.local/hugo"
          tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz"
          export PATH="${HOME}/.local/hugo:${PATH}"

        # 如果站点根目录存在 go.mod，按同样方式安装 Go（${GO_VERSION}）；
        # 如果存在 package-lock.json，按同样方式安装 Node.js（${NODE_VERSION}）并执行 npm ci。
        # 构建日志中建议打印各工具的版本，便于排查问题。

        # 配置 Git 并获取完整历史
        - |
          git config --global core.quotepath false
          if [[ $(git rev-parse --is-shallow-repository) == true ]]; then
            git fetch --unshallow
          fi

        # 初始化 Git 子模块
        - |
          if [[ -f .gitmodules ]]; then
            git submodule update --init --recursive
          fi
    build:
      commands:
        # 构建项目
        - hugo build --gc --minify
  artifacts:
    baseDirectory: public
    files:
      - '**/*'
  cache:
    paths:
      - .cache/hugo/**/*
```

**第 2 步：配置图片缓存**

在本地 Git 仓库根目录的项目配置文件中，把图片缓存的位置设置为 `cacheDir`，如下所示：

```toml
[caches.images]
dir = ':cacheDir/images'
```

关于文件缓存的更多信息，请参阅官方文档的「配置文件缓存」章节。

**第 3 步：提交并推送改动**

```bash
git add -A
git commit -m "Create amplify.yml"
git push
```

**第 4 步：进入 Amplify 控制台**

登录 AWS 账号，进入 Amplify 控制台，然后按下 **Deploy an app**（部署应用）按钮。

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
