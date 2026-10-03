+++
title = "hugo mod clean"
linkTitle = "hugo mod clean"
description = "删除当前项目的 Hugo 模块缓存，并可限定要清理的模块路径。"
date = 2026-10-01
weight = 310
source = "https://gohugo.io/commands/hugo_mod_clean/"
+++

`hugo mod clean` 是 `hugo mod` 的子命令，用于删除当前项目的 Hugo 模块（Module）缓存。Hugo 在解析模块依赖时会把取到的模块放进缓存目录，当缓存损坏、版本对不上，或者希望依赖重新取一遍时，可以用它把缓存清掉。

## 用法

```text
hugo mod clean [flags] [args]
```

在项目根目录执行。默认清理与当前项目相关的模块缓存；加上 `--all` 则清理整个模块缓存。

## 选项

| 选项 | 说明 |
| --- | --- |
| `--all` | 清理整个模块缓存 |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `clean` 子命令的帮助信息 |
| `--pattern string` | 按模式匹配要清理的模块路径；不设置时清理全部，例如 `"**hugo*"` |
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

清理当前项目的模块缓存：

```bash
hugo mod clean
```

只清理路径匹配某个模式的模块缓存：

```bash
hugo mod clean --pattern "**hugo*"
```

清理整个模块缓存，包括其他项目用到的模块：

```bash
hugo mod clean --all
```

## 说明

- `--pattern` 接受 Glob 模式，用来挑选要清理的模块路径；不传该选项时等同于清理全部。
- `--all` 作用在整个缓存目录上，而不只是当前项目，多个项目共用同一份缓存时请谨慎使用。
- 清理完成后再次构建，或执行 [`hugo mod get`](/commands/hugo-mod-get/) 与 [`hugo mod tidy`](/commands/hugo-mod-tidy/) 时，Hugo 会重新取回所需的模块。
