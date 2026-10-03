+++
title = "hugo new"
linkTitle = "hugo new"
description = "hugo new：创建新内容与项目骨架。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/commands/hugo_new/"
+++

`hugo new` 是父命令 [hugo](/commands/hugo/) 的子命令，用来创建新内容。它会新建一个内容文件，并自动写入日期与标题；具体创建哪一类文件，则由你提供的路径来推断。

## 用法

`hugo new` 自身不完成创建动作，而是把工作交给它的子命令：

```text
hugo new content [path] [flags]
hugo new project [path] [flags]
```

创建内容时使用 `hugo new content`；在指定路径搭建一个新项目时使用 `hugo new project`。

`hugo new` 本身不接受目标路径，创建动作完全由子命令完成。选择子命令时可以先想清楚要做的事：写一篇新文章属于创建内容，用 `hugo new content`；从零搭起站点骨架属于创建项目，用 `hugo new project`。两者的选项也各自独立，例如 `-k` 与 `--force` 属于 content，`--format` 属于 project，所以查看选项时要认准子命令。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h, --help` | 显示 new 的帮助信息 |

创建内容所使用的 `-k KIND`（指定内容种类）等选项属于子命令，详见 [hugo new content](/commands/hugo-new-content/)。

### 继承自父命令的选项

`hugo new` 会继承 `hugo` 的选项，常用者有 `--config`、`--configDir`、`--logLevel`、`--quiet`、`-s` / `--source`、`--themesDir`、`--clock`、`-e` / `--environment`、`-M` / `--renderToMemory`、`-d` / `--destination`、`--noBuildLock` 与 `--ignoreVendorPaths`。

## 示例

创建一篇新内容：

```bash
hugo new content posts/my-first-post.md
```

用 `-k` 指定内容种类：

```bash
hugo new content --kind posts posts/my-first-post.md
```

在指定路径创建一个新项目：

```bash
hugo new project my-site
```

## 说明

- 如果主题或项目里提供了原型（archetype），新建内容时会使用它们。原型文件放在站点根目录的 `archetypes/` 目录下，文件名与种类对应；关于原型的机制可以参见[原型](/content-management/archetypes/)。
- `hugo new` 是 `hugo new content` 的简写形式，写 `hugo new posts/my-first-post.md` 也能创建内容。
- 请确保在项目根目录下执行这些命令，这样 Hugo 才能找到原型文件与内容目录。
- CLI 中还有 `hugo new theme` 等其他子命令，本节未收录其页面。
