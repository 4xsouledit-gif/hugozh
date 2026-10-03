+++
title = "hugo new theme"
linkTitle = "hugo new theme"
description = "在当前项目的 themes 目录下创建一个可用的新主题骨架。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/commands/hugo_new_theme/"
+++

`hugo new theme` 是 `hugo new` 的子命令，用于新建主题。它会把主题骨架写入当前项目的 `themes/` 目录，生成的主题可以直接使用，并附带模板示例与示例内容，方便在此基础上继续改造。

## 用法

```text
hugo new theme [name] [flags]
```

`name` 是必填参数，表示主题名称，同时也是 `themes/` 下的目录名。执行之后会得到类似下面的结构：

```text
themes/my-theme/
├── archetypes/
├── assets/
├── content/
├── layouts/
├── static/
├── hugo.toml
├── LICENSE
├── README.md
└── theme.toml
```

具体生成的文件随 Hugo 版本略有差异。要在站点里启用这个主题，把它加入配置文件的 `theme` 字段即可。

## 选项

| 选项 | 说明 |
| --- | --- |
| `--format string` | 生成的配置文件所用的格式：`toml`、`yaml` 或 `json`，默认为 `toml` |
| `-h`, `--help` | 显示 `theme` 子命令的帮助信息 |

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

在项目根目录创建名为 `my-theme` 的主题，并使用 YAML 格式的配置文件：

```bash
hugo new theme my-theme
```

```bash
hugo new theme my-theme --format yaml
```

主题默认写入项目根目录下的 `themes/`，需要换到别处时用 `--themesDir` 指定：

```bash
hugo new theme my-theme --themesDir themes
```

## 说明

- 主题创建完成后，记得在站点配置中设置 `theme = "my-theme"`，否则站点不会使用它。
- 主题自身的配置文件（`hugo.toml`）与站点配置相互独立，前者为使用该主题的站点提供默认值。
- 若只需要新建内容页或站点骨架，请改用 `hugo new content` 与 `hugo new site`；`hugo new theme` 只负责主题。
