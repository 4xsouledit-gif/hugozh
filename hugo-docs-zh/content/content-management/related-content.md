+++
title = "相关内容"
linkTitle = "相关内容"
description = "用索引字段计算页面相似度，在模板中输出相关内容列表。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/content-management/related/"
+++

## 相关内容如何工作

相关内容（related content）依据前置元数据（front matter）中的参数为页面之间计算相似度，用来生成「参见」一类的列表。判定相似度的索引（index）与各自的权重都在站点配置的 `related` 区段中声明，因此同一套内容可以通过调整配置改变相关结果的取向：更看重共享标签，还是更看重发布时间接近。

## 列出相关内容

下面这个局部模板列出最多 5 个相关页面，也就是共享 `date`、`keywords` 等参数的页面：

```go-html-template
{{ with site.RegularPages.Related . | first 5 }}
  <p>相关内容：</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

`Related` 方法只接受一个参数，这个参数可以是 `Page`，也可以是选项映射。选项映射包含以下选项：

- `indices`：要在哪些索引中搜索。
- `document`：为哪个页面查找相关内容，使用选项映射时必填。
- `namedSlices`：要搜索的关键词，用 `keyVals` 函数构造键值对切片。
- `fragments`：用于类型为 `fragments` 的索引的关键词列表，会与文档的片段（fragment）标识符匹配。

同时用上全部选项的示例如下：

```go-html-template
{{ $page := . }}
{{ $opts := dict
  "indices" (slice "tags" "keywords")
  "document" $page
  "namedSlices" (slice (keyVals "tags" "hugo" "rocks") (keyVals "date" $page.Date))
  "fragments" (slice "heading-1" "heading-2")
}}
```

> [!NOTE]
> 该特性在 Hugo 0.111.0 中被简化：此前有 `Related`、`RelatedTo`、`RelatedIndices` 三个方法，现在只剩 `Related` 一个，旧方法仍然可用但已废弃。

## 为内容标题建立索引

在 `related` 配置中加入一个类型为 `fragments` 的索引，Hugo 就会为正文标题建立索引并据此查找相关内容：

```toml
[related]
  threshold = 20
  includeNewer = true
  toLower = false

  [[related.indices]]
    name = "fragmentrefs"
    type = "fragments"
    applyFilter = true
    weight = 80
```

`name` 对应一个可选的前置元数据切片参数，用于从页面层链接到片段或标题层。开启 `applyFilter` 后，结果中每个页面的 `.HeadingsFiltered` 会给出过滤后的标题，便于在相关列表里显示到标题一级：

```go-html-template
{{ $related := site.RegularPages.Related . | first 5 }}
{{ with $related }}
  <h2>参见</h2>
  <ul>
    {{ range $i, $p := . }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
        {{ with .HeadingsFiltered }}
          <ul>
            {{ range . }}
              {{ $link := printf "%s#%s" $p.RelPermalink .ID | safeURL }}
              <li><a href="{{ $link }}">{{ .Title }}</a></li>
            {{ end }}
          </ul>
        {{ end }}
      </li>
    {{ end }}
  </ul>
{{ end }}
```

## 默认配置

```toml
[related]
  threshold = 80
  includeNewer = false
  toLower = false

  [[related.indices]]
    name = "keywords"
    weight = 100

  [[related.indices]]
    name = "date"
    weight = 10

  [[related.indices]]
    name = "tags"
    weight = 80
```

> [!NOTE]
> 一旦在项目配置中加入 `related` 区段，就必须提供完整配置，不能只覆盖其中个别默认值。该区段既可以全局设置，也可以按语言分别设置。

## 顶层设置

| 键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `threshold` | int | `80` | 取值范围 `[0, 100]`，越低匹配越多，但相关性可能越弱 |
| `includeNewer` | bool | `false` | 是否把发布日期晚于当前页面的内容纳入结果 |
| `toLower` | bool | `false` | 是否把索引与查询中的关键词统一转为小写，结果更准但略有性能开销 |

## 按索引的设置

| 键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | string | — | 索引名，直接对应页面参数，支持字符串、列表以及时间日期对象 |
| `weight` | int | `0` | 该索引相对其他索引的重要性；为 `0` 相当于关闭该索引，也可以为负 |
| `type` | string | `basic` | 取 `basic` 或 `fragments` |
| `pattern` | string | 日期索引为 `2006` | 仅对日期有意义，如 `200601` 表示按年月加权 |
| `applyFilter` | bool | `false` | 是否对搜索结果应用类型专属过滤，仅用于 `fragments` |
| `cardinalityThreshold` | int | `0` | 取值范围 `[1, 100]`，出现频率高于该百分比的索引值会被移出索引，`0` 表示不过滤 |
| `minTokenLength` | int | `0` | 开启 `tokenize` 时按 Unicode 码点计算的最短词长，`0` 表示不限制 |
| `tokenize` | bool | `false` | 是否先按空白把字符串值切成词再建立索引 |
| `toLower` | bool | `false` | 索引级的同名词，含义与顶层设置一致 |

`tokenize` 只按空白切分，因此 `apple` 与 `apples` 会被当作两个不同的词，中文、日文等不以空格分词的语言不受支持。分词会让索引体积随词数增长，可配合 `minTokenLength` 排除短词、用 `cardinalityThreshold` 移除高频词；`minTokenLength` 先于 `cardinalityThreshold` 生效，被排除的词不会进入索引。

## 示例：按分类法术语关联

设想一个书评站点，用 genres 与 authors 两个分类法（taxonomy）标识每篇书评，希望共享作者或类型的书评互相推荐：

```toml
[taxonomies]
  author = "authors"
  genre = "genres"

[related]
  includeNewer = true
  threshold = 80
  toLower = true

  [[related.indices]]
    name = "authors"
    weight = 2

  [[related.indices]]
    name = "genres"
    weight = 1
```

`authors` 的权重是 `2`、`genres` 是 `1`，也就是说共享作者的份量是共享类型的两倍。渲染时仍然使用前面那个局部模板。

## 示例：按标题词关联

若希望标题中含有相同词语的文章互相关联，例如标题里的 `Hugo`、`image`、`processing` 都参与匹配：

```toml
[related]
  threshold = 50
  toLower = true

  [[related.indices]]
    name = "title"
    weight = 1
    tokenize = true
    minTokenLength = 4
```

`tokenize` 为 `true` 时，Hugo 按空白切分标题并逐词建立索引；`minTokenLength = 4` 会排除 `and`、`the`、`for` 这类短词。

## 延伸阅读

- [分类法](/content-management/taxonomies/)
- [前置元数据](/content-management/front-matter/)
- [配置](/configuration/)
