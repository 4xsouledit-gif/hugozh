+++
title = "hugo convert toJSON"
linkTitle = "hugo convert toJSON"
description = "把内容目录中的前置元数据统一改写为 JSON 格式。"
date = 2026-10-01
weight = 200
source = "https://gohugo.io/commands/hugo_convert_toJSON/"
+++

`hugo convert toJSON` 是 [hugo convert](/commands/hugo-convert/) 的子命令，用于把内容目录中所有文件的前置元数据都改为 JSON 格式。JSON 前置元数据以花括号包裹，机器读取方便，适合由程序生成或批量处理的站点；把整站统一到一种格式，也能避免同一项目里 TOML、YAML、JSON 三种写法混用带来的混乱。

## 用法

```text
hugo convert toJSON [flags] [args]
```

命令遍历内容目录中的每个内容文件，就地改写其前置元数据，正文保持不变。转换完成后建议先构建一次或本地预览确认页面数据仍然正常。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `toJSON` 子命令的帮助信息 |

## 继承自父命令的选项

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
| `-o`, `--output string` | 写入文件的文件系统路径 |
| `--quiet` | 以静默模式构建 |
| `-M`, `--renderToMemory` | 渲染到内存，主要用于运行服务器时 |
| `-s`, `--source string` | 读取文件时相对的起始文件系统路径 |
| `--themesDir string` | 主题目录的文件系统路径 |
| `--unsafe` | 启用安全性较低的操作，请先备份 |

## 示例

把项目内容的前置元数据统一转换为 JSON：

```bash
hugo convert toJSON
```

转换会原地改写源文件，确认已有备份或已纳入版本控制后，可按需加上 `--unsafe`：

```bash
hugo convert toJSON --unsafe
```

先把结果输出到另一个目录，确认无误后再替换原文件：

```bash
hugo convert toJSON --output converted
```

## 说明

- `-o`、`--output` 与 `--unsafe` 继承自父命令 `hugo convert`，其余继承选项来自顶层 `hugo` 命令。
- 下游工具读取 JSON 时不会遇到 YAML 缩进或 TOML 键名风格的问题，因此由脚本生成前置元数据的项目常选这种格式。
- 只有前置元数据会被改写，Markdown 正文与页面资源不受影响。
- 其他目标格式的写法见 [hugo convert toTOML](/commands/hugo-convert-totoml/) 与 [hugo convert toYAML](/commands/hugo-convert-toyaml/)。
