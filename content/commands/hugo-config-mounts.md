+++
title = "hugo config mounts"
linkTitle = "hugo config mounts"
description = "打印项目最终生效的文件挂载配置，便于核对挂载来源与目标。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/commands/hugo_config_mounts/"
+++

`hugo config mounts` 是 `hugo config` 的子命令，用于打印项目最终生效的文件挂载（mount）配置。挂载把内容、资源、模板等目录映射到 Hugo 的各个组件上，除了在站点配置里书写，主题与模块也会注入自己的挂载，因此最终结果往往和配置文件里看到的不完全一致。

## 用法

```text
hugo config mounts [flags] [args]
```

输出会列出每个挂载的来源目录、目标组件与相关设置。配置目录中按文件拆分的挂载配置，同样会体现在输出里。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://example.org/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `mounts` 子命令的帮助信息 |
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

在项目根目录查看最终生效的挂载：

```bash
hugo config mounts
```

查看启用了某个主题之后的挂载结果：

```bash
hugo config mounts --theme my-theme
```

指定源目录时，输出中的相对路径都会以该目录为基准：

```bash
hugo config mounts --source .
```

## 说明

- 挂载常与主题、模块一起使用，用来把外部目录的内容合并进 `content/`、`assets/`、`layouts/` 等。
- 当某个文件“明明存在却不生效”时，先看这里的挂载结果，确认目录确实被挂载到了预期的组件上。
- 需要查看挂载之外的完整配置，请使用父命令 `hugo config`。
