+++
title = "HTTP 缓存配置"
linkTitle = "HTTP 缓存配置"
description = "配置远程资源的 HTTP 缓存与轮询策略。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/configuration/http-cache/"
+++

## 这一页解决什么问题

`[HTTPCache]` 只对 `resources.GetRemote` 抓取的远程资源生效，决定两件事：**这些资源缓存不缓存**，以及**多久检查一次变化**（轮询）。

**默认配置是最保守的一种**：HTTP 缓存排除 `**`（等于全部绕过），轮询 `disable = true`。所以默认情况下，`hugo server` 运行期间远程数据只会在服务器重启后更新——不知道这一点容易误以为 Hugo 坏了。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `cache.for.includes` / `excludes` | 想让远程资源走 HTTP 缓存（减少请求、复用 ETag 与 Last-Modified） | 只写了 `includes` 却没清空 `excludes`（默认 `['**']`）→ 缓存仍被全部排除，配置「看着写了」却不生效 |
| `polls.disable` / `high` / `low` | 希望在 `hugo server` 运行期间自动重建变化的远程数据 | 保持默认 `disable = true` → 远程数据变了本地不刷新，只能重启服务器 |
| `polls.for.includes` / `excludes` | 只想轮询部分资源 | 默认 `includes = ['**']` 会把所有资源纳入轮询，产生大量远程请求 |
| `respectCacheControlNoStoreInRequest` / `...InResponse` | 服务器要求 `no-store` 时严格不使用缓存 | 忽略 `no-store` 会缓存本不该缓存的响应；两个键分别对应请求与响应标头，别只改一个 |

**性能关系**（上游已说明）：启用轮询但禁用 HTTP 缓存时，只有文件缓存 TTL 到期后才会检查变化——`maxAge` 为 `10h` 而轮询间隔 `1s` 的配置非常低效。

> 仅在通过 `resources.GetRemote` 函数获取远程资源时，这份配置才有意义。

## 分层缓存

Hugo 使用分层缓存系统：

```text
 .-----------.
|  dynacache  |
'-----+-----'
       |
       v
 .----------.
| HTTP cache |
'-----+----'
       |
       v
 .----------.
| file cache |
'-----+----'
```

Dynacache
: 采用最近最少使用（LRU）淘汰策略的内存缓存。当内容发生变化、命中缓存清除（cache-busting）模式，或内存紧张时，条目会被移出缓存。

