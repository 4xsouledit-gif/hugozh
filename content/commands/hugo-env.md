+++
title = "hugo env"
linkTitle = "hugo env"
description = "显示 Hugo 的版本与环境信息，提交缺陷报告时常用。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/commands/hugo_env/"
+++

`hugo env` 显示 Hugo 的版本与环境信息。它输出的内容比 `hugo version` 更详细，除了版本号，还会列出构建时所用的 Go 版本，以及扩展版（extended）、部署（deploy）等编译时开关是否启用。提交缺陷报告或排查“同一份模板在不同机器上行为不同”时，先贴出它的输出。

## 用法

```text
hugo env [flags] [args]
```

在项目根目录执行即可，命令不会读写站点的输出目录。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `env` 命令的帮助信息 |

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

打印版本与环境信息：

```bash
hugo env
```

在别人的机器上复现问题之前，先记录自己的环境：

```bash
hugo env
```

## 说明

- 输出中的 `hugo` 一行是版本号，`go` 一行是 Go 编译器版本；各自后面还会列出编译时启用的扩展。
- 只想看版本号时，用 `hugo version`；需要完整环境信息时，用 `hugo env`。
- 报告缺陷时，通常还需要附上操作系统与架构信息，它们会一并出现在命令输出中。
