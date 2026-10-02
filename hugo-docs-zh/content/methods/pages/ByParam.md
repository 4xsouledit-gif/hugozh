+++
title = "ByParam"
linkTitle = "ByParam"
description = "返回给定页面集合按指定参数升序排序后的结果。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/pages/byparam/"

[params.functions_and_methods]
signatures = ["PAGES.ByParam PARAM"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

按**自定义前置元数据字段**排序：作者名、价格、评分、颜色、排序键……凡是不属于内置日期/标题/权重的字段，都用它。

`PARAM` 是字段名（字符串）。嵌套字段用点号连写，例如 `author.last_name`。如果页面没有写这个参数，Hugo 会改用[项目配置](/configuration/params/)里的同名参数（上游说明）；两者都没有的页面**不会从集合里消失，而是排在最后**（实测）。

## 什么时候用，什么时候别用

**该用**：

- 排序键是自定义字段（`price`、`rating`、`author.last_name`…）；
- 想让读者按「作者」「难度」浏览。

**别用**：

- 内置字段排序 → 日期用 [`ByDate`](/methods/pages/bydate/)、标题用 [`ByTitle`](/methods/pages/bytitle/)、权重用 [`ByWeight`](/methods/pages/byweight/)、发布/过期用 `ByPublishDate`/`ByExpiryDate`；
- 想**分组**而不是排序 → 用 [`GroupByParam`](/methods/pages/groupbyparam/)；
- 想筛掉没有该参数的页面 → 先用 [`collections.Where`](/functions/collections/where/)（`"Params.xxx" "ne" nil`）再排序。

## 用法

如果前置元数据中没有给定的参数，Hugo 会改用项目配置中的同名参数（如果存在）。

```go-html-template
{{ range .Pages.ByParam "author" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range (.Pages.ByParam "author").Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

如果目标参数是嵌套的，请用点号访问其字段：

```go-html-template
{{ range .Pages.ByParam "author.last_name" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：有该参数的排前，没写的排后

示例沿用本章首页的[示例站点结构](/methods/pages/)：`post-1` 与 `post-3` 有 `rank`（分别 2、1），`post-2` 与 `post-4` 没有；四页都有 `color`。

```go-html-template {file="layouts/_default/list.html"}
按 color：{{ range .Pages.ByParam "color" }}{{ .LinkTitle }}={{ .Params.color }} {{ end }}
按 rank（两页没写）：{{ range .Pages.ByParam "rank" }}{{ .LinkTitle }}={{ with .Params.rank }}{{ . }}{{ else }}-{{ end }} {{ end }}
按 author.last_name：{{ range .Pages.ByParam "author.last_name" }}{{ .LinkTitle }}={{ .Params.author.last_name }} {{ end }}
```

Hugo 渲染为：

```html
按 color：bravo=blue delta=green charlie=red alpha=red 
按 rank（两页没写）：charlie=1 alpha=2 bravo=- delta=- 
按 author.last_name：bravo=Alpha delta=Bravo charlie=Mike alpha=Zulu 
```

**你应当看到什么**：`rank` 这一行里，有值的 `charlie`(1)、`alpha`(2) 排在前，**没写 `rank` 的 `bravo`、`delta` 排在最后**（`-` 是我们模板里显式输出的占位），页面没有丢。`color` 里 `charlie` 与 `alpha` 都是 `red`，两者顺序由内部实现决定，不要依赖。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 参数在四页都存在（`color`） | 按值升序 `blue green red red` | 否 |
| 参数只有部分页面有（`rank`） | 有值的排前，**没有的排在最后**，页面全部保留 | 否 |
| 参数所有页面都没有 | 返回原集合顺序（实测 `alpha bravo charlie delta`） | 否 |
| 嵌套参数（`author.last_name`） | 按嵌套值升序 | 否 |
| 两个页面取值相同 | 顺序由内部实现决定，**上游未说明**（实测与输入顺序不同） | 否 |
| `PARAM` 传数字（`ByParam 3`） | **不报错**，返回原集合顺序（取不到该键） | 否 |
| 空集合 | 空集合：`range` 无输出 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 排序完全没生效，顺序和 `.Pages` 一样 | 参数名拼错，或该字段写在 `[params]` 表里而模板查的是顶层键 | 先用 `{{ debug.Dump (index .Pages 0).Params }}` 确认键名 |
| 没报错但结果不对 | 部分页面的位置莫名其妙 | 这些页面没写该参数，被排在最后 | 给它们补默认值，或先用 `where` 过滤 |
| 没报错但结果不对 | 数字排序按字符串比较（`10` 排在 `2` 前） | 前置元数据里数字被加了引号，变成字符串 | 去掉引号；YAML/JSON 里的字符串数字也一样 |
| 没报错但结果不对 | 相同取值的两页顺序每次看起来都不对 | 平局顺序上游未说明 | 不要依赖平局顺序；必要时用第二排序键（先分组再排） |

更多排查入口见[故障排查](/troubleshooting/)。
