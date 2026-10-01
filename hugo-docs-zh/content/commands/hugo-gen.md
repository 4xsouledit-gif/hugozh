+++
title = "hugo gen"
linkTitle = "hugo gen"
description = "生成文档与语法高亮样式的父命令，需搭配子命令使用。"
date = 2026-10-01
weight = 240
source = "https://gohugo.io/commands/hugo_gen/"
+++

`hugo gen` 是生成类辅助命令的父命令，用于产出命令行文档、man 手册页以及 Chroma 语法高亮样式表。它本身不执行任何生成动作，必须搭配一个子命令使用，例如 `hugo gen doc`。

## 用法

```text
hugo gen [command] [flags]
```

直接运行 `hugo gen` 而不带子命令时不会生成任何文件，Hugo 会提示需要一个子命令。

## 子命令

| 子命令 | 说明 |
| --- | --- |
| `hugo gen chromastyles` | 为 Chroma 代码高亮器生成 CSS 样式表 |
| `hugo gen doc` | 为 Hugo 命令行界面生成 Markdown 文档 |
| `hugo gen man` | 为 Hugo 命令行界面生成 man 手册页 |

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `gen` 命令的帮助信息 |

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

在项目根目录生成 man 手册页，默认写入当前目录下的 `man/`：

```bash
hugo gen man
```

把 Markdown 文档写到项目内的其他目录：

```bash
hugo gen doc --dir ./docs/cli
```

导出当前样式对应的 Chroma 样式表：

```bash
hugo gen chromastyles --style monokai > ./assets/css/chroma.css
```

## 说明

- 三个子命令都只读取 Hugo 自身的内置数据或样式，不构建站点，也不写入 `public/`。
- `hugo gen doc` 与 `hugo gen man` 是上游维护命令行文档所用的工具，普通站点项目很少用到。
- 渲染站点通常只需要 `hugo gen chromastyles` 输出的样式表，而且仅在关闭内联样式时才需要。
- 每个子命令除自己的专属选项外，同样接受上表列出的全局选项。
