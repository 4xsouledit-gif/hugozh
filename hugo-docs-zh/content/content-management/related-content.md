+++
title = "相关内容"
linkTitle = "相关内容"
description = "用索引字段计算页面相似度，在模板中输出相关内容列表；含配置位置、返回值边界与验证方法。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/content-management/related/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "会改项目配置，会写带 `range` 与 `with` 的模板。",
  "读过[分类法](/content-management/taxonomies/)与[前置元数据](/content-management/front-matter/)。",
]
outcomes = [
  "在项目配置里声明 `related` 索引，并在模板中列出相关内容；",
  "说清 `threshold` 与各索引 `weight` 如何影响结果，知道为什么结果会是空的；",
  "用 `.HeadingsFiltered` 把相关结果精确到标题一级；",
  "判断某个页面集合该用 `related` 还是手工分类法筛选。",
]
next = ["/configuration/related-content/", "/content-management/taxonomies/", "/functions/collections/keyvals/"]

+++

## 这一页解决什么问题

相关内容（related content）依据前置元数据（front matter）中的参数为页面之间计算相似度，用来生成「参见」一类的列表。判定相似度的索引（index）与各自的权重都在站点配置的 `related` 区段中声明，因此同一套内容可以通过调整配置改变相关结果的取向：更看重共享标签，还是更看重发布时间接近。

它最容易出现的现象是**「列表是空的」**，而且构建不报错。原因通常是三者之一：`threshold` 设得太高、索引字段在内容里根本不存在、或者 `related` 区段被局部覆盖导致配置不完整。本页给出可验证的做法。

**验证相关内容是否生效**：在单页模板里临时输出结果数量。

```go-html-template
{{ $related := site.RegularPages.Related . | first 5 }}
{{ warnf "page=%s related=%d" .Title (len $related) }}
```

**你应当看到什么**：构建日志里出现每个页面的 `related=N`。`N` 为 0 说明没有任何页面达到 `threshold`，此时页面上的「参见」区块会被 `{{ with }}` 整块跳过（**不会报错，也不会留下空标签**）——这正是「明明配了却没有列表」的真相。把 `threshold` 调低（例如从 80 调到 20）或给内容补上索引字段，`N` 就会变化。

> [!NOTE]
> **`.Related` 的返回值边界**：没有匹配时返回**空页面集合**，不是 `nil` 报错——模板里直接 `{{ range .Related . }}` 输出空，`{{ with … }}` 跳过整块。但要注意：**必须把页面作为参数传进去**（`site.RegularPages.Related .`），漏掉参数或传 `nil` 会报错。

**实测（Hugo 0.167）**：在 `[related]` 里配 `threshold = 10`、`includeNewer = true`、`toLower = true`，加一条 `name = 'tags'`、`weight = 100` 的索引，三篇内容的 tags 分别是 `['hugo','go']`、`['hugo']`、`['cooking']` 时：带 `hugo` 的两页互为相关（模板输出 `related=R2`），只带 `cooking` 的那页输出为空——即没有达到阈值的页面时返回**空集合**，`{{ with }}` 会整块跳过。

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

## 什么时候用相关内容、什么时候别用

**该用**：

- 文章数量大、标签/关键词本来就维护得比较整齐，希望自动生成「参见」；
- 想把「标题里出现相同词」这种弱信号也纳入关联（配 `tokenize`）。

**别用**：

- **结果要求完全可控**——`related` 是打分排序，权重与阈值一变结果就变；需要稳定、可解释的关联时，用[分类法](/content-management/taxonomies/)筛选或在前置元数据里显式写一个页面列表；
- **站点只有几十页、每页都已手工维护链接**——自动结果反而不如人工挑选；
- **索引字段在内容里几乎为空**——没有可比较的数据，调低 `threshold` 也只是把「噪声」放进来。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 「参见」区块完全不出现，也不报错 | `.Related` 返回空集合，`{{ with }}` 跳过整块 | 用 `warnf` 打印 `len $related`；调低 `threshold`，或确认索引字段真的写在内容里 |
| 没报错但结果不对 | 改了 `related` 配置，只有部分设置生效 | `related` 区段一旦出现就必须写完整，不能只覆盖个别键 | 把 `threshold`、`includeNewer`、`toLower` 与全部 `[[related.indices]]` 一起写出，见[默认配置](#默认配置) |
| 没报错但结果不对 | 某个索引完全不起作用 | 该索引的 `weight` 为 `0`（相当于关闭），或 `name` 与前置元数据字段名不一致 | 给 `weight` 一个正值；核对 `name` 与内容里的字段名逐字一致 |
| 没报错但结果不对 | `fragments` 索引配了却没有标题级结果 | 没有开启 `applyFilter`，`.HeadingsFiltered` 为空 | 在该索引下加 `applyFilter = true` |
| 没报错但结果不对 | 中文标题按词关联不起来 | `tokenize` 只按空白切分，中文、日文等不用空格分词的语言不受支持 | 中文站点改用分类法/关键词字段做索引，不要依赖 `tokenize` |
| 没报错但结果不对 | 结果里都是很久以后的文章或排序奇怪 | `includeNewer` 与 `pattern` 的取值不符合预期 | 按需设置 `includeNewer`；日期索引用 `pattern` 控制加权粒度（如 `200601` 按年月） |
| 报错看不懂 | `Related` 调用报参数错误 | 选项映射缺少必填的 `document`，或根本没传页面 | 简单写法传页面（`site.RegularPages.Related .`）；用选项映射时必须带 `document` |
| 报错看不懂 | 构建变慢、内存上升 | 开启了 `tokenize` 且索引词量很大 | 用 `minTokenLength` 排除短词、用 `cardinalityThreshold` 移除高频词；注意 `minTokenLength` 先于 `cardinalityThreshold` 生效 |

更多排查入口见[故障排查](/troubleshooting/)。

## 延伸阅读

- [分类法](/content-management/taxonomies/)
- [前置元数据](/content-management/front-matter/)
- [配置](/configuration/)
