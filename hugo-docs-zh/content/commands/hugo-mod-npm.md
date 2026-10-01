+++
title = "hugo mod npm"
linkTitle = "hugo mod npm"
description = "提供与 npm（Node 包管理器）相关的辅助子命令。"
date = 2026-10-01
weight = 350
source = "https://gohugo.io/commands/hugo_mod_npm/"
+++

`hugo mod npm` 是 `hugo mod` 的子命令，本身是一组与 npm（Node 包管理器）相关的辅助命令的入口。当项目里的 Hugo 模块带有自己的 Node.js 依赖时，这些辅助命令负责把依赖整理成可直接安装的形式，而不必逐个模块手工安装。

使用 Hugo Modules 时，主题或组件模块可以在自己的根目录下声明 Node.js 依赖。由于这些依赖分散在各个模块里，直接运行 `npm install` 无法一次装齐。`hugo mod npm` 这一组命令解决的正是这个问题：把散落的依赖声明汇总到站点自己的 npm 工程中，之后按常规的 npm 工作流安装即可。

## 用法

```text
hugo mod npm [command] [flags]
```

不带子命令执行时不会做具体工作，需要跟上要用的子命令。当前可用的子命令是 [`hugo mod npm pack`](/commands/hugo-mod-npm-pack/)：

| 子命令 | 说明 |
| --- | --- |
| [`hugo mod npm pack`](/commands/hugo-mod-npm-pack/) | 把各模块的 Node.js 依赖合并进一个 npm workspace |

## 选项

| 选项 | 说明 |
| --- | --- |
| `-h`, `--help` | 显示 `npm` 子命令的帮助信息 |

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

查看 `hugo mod npm` 及其子命令的帮助信息：

```bash
hugo mod npm --help
```

把模块中的 Node.js 依赖合并进 npm workspace：

```bash
hugo mod npm pack
```

## 说明

- 本命令只是分组入口，实际的依赖合并工作由子命令 `hugo mod npm pack` 完成。
- 在项目根目录执行，这样生成的 workspace 结构才会落在站点自己的 `package.json` 旁边。
- 合并完成后，用 npm 安装依赖即可；依赖来源与优先级的细节见 [`hugo mod npm pack`](/commands/hugo-mod-npm-pack/)。
