+++
title = "Related"
linkTitle = "Related"
description = "返回与给定页面相关的一组页面。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/methods/pages/related/"

[params.functions_and_methods]
returnType = "page.Pages"
+++

## 这一页解决什么问题

找出「和这一页相关」的其他页面：文章底部「相关阅读」、跨章节推荐。

相关性来自**前置元数据**（`tags`、`keywords` 等）加上[相关内容配置][]。值得注意的是：**默认配置下，比当前页更新的页面会被过滤掉**（`includeNewer` 默认 `false`），这一条上游方法页没写，是本页最值得先记的坑——「明明有相关文章却一个都不出现」几乎都出在这里。

## 什么时候用，什么时候别用

**该用**：

- 「相关阅读」这类软关联，靠标签/关键词自动生成；
- 需要按相关性权重排序、取前若干条。

**别用**：

- 想要**确定性**的关联（手工指定「读完这篇读哪篇」）→ 用 [`ByWeight`](/methods/pages/byweight/) 或[菜单](/configuration/menus/)；
- 想按分类法取同术语页面 → 用 [`GetTerms`](/methods/page/getterms/) 或 [`collections.Where`](/functions/collections/where/)；
- 想要上一篇/下一篇 → 用 [`Next`](/methods/pages/next/) / [`Prev`](/methods/pages/prev/)。

Hugo 依据前置元数据，用多个因素找出与给定页面相关的内容。可以使用默认的[相关内容配置][]，也可以按所需的索引与参数调整结果。详见[说明][]。

## 用法

传给 `Related` 方法的参数可以是 `Page`，也可以是选项映射。例如传入当前页面：

```go-html-template {file="layouts/page.html"}
{{ with .Site.RegularPages.Related . | first 5 }}
  <p>Related pages:</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

传入选项映射：

```go-html-template {file="layouts/page.html"}
{{ $opts := dict
  "document" .
  "indices" (slice "tags" "keywords")
}}
{{ with .Site.RegularPages.Related $opts | first 5 }}
  <p>Related pages:</p>
  <ul>
    {{ range . }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 选项

`indices`
: （`slice`）要在其中搜索的索引。

`document`
: （`page`）要为其查找相关内容的页面。指定选项映射时必填。

`namedSlices`
: （`slice`）要搜索的关键词，用 [`keyVals`][] 函数表示为 `KeyValues` 的切片。

`fragments`
: （`slice`）用于类型为 "fragments" 的索引的一组特殊关键词。它会匹配文档的 [fragment](g)（片段）标识符。

下面这个刻意构造的例子用到了上述所有选项：

```go-html-template
{{ $page := . }}
{{ $opts := dict
  "indices" (slice "tags" "keywords")
  "document" $page
  "namedSlices" (slice (keyVals "tags" "hugo" "rocks") (keyVals "date" $page.Date))
  "fragments" (slice "heading-1" "heading-2")
}}
```

## 完整示例：`includeNewer` 让结果从 2 条变成 3 条

示例沿用本章首页的[示例站点结构](/methods/pages/)。相关配置（`hugo.toml`）：

```toml
[related]
  threshold = 20
  includeNewer = false
  toLower = false

  [[related.indices]]
    name = "tags"
    weight = 100

  [[related.indices]]
    name = "keywords"
    weight = 50
```

`post-2`（`bravo`，`date = 2023-02-15`）的标签是 `tags = ["hugo"]`、`keywords = ["site", "theme"]`。

```go-html-template {file="layouts/_default/single.html"}
{{ range site.RegularPages.Related . }}{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为：

```html
alpha charlie 
```

把配置改成 `includeNewer = true` 后，同一个模板（同一个页面）渲染为：

```html
delta alpha charlie 
```

**你应当看到什么**：默认配置下 `delta` **没有出现**——它是最相关的候选之一（与 `bravo` 共享 `hugo` 与 `site`），但它的 `date`（2024-01-01）比 `bravo`（2023-02-15）新，被 `includeNewer = false` 过滤掉了。打开 `includeNewer` 后它才回来。结果列表按相关性权重从高到低排列。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows；`related` 配置见上。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 默认（`includeNewer = false`），`post-2` | `alpha charlie`（比当前页新的相关页被过滤） | 否 |
| `includeNewer = true`，`post-2` | `delta alpha charlie` | 否 |
| `post-1`（`alpha`） | `charlie` | 否 |
| `post-3`（`charlie`） | **空集合**（它的相关页都比它新，被过滤） | 否 |
| `post-4`（`delta`） | `alpha bravo charlie` | 否 |
| 传入选项映射但**缺 `document`** | 空结果，**不报错**（上游写明 `document` 必填） | 否 |
| 只传 `indices`（`tags`）| 结果变少：`post-2` 只剩 `alpha` | 否 |
| 不传参数（`.Related`） | —— | 是：`wrong number of args for Related: want 2 got 1` |
| 在单页模板里用 `.RegularPages.Related .` | **空结果**（实测）；改用 `site.RegularPages.Related .` 或 `.CurrentSection.RegularPages.Related .` 才拿到页面 | 否 |
| 空集合上调用 | 空集合，`with` 走 `else` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 一个相关页面都没有 | `includeNewer` 默认 `false`，比当前页新的候选被过滤 | 在 `hugo.toml` 的 `[related]` 里设 `includeNewer = true` |
| 没报错但结果不对 | 结果为空，但参数都写了 | 选项映射里漏了 `document`（缺它不报错，只返回空） | 补 `"document" .` |
| 没报错但结果不对 | 结果总会少一些 | `threshold` 太高，弱相关的组合没过线 | 下调 `threshold`，或给索引调 `weight` |
| 没报错但结果不对 | 在单页模板里调用得到空 | 调用它的集合本身是空的（例如 `.RegularPages` 在单页上下文里没有页面） | 改用 `site.RegularPages.Related .` 或 `.CurrentSection.RegularPages.Related .` |
| 报错看不懂 | `wrong number of args for Related: want 2 got 1` | 忘了传页面/选项 | 写成 `.Related .` |
| 没报错但结果不对 | 中文标签匹配不上 | `toLower` 与大小写、以及中英文混写 | 统一标签写法；必要时设 `toLower = true` |

更多排查入口见[故障排查](/troubleshooting/)。

[`keyVals`]: /functions/collections/keyvals/
[说明]: /content-management/related-content/
[相关内容配置]: /configuration/related-content/
