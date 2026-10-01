+++
title = "hugo convert"
linkTitle = "hugo convert"
description = "把内容的前置元数据转换为另一种格式的父命令。"
date = 2026-10-01
weight = 190
source = "https://gohugo.io/commands/hugo_convert/"
+++

`hugo convert` 是用于转换前置元数据格式的父命令。它把内容目录里每个文件的前置元数据改写成另一种格式，便于在 YAML、TOML 与 JSON 之间迁移：例如从其他静态站点生成器搬过来之后，想让全站统一使用 TOML 前置元数据，就可以用它批量处理，而不必手工逐个文件改写。

`hugo convert` 本身不执行转换，需要搭配子命令使用：`hugo convert toJSON`、`hugo convert toTOML` 与 `hugo convert toYAML`。

## 用法

```text
hugo convert [command] [flags]
```

只运行 `hugo convert` 而不带子命令不会转换任何文件，Hugo 会提示需要一个子命令。

## 子命令

| 子命令 | 说明 |
| --- | --- |
| `hugo convert toJSON` | 把内容目录中的前置元数据转换为 JSON，详见 [hugo convert toJSON](/commands/hugo-convert-tojson/) |
| `hugo convert toTOML` | 把内容目录中的前置元数据转换为 TOML，详见 [hugo convert toTOML](/commands/hugo-convert-totoml/) |
| `hugo convert toYAML` | 把内容目录中的前置元数据转换为 YAML，详见 [hugo convert toYAML](/commands/hugo-convert-toyaml/) |

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `convert` 命令的帮助信息 |
| `-o`, `--output string` | 写入文件的文件系统路径 |
| `--unsafe` | 启用安全性较低的操作，请先备份 |

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

把项目内容的前置元数据统一转换为 TOML：

```bash
hugo convert toTOML
```

转换会改写内容目录中的源文件，因此上游提醒先做备份；确认已有备份或已纳入版本控制后，再按需加上 `--unsafe`：

```bash
hugo convert toYAML --unsafe
```

先把结果写到另一个目录，检查无误后再替换原文件：

```bash
hugo convert toJSON --output converted
```

## 说明

- `-o`、`--output` 与 `--unsafe` 是 `convert` 自己的选项，因此它们同样出现在各个子命令的继承选项列表里。
- 上游对 `--unsafe` 的说明是「启用安全性较低的操作，请先备份」，动手之前请先提交到版本控制或另存一份副本。
- 转换只针对前置元数据，正文内容不会被改写；不同格式之间的取舍见[内容格式](/content-management/content-formats/)。
- 需要构建站点请使用 [hugo](/commands/hugo/)，本命令只做格式转换，不产出站点文件。