HTTP 缓存
: 按 [RFC 9111](https://datatracker.ietf.org/doc/html/rfc9111) 规范为远程资源提供 HTTP 缓存。当资源带有合适的 HTTP 缓存标头时性能最佳。HTTP 缓存借助文件缓存来存储与读取已缓存的资源。

文件缓存
: 参见[缓存配置](/configuration/caches/)。

HTTP 缓存包含两个关键方面：决定缓存哪些内容（缓存过程本身），以及定义多久检查一次更新（轮询策略）。

## HTTP 缓存

HTTP 缓存的行为是针对一组已配置的资源定义的。即便某个资源的生存时间（TTL）尚未到期，过期的资源也会从文件缓存中刷新。如果某个资源禁用了 HTTP 缓存，Hugo 会绕过缓存，直接访问该文件。

HTTP 缓存的默认配置如下：

```toml
[HTTPCache]
respectCacheControlNoStoreInRequest = true
respectCacheControlNoStoreInResponse = false

[HTTPCache.cache.for]
excludes = ['**']
includes = []

[[HTTPCache.polls]]
disable = true
high = '0s'
low = '0s'
[HTTPCache.polls.for]
excludes = []
includes = ['**']
```

键名|类型|默认值|说明
:--|:--|:--|:--
`respectCacheControlNoStoreInRequest`|`bool`|`true`|（自 v0.151.0 起）通过 `resources.GetRemote` 函数获取远程资源时，是否尊重服务器 `Cache-Control` **请求**标头中的 `no-store` 指令。
`respectCacheControlNoStoreInResponse`|`bool`|`false`|（自 v0.151.0 起）通过 `resources.GetRemote` 函数获取远程资源时，是否尊重服务器 `Cache-Control` **响应**标头中的 `no-store` 指令。
`cache.for.excludes`|`[]string`|`['**']`|要从缓存中排除的 glob 模式切片。默认配置下 HTTP 缓存排除所有文件。
`cache.for.includes`|`[]string`|空|要缓存的 glob 模式切片。
`polls`|`[]PollConfig`|见下|轮询配置的切片。
`polls.disable`|`bool`|`true`|是否为此配置禁用轮询。
`polls.high`|`string`|`0s`|以时长表示的最大轮询间隔，在资源被认为稳定时使用。
`polls.low`|`string`|`0s`|以时长表示的最小轮询间隔，在最近发生过变化后使用，并逐渐向 `polls.high` 增长。
`polls.for.excludes`|`[]string`|空|要排除在轮询之外的 glob 模式切片。
`polls.for.includes`|`[]string`|`['**']`|要纳入轮询的 glob 模式切片。

## HTTP 轮询

轮询用于监视模式（例如 `hugo server`），以检测远程资源的变化。即使 HTTP 缓存被禁用，轮询也可以单独启用。检测到变化后，会重新构建所有使用该资源的页面。可以针对特定资源（通常是已知的静态资源）禁用轮询。

默认配置把一切都关掉了：

```toml
[[HTTPCache.polls]]
disable = true
high = '0s'
low = '0s'
[HTTPCache.polls.for]
includes = ['**']
excludes = []
```

## 行为

轮询与 HTTP 缓存的交互方式如下：

- 启用轮询后，只有真实变化才会触发重新构建，变化通过 `eTag` 变化来检测（服务器未提供时，Hugo 会生成一个 MD5 哈希）。
- 如果启用了轮询但禁用了 HTTP 缓存，只有在文件缓存的 TTL 到期后才会检查远程资源是否变化（例如 `maxAge` 为 `10h` 而轮询间隔为 `1s`，效率很低）。
- 如果轮询与 HTTP 缓存都启用，则在文件缓存的 TTL 到期之前就会检查变化。缓存的 `eTag` 与 `last-modified` 值分别放在 `if-none-match` 与 `if-modified-since` 请求标头中发送，HTTP [304](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/304) 响应时直接返回缓存的响应。

## 示例

假设某个站点要渲染通过 `resources.GetRemote` 函数获取的远程数据。在默认配置下，Hugo 对每个远程资源都绕过 HTTP 缓存，轮询也处于禁用状态。结果是在运行 `hugo server` 期间，只有重启服务器之后才会发现远程数据的变化。

下面的配置为远程 JSON 资源启用 HTTP 缓存，并在监视时轮询其变化。Hugo 在最近一次变化之后最快每 10 秒检查一次，资源稳定后逐步退避到每 5 分钟一次：

```toml
[HTTPCache.cache.for]
includes = ['**.json']
excludes = []

[[HTTPCache.polls]]
disable = false
high = '5m'
low = '10s'
[HTTPCache.polls.for]
includes = ['**.json']
excludes = []
```

glob 模式会与完整的远程 URL 进行匹配，路径分隔符是 `/`。使用这份配置后，Hugo 会：

- 把远程 JSON 资源的响应缓存到[文件缓存](/configuration/caches/)中，并遵循服务器返回的 `ETag` 与 `Last-Modified` 标头。
- 在监视时检测这些资源的变化，触发所有依赖它们的页面重新构建。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 为远程资源写了缓存配置，仍然每次都请求 | `cache.for.excludes` 默认是 `['**']`，排除优先 | 按本页示例设置 `includes`，并把 `excludes` 显式设为空数组 |
| `hugo server` 期间远程数据变化不生效 | 轮询默认 `disable = true` | 按示例启用 `polls` 并设置 `low` / `high`；或重启服务器 |
| 启用轮询后构建仍然很慢 | 轮询间隔与文件缓存 TTL 量级不匹配 | 参见[缓存配置](/configuration/caches/)调整 `maxAge`，让两者量级相当 |
| 想对已知静态的远程资源跳过检查 | —— | 在 `polls.for.excludes` 中排除这些 URL 模式 |
| 远程资源相关报错（403 / 被拒绝） | 这不是缓存问题，而是安全策略未放行该地址 | 见[配置安全](/configuration/security/)中的 `http.urls` |
| 报错看不懂 | 该配置多数不报错，症状是「更新不生效」 | 见[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
