+++
title = "IsBranch"
linkTitle = "IsBranch"
description = "报告给定页面是否为一个分支包。"
date = 2026-10-02
weight = 290
source = "https://gohugo.io/methods/page/isbranch/"

[params.functions_and_methods]
signatures = ["PAGE.IsBranch"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsBranch` 回答「这个页面是不是分支包」：首页、section 页、分类法页、术语页都是分支（`true`），普通内容页（包括叶子包页面）都是 `false`。模板里要区分「列表型页面」与「内容型页面」时，它是最直接的判断（0.163.0 起取代了已弃用的 `IsNode`）。

## 什么时候用，什么时候别用

**该用**：

- 一套模板里区分列表与详情（分支页面通常渲染 `.Pages`，普通页面渲染 `.Content`）；
- 取代已弃用的 `IsNode`。

**别用**：

- 想判断「是不是普通内容页」→ 用 [`IsPage`](/methods/page/ispage/)，语义更直白；
- 想区分页面包类型（叶子包 / 分支包 / 非包）→ 用 [`BundleType`](/methods/page/bundletype/)（注意普通页面返回空字符串）；
- 想判断首页 → 用 [`IsHome`](/methods/page/ishome/)。

## 用法

**（0.163.0 新增）**

[分支](g)

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md    <-- kind = page      IsBranch = false
│   ├── book-2.md       <-- kind = page      IsBranch = false
│   └── _index.md       <-- kind = section   IsBranch = true
├── tags
│   ├── fiction
│   │   └── _index.md   <-- kind = term      IsBranch = true
│   └── _index.md       <-- kind = taxonomy  IsBranch = true
└── _index.md           <-- kind = home      IsBranch = true
```

```go-html-template
{{ .IsBranch }}
```

## 完整示例：一套模板区分分支与普通页面

最小站点：`content/_index.md`（首页）、`content/docs/guide/_index.md`（section）、`content/docs/guide/alpha.md`（普通页面）、`content/docs/guide/bundle/index.md`（叶子包）、`/tags/hugo/`（术语页）。模板：

```go-html-template {file="layouts/_default/single.html"}
{{ if .IsBranch }}
  <p>分支页面</p>
{{ else }}
  <p>普通页面</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，`alpha`（普通页面）与叶子包页面输出：

```html
<p>普通页面</p>
```

首页、各层 section 页、分类法页与术语页输出：

```html
<p>分支页面</p>
```

**你应当看到什么**：`IsBranch` 为 `true` 的页面才有子页面（`.Pages` 可用），为 `false` 的页面才有正文；叶子包页面属于「普通页面」一侧。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构见上。

| 页面 | `IsBranch` | 是否报错 |
| --- | --- | --- |
| 首页 | `true` | 否 |
| section 页（有/无 `_index.md`） | `true` | 否 |
| 分类法页 `/tags/` | `true` | 否 |
| 术语页 `/tags/hugo/` | `true` | 否 |
| 普通内容页 `alpha.md` | `false` | 否 |
| 叶子包页面 `bundle/index.md` | `false` | 否 |
| 返回类型 | `bool` | 否 |

> [!NOTE]
> 上游已弃用的 [`IsNode`](/methods/page/isnode/) 在本版本会触发弃用警告；`IsBranch` 不触发。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建出现弃用警告 | 日志提示 `.Page.IsNode was deprecated` | 模板里还在用 `IsNode` | 改用 `IsBranch`，或 `not .IsPage` |
| 没报错但结果不对 | 叶子包页面被当成分支处理 | 叶子包 `IsBranch` 为 `false` | 需要区分包类型时用 `BundleType` |
| 没报错但结果不对 | 分支页面上取不到正文 | 分类法页、section 页的 `.Content` 往往为空 | 分支页面渲染 `.Pages` / `.Data.Terms`，普通页面渲染 `.Content` |

更多排查入口见[故障排查](/troubleshooting/)。

