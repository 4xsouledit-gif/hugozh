+++
title = "hugo gen man"
linkTitle = "hugo gen man"
description = "为 Hugo 命令行界面生成 man 手册页。"
date = 2026-10-01
weight = 270
source = "https://gohugo.io/commands/hugo_gen_man/"
+++

`hugo gen man` 是 `hugo gen` 的子命令，为 Hugo 命令行界面自动生成保持最新的 man 手册页。默认情况下，它会在当前目录下的 `man/` 目录中创建手册页文件。

生成的 man 手册页适合安装到系统的 man 路径中，之后就能用 `man hugo` 之类的命令在终端里查阅离线文档。

## 用法

```text
hugo gen man [flags] [args]
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `--dir string` | 写入 man 手册页的目录，默认为 `man/` |
| `-h`, `--help` | 显示 `man` 命令的帮助信息 |

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

在项目根目录生成手册页，输出写入默认的 `man/` 目录：

```bash
hugo gen man
```

改为写入项目内的其他相对路径：

```bash
hugo gen man --dir ./docs/man
```

指定读取文件的起始路径后再生成：

```bash
hugo gen man --source . --dir ./man
```

## 说明

- `--dir` 的值以当前工作目录为基准，用相对路径时不会写到站点内容目录之外的位置。
- 每个命令对应一个手册页文件，内容涵盖该命令的用途、选项以及可用的子命令。
- 该命令只生成手册页文本，不构建站点，也不写入 `public/`。
- 需要 Markdown 形式的命令行文档时，请使用 `hugo gen doc`；需要站点样式表时，请使用 `hugo gen chromastyles`。
