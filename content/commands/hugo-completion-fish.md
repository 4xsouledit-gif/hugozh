+++
title = "hugo completion fish"
linkTitle = "hugo completion fish"
description = "生成 fish 的 hugo 补全脚本，并说明如何加载。"
date = 2026-10-01
weight = 420
source = "https://gohugo.io/commands/hugo_completion_fish/"
+++

`hugo completion fish` 生成 fish 的自动补全脚本。fish 的用法与其他 shell 略有不同：它的补全逻辑用 fish 脚本书写，可以直接用管道交给本会话执行，也可以写入 fish 约定的补全目录，让之后的每个会话自动加载。

## 用法

```text
hugo completion fish [flags]
```

命令把补全脚本写到标准输出，需要重定向到文件，或者通过管道交给 fish 的 `source` 执行。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `fish` 子命令的帮助信息 |
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

在当前 fish 会话中加载补全，用完即弃：

```bash
hugo completion fish | source
```

把补全脚本写入 fish 的补全目录，让每个新会话自动加载：

```bash
mkdir -p .config/fish/completions
hugo completion fish > .config/fish/completions/hugo.fish
```

生成不带描述文字的补全并在当前会话中加载：

```bash
hugo completion fish --no-descriptions | source
```

## 说明

- fish 会自动加载配置目录下 `fish/completions` 里的补全脚本，并按文件名与命令名对应，因此脚本要保存为 `hugo.fish`；写入该目录后不必再手动 `source`。
- 上面示例中的相对路径以主目录为基准：fish 的配置目录通常位于主目录下的 `.config`；如果设置了 `XDG_CONFIG_HOME`，则以该变量指向的目录为基准。
- 写入补全目录后需要重新打开一个 shell 才会生效；用管道当场 `source` 则立即生效，但只限当前会话。
- `--no-descriptions` 会去掉补全项后面的说明文字，适合希望列表更紧凑的场景。
- 其他 shell 的补全脚本见 [hugo completion](/commands/hugo-completion/)。
