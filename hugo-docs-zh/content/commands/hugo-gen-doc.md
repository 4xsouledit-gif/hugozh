+++
title = "hugo gen doc"
linkTitle = "hugo gen doc"
description = "为 Hugo 命令行界面生成 Markdown 文档。"
date = 2026-10-01
weight = 260
source = "https://gohugo.io/commands/hugo_gen_doc/"
+++

`hugo gen doc` 是 `hugo gen` 的子命令，为 Hugo 命令行界面生成 Markdown 文档。它为每个命令生成一个 Markdown 文件，并写好适合在 Hugo 中渲染的 front matter，因此输出结果可以直接放进文档站点的内容目录。

这个命令主要用于为 gohugo.io 生成保持最新的命令行界面文档，普通站点项目一般用不到它。

## 用法

```text
hugo gen doc [flags] [args]
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `--dir string` | 写入文档的目录，默认为 `/tmp/hugodoc/` |
| `-h`, `--help` | 显示 `doc` 命令的帮助信息 |

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

按默认目录生成文档，输出会落到 `/tmp/hugodoc/`：

```bash
hugo gen doc
```

改为写入项目内便于查看的相对路径：

```bash
hugo gen doc --dir ./docs/cli
```

指定读取文件的起始路径后生成文档：

```bash
hugo gen doc --source . --dir ./docs/cli
```

## 说明

- 生成结果是每个命令一个 Markdown 文件，文件名与命令对应，例如 `hugo_gen.md` 对应 `hugo gen`。
- 文件顶部的 front matter 已按 Hugo 的渲染需要写好，可以直接作为内容页使用，无需手工补全字段。
- 该命令不会构建站点，也不会写入 `public/`，只把 Markdown 文件写到 `--dir` 指定的目录。
- 本站在 [commands 章节](/commands/) 中收录的命令页，正是这类生成结果经过整理与翻译后的版本。
