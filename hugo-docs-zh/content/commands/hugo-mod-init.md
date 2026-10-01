+++
title = "hugo mod init"
linkTitle = "hugo mod init"
description = "把当前项目初始化为 Hugo Module，可显式传入模块路径。"
date = 2026-10-01
weight = 340
source = "https://gohugo.io/commands/hugo_mod_init/"
+++

`hugo mod init` 是 `hugo mod` 的子命令，用于把当前项目初始化为一个 Hugo Module（模块）。执行后项目会具备作为模块被引用、以及引用其他模块的条件，是使用 Hugo Modules 管理主题与共享资源的第一步。

## 用法

```text
hugo mod init [flags] [args]
```

命令会尝试自行推断模块路径；你也可以把它作为参数传进去，例如：

```bash
hugo mod init github.com/gohugoio/testshortcodes
```

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `init` 子命令的帮助信息 |
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

在项目根目录初始化，让 Hugo 自行推断模块路径：

```bash
hugo mod init
```

显式指定模块路径，适合仓库地址与推断结果不一致的情况：

```bash
hugo mod init github.com/gohugoio/testshortcodes
```

在子目录中初始化一个独立模块：

```bash
hugo mod init github.com/example/my-project/sub-module
```

## 说明

- Hugo Modules 支持多模块项目，因此可以在 GitHub 仓库的某个子文件夹里单独初始化一个 Hugo Module。
- 推断模块路径时通常依据版本库信息；推断不出来或推断结果不符合预期时，按上面的写法把路径作为参数传入即可。
- 初始化只建立模块身份，不会自动添加依赖。需要引入主题或其他模块时，用 [`hugo mod get`](/commands/hugo-mod-get/) 获取；整理依赖条目则用 [`hugo mod tidy`](/commands/hugo-mod-tidy/)。
