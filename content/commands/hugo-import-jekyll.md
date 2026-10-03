+++
title = "hugo import jekyll"
linkTitle = "hugo import jekyll"
description = "从 Jekyll 项目导入内容并生成 Hugo 站点。"
date = 2026-10-01
weight = 290
source = "https://gohugo.io/commands/hugo_import_jekyll/"
+++

`hugo import jekyll` 是 [`hugo import`](/commands/hugo-import/) 的子命令，用于从 Jekyll 项目导入站点。它需要两个路径参数：先是 Jekyll 站点的根目录，再是写入导入结果的目标目录，例如 `hugo import jekyll jekyll_root_path target_path`。

导入会把 Jekyll 的内容与配置转换为 Hugo 可以使用的形式，省去逐篇迁移文章的重复劳动。

## 用法

```text
hugo import jekyll [flags] [args]
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `--force` | 允许导入到非空的目标目录 |
| `-h`, `--help` | 显示 `jekyll` 命令的帮助信息 |

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

把当前目录下的 Jekyll 站点导入到同级的新目录：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site
```

目标目录已经存在且非空时，显式允许写入：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site --force
```

导入时把日志级别调到 `debug`，便于排查问题：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site --logLevel debug
```

## 说明

- 两个位置参数缺一不可，顺序是先源目录、后目标目录；只给一个参数时命令会报错。
- 目标目录默认为空目录；若其中已有文件，必须加上 `--force` 才会继续导入。
- 迁移结果是普通文件，请在导入后检查 front matter、永久链接与图片等静态资源的相对路径。
- 导入完成后可以用 `hugo server` 在本地预览，确认页面与资源都能正常渲染。
