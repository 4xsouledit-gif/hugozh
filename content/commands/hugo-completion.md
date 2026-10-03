+++
title = "hugo completion"
linkTitle = "hugo completion"
description = "为指定 shell 生成 hugo 命令的自动补全脚本。"
date = 2026-10-01
weight = 400
source = "https://gohugo.io/commands/hugo_completion/"
+++

`hugo completion` 用来为指定的 shell 生成 `hugo` 命令的自动补全脚本。它本身不输出补全结果，而是按子命令决定生成哪一种 shell 的脚本：bash、fish、powershell 或 zsh。生成脚本之后，把它交给对应的 shell 执行或加载，输入 `hugo` 及其子命令、选项时就能用补全键（通常是 Tab）自动补全。每个子命令的帮助信息里都写明了该 shell 下如何使用生成的脚本。

## 用法

```text
hugo completion [command]
```

必须先选择一个 shell 子命令，四个子命令分别是：

- [hugo completion bash](/commands/hugo-completion-bash/)：生成 bash 的补全脚本。
- [hugo completion fish](/commands/hugo-completion-fish/)：生成 fish 的补全脚本。
- [hugo completion powershell](/commands/hugo-completion-powershell/)：生成 powershell 的补全脚本。
- [hugo completion zsh](/commands/hugo-completion-zsh/)：生成 zsh 的补全脚本。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `completion` 命令的帮助信息 |

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

把 zsh 的补全脚本写入文件：

```bash
hugo completion zsh > completions/_hugo
```

生成 bash 的补全脚本，并在当前会话中立即生效：

```bash
source <(hugo completion bash)
```

查看某个 shell 子命令的详细用法：

```bash
hugo completion fish --help
```

## 说明

- 补全脚本由 `hugo` 二进制自身生成，内容会随 Hugo 版本变化，所以升级 Hugo 之后建议重新生成一次。
- 四个子命令都提供 `--no-descriptions` 选项，用于关闭补全项后面的说明文字；其余选项与各自的加载方式见对应子命令页面。
- 生成不会自动生效：脚本要么被对应的 shell 加载，要么写入该 shell 约定的补全目录，具体做法参见各子命令页面。
- 这些命令只影响命令行的补全体验，不改变站点的构建结果，因此可以随时重新生成或删除生成的文件。
