+++
title = "hugo build"
linkTitle = "hugo build"
description = "hugo build 子命令：显式构建整个项目。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/commands/hugo_build/"
+++

`hugo build` 是父命令 [hugo](/commands/hugo/) 的子命令，用来构建项目。它是主命令的显式写法：不写子命令时直接执行 `hugo` 同样会构建项目，两者行为一致，区别只在于书写方式。在脚本或文档中需要明确表达「构建」这一动作时，写成 `hugo build` 更清楚。

## 用法

```text
hugo build [flags]
```

## 选项

下表列出常用选项，完整列表请以 `hugo build --help` 的输出为准。

| 选项 | 说明 |
| --- | --- |
| `-b, --baseURL` | 站点根的主机名与路径 |
| `-D, --buildDrafts` | 构建时包含草稿内容 |
| `-E, --buildExpired` | 构建时包含已过期内容 |
| `-F, --buildFuture` | 构建时包含发布日期在未来的内容 |
| `--cleanDestinationDir` | 删除目标目录中的陈旧文件 |
| `--config` | 配置文件，默认使用项目中的 hugo.yaml、hugo.json 或 hugo.toml |
| `--configDir` | 配置目录，默认为 config |
| `-c, --contentDir` | 内容目录的文件系统路径 |
| `-d, --destination` | 写入输出文件的文件系统路径 |
| `--disableKinds` | 禁用某几类页面，例如首页、RSS |
| `--enableGitInfo` | 为页面写入 Git 版本、日期与作者信息 |
| `-e, --environment` | 构建环境 |
| `--gc` | 构建后清理未使用的缓存文件 |
| `-h, --help` | 显示 build 的帮助信息 |
| `--ignoreCache` | 忽略已配置的文件缓存 |
| `-l, --layoutDir` | 布局目录的文件系统路径 |
| `--logLevel` | 日志级别，取值为 debug、info、warn、error |
| `--minify` | 压缩受支持的输出格式 |
| `--noBuildLock` | 不创建 .hugo_build.lock 文件 |
| `--quiet` | 以安静模式构建 |
| `-s, --source` | 读取文件所相对的源路径 |
| `--templateMetrics` | 显示模板执行的统计信息 |
| `-t, --theme` | 要使用的主题，主题位于 themes/THEMENAME/ 下 |
| `-w, --watch` | 监听文件系统变化并按需重建 |

## 示例

构建整个项目：

```bash
hugo build
```

做一次带草稿的本地构建：

```bash
hugo build --buildDrafts
```

输出到自定义目录并压缩：

```bash
hugo build --destination dist --minify
```

## 说明

- `hugo build` 属于 `hugo` 命令，因此它同样接受父命令的选项；本页表格与 [hugo](/commands/hugo/) 的选项基本重合。
- 输出位置由配置决定；未指定 `--destination` 时以配置中的发布目录为准。
- 如果只是想快速检查构建结果，`--quiet` 可以减少终端的输出量。
- 需要边改边看效果时，请改用 [hugo server](/commands/hugo-server/)；新建内容请使用 [hugo new](/commands/hugo-new/)。
