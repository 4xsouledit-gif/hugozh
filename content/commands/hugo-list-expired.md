+++
title = "hugo list expired"
linkTitle = "hugo list expired"
description = "列出过期日期已过去、正常构建不再发布的内容。"
date = 2026-10-01
weight = 160
source = "https://gohugo.io/commands/hugo_list_expired/"
+++

`hugo list expired` 是 [hugo list](/commands/hugo-list/) 的子命令，用于列出过期日期已经过去的内容。Hugo 依据内容前置元数据中的时间字段（例如 `expiryDate`）判断一个页面是否过期：过期页面在正常构建中不再发布，但源文件仍然留在内容目录里，这条命令就是把它们找出来的手段，适合在内容巡检或上线前检查时使用。

## 用法

```text
hugo list expired [flags] [args]
```

在项目根目录执行，输出为逗号分隔的表格：第一行是表头，随后每一行对应一个已过期的内容文件，包含内容文件的路径、标题与相关时间字段。命令只读取内容并打印清单，不会构建站点。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `expired` 子命令的帮助信息 |

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

列出项目中所有已过期的内容：

```bash
hugo list expired
```

以当前目录作为源目录列出，便于在脚本中固定工作目录：

```bash
hugo list expired --source .
```

改用指定的配置文件，检查另一套配置下的过期内容：

```bash
hugo list expired --config hugo.toml
```

## 说明

- 一个页面是否算作过期，取决于内容的时间字段；这些字段既可以写在页面的前置元数据里，也可以通过级联或站点配置提供。
- 本命令只负责列出，不改变构建行为。这类内容在构建结果中是否发布，由与构建相关的站点配置决定，请以你的项目配置为准。
- 输出是纯文本表格，可以直接重定向到文件，交给其他工具继续处理。
- 需要查看未来内容或全部内容，请分别使用 [hugo list future](/commands/hugo-list-future/) 与 [hugo list all](/commands/hugo-list-all/)；只关心真正会发布的内容时，使用 [hugo list published](/commands/hugo-list-published/)。
