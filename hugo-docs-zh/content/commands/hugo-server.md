+++
title = "hugo server"
linkTitle = "hugo server"
description = "hugo server：启动内置服务器并实时预览。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/commands/hugo_server/"
+++

`hugo server` 是父命令 [hugo](/commands/hugo/) 的子命令，用来启动内置的 Web 服务器。Hugo 自带的服务器会一边构建、一边把项目提供出去；它的性能很好，但毕竟是一个选项有限的服务器，主要用于本地预览，而不是生产环境托管。

## 用法

```text
hugo server [command] [flags]
```

默认情况下，`hugo server` 会把文件写入磁盘并从磁盘提供；如果加上 `--renderToMemory`，渲染结果只留在内存中。后者在某些情况下更快，但会占用更多内存。

服务器默认会监听文件变化，在文件被修改后自动重新构建，并让已经打开的浏览器页面实时刷新、接收最新内容。由于多数 Hugo 项目能在不到一秒内完成构建，保存文件后几乎立刻就能看到结果。

## 选项

下表列出全部选项。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `--appendPort` | bool | `true` | 把端口追加到 baseURL |
| `-b, --baseURL` | string | — | 站点根目录的主机名与路径，例如 `https://spf13.com/` |
| `--bind` | string | `"127.0.0.1"` | 服务器绑定的接口 |
| `-D, --buildDrafts` | bool | — | 构建时包含标记为草稿的内容 |
| `-E, --buildExpired` | bool | — | 构建时包含已过期的内容 |
| `-F, --buildFuture` | bool | — | 构建时包含发布日期在未来的内容 |
| `--cacheDir` | string | — | 缓存目录的文件系统路径 |
| `--cleanDestinationDir` | bool | — | 删除目标目录中的陈旧文件 |
| `-c, --contentDir` | string | — | 内容目录的文件系统路径 |
| `--disableBrowserError` | bool | — | 不在浏览器中显示构建错误 |
| `--disableFastRender` | bool | — | 改动时进行完整重新渲染 |
| `--disableKinds` | strings | — | 禁用某些种类的页面，例如首页、RSS |
| `--disableLiveReload` | bool | — | 只监听变化，重建时不做浏览器实时刷新 |
| `--enableGitInfo` | bool | — | 为页面加入 Git 版本、日期、作者与 CODEOWNERS 信息 |
| `--forceSyncStatic` | bool | — | 静态文件发生变化时复制全部文件 |
| `--gc` | bool | — | 构建后执行一些清理任务（删除未使用的缓存文件） |
| `-h, --help` | bool | — | 显示 server 的帮助信息 |
| `--ignoreCache` | bool | — | 忽略已配置的文件缓存 |
| `-l, --layoutDir` | string | — | 布局目录的文件系统路径 |
| `--liveReloadPort` | int | `-1` | 实时刷新使用的端口（例如在 HTTPS 代理场景下为 443） |
| `--minify` | bool | — | 压缩受支持的输出格式（HTML、XML 等） |
| `-N, --navigateToChanged` | bool | — | 浏览器实时刷新时跳转到发生变化的内容文件 |
| `--noChmod` | bool | — | 不同步文件的权限模式 |
| `--noHTTPCache` | bool | — | 禁用浏览器对内置服务器所提供页面的缓存 |
| `--noTimes` | bool | — | 不同步文件的修改时间 |
| `-O, --openBrowser` | bool | — | 服务器启动后在浏览器中打开项目 |
| `--panicOnWarning` | bool | — | 遇到第一条 WARNING 日志时 panic |
| `--poll` | string | — | 把该值设为轮询间隔（例如 `--poll 700ms`），改用轮询方式监听文件系统变化 |
| `-p, --port` | int | `1313` | 服务器监听的端口 |
| `--pprof` | bool | — | 启用 pprof 服务器（端口 8080） |
| `--printI18nWarnings` | bool | — | 打印缺失的翻译 |
| `--printMemoryUsage` | bool | — | 定时在屏幕上打印内存占用 |
| `--printPathWarnings` | bool | — | 打印重复目标路径等警告 |
| `--printUnusedTemplates` | bool | — | 打印未使用模板的警告 |
| `--renderSegments` | strings | — | 要渲染的命名分段（在 segments 配置中定义） |
| `--renderStaticToDisk` | bool | — | 静态文件从磁盘提供，动态文件从内存提供 |
| `--templateMetrics` | bool | — | 显示模板执行的统计信息 |
| `--templateMetricsHints` | bool | — | 与 `--templateMetrics` 一起使用时计算一些改进建议 |
| `-t, --theme` | strings | — | 要使用的主题，主题位于 `/themes/THEMENAME/` 下 |
| `--tlsAuto` | bool | — | 生成并使用本地受信任的证书 |
| `--tlsCertFile` | string | — | TLS 证书文件的路径 |
| `--tlsKeyFile` | string | — | TLS 密钥文件的路径 |
| `--trace` | file | — | 把 trace 写入文件（一般用途不大） |
| `-w, --watch` | bool | `true` | 监听文件系统变化并按需重建 |

### 继承自父命令的选项

`hugo server` 还会继承 `hugo` 的选项，常用者有 `--config`、`--configDir`、`--logLevel`、`--quiet`、`-s` / `--source`、`--themesDir`、`--clock`、`-e` / `--environment`、`-M` / `--renderToMemory`、`-d` / `--destination`、`--noBuildLock` 与 `--ignoreVendorPaths`。

## 示例

启动服务器，在默认端口上预览：

```bash
hugo server
```

同时预览草稿内容，并让浏览器自动跳转到被改动的页面：

```bash
hugo server --buildDrafts --navigateToChanged
```

更换端口，并把渲染结果放在内存中：

```bash
hugo server --port 1414 --renderToMemory
```

## 说明

- 服务器默认绑定 `127.0.0.1` 的 1313 端口；需要让同一网络中的其他设备访问时，可以配合 `--bind` 与 `--baseURL` 使用。
- 模板改动频繁时，`--disableFastRender` 会让每次改动都完整重建，结果更可靠。
- 需要在 HTTPS 下预览时，可以用 `--tlsAuto` 生成证书；要让系统信任这张本地证书，请使用 [hugo server trust](/commands/hugo-server-trust/)。
- 站点构建完成后要发布到生产环境，请改用 [hugo](/commands/hugo/) 或 [hugo build](/commands/hugo-build/)。

## 参见

- [hugo](/commands/hugo/)：构建项目
- [hugo server trust](/commands/hugo-server-trust/)：把本地 CA 安装到系统信任存储中
