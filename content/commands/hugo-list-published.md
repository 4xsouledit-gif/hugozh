+++
title = "hugo list published"
linkTitle = "hugo list published"
description = "列出既非草稿，也不是未来或过期内容的内容文件。"
date = 2026-10-01
weight = 180
source = "https://gohugo.io/commands/hugo_list_published/"
+++

`hugo list published` 是 [hugo list](/commands/hugo-list/) 的子命令，用于列出已发布的内容，也就是既不是草稿，也没有尚未来临的发布日期、也没有已经过去的过期日期的那些页面。它给出的正是正常构建时会出现在站点上的篇目，因此常用来在发布前确认清单，或者核对某个文件为什么没有出现在线上。

## 用法

```text
hugo list published [flags] [args]
```

在项目根目录执行，输出为逗号分隔的表格：第一行是表头，随后每一行对应一个已发布的内容文件，包含内容文件的路径、标题与相关时间字段。命令只读取内容并打印清单，不会构建站点。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `published` 子命令的帮助信息 |

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

列出项目中所有已发布的内容：

```bash
hugo list published
```

以当前目录作为源目录列出，便于在脚本中固定工作目录：

```bash
hugo list published --source .
```

改用指定的配置文件，检查生产环境下会发布的篇目：

```bash
hugo list published --config hugo.toml
```

## 说明

- 过滤条件取自内容的前置元数据：`draft` 为真，或时间字段落在将来、已经过去，都会让页面从这份清单里被排除。
- 与 [hugo list all](/commands/hugo-list-all/) 相比，本命令做的是排除而不是全量罗列，因此条目数最少，最接近线上实际内容。
- 如果某个文件在这份清单里找不到，依次检查它是否为草稿，以及发布时间、过期时间是否让它落在了这段区间之外。
- 需要分别查看被排除的内容时，使用 [hugo list drafts](/commands/hugo-list-drafts/)、[hugo list future](/commands/hugo-list-future/) 与 [hugo list expired](/commands/hugo-list-expired/)。
