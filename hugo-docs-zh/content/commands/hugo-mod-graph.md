+++
title = "hugo mod graph"
linkTitle = "hugo mod graph"
description = "打印模块依赖关系图，并标注模块处于禁用还是 vendored 状态。"
date = 2026-10-01
weight = 330
source = "https://gohugo.io/commands/hugo_mod_graph/"
+++

`hugo mod graph` 是 `hugo mod` 的子命令，用于打印模块（Module）依赖关系图，并附带模块状态信息，例如是否被禁用、是否来自 vendor。排查“某个依赖究竟从哪来”“版本为什么和预期不一致”这类问题时，它是第一步要看的东西。

## 用法

```text
hugo mod graph [flags] [args]
```

在项目根目录执行，输出会列出各模块之间的依赖关系。需要注意：对于 vendored 的模块，图中列出的是 vendor 目录里的版本，而不是 `go.mod` 中记录的版本。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `--clean` | 删除校验失败的依赖所对应的模块缓存 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `graph` 子命令的帮助信息 |
| `--renderSegments strings` | 要渲染的具名片段，在 segments 配置中定义 |
| `-t`, `--theme strings` | 使用的主题，位于 `/themes/THEMENAME/` |

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

打印当前项目的模块依赖关系图：

```bash
hugo mod graph
```

依赖校验失败时，顺带删除对应模块的缓存后重新查看：

```bash
hugo mod graph --clean
```

忽略 `_vendor` 目录，直接查看 Go Modules 记录的依赖关系：

```bash
hugo mod graph --ignoreVendorPaths "**"
```

## 说明

- 图里的模块状态会标出 disabled（已禁用）与 vendored（来自 vendor）等情况，便于区分“真的没依赖”和“依赖被关掉了”。
- vendored 模块显示的版本来自 vendor 目录，可能与 `go.mod` 中的记录不同；两者不一致时以这里看到的结果为准，因为构建时用的就是它。
- 依赖关系不符合预期时，可先用 [`hugo mod get`](/commands/hugo-mod-get/) 更新版本，再用 [`hugo mod tidy`](/commands/hugo-mod-tidy/) 清理无用条目，最后回到本命令确认结果。
