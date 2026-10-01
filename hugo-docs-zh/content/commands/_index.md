+++
title = "命令"
linkTitle = "命令"
description = "Hugo 命令行界面的整体结构与各命令索引。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/commands/"
+++

Hugo 的命令行界面（command line interface，CLI）构建在 Cobra 之上。构建站点、本地预览、创建内容这些日常工作，都可以在项目根目录下用少数几条命令完成。本节先说明 CLI 的组织方式，再分别给出各命令的参考页面。

## 命令的分层

Hugo 的命令分为父命令与子命令两层，子命令会共享父命令的选项：

- `hugo` 是主命令，用来构建项目；`hugo build` 是它的显式子命令，两者行为一致。
- `hugo server` 启动内置的 Web 服务器；`hugo server trust` 负责把本地 CA 证书装入系统信任库。
- `hugo new` 用来创建新内容；`hugo new content` 与 `hugo new project` 是它下面的子命令。

除本节收录的命令之外，CLI 还提供 completion、config、convert、deploy、env、gen、import、list、mod、version 等命令，它们的工作方式与本节各页所述一致。

## 全局选项

不少选项定义在根命令 `hugo` 上，并会被子命令继承，例如 `--config`、`--configDir`、`--logLevel`、`--quiet`、`-s` / `--source`、`--themesDir`、`--clock`、`-e` / `--environment`、`-M` / `--renderToMemory`、`-d` / `--destination`、`--noBuildLock` 与 `--ignoreVendorPaths`。各子命令的参考页面会把这些选项单独列为「继承自父命令的选项」，因此不必在每条命令下重复查阅。

## 执行位置

这些命令都应当在项目根目录下执行：Hugo 从当前目录开始向上查找配置文件，并据此确定项目根目录，以及 `content/`、`layouts/`、`static/` 等目录的位置。如果确实需要在其他位置执行，可以先用 `--source` / `-s` 指定要读取的目录。

## 示例

在项目根目录构建站点：

```bash
hugo
```

启动开发服务器，并让草稿内容也参与构建：

```bash
hugo server --buildDrafts
```

依据原型创建一篇新内容：

```bash
hugo new content posts/my-first-post.md
```

## 查看帮助

任何命令都可以通过 `--help` 查看它自己的参数列表与可用子命令：

```bash
hugo --help
hugo server --help
```

## 本节命令

- [hugo](/commands/hugo/)：构建项目的主命令。
- [hugo build](/commands/hugo-build/)：以显式子命令的形式构建项目。
- [hugo server](/commands/hugo-server/)：启动内置的 Web 服务器。
- [hugo server trust](/commands/hugo-server-trust/)：把本地 CA 装入系统信任库。
- [hugo new](/commands/hugo-new/)：创建新内容。
- [hugo new content](/commands/hugo-new-content/)：创建新的内容文件。
- [hugo new project](/commands/hugo-new-project/)：在指定路径创建新项目。
