+++
title = "hugo list"
linkTitle = "hugo list"
description = "列出站点内容的父命令，需搭配 all、drafts 等子命令使用。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/commands/hugo_list/"
+++

`hugo list` 是列出站点内容的父命令。它本身不执行任何列出动作，必须搭配一个子命令使用，例如 `hugo list drafts`。

## 用法

```text
hugo list [command] [flags]
```

直接运行 `hugo list` 而不带子命令不会输出内容列表，Hugo 会提示需要一个子命令。

## 子命令

| 子命令 | 说明 |
| --- | --- |
| `hugo list all` | 列出全部内容，包含草稿、未来内容与过期内容 |
| `hugo list drafts` | 列出草稿内容 |
| `hugo list expired` | 列出已过期内容 |
| `hugo list future` | 列出未来内容 |
| `hugo list published` | 列出已发布内容 |

其中 `hugo list all` 与 `hugo list drafts` 已收录在本章节，其余子命令可参照相同的用法理解。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `list` 命令的帮助信息 |

## 继承自父命令的全局选项

| 选项 | 说明 |
| --- | --- |
| `--clock string` | 设定 Hugo 使用的时钟，例如 `--clock 2021-11-06T22:30:00.00+09:00` |
| `--config string` | 指定配置文件，默认为 `hugo.yaml`、`hugo.json` 或 `hugo.toml` |
| `--configDir string` | 配置目录，默认为 `config` |
| `-d`, `--destination string` | 写入文件的文件系统路径 |
| `-e`, `--environment string` | 构建环境 |
| `--ignoreVendorPaths string` | 对匹配给定 Glob 模式的模块路径忽略其中的 `_vendor` |
| `--logLevel string` | 日志级别：`debug`、`info`、`warn` 或 `error` |
| `--noBuildLock` | 不创建 `.hugo_build.lock` 文件 |
| `--quiet` | 以静默模式构建 |
| `-M`, `--renderToMemory` | 渲染到内存，主要用于运行服务器时 |
| `-s`, `--source string` | 读取文件时相对的起始文件系统路径 |
| `--themesDir string` | 主题目录的文件系统路径 |

## 示例

在项目根目录列出草稿内容：

```bash
hugo list drafts
```

列出全部内容：

```bash
hugo list all
```

输出是逗号分隔的表格，可以直接重定向到文件，交给其他工具继续处理：

```bash
hugo list drafts
```

## 说明

- 输出通常以逗号分隔的表格形式给出，第一行是表头，包含路径、slug、标题以及各时间字段。
- 内容是否被归入草稿、未来或过期，取决于 front matter 中的 `draft`、`publishDate`、`expiryDate` 等字段。
- 该命令只读取内容并打印列表，不会构建站点，也不会写入 `public/`。
