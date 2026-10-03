+++
title = "hugo list future"
linkTitle = "hugo list future"
description = "列出发布日期位于将来、尚未发布的内容。"
date = 2026-10-01
weight = 170
source = "https://gohugo.io/commands/hugo_list_future/"
+++

`hugo list future` 是 [hugo list](/commands/hugo-list/) 的子命令，用于列出发布日期位于将来的内容。Hugo 依据内容前置元数据中的时间字段（例如 `publishDate`）判断一个页面是否属于未来内容：这类页面的发布时间还没到，因此在正常构建中不会发布，但作者往往已经写好并放在内容目录里。做发布排期、核对待上线篇目时，这条命令比手工翻文件更可靠。

## 用法

```text
hugo list future [flags] [args]
```

在项目根目录执行，输出为逗号分隔的表格：第一行是表头，随后每一行对应一个未来内容文件，包含内容文件的路径、标题与相关时间字段。命令只读取内容并打印清单，不会构建站点。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `future` 子命令的帮助信息 |

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

列出项目中所有发布日期位于将来的内容：

```bash
hugo list future
```

以当前目录作为源目录列出，便于在脚本中固定工作目录：

```bash
hugo list future --source .
```

改用指定的配置文件，检查另一套配置下的待发布篇目：

```bash
hugo list future --config hugo.toml
```

## 说明

- 一个页面是否算作未来内容，取决于内容的时间字段；这些字段既可以写在页面的前置元数据里，也可以通过级联或站点配置提供。
- 本命令只负责列出，不改变构建行为。这类内容在构建结果中是否发布，由与构建相关的站点配置决定，请以你的项目配置为准。
- 与 `hugo list expired` 相对：前者看发布日期还没到的内容，后者看过期日期已经过去的内容；两者都不做构建。
- 需要一并检查全部内容时，使用 [hugo list all](/commands/hugo-list-all/)；只关心当前真正会发布的内容时，使用 [hugo list published](/commands/hugo-list-published/)。
