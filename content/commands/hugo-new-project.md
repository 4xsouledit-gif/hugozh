+++
title = "hugo new project"
linkTitle = "hugo new project"
description = "hugo new project：在指定路径创建新项目。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/commands/hugo_new_project/"
+++

`hugo new project` 是 [hugo new](/commands/hugo-new/) 的子命令，用来在指定路径创建一个新项目。它会按所选的文件格式生成项目配置，并把站点所需的基本目录结构准备好，之后就可以直接在这个项目里构建站点。

## 用法

```text
hugo new project [path] [flags]
```

路径是相对于当前工作目录的，因此最好在准备存放项目的父目录下执行。如果只想得到一份默认配置，直接给出目录名即可；如果希望配置以特定格式书写，就在创建时用 `--format` 指定。创建完成后 Hugo 不会自动启动服务器，接下来的构建与预览仍然使用 [hugo](/commands/hugo/) 与 [hugo server](/commands/hugo-server/)。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-f, --force` | 在非空目录中初始化 |
| `--format` | 首选的配置文件格式，可取 toml、yaml 或 json，默认为 toml |
| `-h, --help` | 显示 project 的帮助信息 |

### 继承自父命令的选项

本命令还会继承 `hugo` 的选项，常用者有 `--config`、`--configDir`、`--logLevel`、`--quiet`、`-s` / `--source`、`--themesDir`、`--clock`、`-e` / `--environment`、`-M` / `--renderToMemory`、`-d` / `--destination`、`--noBuildLock` 与 `--ignoreVendorPaths`。

## 示例

在当前目录下创建名为 `my-site` 的项目：

```bash
hugo new project my-site
```

配置文件改用 YAML 格式：

```bash
hugo new project --format yaml my-site
```

在一个已经存在其他文件的目录中初始化：

```bash
hugo new project --force my-site
```

## 说明

- `--format` 决定生成哪种格式的配置文件，默认是 toml；三种格式的差异可以参见[配置](/configuration/)。
- 目标目录非空时，需要显式加上 `--force` 才会在其中初始化。
- 生成的项目结构包括 `content/`、`layouts/`、`static/` 等目录，各目录的用途参见[目录结构](/getting-started/directory-structure/)。
- 项目建好后，可以按照[安装](/installation/)与[快速开始](/getting-started/quick-start/)的步骤继续搭建；创建内容则使用 [hugo new content](/commands/hugo-new-content/)。
