+++
title = "hugo completion bash"
linkTitle = "hugo completion bash"
description = "生成 bash 的 hugo 补全脚本，并说明如何加载进会话。"
date = 2026-10-01
weight = 410
source = "https://gohugo.io/commands/hugo_completion_bash/"
+++

`hugo completion bash` 生成 bash 的自动补全脚本。把脚本交给 bash 执行之后，输入 `hugo` 及其子命令或选项时就能用 Tab 键补全。生成的脚本依赖 `bash-completion` 软件包：如果系统里还没有安装，可以用操作系统的包管理器装一个。

## 用法

```text
hugo completion bash
```

命令把补全脚本写到标准输出，因此通常需要重定向到文件，或者直接交给 bash 执行。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `bash` 子命令的帮助信息 |
| `--no-descriptions` | 关闭补全项的描述文字 |

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

在当前 shell 会话中加载补全，用完即弃：

```bash
source <(hugo completion bash)
```

先把脚本写入相对路径下的文件，再加载它：

```bash
mkdir -p completions
hugo completion bash > completions/hugo
source completions/hugo
```

生成不带描述文字的补全脚本：

```bash
hugo completion bash --no-descriptions > completions/hugo
```

## 说明

- `bash-completion` 软件包提供触发补全的机制，本命令只生成补全逻辑；缺少该软件包时，加载脚本也不会看到补全效果。
- 想让每个新会话都自动加载，只需执行一次：把脚本放进 bash-completion 的加载目录，文件名取 `hugo`。Linux 上该目录通常是系统配置目录下的 `bash_completion.d`，macOS 上通常是 Homebrew 前缀下的 `etc/bash_completion.d`。上面示例先写入 `completions/hugo`，再把该文件移动到对应目录即可。
- 放置完成后需要重新打开一个 shell 才会生效；改动脚本内容后同样要重新打开 shell。
- `--no-descriptions` 适合不喜欢补全列表附带说明文字的场合，代价是补全项更难分辨。
- 其他 shell 的补全脚本见 [hugo completion](/commands/hugo-completion/)。
