+++
title = "缓存配置"
linkTitle = "缓存配置"
description = "配置文件缓存的用途、键、路径标记与垃圾回收。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/configuration/caches/"
+++

## 这一页解决什么问题

Hugo 会把「算过一次的结果」写到磁盘上，避免重复劳动——图片处理、远程资源下载、Sass 编译、模块解析都走这套缓存。这一页说明缓存放在哪、什么时候过期、以及缓存作祟时怎么清干净。

**关键提醒**：这里改错通常**不会报错**，只会表现为「源文件改了但产物没变」或者磁盘被缓存吃满。遇到「改了没反应」，先用 `hugo --ignoreCache` 构建一次做对照，再回来查这一页。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `dir` | 想换缓存位置（磁盘紧张、CI 需要缓存目录可保留） | 路径不存在或无写权限 → 缓存相关操作直接失败；指到项目内且被清理波及 → 缓存每次都被清 |
| `maxAge` | 想定期淘汰远程资源或图片处理结果 | `0` 表示**禁用**该组缓存（每次构建重新下载/处理，构建明显变慢）；`-1` 表示永不过期（缓存只增不减，`getresource` 与 `misc` 尤其明显） |
| `modulegitinfo` / `modulequeries` | 使用 Hugo Modules，且不想每次构建都联网校验 | `maxAge` 调大后，模块仓库的更新不会立刻反映到构建中 |

**什么时候别用**：不要把 `maxAge` 一律设成 `-1` 来「提速」。缓存不失效的问题应该修在源头（例如 `build.cacheBusters`，见[构建配置](/configuration/build/)），而不是让旧值永远留着。

## 默认配置

```toml
[caches]
  [caches.assets]
    dir = ':resourceDir/_gen'
    maxAge = -1
  [caches.getresource]
    dir = ':cacheDir/:project'
    maxAge = -1
  [caches.images]
    dir = ':resourceDir/_gen'
    maxAge = -1
  [caches.misc]
    dir = ':cacheDir/:project'
    maxAge = -1
  [caches.modulegitinfo]
    dir = ':cacheDir/modules'
    maxAge = '24h'
  [caches.modulequeries]
    dir = ':cacheDir/modules'
    maxAge = '24h'
  [caches.modules]
    dir = ':cacheDir/modules'
    maxAge = -1
```

## 用途

Hugo 用文件缓存把数据保存在磁盘上，既避免同一次构建中重复执行相同操作，也让数据可以跨构建持续保留。

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `assets` | `map` | 见上文 | 缓存已处理的 CSS 与 Sass 资源。 |
| `getresource` | `map` | 见上文 | 缓存通过 `resources.GetRemote` 函数从远程 URL 获取的文件。 |
| `images` | `map` | 见上文 | 缓存已处理的图片。 |
| `misc` | `map` | 见上文 | 缓存杂项数据，例如 `transform.ToMath` 函数的结果。 |
| `modulegitinfo` | `map` | 见上文 | 缓存模块的 Git 信息。 |
| `modulequeries` | `map` | 见上文 | 缓存模块解析查询的结果。 |
| `modules` | `map` | 见上文 | 缓存已下载的模块。 |

## 键

每个缓存分组都支持以下两个键：

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dir` | `string` | 见上文 | Hugo 存放缓存文件的绝对文件系统路径。路径可以以 `:cacheDir` 或 `:resourceDir` 标记开头，把缓存锚定到特定的系统或项目位置。 |
| `maxAge` | `string` | `-1` | 缓存条目在被清除前保持有效的时长，用时长表示。值为 `0` 表示对该键禁用缓存，值为 `-1` 表示缓存条目永不过期。 |

## 路径标记

| 标记 | 类型 | 说明 |
| --- | --- | --- |
| `:cacheDir` | `string` | 指定的缓存目录，即 `cacheDir` 设置的值。 |
| `:project` | `string` | 当前 Hugo 项目的基础目录名。这可以确保每个项目有独立的文件缓存，避免 `hugo build --gc` 命令影响同一台机器上的其他项目。 |
| `:resourceDir` | `string` | 用于缓存资源管道产物的指定目录，即 `resourceDir` 设置的值。 |

例如 `dir = ':cacheDir/:project'` 表示把缓存放在 `cacheDir` 之下、以项目目录名命名的子目录中；`dir = ':resourceDir/_gen'` 表示放在项目资源目录的 `_gen` 子目录中。

## 垃圾回收

随着你修改站点或更改配置，先前构建留下的缓存文件可能继续占用磁盘空间。使用 `hugo build --gc` 命令可以从文件缓存中删除这些已过期或不再使用的条目。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了图片处理参数或 Sass，产物没变化 | 命中了旧的缓存条目 | 先用 `hugo --ignoreCache` 构建对照一次；确认是缓存问题后，删除 `:cacheDir` / `:resourceDir` 下的缓存目录 |
| `resources.GetRemote` 拿到的还是旧内容 | `getresource` 组缓存仍然有效 | 删除该组缓存目录（默认 `:cacheDir/:project`），或把它的 `maxAge` 调小 |
| 磁盘被缓存占满 | `maxAge = -1` 表示永不过期，缓存只增不减 | 定期执行 `hugo build --gc`；增长快的分组改设有限 `maxAge` |
| CI 上每次构建都很慢 | 缓存目录没有被跨构建保留 | 把 `cacheDir` 指向 CI 的缓存目录并纳入缓存策略；当前默认位置可用 `hugo config` 的 `cachedir` 查看 |
| 缓存目录写不进去 | `dir` 指向不存在的盘符或没有权限的路径 | 改用绝对路径并确认权限；跨机器场景避免把绝对路径写死 |

更多排查入口见[故障排查](/troubleshooting/)。
