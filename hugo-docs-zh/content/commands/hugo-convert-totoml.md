+++
title = "hugo convert toTOML"
linkTitle = "hugo convert toTOML"
description = "把内容目录中的前置元数据统一改写为 TOML 格式。"
date = 2026-10-01
weight = 210
source = "https://gohugo.io/commands/hugo_convert_toTOML/"
+++

`hugo convert toTOML` 是 [hugo convert](/commands/hugo-convert/) 的子命令，用于把内容目录中所有文件的前置元数据都改为 TOML 格式。TOML 前置元数据以加号组成的分隔行包裹，也是 Hugo 项目配置常见的书写方式；如果站点配置用 TOML，把内容的前置元数据也统一成 TOML，全项目的写法会更为一致。

## 用法

```text
hugo convert toTOML [flags] [args]
```

命令遍历内容目录中的每个内容文件，就地改写其前置元数据，正文保持不变。转换完成后建议先构建一次或本地预览确认页面数据仍然正常。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `toTOML` 子命令的帮助信息 |

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

把项目内容的前置元数据统一转换为 TOML：

```bash
hugo convert toTOML
```

转换会原地改写源文件，确认已有备份或已纳入版本控制后，可按需加上 `--unsafe`：

```bash
hugo convert toTOML --unsafe
```

先把结果输出到另一个目录，确认无误后再替换原文件：

```bash
hugo convert toTOML --output converted
```

## 说明

- `-o`、`--output` 与 `--unsafe` 继承自父命令 `hugo convert`，其余继承选项来自顶层 `hugo` 命令。
- TOML 的键值对没有缩进要求，字段较多时也不容易出现 YAML 那样的缩进错位问题。
- 只有前置元数据会被改写，Markdown 正文与页面资源不受影响。
- 其他目标格式的写法见 [hugo convert toJSON](/commands/hugo-convert-tojson/) 与 [hugo convert toYAML](/commands/hugo-convert-toyaml/)。
