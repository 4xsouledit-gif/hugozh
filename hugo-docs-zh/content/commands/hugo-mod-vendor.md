+++
title = "hugo mod vendor"
linkTitle = "hugo mod vendor"
description = "把所有模块依赖复制到项目的 _vendor 目录，使构建无需联网。"
date = 2026-10-01
weight = 380
source = "https://gohugo.io/commands/hugo_mod_vendor/"
+++

`hugo mod vendor` 是 `hugo mod` 的子命令，用于把当前项目依赖的所有 Hugo 模块（Module）集中复制到项目根目录下的 `_vendor` 目录。一个模块被 vendor 之后，Hugo 就从 `_vendor` 目录里查找它的依赖，因此构建过程不再需要访问网络。这在离线环境、构建服务器上无法直连模块仓库，或者希望把依赖固定下来的场合都很有用。

## 用法

```text
hugo mod vendor [flags] [args]
```

在项目根目录执行。命令成功后会生成 `_vendor` 目录，其中的内容就是当前依赖的一份副本。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `vendor` 子命令的帮助信息 |
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

把当前项目的全部模块依赖 vendor 到 `_vendor` 目录：

```bash
hugo mod vendor
```

为另一个目录下的项目执行 vendor，可用 `--source` 指定项目根目录：

```bash
hugo mod vendor --source mysite
```

指定模块缓存目录：

```bash
hugo mod vendor --cacheDir cache
```

## 说明

- 只有在模块确实被 vendor 的情况下，Hugo 才会从 `_vendor` 目录查找它的依赖；没有 vendor 的模块仍按通常的模块解析方式处理。
- 常见做法是把生成的 `_vendor` 目录纳入版本控制，这样在别的机器上无需联网就能构建出同样的结果。
- 想确认 `_vendor` 目录之外的下载缓存是否与下载时一致，可以用 [`hugo mod verify`](/commands/hugo-mod-verify/) 校验。
- 如果只想让部分模块路径忽略 `_vendor`，可用全局选项 `--ignoreVendorPaths` 指定对应的 Glob 模式。
