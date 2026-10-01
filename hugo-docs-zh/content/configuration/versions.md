+++
title = "版本配置"
linkTitle = "版本配置"
description = "定义内容版本、默认版本与版本权重排序。"
date = 2026-10-01
weight = 330
source = "https://gohugo.io/configuration/versions/"
+++

> **注意**
> `versions` 配置自 Hugo v0.153.0 起提供。

版本（version）是内容变化的维度之一，与语言（面向本地化）、角色（面向受众）并列。借助版本，你可以用语义化版本同时维护同一内容的不同迭代、发布或生命周期状态，并在一次构建中生成多个版本的站点。

以下为默认配置：

```toml
[versions."v1.0.0"]
weight = 0
```

也就是说，默认情况下项目只定义了一个版本 `v1.0.0`，其权重为 `0`。

## 基础设置

在站点配置文件中配置以下基础设置：

```toml
defaultContentVersion = 'v1.0.0'
defaultContentVersionInSubdir = false
```

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `defaultContentVersion` | `string` | `''` | 项目的默认版本。定义了一个或多个版本时，该值必须与某个已定义的版本名一致。 |
| `defaultContentVersionInSubdir` | `bool` | `false` | 是否把默认内容版本发布到与 `defaultContentVersion` 同名的子目录。 |

把 `defaultContentVersionInSubdir` 设为 `true` 后，默认内容版本会发布到与 `defaultContentVersion` 同名的子目录中，使各版本的发布路径保持统一的结构。

## 版本设置

用下面的设置定义 Hugo 如何为各版本排序。

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `versions` | `map` | `{'v1.0.0': {weight = 0}}` | 版本映射，键为版本名，值为该版本的设置。 |
| `versions.<版本名>.weight` | `int` | `0` | 该版本的权重。设为非零值时，它是该版本的首要排序依据。 |

`weight` 设为非零值才会成为首要排序依据；保持 `0` 或未定义时，该版本只能依靠后续的语义化版本次序来决定位置。

## 排序顺序

Hugo 先按权重升序排序版本，再按各版本的[语义化版本](https://semver.org/)降序排序。这会影响构建顺序，以及互补站点（sites complements）的选取。

## 示例

下面的配置演示了如何定义多个版本并分别指定权重：

```toml
[versions."v1.0.0"]
weight = 20
[versions."v2.0.0"]
weight = 10
```

`v2.0.0` 的权重是 `10`，小于 `v1.0.0` 的 `20`，因此 `v2.0.0` 排在前面。如果两个版本的权重相同或都未设置，则改由语义化版本次序决定，版本号较大的排在前面。

## 注意事项

- 版本名建议直接使用语义化版本号（形如 `v1.0.0`），这样才能获得预期的排序结果。
- 定义多个版本时，`defaultContentVersion` 的取值必须能在已定义的版本名中找到；当项目没有定义任何版本时，默认版本回退为 `v1.0.0`。
- 版本可以与语言、角色叠加组合，用来精确控制哪些页面在哪些站点上生成。相关说明见[内容管理](/content-management/)。
