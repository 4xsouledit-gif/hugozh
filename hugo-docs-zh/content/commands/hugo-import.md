+++
title = "hugo import"
linkTitle = "hugo import"
description = "从其他系统导入项目的父命令，需搭配子命令使用。"
date = 2026-10-01
weight = 280
source = "https://gohugo.io/commands/hugo_import/"
+++

`hugo import` 是导入类命令的父命令，用于把其他静态站点生成器的项目导入为 Hugo 项目。它本身不执行导入，必须搭配一个子命令使用，例如 `hugo import jekyll jekyll_root_path target_path`。

目前该父命令下收录的子命令是 [`hugo import jekyll`](/commands/hugo-import-jekyll/)，用于从 Jekyll 站点导入。

## 用法

```text
hugo import [command] [flags]
```

直接运行 `hugo import` 而不带子命令时不会导入任何内容，Hugo 会提示需要一个子命令。

## 子命令

| 子命令 | 说明 |
| --- | --- |
| `hugo import jekyll` | 从 Jekyll 导入项目 |

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `import` 命令的帮助信息 |

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

查看导入相关命令的帮助信息：

```bash
hugo import --help
```

查看子命令的用法与选项：

```bash
hugo import jekyll --help
```

把同级目录下的 Jekyll 站点导入到新的目标目录：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site
```

## 说明

- 导入动作由子命令完成，父命令只负责组织这些子命令。
- 各子命令同样接受上表列出的全局选项，例如 `--logLevel`、`--quiet`。
- 导入过程通常由源目录与目标目录两个参数决定，具体的参数含义请见对应子命令页面。
- 导入完成后建议先用 `hugo server` 本地预览，再逐项检查内容、链接与资源路径是否符合预期。
