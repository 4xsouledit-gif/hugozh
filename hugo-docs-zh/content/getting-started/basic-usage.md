+++
title = "基本用法"
linkTitle = "基本用法"
description = "用命令行构建、预览与部署 Hugo 站点的基本命令与常用参数。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/getting-started/usage/"
+++

## 测试安装

安装 Hugo 之后，先运行下面的命令确认安装成功：

```bash
hugo version
```

## 查看可用命令

查看全部可用命令与参数：

```bash
hugo help
```

查看某个子命令的帮助，使用 `--help` 参数：

```bash
hugo server --help
```

## 构建站点

切换到项目目录后执行：

```bash
hugo build
```

`hugo build` 会构建项目，把文件发布到 `public` 目录。要发布到其他目录，可以使用 `--destination` 参数，或在项目配置中设置 `publishDir`。

> Hugo 在构建前不会清空 `public` 目录：同名文件会被覆盖，但不会被删除。这样做是为了避免误删你在构建之后手动放入 `public` 目录的文件。
>
> 如有需要，你可以每次构建前手动清空 `public` 目录，或者使用 `--cleanDestinationDir` 命令行参数或 `cleanDestinationDir` 配置项，让 Hugo 自动清理陈旧文件。

## 草稿、将来与过期内容

你可以在内容的[前置元数据](/content-management/front-matter/)中设置 `draft`、`date`、`publishDate` 与 `expiryDate`。默认情况下，满足以下任一条件的内容不会被发布：

- `draft` 为 `true`
- `date` 位于将来
- `publishDate` 位于将来
- `expiryDate` 已经过去

> Hugo 会发布草稿、将来与过期页面的后代页面，其中也包括 section（内容区块）页面。要阻止这些后代页面发布，可以用 `cascade` 前置元数据字段把[构建选项](/content-management/build-options/)级联给它们。

运行 `hugo build` 或 `hugo server` 时，可以用命令行参数覆盖默认行为：

```bash
hugo build --buildDrafts    # 或 -D
hugo build --buildExpired   # 或 -E
hugo build --buildFuture    # 或 -F
```

虽然也可以把这些值写进项目配置，但除非所有内容作者都清楚这些设置，否则可能带来意料之外的结果。

> 如前所述，Hugo 在构建前不会清空 `public` 目录。根据上面四个条件在_当次_构建中的判定结果，构建后的 `public` 目录里可能残留上一次构建产生的多余文件。
>
> 常见做法是在每次构建前手动清空 `public` 目录，以移除草稿、过期与将来内容，或者使用 `--cleanDestinationDir` 参数或 `cleanDestinationDir` 配置项让 Hugo 自动清理陈旧文件。

## 开发与测试站点

在开发模板或撰写内容时预览站点，切换到项目目录后执行：

```bash
hugo server
```

`hugo server` 会构建站点，并用一个精简的 HTTP 服务器提供页面。运行时会显示本地站点地址：

```text
Web Server is available at http://localhost:1313/
```

服务器运行期间会监视项目目录中资源（assets）、配置（configuration）、内容（content）、数据（data）、模板（layouts）、翻译（translations）与静态文件（static files）的变化，一旦检测到改动就重建站点，并通过实时重载（LiveReload）刷新浏览器。

多数 Hugo 构建都非常快，除非你正盯着浏览器，否则可能感觉不到这次变化。

### 实时重载（LiveReload）

服务器运行时，Hugo 会向生成的 HTML 页面注入 JavaScript。LiveReload 脚本通过 WebSocket 在浏览器与服务器之间建立连接，你不需要安装任何软件或浏览器插件，也不需要做任何配置。

### 自动跳转

编辑内容时，如果希望浏览器自动跳转到你最后修改的页面，可以运行：

```bash
hugo server --navigateToChanged
```

## 部署站点

> 如前所述，Hugo 在构建前不会清空 `public` 目录。请在每次构建前手动清空它，以移除草稿、过期与将来内容，或者使用 `--cleanDestinationDir` 参数或 `cleanDestinationDir` 配置项让 Hugo 自动清理陈旧文件。

准备好部署时执行：

```bash
hugo
```

这条命令会构建站点，把文件发布到 `public` 目录，目录结构大致如下：

```text
public/
├── categories/
│   ├── index.html
│   └── index.xml  <-- 该 section 的 RSS 订阅
├── posts/
│   ├── my-first-post/
│   │   └── index.html
│   ├── index.html
│   └── index.xml  <-- 该 section 的 RSS 订阅
├── tags/
│   ├── index.html
│   └── index.xml  <-- 该 section 的 RSS 订阅
├── index.html
├── index.xml      <-- 站点级 RSS 订阅
└── sitemap.xml
```

在简单的托管环境中，通常用 `ftp`、`rsync` 或 `scp` 把文件上传到虚拟主机的根目录，此时 `public` 目录中的内容就是全部所需文件。

多数用户会把站点部署到 CI/CD（持续集成与持续交付）平台：向远程 Git 仓库推送后触发构建与部署。Git 仓库通常包含整个项目目录，但会排除 `public` 目录，因为站点是在推送_之后_才构建的。
