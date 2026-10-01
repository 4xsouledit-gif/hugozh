+++
title = "hugo mod"
linkTitle = "hugo mod"
description = "管理项目依赖图中模块的父命令，需搭配子命令使用。"
date = 2026-10-01
weight = 300
source = "https://gohugo.io/commands/hugo_mod/"
+++

`hugo mod` 是管理模块的一组辅助命令的父命令，用于维护项目依赖图中的 Hugo Modules。它本身不执行具体操作，必须搭配一个子命令使用，例如 `hugo mod tidy`。

这里的多数操作都要求系统上安装了 Go（版本不低于 Go 1.12）以及相应的版本控制系统客户端（通常是 Git）。如果只使用 `/themes` 目录中的模块，或者已经通过 `hugo mod vendor` 把它们 vendor 到本地，则不需要这些依赖。

Hugo 解析项目配置中定义的组件时，总是按固定顺序查找：`_vendor` 目录（未传入 `--ignoreVendorPaths` 参数时）、Go Modules、然后是 `themes` 目录中的文件夹。更多信息见 https://gohugo.io/hugo-modules/ 。

## 用法

```text
hugo mod [command] [flags]
```

## 子命令

| 子命令 | 说明 |
| --- | --- |
| `hugo mod clean` | 删除当前项目的 Hugo Module 缓存 |
| `hugo mod get` | 解析当前 Hugo 项目中的依赖 |
| `hugo mod graph` | 打印模块依赖图 |
| `hugo mod init` | 把当前项目初始化为 Hugo Module |
| `hugo mod npm` | 各种 npm 辅助功能 |
| `hugo mod tidy` | 删除 `go.mod` 与 `go.sum` 中未使用的条目 |
| `hugo mod vendor` | 把所有模块依赖 vendor 到 `_vendor` 目录 |
| `hugo mod verify` | 验证依赖 |

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `mod` 命令的帮助信息 |

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

把当前项目初始化为 Hugo Module：

```bash
hugo mod init github.com/example/my-site
```

整理依赖清单，移除未使用的条目：

```bash
hugo mod tidy
```

把所有依赖放入 `_vendor` 目录，便于离线构建：

```bash
hugo mod vendor
```

查看模块依赖图：

```bash
hugo mod graph
```

## 说明

- 使用 Go Modules 时，命令行中的模块路径通常写成仓库形式的相对标识，例如 `github.com/example/my-site`。
- 用 `hugo mod vendor` vendor 之后，构建不再需要 Go 与 VCS 客户端；此时可配合 `--ignoreVendorPaths` 控制哪些模块路径忽略 `_vendor`。
- 组件解析顺序决定了同名模块的取用优先级，排查“改了模块却不生效”时，先确认是否命中了 `_vendor` 目录。
- 各子命令除自己的选项外，同样接受上表列出的全局选项。
