+++
title = "IsSection"
linkTitle = "IsSection"
description = "报告给定页面是否为 section 页面。"
date = 2026-10-02
weight = 350
source = "https://gohugo.io/methods/page/issection/"

[params.functions_and_methods]
signatures = ["PAGE.IsSection"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsSection` 判断当前页面是不是 **section 页**（由 `_index.md` 或目录生成的列表型页面，`kind = section`）。它常用来：在导航里标记「栏目页」、给栏目页换版式，或在通用模板里决定渲染 `.Pages` 还是 `.Content`。

## 什么时候用，什么时候别用

**该用**：

- 判断一个页面是否是栏目/目录页；
- 与 [`IsHome`](/methods/page/ishome/) 配合，排除首页后处理栏目页。

**别用**：

- 想判断**所有**列表型页面（含首页、分类法页、术语页）→ 用 [`IsBranch`](/methods/page/isbranch/)；
- 想判断普通内容页 → 用 [`IsPage`](/methods/page/ispage/)；
- 想判断「当前页属于哪个 section」→ 用 [`CurrentSection`](/methods/page/currentsection/) 或 [`InSection`](/methods/page/insection/)。

## 用法

如果[页面种类](g)为 `section`，`Page` 对象上的 `IsSection` 方法就返回 `true`。

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md  <-- kind = page
│   ├── book-2.md     <-- kind = page
│   └── _index.md     <-- kind = section
└── _index.md         <-- kind = home
```

```go-html-template
{{ .IsSection }}
```

## 完整示例：区分栏目页与首页

最小站点：`content/_index.md`（首页）、`content/docs/_index.md`、`content/docs/guide/_index.md`（section 页）、`content/docs/guide/alpha.md`（普通页面）。模板放在 `layouts/_default/list.html`：

```go-html-template {file="layouts/_default/list.html"}
{{ if .IsSection }}
  <h1>栏目：{{ .Title }}</h1>
{{ else if .IsHome }}
  <h1>首页</h1>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，`/docs/guide/` 输出：

```html
<h1>栏目：指南</h1>
```

首页由 `layouts/index.html` 渲染（不走 `list.html`），普通页面由 `single.html` 渲染，都不会命中这段判断。

**你应当看到什么**：`IsSection` 只对 section 页为 `true`；首页虽然也渲染 `.Pages`，但它是 `kind = home`，`IsSection` 为 `false`（实测），所以必须单独用 `IsHome` 处理。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；站点含首页、两层 section、普通页面、叶子包、术语页。

| 页面 | `IsSection` | 是否报错 |
| --- | --- | --- |
| section 页 `/docs/`、`/docs/guide/` | `true` | 否 |
| 首页 | `false` | 否 |
| 普通内容页 `alpha.md` | `false` | 否 |
| 叶子包页面 | `false` | 否 |
| 术语页 `/tags/hugo/` | `false` | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 首页没有被处理 | 只判断了 `IsSection`，首页走了空分支 | 首页的 `IsSection` 为 `false` | 补 `else if .IsHome`（或让首页走 `layouts/index.html`） |
| 分类法页/术语页没被处理 | 同上 | 它们也不是 section | 需要覆盖所有列表型页面时用 [`IsBranch`](/methods/page/isbranch/) |
| 没报错但结果不对 | 栏目页的 `Pages` 顺序与预期不符 | `.Pages` 的排序规则（权重/日期） | 显式用 `.Pages.ByWeight` / `ByDate` |

更多排查入口见[故障排查](/troubleshooting/)。

