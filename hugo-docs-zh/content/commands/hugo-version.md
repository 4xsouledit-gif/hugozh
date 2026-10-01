+++
title = "hugo version"
linkTitle = "hugo version"
description = "显示当前 Hugo 的版本号，以及编译进该版本的相关信息。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/commands/hugo_version/"
+++

`hugo version` 显示当前 Hugo 的版本号。输出中还会带上编译进该二进制的相关信息，例如是否为扩展版，这些信息在提交缺陷报告时同样有用。需要更完整的环境明细时，改用 `hugo env`。

## 用法

```text
hugo version [flags] [args]
```

在任意目录执行都可以，命令不依赖当前是否位于 Hugo 项目之中。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `version` 命令的帮助信息 |

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

查看当前 Hugo 的版本：

```bash
hugo version
```

在 CI 流程中确认本地版本与流水线一致：

```bash
hugo version
```

## 说明

- 版本号形如 `v0.0.0-xxxxxxx` 时，说明这是一个由源码构建的版本，而非正式发布版。
- 输出中若出现扩展版标记，表示该二进制支持 WebP 等图像处理能力；许多主题与模板依赖这一点。
- 排查环境差异时，把 `hugo version` 与 `hugo env` 的输出一起附上最为稳妥。
