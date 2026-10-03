+++
title = "hugo completion powershell"
linkTitle = "hugo completion powershell"
description = "生成 PowerShell 的 hugo 补全脚本，并说明如何加载。"
date = 2026-10-01
weight = 430
source = "https://gohugo.io/commands/hugo_completion_powershell/"
+++

`hugo completion powershell` 生成 PowerShell 的自动补全脚本。脚本内容是一段 PowerShell 代码，因此在当前会话中加载时需要先用 `Out-String` 把它转成字符串，再用 `Invoke-Expression` 执行；希望长期生效，则把这段输出写进 PowerShell 的配置文件。

## 用法

```text
hugo completion powershell [flags]
```

命令把补全脚本写到标准输出，可以交给管道执行，也可以重定向成 `.ps1` 文件。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `powershell` 子命令的帮助信息 |
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

在当前 PowerShell 会话中加载补全，用完即弃：

```bash
hugo completion powershell | Out-String | Invoke-Expression
```

先把脚本写入相对路径下的文件，再在当前会话中点源加载：

```bash
hugo completion powershell > completions/hugo.ps1
. completions/hugo.ps1
```

生成不带描述文字的补全并在当前会话中加载：

```bash
hugo completion powershell --no-descriptions | Out-String | Invoke-Expression
```

## 说明

- 管道中的 `Out-String` 把脚本内容转成字符串，`Invoke-Expression` 在当前会话中执行它，两者缺一不可；点源加载 `.ps1` 文件则相当于在同一会话中逐行执行脚本。
- 想让每个新会话都生效，只需执行一次：把上面那条命令的输出追加到 PowerShell 的配置文件中，该文件由 `$PROFILE` 变量指向。修改配置文件后需要重新打开一个 shell。
- 也可以把补全脚本生成到固定位置，再在配置文件里用点源方式加载它，这样更新 Hugo 之后只要重新生成脚本即可，不必改动配置文件。
- `--no-descriptions` 会去掉补全项后面的说明文字。
- 其他 shell 的补全脚本见 [hugo completion](/commands/hugo-completion/)。
