+++
title = "相关内容配置"
linkTitle = "相关内容配置"
description = "通过索引与阈值控制相关内容的匹配方式。"
date = 2026-10-01
weight = 240
source = "https://gohugo.io/configuration/related-content/"
+++

## 默认配置

Hugo 自带一套合理的相关内容识别配置，你可以在项目配置中全局或按语言自定义它。默认配置如下：

```toml
[related]
includeNewer = false
threshold = 80
toLower = false

[[related.indices]]
applyFilter = false
cardinalityThreshold = 0
minTokenLength = 0
name = 'keywords'
pattern = ''
toLower = false
tokenize = false
type = 'basic'
weight = 100

[[related.indices]]
applyFilter = false
cardinalityThreshold = 0
minTokenLength = 0
name = 'date'
pattern = ''
toLower = false
tokenize = false
type = 'basic'
weight = 10

[[related.indices]]
applyFilter = false
cardinalityThreshold = 0
minTokenLength = 0
name = 'tags'
pattern = ''
toLower = false
tokenize = false
type = 'basic'
weight = 80
```

> 一旦在项目配置里加上 `related` 区段，就必须给出完整配置：不能只指定要覆盖的那几个设置，而把其余设置留空。渲染相关内容请使用模板中的 `Pages.Related` 方法。

## 顶层设置

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `threshold` | `int` | `80` | 取值范围 `[0, 100]`。值越低匹配到的内容越多，但相关性可能越弱。 |
| `includeNewer` | `bool` | `false` | 是否把发布日期晚于当前页面的内容纳入相关列表。开启后，旧文章的相关列表会随着新增内容而变化。 |
| `toLower` | `bool` | `false` | 是否把索引与查询中的关键词统一转为小写。结果可能更准确，但有轻微的性能开销。 |

## 索引设置

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `indices[].name` | `string` | — | 索引名。该值直接对应一个页面参数，Hugo 支持 `author` 这类字符串值、`tags` 与 `keywords` 这类列表，以及时间和日期对象。 |
| `indices[].weight` | `int` | `0` | 该索引相对其他索引的重要性。可以为 `0`（相当于关闭该索引），甚至可以为负。内置默认配置中，`keywords` 为 `100`、`tags` 为 `80`、`date` 为 `10`。 |
| `indices[].type` | `string` | `basic` | 取 `basic` 或 `fragments` 之一。 |
| `indices[].pattern` | `string` | `''` | 仅对日期有意义。默认配置中该值为空；原文指出日期索引的默认模式是 `2006`，把它显式写进 `pattern` 会让同年发布的页面获得额外权重；更新频繁的站点可改用 `200601`，即按年月加权。 |
| `indices[].applyFilter` | `bool` | `false` | 是否对搜索结果应用某个 `type` 专属的过滤。仅用于 `fragments` 类型。 |
| `indices[].cardinalityThreshold` | `int` | `0` | 取值范围 `[1, 100]` 的百分比阈值，出现频率高于该阈值的索引值会被移出索引。例如 `60` 会移除出现在超过 60% 文档中的索引值；`0` 表示禁用过滤。 |
| `indices[].minTokenLength` | `int` | `0` | （自 v0.166.0 起）当 `tokenize` 为 `true` 时，以 Unicode 码点计算的最短词长。可用它排除 `a`、`in`、`the` 这类短词，而不必考虑其出现频率。该设置先于 `cardinalityThreshold` 生效，被排除的词不会进入索引。默认 `0` 表示不设下限。 |
| `indices[].tokenize` | `bool` | `false` | （自 v0.166.0 起）是否在建立索引前按空白切分字符串值。 |
| `indices[].toLower` | `bool` | `false` | 是否把索引与查询中的关键词统一转为小写，含义与顶层同名设置一致。 |

`tokenize` 有一些需要留意的行为：对 `fragments` 类型的索引，非标题片段（例如描述列表的术语）始终按其精确标识符建立索引；分词会让索引体积随每个值的词数增长，可配合 `minTokenLength` 排除短词、`cardinalityThreshold` 移除高频词；`apple` 与 `apples` 这类单复数形式会被视为不同的词，不以空白分词的中日韩语言及其他文字系统不受支持。

## 示例：按分类法术语关联

设想一个书评站点，正文是书评，用类型与作者作为分类法（taxonomy）。我们希望访客查看某篇书评时，看到一份基于共享作者和类型的相关书评列表。

先声明分类法：

```toml
[taxonomies]
author = 'authors'
genre = 'genres'
```

再配置相关内容的识别方式：

```toml
[related]
includeNewer = true
threshold = 80
toLower = true

[[related.indices]]
name = 'authors'
weight = 2

[[related.indices]]
name = 'genres'
weight = 1
```

`authors` 索引的权重是 `2`，`genres` 是 `1`，也就是说共享作者的份量是共享类型的两倍。渲染时用模板取回 5 条相关书评即可，例如 `site.RegularPages.Related . | first 5`。

## 示例：按标题词关联

再设想一个博客，希望标题中含有相同词语的文章互相关联：标题为 “Hugo image processing” 的文章，应当匹配标题中含有 `Hugo`、`image` 或 `processing` 的文章。

```toml
[related]
threshold = 50
toLower = true

[[related.indices]]
name = 'title'
weight = 1
tokenize = true
minTokenLength = 4
```

`tokenize` 为 `true` 时，Hugo 按空白切分每个页面标题，并为切分出的单词分别建立索引；`minTokenLength = 4` 会排除 `and`、`the`、`for` 这类短词。渲染方式与上一个示例相同。

## 延伸阅读

- [相关内容](/content-management/related-content/)
- [标记配置](/configuration/markup/)
- [站点配置](/configuration/)
