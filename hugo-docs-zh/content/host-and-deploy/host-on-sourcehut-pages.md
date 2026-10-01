+++
title = "部署到 SourceHut Pages"
linkTitle = "部署到 SourceHut Pages"
description = "用手工上传或 SourceHut 构建系统发布 Hugo 站点。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/host-and-deploy/host-on-sourcehut-pages/"
+++

下面的步骤说明如何把站点发布到 SourceHut Pages，可以手工部署，也可以交给 SourceHut 构建系统自动完成。

> **提示**
> 不要把构建输出目录 `public` 的内容提交到仓库。Hugo 每次构建都会重新生成该目录。

## 前置条件

- 熟悉 [Git](https://git-scm.com/) 或 [Mercurial](https://www.mercurial-scm.org/) 版本控制
- 已读完 Hugo 的[快速入门](/getting-started/quick-start/)
- 拥有 [SourceHut 账号](https://meta.sr.ht/login)
- 本地有一份准备发布的 Hugo 站点

下文出现的 `<YourUsername>` 都指你实际的 SourceHut 用户名，使用时需要替换成真实值。

## baseURL 注意事项

如果你使用 SourceHut Pages 提供的默认地址（例如 `https://<YourUsername>.srht.site/`），项目配置中的 `baseURL` 必须写成该完整 URL。若想改用其他域名，请查阅官方文档的[自定义域名](https://srht.site/custom-domains)部分。

## 手工部署

这种方式不需要付费账号。开始前需要创建一个 [SourceHut 个人访问令牌](https://meta.sr.ht/oauth2/personal-token)，并安装、配置 [hut](https://sr.ht/~xenrox/hut/) 命令行工具。

```sh
hugo build
tar -C public -cvz . > site.tar.gz
hut init
hut pages publish -d <YourUsername>.srht.site site.tar.gz
```

命令先构建站点，把 `public` 目录打包成 `site.tar.gz`，再通过 `hut pages publish` 上传到指定域名。SourceHut 会自动为你申请 TLS 证书，站点随后可通过 `https://<YourUsername>.srht.site/`（或你提供的自定义域名）访问。

## 自动部署

这种方式需要付费账号，并依赖 SourceHut 构建系统。

首先在项目根目录创建 `.build.yml`，定义[构建清单](https://man.sr.ht/builds.sr.ht/#build-manifests)。下面是一个最简模板：

```yaml {file=".build.yml"}
image: alpine/edge
packages:
  - hugo
  - hut
oauth: pages.sr.ht/PAGES:RW
environment:
  site: <YourUsername>.srht.site
tasks:
- package: |
    cd $site
    hugo build
    tar -C public -cvz . > ../site.tar.gz
- upload: |
    hut pages publish -d $site site.tar.gz
```

`oauth: pages.sr.ht/PAGES:RW` 授予构建任务发布页面的权限，`environment.site` 指定目标域名，`package` 任务构建并打包，`upload` 任务负责发布。

如果站点需要用 [Dart Sass](https://gohugo.io/functions/css/sass/#dart-sass) 把 Sass 编译成 CSS，请把 `DART_SASS_VERSION` 设为[最新版本号](https://github.com/sass/dart-sass/releases)，并在执行 Hugo 构建之前加入 Dart Sass 的安装步骤。注意 Alpine 系统要使用 `linux-x64-musl` 版本。

```yaml {file=".build.yml"}
image: alpine/edge
packages:
  - hugo
  - hut
  - curl # For Dart Sass installation
oauth: pages.sr.ht/PAGES:RW
environment:
  site: <YourUsername>.srht.site
tasks:
- package: |
    DART_SASS_VERSION=1.105.0
    mkdir -p $HOME/.local
    curl -L https://github.com/sass/dart-sass/releases/download/${DART_SASS_VERSION}/dart-sass-${DART_SASS_VERSION}-linux-x64-musl.tar.gz -o dart-sass.tar.gz
    tar -xzf dart-sass.tar.gz -C $HOME/.local
    rm dart-sass.tar.gz
    chmod -R +x $HOME/.local/dart-sass/src
    export PATH="$HOME/.local/dart-sass:$PATH"
    sass --version # Verify installation
    cd $site
    hugo build
    tar -C public -cvz . > ../site.tar.gz
- upload: |
    hut pages publish -d $site site.tar.gz
```

创建一个名为 `<YourUsername>.srht.site`（或在适用时使用你的自定义域名）的仓库，并把本地项目推送到该仓库。随后可以在 `https://builds.sr.ht/` 查看页面的构建进度。

构建通过后，SourceHut 会自动为你申请 TLS 证书，站点可通过 `https://<YourUsername>.srht.site/`（或你提供的自定义域名）访问。

## 后续配置

**自定义域名**：在 SourceHut Pages 中绑定自定义域名后，仓库名与构建清单里的 `site` 都要改成该域名，配置中的 `baseURL` 也要同步更新；证书仍由 SourceHut 自动签发。

**重定向与子路径**：站点资源引用建议使用 Hugo 生成的相对地址；页面级跳转可使用 Hugo 的 aliases。

## 相关资源

- [SourceHut Pages 通用文档](https://man.sr.ht/pages.sr.ht/)
- [自定义域名设置](https://man.sr.ht/pages.sr.ht/custom-domains.md)
