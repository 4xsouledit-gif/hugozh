+++
title = "hugo mod npm pack"
linkTitle = "hugo mod npm pack"
description = "把各 Hugo 模块的 Node.js 依赖合并进一个 npm workspace。"
date = 2026-10-01
weight = 360
source = "https://gohugo.io/commands/hugo_mod_npm_pack/"
+++

`hugo mod npm pack` 是 `hugo mod` 的子命令，也是 `hugo mod npm` 目前唯一的子命令。它把所有 Hugo 模块（Module）里声明的 Node.js 依赖合并到一个名为 `packages/hugoautogen` 的 npm workspace 中，省去手工逐个模块安装依赖的麻烦。

## 用法

```text
hugo mod npm pack [flags] [args]
```

在项目根目录执行。合并后的依赖写入 `packages/hugoautogen/package.json`，同时根目录的 `package.json` 会被补上一条指向 `packages/hugoautogen` 的 `workspaces` 记录。

依赖来源从各模块根目录下的 `package.hugo.json` 或 `package.json` 中读取；两者同时存在时，`package.hugo.json` 优先。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `pack` 子命令的帮助信息 |
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

在项目根目录合并所有模块的 Node.js 依赖：

```bash
hugo mod npm pack
```

合并后按 workspace 的方式安装依赖：

```bash
npm install
```

如果模块使用 `package.hugo.json` 单独维护 Hugo 侧的依赖声明，直接重新执行合并即可让它生效：

```bash
hugo mod npm pack
npm install
```

## 说明

- 生成物位于 `packages/hugoautogen/package.json`，属于自动生成的内容，不建议手工修改，重新执行命令时它会被覆盖。
- 根目录 `package.json` 中的 `workspaces` 记录同样由本命令写入，用于把自动生成的 workspace 纳入 npm 的依赖解析。
- `package.hugo.json` 与 `package.json` 同时存在时以前者为准，因此可以把 Hugo 相关的依赖声明与普通 npm 依赖分开维护。
- 依赖加载与模块解析的其余环节，参见 [`hugo mod get`](/commands/hugo-mod-get/)（获取模块依赖）与 [`hugo mod tidy`](/commands/hugo-mod-tidy/)（清理无用条目）。
