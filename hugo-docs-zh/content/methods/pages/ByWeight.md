+++
title = "ByWeight"
linkTitle = "ByWeight"
description = "返回给定页面集合按权重升序排序后的结果。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/pages/byweight/"

[params.functions_and_methods]
signatures = ["PAGES.ByWeight"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

按**权重升序**（轻的在前）重排页面集合。权重是你在前置元数据里手工指定的整数，用来表达「我自己规定的顺序」——章节顺序、教程步骤、手工编排的目录。它比按标题/日期排序更可控，尤其适合中文站点（拼音序不是 Hugo 的默认行为）。

返回的是新集合，原集合不变。

## 什么时候用，什么时候别用

**该用**：

- 顺序由人决定（「先读这篇，再读那篇」）；
- 想要稳定的、不受日期改动影响的列表顺序。

**别用**：

- 顺序应该由内容自身决定 → 用 [`ByDate`](/methods/pages/bydate/)、[`ByTitle`](/methods/pages/bytitle/) 等；
- 想做「第 2 篇 / 共 3 篇」这类**位置**展示 → 用 [`IndexOf`](/methods/pages/indexof/)；
- 想分页 → `ByWeight` 只排序，分页用[分页器](/templates/pagination/)。

## 用法

用前置元数据中的 `weight` 字段为页面指定[weight](g)（权重）。权重必须是非零整数。较轻的条目浮到顶部，较重的条目沉到底部。未设置权重或权重为零的页面排在集合末尾。

```go-html-template
{{ range .Pages.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByWeight.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：有权重的在前，没权重的在最后

示例沿用本章首页的[示例站点结构](/methods/pages/)：`post-1/2/3` 的 `weight` 是 10、20、30，`post-4` **没有写 `weight`**。

```go-html-template {file="layouts/_default/list.html"}
升序：{{ range .Pages.ByWeight }}{{ .LinkTitle }}({{ .Weight }}) {{ end }}
降序：{{ range .Pages.ByWeight.Reverse }}{{ .LinkTitle }}({{ .Weight }}) {{ end }}
```

Hugo 渲染为：

```html
升序：alpha(10) bravo(20) charlie(30) delta(0) 
降序：delta(0) charlie(30) bravo(20) alpha(10) 
```

**你应当看到什么**：升序是 10 → 20 → 30，**没写权重的 `delta` 排在最后**（它的 `.Weight` 输出 `0`）；`Reverse` 之后 `delta` 跑到了最前——这是「未加权页面排在集合末尾」这条规则被反转后的自然结果，往往**不是**你想要的降序列表。要排除它，先用 `where` 过滤掉 `.Weight` 为 0 的页面。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 权重 10/20/30，另有一页未设权重 | `alpha(10) bravo(20) charlie(30) delta(0)`，未设权重的在最后 | 否 |
| 权重显式写 `0` | 与未设置等效：`.Weight` 为 `0`，排在最后 | 否 |
| 权重为负数（`-5`） | 排在所有正权重之前（实测 `-5` 在最前） | 否 |
| 权重相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| 权重写成字符串（`weight = "ten"`） | **不报错**：`.Weight` 为 `0`，与未加权页面一起排在末尾（实测） | 否 |
| 空集合 | 空集合：`range` 无输出，`len` 为 0 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 降序列表里第一页是「没排序的那篇」 | 未加权页面 `.Weight` 为 0，反转后跑到最前 | 先 `where .Pages "Weight" "gt" 0`，或在模板里跳过 0 |
| 没报错但结果不对 | 只有部分页面按预期排列 | 其余页面没写 `weight`，全部堆在末尾 | 要么全部指定 `weight`，要么改用 `ByTitle`/`ByDate` |
| 没报错但结果不对 | 想插一页到两页之间却没有整数可用 | 权重必须是整数，`15` 和 `25` 用完了 | 用 `15`、`17` 这类空隙，或整体重编号 |
| 没报错但结果不对 | 某页的权重「没起作用」，落到末尾 | `weight` 被加了引号变成字符串，Hugo **不报错**，只把它当成 0 | 去掉引号，写成 `weight = 10` |

更多排查入口见[故障排查](/troubleshooting/)。
