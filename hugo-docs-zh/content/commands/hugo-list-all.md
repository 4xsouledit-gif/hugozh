+++
title = "hugo list all"
linkTitle = "hugo list all"
description = "列出站点的全部内容，包含草稿、未来内容与已过期内容。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/commands/hugo_list_all/"
+++

`hugo list all` 是 `hugo list` 的子命令，用于列出站点的全部内容，不论其状态如何，草稿、未来内容与已过期内容都会被包含进来。需要做内容盘点或排期检查时，它比逐个状态筛选更省事。

## 用法

```text
hugo list all [flags] [args]
```

在项目根目录执行，输出为逗号分隔的表格：第一行是表头，随后每一行对应一个内容文件。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `all` 子命令的帮助信息 |

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

列出站点的全部内容：

```bash
hugo list all
```

上线前盘点内容，确认每个文件的状态与时间：

```bash
hugo list all
```

## 说明

- 输出中的时间字段取内容 front matter 里的 `date`、`publishDate`、`expiryDate` 等，缺省时按站点配置推导。
- 与 `hugo list drafts` 相比，本命令不做任何筛选，因此条目数最多。
- 命令只读取并打印内容清单，不会构建站点，适合放在上线前的检查脚本里。
