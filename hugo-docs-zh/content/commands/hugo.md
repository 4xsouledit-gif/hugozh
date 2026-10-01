+++
title = "hugo"
linkTitle = "hugo"
description = "hugo 主命令：构建整个 Hugo 项目。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/commands/hugo/"
+++

`hugo` 是主命令，用来构建项目。Hugo 是用 Go 编写的快速、灵活的静态站点生成器（static site generator）。不带任何子命令直接执行 `hugo`，就是一次完整构建。

## 用法

```text
hugo [flags]
```

`hugo build` 是它的显式子命令，行为与 `hugo` 一致，详见 [hugo build](/commands/hugo-build/)。

## 选项

下表列出常用选项，完整列表请以 `hugo --help` 的输出为准。

| 选项 | 说明 |
| --- | --- |
| `-b, --baseURL` | 站点根目录的主机名与路径 |
| `-D, --buildDrafts` | 构建时包含标记为草稿的内容 |
| `-E, --buildExpired` | 构建时包含已过期的内容 |
| `-F, --buildFuture` | 构建时包含发布日期在未来的内容 |
| `--cacheDir` | 缓存目录的文件系统路径 |
| `--cleanDestinationDir` | 移除目标目录中失效的文件 |
| `--clock` | 设置 Hugo 使用的时钟 |
| `--config` | 配置文件，默认为 hugo.yaml、hugo.json 或 hugo.toml |
| `--configDir` | 配置目录，默认为 config |
| `-c, --contentDir` | 内容目录的文件系统路径 |
| `-d, --destination` | 写入输出文件的文件系统路径 |
| `--disableKinds` | 禁用某几类页面，例如首页、RSS |
| `--enableGitInfo` | 为页面加入 Git 版本、日期、作者与 CODEOWNERS 信息 |
| `-e, --environment` | 构建环境 |
| `--gc` | 构建后执行清理，删除未使用的缓存文件 |
| `-h, --help` | 显示 hugo 的帮助信息 |
| `--ignoreCache` | 忽略已配置的文件缓存 |
| `-l, --layoutDir` | 布局目录的文件系统路径 |
| `--logLevel` | 日志级别，取值为 debug、info、warn、error |
| `--minify` | 压缩受支持的输出格式，例如 HTML、XML |
| `--noBuildLock` | 不创建 .hugo_build.lock 文件 |
| `--panicOnWarning` | 出现第一条 WARNING 日志时中止 |
| `--poll` | 设置轮询间隔，改用轮询方式监听文件变化 |
| `--printPathWarnings` | 对目标路径重复等问题输出警告 |
| `--quiet` | 以安静模式构建 |
| `-s, --source` | 读取文件所相对的源路径 |
| `--templateMetrics` | 显示模板执行的统计信息 |
| `-t, --theme` | 要使用的主题，主题位于 themes/THEMENAME/ 下 |
| `--themesDir` | 主题目录的文件系统路径 |
| `-w, --watch` | 监听文件系统变化并按需重建 |

其中 `-D`、`-E`、`-F` 分别用来把草稿、已过期内容和发布日期在未来的内容纳入构建。

## 示例

在项目根目录执行一次普通构建：

```bash
hugo
```

连带草稿一起构建，并压缩输出：

```bash
hugo --buildDrafts --minify
```

指定输出目录，并在构建前清理其中失效的文件：

```bash
hugo --destination dist --cleanDestinationDir
```

## 说明

- 输出位置由配置决定；未指定 `--destination` 时以配置中的发布目录为准。
- `--baseURL` 会覆盖配置里的基础 URL（baseURL），常用于把同一份内容部署到不同域名或子路径。
- `--watch` 让 Hugo 持续监听文件变化并按需重建，适合在本地代替开发服务器完成一次性预览。
- 相关命令：创建内容用 [hugo new](/commands/hugo-new/)，本地预览用 [hugo server](/commands/hugo-server/)，常用命令的组合可以参考[基本用法](/getting-started/basic-usage/)。
