+++
title = "hugo mod verify"
linkTitle = "hugo mod verify"
description = "校验本地缓存中的模块依赖在下载后是否被改动过。"
date = 2026-10-01
weight = 390
source = "https://gohugo.io/commands/hugo_mod_verify/"
+++

`hugo mod verify` 是 `hugo mod` 的子命令，用来校验当前模块的依赖：这些依赖保存在本地已下载的源码缓存里，命令会检查它们自下载以来有没有被修改过。如果校验没有通过，可以加上 `--clean` 把未通过校验的依赖缓存删掉，之后再重新取回这些依赖。

## 用法

```text
hugo mod verify [flags] [args]
```

在项目根目录执行。校验的对象是本地缓存中已经下载好的依赖，所以使用前应当确保依赖已经下载到本地。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b`, `--baseURL string` | 站点根目录的主机名（可含路径），例如 `https://spf13.com/` |
| `--cacheDir string` | 缓存目录的文件系统路径 |
| `--clean` | 删除未通过校验的依赖所对应的模块缓存 |
| `-c`, `--contentDir string` | 内容目录的文件系统路径 |
| `-h`, `--help` | 显示 `verify` 子命令的帮助信息 |
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

校验当前项目的模块依赖：

```bash
hugo mod verify
```

校验后把未通过校验的依赖缓存删掉，以便重新下载：

```bash
hugo mod verify --clean
```

对另一个目录下的项目执行校验，并指定模块缓存目录：

```bash
hugo mod verify --source mysite --cacheDir cache
```

## 说明

- 校验针对的是本地已下载的源码缓存，因此比较的是缓存内容与下载时的状态；缓存不存在时无从校验，需要先下载依赖。
- 建议只在校验确实失败时再加 `--clean`：它会删除对应依赖的模块缓存，之后必须重新获取这些依赖，代价是多一次下载。
- 如果依赖已经复制到项目内的 `_vendor` 目录，可用 [`hugo mod vendor`](/commands/hugo-mod-vendor/) 重新生成这份副本。
- `--cacheDir`、`--ignoreVendorPaths` 等选项对所有 `hugo mod` 子命令同样生效。
