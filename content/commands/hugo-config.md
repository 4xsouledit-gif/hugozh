+++
title = "hugo config"
linkTitle = "hugo config"
description = "显示项目最终生效的配置，包含默认值与自定义值。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/commands/hugo_config/"
+++

`hugo config` 显示当前项目最终生效的配置，既包括 Hugo 的默认值，也包括你在配置文件、配置目录、命令行参数与环境变量中写入的自定义值。排查配置是否被正确覆盖时，它比直接阅读配置文件更可靠。

`hugo config` 是父命令，目前带有子命令 `hugo config mounts`，用于查看配置好的文件挂载。

## 用法

```text
hugo config [command] [flags]
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://example.org/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `--format string` | 输出所用的格式：`toml`、`yaml` 或 `json`，默认为 `toml` |
| `-h`, `--help` | 显示 `config` 命令的帮助信息 |
| `--lang string` | 显示哪个语言的配置，默认为默认内容语言 |
| `--printZero` | 输出中一并包含取值为零值的配置项，例如 `false`、`0`、`""` |
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

在项目根目录以默认的 TOML 格式查看完整配置：

```bash
hugo config
```

改为 YAML 或 JSON 输出，便于与其他工具配合：

```bash
hugo config --format yaml
```

```bash
hugo config --format json
```

只看某个语言的配置：

```bash
hugo config --lang zh
```

把取值为零值的配置项也打印出来：

```bash
hugo config --printZero
```

## 说明

- `--printZero` 在生产环境默认的构建中尤其有用：许多配置项在默认配置下并不会出现在输出里。
- 输出内容是合并后的结果，因此可以用来确认某个选项究竟被哪一层配置覆盖。
- 查看文件挂载的配置，请使用 `hugo config mounts`。
