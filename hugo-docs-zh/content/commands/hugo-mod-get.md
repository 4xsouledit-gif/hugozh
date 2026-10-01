+++
title = "hugo mod get"
linkTitle = "hugo mod get"
description = "解析并获取当前 Hugo 项目的模块依赖，可指定版本或递归更新。"
date = 2026-10-01
weight = 320
source = "https://gohugo.io/commands/hugo_mod_get/"
+++

`hugo mod get` 是 `hugo mod` 的子命令，用于解析当前 Hugo 项目里的模块（Module）依赖。它既可以为某个模块取回可用的最新版本，也可以锁定到指定版本，或者一次性更新全部直接依赖、直接与间接依赖。

## 用法

```text
hugo mod get [flags] [args]
```

不带参数执行时，会为所有直接模块依赖取回最新版本。也可以传入模块路径，或者用 `./...` 递归处理当前目录下的模块。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `get` 子命令的帮助信息 |

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

为指定模块安装可用的最新版本：

```bash
hugo mod get github.com/gohugoio/testshortcodes
```

安装指定版本：

```bash
hugo mod get github.com/gohugoio/testshortcodes@v0.3.0
```

更新全部直接模块依赖到最新版本：

```bash
hugo mod get
```

递归处理当前目录下的模块：

```bash
hugo mod get ./...
```

更新全部依赖，包括间接依赖：

```bash
hugo mod get -u
hugo mod get -u ./...
```

## 说明

- `-u` 之类的标志来自 `go get`；凡是 `go get` 支持的标志在这里同样可用，可运行 `go help get` 查看完整说明。
- Hugo 解析组件时有一个固定顺序：先看项目配置里定义的内容，再依次看 `_vendor` 目录（未提供 `--ignoreVendorPaths` 标志时）、Go Modules、以及主题目录中的文件夹。
- 版本号写在模块路径之后，用 `@` 连接，例如 `@v0.3.0`；不写版本即取最新可用版本。
- 依赖更新完成后，可用 [`hugo mod tidy`](/commands/hugo-mod-tidy/) 清理不再使用的条目，或用 [`hugo mod graph`](/commands/hugo-mod-graph/) 查看依赖关系。
