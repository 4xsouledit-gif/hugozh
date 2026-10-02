+++
title = "部署到 SourceHut Pages"
linkTitle = "部署到 SourceHut Pages"
description = "用手工上传或 SourceHut 构建系统发布 Hugo 站点：hut 命令、.build.yml 构建清单、baseURL 与失败排查。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/host-and-deploy/host-on-sourcehut-pages/"

[params.teach]
difficulty = "进阶"
time = "25–40 分钟"
prereq = [
  "一个 SourceHut 账号，以及本地一份可构建的 Hugo 站点",
  "会用 Git 或 Mercurial 做基本的版本控制操作",
  "手工部署需要安装 hut 命令行工具；自动部署需要一个付费账号",
]
outcomes = [
  "用手工方式把站点打包上传到 SourceHut Pages，并确认网址可访问",
  "写出 `.build.yml` 构建清单，让 builds.sr.ht 自动构建并发布",
  "说清仓库名、`environment.site` 与 `baseURL` 三者必须一致的原因",
  "构建失败或站点 404 时，知道去 builds.sr.ht 还是本地查",
]
next = ["/host-and-deploy/host-on-codeberg-pages/", "/host-and-deploy/host-on-gitlab-pages/", "/functions/css/sass/", "/troubleshooting/"]
+++

下面的步骤说明如何把站点发布到 SourceHut Pages，可以手工部署，也可以交给 SourceHut 构建系统自动完成。

