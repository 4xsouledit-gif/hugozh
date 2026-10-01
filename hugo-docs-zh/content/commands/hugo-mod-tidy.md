+++
title = "hugo mod tidy"
linkTitle = "hugo mod tidy"
description = "删除 go.mod 与 go.sum 中不再使用的模块条目。"
date = 2026-10-01
weight = 370
source = "https://gohugo.io/commands/hugo_mod_tidy/"
+++

`hugo mod tidy` 是 `hugo mod` 的子命令，用于删除 `go.mod` 与 `go.sum` 中不再被使用的条目。项目长期演进、模块增删之后，这两个文件里往往会留下已移除依赖的残迹，执行一次整理可以让依赖声明重新与实际情况对齐。

## 用法

```text
hugo mod tidy [flags] [args]
```

在项目根目录执行。命令会重写 `go.mod` 与 `go.sum`，只保留当前项目真正需要的模块条目。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `tidy` 子命令的帮助信息 |
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

整理当前项目的模块依赖声明：

```bash
hugo mod tidy
```

移除某个依赖后跟进整理：

```bash
hugo mod get ./...
hugo mod tidy
```

提交前确认依赖声明干净：

```bash
hugo mod tidy
git diff -- go.mod go.sum
```

## 说明

- 本命令只影响 `go.mod` 与 `go.sum` 两个文件，不会下载或升级模块版本；要更新版本请使用 [`hugo mod get`](/commands/hugo-mod-get/)。
- 整理前建议先提交或暂存当前改动，这样对照 `git diff` 就能确认哪些条目被删除。
- 依赖被删除却仍然在模板或配置里被引用时，构建会直接报错，因此整理后应重新构建站点确认无误。
- 想先看清模块之间的实际依赖关系，可用 [`hugo mod graph`](/commands/hugo-mod-graph/) 打印依赖图。
