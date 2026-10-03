+++
title = "IsPage"
linkTitle = "IsPage"
description = "报告给定页面是否为常规页面。"
date = 2026-10-02
weight = 340
source = "https://gohugo.io/methods/page/ispage/"

[params.functions_and_methods]
signatures = ["PAGE.IsPage"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsPage` 判断当前页面是不是**普通内容页**（`kind = page`，即由 `.md` 文件或叶子包的 `index.md` 生成的页面）。列表与详情共用一套模板时，它就是那根分叉的判断条件。

## 什么时候用，什么时候别用

**该用**：

- 通用模板里区分「详情页」与「列表页」；
- 判断是否可以安全地取 `.Content`（分支页面往往没有正文）。

**别用**：

- 想判断 section 页 → 用 [`IsSection`](/methods/page/issection/)；
- 想判断分支（首页 / section / 分类法 / 术语）→ 用 [`IsBranch`](/methods/page/isbranch/)；
- 想判断首页 → 用 [`IsHome`](/methods/page/ishome/)；
- 已弃用的 `IsNode` 只是 `not IsPage` 的旧写法，新代码别再用。

## 用法

如果[页面种类](g)为 `page`，`Page` 对象上的 `IsPage` 方法就返回 `true`。

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
{{ .IsPage }}
```

## 完整示例：详情与列表共用一个模板

最小站点：`content/docs/guide/alpha.md`（普通页面）、`content/docs/guide/bundle/index.md`（叶子包）、`content/docs/guide/_index.md`（section）。模板：

```go-html-template {file="layouts/_default/baseof.html"}
{{ if .IsPage }}
  <article>{{ .Content }}</article>
{{ else }}
  <p>列表页</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，普通页面与叶子包页面的输出以 `<article>` 开头（内容为该页正文渲染结果），section 页则输出：

```html
<p>列表页</p>
```

**你应当看到什么**：普通页面与叶子包页面都走 `true` 分支（叶子包也是 `kind = page`，所以正文里会带上包内内容）；section、首页、分类法页、术语页走另一分支。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；站点含首页、两层 section、普通页面、叶子包、术语页。

| 页面 | `IsPage` | 是否报错 |
| --- | --- | --- |
| 普通内容页 `alpha.md` | `true` | 否 |
| 叶子包页面 `bundle/index.md` | `true` | 否 |
| section 页 `/docs/`、`/docs/guide/` | `false` | 否 |
| 首页 | `false` | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 列表页显示了空正文 | 分支页面上 `.Content` 为空 | 分支页面通常没有正文 | 用 `IsPage` 分流，列表侧渲染 `.Pages` |
| 叶子包被漏掉 | 用「文件名不是 `_index.md`」之类的启发式判断 | 叶子包也是 `kind = page`，`IsPage` 为 `true` | 统一用 `IsPage` / `IsBranch`，不要手写路径判断 |
| 构建出现弃用警告 | 日志提示 `Page.IsNode was deprecated` | 老写法 | 改用 `IsPage` / `IsBranch` |

更多排查入口见[故障排查](/troubleshooting/)。

