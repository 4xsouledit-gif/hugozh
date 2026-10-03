+++
title = "hugo list drafts"
linkTitle = "hugo list drafts"
description = "列出被标记为草稿的内容文件及其相关时间信息。"
date = 2026-10-01
weight = 150
source = "https://gohugo.io/commands/hugo_list_drafts/"
+++

`hugo list drafts` 是 `hugo list` 的子命令，用于列出草稿内容。凡是在 front matter 中设置了 `draft = true` 的内容页，都会被它筛选出来。默认构建不会渲染草稿，因此在发布前用它核对是否有内容仍处于草稿状态，是很常见的做法。

## 用法

```text
hugo list drafts [flags] [args]
```

在项目根目录执行，输出为逗号分隔的表格：第一行是表头，随后每一行对应一个草稿内容文件。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `drafts` 子命令的帮助信息 |

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

列出全部草稿内容：

```bash
hugo list drafts
```

发布前核对草稿，确认没有遗漏的内容：

```bash
hugo list drafts
```

## 说明

- 若输出为空，说明当前没有任何内容被标记为草稿，或者在当前环境下草稿不会被统计。
- 要让草稿出现在构建结果中，需要在构建时加上 `--buildDrafts`（简写 `-D`）。
- 内容是否算草稿只取决于 front matter 中的 `draft` 字段，与文件名和目录位置无关。
- 想一次看全所有状态的内容，请改用 `hugo list all`。
