+++
title = "hugo deploy"
linkTitle = "hugo deploy"
description = "把构建好的项目部署到云端提供商的命令。"
date = 2026-10-01
weight = 230
source = "https://gohugo.io/commands/hugo_deploy/"
+++

`hugo deploy` 把项目部署到云端提供商。它按照站点配置 deployment 区段中声明的目标，把构建产物上传到对应的对象存储或托管服务，并可选地清理多余文件、刷新 CDN 缓存。相比把上传步骤写进脚本，这种方式的差异由 Hugo 自己比对，只上传有变化的文件，因此重复发布更快。

上游另有一篇部署专文（[https://gohugo.io/hosting-and-deployment/hugo-deploy/](https://gohugo.io/hosting-and-deployment/hugo-deploy/)）介绍完整流程与配置写法，本页只说明命令行部分。

## 用法

```text
hugo deploy [flags] [args]
```

先在项目根目录执行 `hugo` 完成构建，再执行 `hugo deploy` 上传产物。目标来自配置文件中的 deployments 设置；不指定 `--target` 时使用其中的第一个目标。

## 选项

| 选项 | 说明 |
| --- | --- |
| `--confirm` | 在对目标做出改动前先请求确认 |
| `--dryRun` | 空运行，只显示将要执行的操作而不真正上传 |
| `--force` | 强制上传全部文件 |
| `-h`, `--help` | 显示 `deploy` 命令的帮助信息 |
| `--invalidateCDN` | 使部署目标中列出的 CDN 缓存失效，默认为 `true` |
| `--maxDeletes int` | 最多删除多少个文件，设为 `-1` 表示不限制，默认为 `256` |
| `--target string` | 使用配置文件 deployments 区段中的哪个部署目标，默认为第一个 |
| `--workers int` | 传输文件的并发工作数，默认为 `10` |

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

先构建，再部署到配置中的默认目标：

```bash
hugo
hugo deploy
```

部署前先空运行一遍，确认将要上传与删除的文件符合预期：

```bash
hugo deploy --dryRun
```

站点配置了多个部署目标时，指定其一：

```bash
hugo deploy --target staging
```

删除是不可逆的操作，加上确认步骤并限制删除数量：

```bash
hugo deploy --confirm --maxDeletes 50
```

只改动少量文件时强制全量上传，或提高并发数以加快传输：

```bash
hugo deploy --force --workers 20
```

## 说明

- 本命令不会替你构建站点，上传的是已经生成的产物；请先运行 [hugo](/commands/hugo/) 或 [hugo build](/commands/hugo-build/)。
- `--dryRun` 是排查部署问题的第一站：它列出将要执行的操作，包括删除哪些远端文件，不会真正改动目标。
- 删除上限默认存在，是为了避免配置写错导致大量文件被误删；将其设为 `-1` 会解除这一保护。
- `--invalidateCDN` 默认开启，部署后会自动刷新部署目标声明的 CDN 缓存；只在不需要刷新时关闭它。
- 部署目标、云端凭据与相关设置都写在站点的 deployment 配置里，配置文件的组织方式见[配置 Hugo](/configuration/)。
