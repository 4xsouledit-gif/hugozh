+++
title = "hugo completion zsh"
linkTitle = "hugo completion zsh"
description = "生成 zsh 的 hugo 补全脚本，并说明如何加载。"
date = 2026-10-01
weight = 440
source = "https://gohugo.io/commands/hugo_completion_zsh/"
+++

`hugo completion zsh` 生成 zsh 的自动补全脚本。zsh 的补全体系依赖 `compinit`，并从 `fpath` 数组列出的目录里查找补全函数，函数名以 `_` 开头且与命令同名，所以生成的脚本要保存为 `_hugo`。

## 用法

```text
hugo completion zsh [flags]
```

命令把补全脚本写到标准输出，通常重定向到文件，或直接交给当前会话执行。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `zsh` 子命令的帮助信息 |
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

如果当前环境还没有启用补全，先在会话里启用一次：

```bash
autoload -U compinit; compinit
```

在当前会话中加载补全脚本，用完即弃：

```bash
source <(hugo completion zsh)
```

写入 `fpath` 中的第一个目录，让每个新会话自动加载：

```bash
hugo completion zsh > "${fpath[1]}/_hugo"
```

生成不带描述文字的补全脚本：

```bash
hugo completion zsh --no-descriptions > _hugo
```

## 说明

- 若启动时没有启用补全，需要先执行 `autoload -U compinit; compinit`；希望永久启用，可以把这一行加入 zsh 的启动文件 `.zshrc`。
- zsh 从 `fpath` 数组列出的目录中查找补全函数，因此脚本必须命名为 `_hugo`，并放进 `fpath` 覆盖的目录里；`${fpath[1]}` 就是该数组的第一个条目，直接写入这里最省事。
- 也可以把脚本写入相对路径下的文件，再把它移动到 `fpath` 覆盖的目录；写入后需要重新打开一个 shell 才会生效。
- 在 macOS 上通过 Homebrew 使用 zsh 时，补全函数通常放在 Homebrew 前缀下的 `share/zsh/site-functions`，把脚本写入该目录下的 `_hugo` 即可。
- `--no-descriptions` 会去掉补全项后面的说明文字。
- 其他 shell 的补全脚本见 [hugo completion](/commands/hugo-completion/)。