> [!NOTE]
> 不要把 [`publishDir`](/configuration/all/#publishdir) 的内容提交到仓库。Hugo 会在构建项目时重新创建该目录。

## 这一页解决什么问题

本地 `public/` 已经能生成，现在要让它变成一个人人可访问的网址。SourceHut Pages 提供两条路径，选一条即可：

- **手工部署**：本机打包 `public/` 后上传，不需要付费账号，适合偶尔发布；
- **自动部署**：把仓库推到指定名字的仓库，由 builds.sr.ht 按 `.build.yml` 构建并发布，需要付费账号。

SourceHut 这条路线的关键是**三个名字必须一致**：仓库名、`.build.yml` 里的 `environment.site`、以及项目配置里的 `baseURL`。三者不一致时，构建可能成功，但网址打不开或链接全错。

## 从本地 public/ 到线上可访问

| 阶段 | 你做什么 | 完成后如何验证 |
| --- | --- | --- |
| 1. 本地确认 | 在项目根目录执行 `hugo build` | 退出码 0，`public/index.html` 是期望内容 |
| 2. 设地址 | 把 `baseURL` 设为 `https://<YourUsername>.srht.site/` | 本地构建产物里的绝对地址就是它 |
| 3. 打包/写清单 | 手工：打包 `site.tar.gz`；自动：写 `.build.yml` | 手工方式生成 tar.gz 文件；自动方式文件已提交推送 |
| 4. 发布 | 手工：`hut pages publish`；自动：推送到目标仓库 | 手工方式命令返回成功；自动方式 builds.sr.ht 出现一次构建 |
| 5. 访问 | 打开 `https://<YourUsername>.srht.site/` | 首页正常显示，样式与图片都在 |

## 你要填的变量

| 变量 | 在哪填 | 填什么 | 填错的后果 |
| --- | --- | --- | --- |
| `baseURL` | 项目配置文件 | `https://<YourUsername>.srht.site/`（或自定义域名） | 页面能打开但样式、站内链接指向错误地址 |
| `-d` 参数 / `environment.site` | `hut pages publish` 命令 / `.build.yml` | 站点域名，例如 `<YourUsername>.srht.site` | 发布到错误域名，或网址 404 |
| `DART_SASS_VERSION` | `.build.yml` | 站点用 Sass 时填最新版本号 | 构建报找不到 `sass` |
| 访问令牌 | SourceHut 个人访问令牌页 | 供 `hut` 使用 | `hut` 认证失败 |
| `oauth` | `.build.yml` | `pages.sr.ht/PAGES:RW` | 构建任务无权发布页面 |
| 仓库名 | SourceHut 仓库设置 | `<YourUsername>.srht.site`（或自定义域名） | 自动部署不会触发，或发布到错误目标 |

## 前提条件

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

**你应当看到什么**：`hut init` 会让你选择实例并完成认证，成功后本地会保存配置；`hut pages publish` 返回成功且没有报错。随后打开网址，首页与内页都应正常。第一次访问时若提示证书问题，稍等片刻让证书签发完成再试。

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

> [!NOTE]
> 清单里的 `cd $site` 依赖仓库名与 `site` 一致。构建机会把仓库克隆到与你仓库同名的目录下，因此**仓库名必须是 `<YourUsername>.srht.site`**（或你的自定义域名）；改成别的名字，`cd` 就会失败。

如果站点需要用 [Dart Sass](/functions/css/sass/) 把 Sass 编译成 CSS，请把 `DART_SASS_VERSION` 设为[最新版本号](https://github.com/sass/dart-sass/releases)，并在执行 Hugo 构建之前加入 Dart Sass 的安装步骤。注意 Alpine 系统要使用 `linux-x64-musl` 版本。

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

**你应当看到什么**：builds.sr.ht 里这次构建的两个任务都变绿；`package` 任务的日志里有 `sass --version` 的输出（若你加了 Sass 步骤）与 Hugo 的构建统计。随后打开网址，应当看到完整站点。

## 失败时：典型报错与排查入口

两条路径的排查入口不同：**手工部署看本地终端输出**；**自动部署看 [builds.sr.ht](https://builds.sr.ht/) 的构建日志**。

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `hut: command not found` | 没安装 hut，或没进 `PATH` | 按 [hut 官方页面](https://sr.ht/~xenrox/hut/)安装，重开终端后重试 |
| `hut pages publish` 报认证失败 | 没有创建个人访问令牌，或 `hut init` 没完成 | 重新创建[个人访问令牌](https://meta.sr.ht/oauth2/personal-token)并执行 `hut init` |
| 构建日志里 `cd: can't cd to ...` | 仓库名与 `environment.site` 不一致 | 把仓库重命名为 `<YourUsername>.srht.site`（或改 `site` 与之匹配） |
| 构建失败，日志提示权限不足 | `.build.yml` 缺少 `oauth: pages.sr.ht/PAGES:RW` | 补上该行并重新推送触发构建 |
| Sass 相关报错：找不到 `sass` | Sass 版本与平台不匹配（Alpine 需要 musl 版） | 用 `linux-x64-musl` 的下载地址，并确认 `export PATH` 在 `hugo build` 之前 |
| 网址 404 | `baseURL` 与 `site` 不一致，或构建产物为空 | 统一两处地址；在构建日志里确认 `public/index.html` 已生成并被打包 |
| 页面能打开但样式、图片丢失 | `baseURL` 不是最终访问地址 | 把配置里的 `baseURL` 改成实际域名后重新构建、重新发布 |
| 证书警告或 HTTPS 打不开 | 证书尚在自动签发中 | 稍等再试；若长时间未签发，检查域名解析是否已指向 SourceHut |

构建阶段的问题（`hugo` 本身报错）见[故障排查](/troubleshooting/)；上线前想先体检一遍站点，见[审计](/troubleshooting/audit/)。

## 后续配置

**自定义域名**：在 SourceHut Pages 中绑定自定义域名后，仓库名与构建清单里的 `site` 都要改成该域名，配置中的 `baseURL` 也要同步更新；证书仍由 SourceHut 自动签发。

**重定向与子路径**：站点资源引用建议使用 Hugo 生成的相对地址；页面级跳转可使用 Hugo 的 aliases。

## 相关资源

- [SourceHut Pages 通用文档](https://man.sr.ht/pages.sr.ht/)
- [自定义域名设置](https://man.sr.ht/pages.sr.ht/custom-domains.md)
