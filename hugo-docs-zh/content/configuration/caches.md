+++
title = "缓存配置"
linkTitle = "缓存配置"
description = "配置文件缓存的用途、键、路径标记与垃圾回收。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/configuration/caches/"
+++

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
