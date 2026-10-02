+++
title = "BundleType"
linkTitle = "BundleType"
description = "返回给定页面的页面包类型；若该页面不是页面包，则返回空字符串。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/page/bundletype/"

[params.functions_and_methods]
signatures = ["PAGE.BundleType"]
returnType = "string"
+++

## 这一页解决什么问题

Hugo 有三种「页面容器」：叶子包（目录里有 `index.md`）、分支包（目录里有 `_index.md`）和普通的 `.md` 文件。写通用模板（页头、SEO、资源处理）时经常要先知道当前页面属于哪一种，`BundleType` 就是这个问题的一句话答案：`leaf`、`branch`，或者**空字符串**（普通的独立页面）。

## 什么时候用，什么时候别用

**该用**：

- 模板需要区分「包」与「普通页面」：例如只有叶子包才把同目录的图片当作 `.Resources`；
- 列表里想对包类页面用不同的摘要或图标。

**别用**：

- 只想判断「是不是普通内容页」→ 用 [`IsPage`](/methods/page/ispage/)；
- 想判断「是不是分支（section / 首页 / 分类法页）」→ 用 [`IsBranch`](/methods/page/isbranch/)（0.163.0 起，它取代了已弃用的 `IsNode`）；
- 想拿到包内资源列表 → `BundleType` 只回答类型，取资源用 `.Resources`。

## 用法

页面包（page bundle）是把内容与关联[资源](g)封装在一起的目录。页面包有两种类型：[叶子包](g)与[分支包](g)。详见[说明][]。

`Page` 对象上的 `BundleType` 方法对分支包返回 `branch`，对叶子包返回 `leaf`，若该页面不是页面包则返回空字符串。

```tree
content/
├── films/
│   ├── film-1/
│   │   ├── a.jpg
│   │   └── index.md  <-- leaf bundle
│   ├── _index.md     <-- branch bundle
│   ├── b.jpg
│   ├── film-2.md
│   └── film-3.md
└── _index.md         <-- branch bundle
```

在模板中取值：

```go-html-template
{{ .BundleType }}
```

## 完整示例：把三种容器各打印一次

最小站点结构：

```tree
content/
├── docs/
│   ├── guide/
│   │   ├── _index.md      <-- 分支包
│   │   ├── alpha.md       <-- 普通页面
│   │   └── bundle/
│   │       ├── index.md   <-- 叶子包
│   │       └── data.json  <-- 叶子包的资源
│   └── _index.md
└── _index.md
```

用同一个 `layouts/_default/single.html` 渲染所有普通页面：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .Title }} → {{ with .BundleType }}{{ . }}{{ else }}（不是页面包）{{ end }}</p>
```

`hugo --source <站点目录> --ignoreCache` 构建后：

```html
<p>Alpha → （不是页面包）</p>
<p>叶子包 → leaf</p>
```

`_index.md` 渲染出的分支包页面，`{{ .BundleType }}` 得到：

```html
branch
```

**你应当看到什么**：普通 `.md` 页面返回的是**空字符串**（最容易误判的一种），必须用 `with` 或 `eq` 兜底；只有真正的包才有值。首页（`content/_index.md`）与各层 section 页同样返回 `branch`。同一次构建中 `IsPage`、`IsBranch` 的取值与之一致。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；内容结构见上。

| 页面 | 结果 | 是否报错 |
| --- | --- | --- |
| 叶子包 `bundle/index.md` | `leaf` | 否 |
| 分支包 `_index.md`（section 页、首页） | `branch` | 否 |
| 普通页面 `alpha.md` | 空字符串（`with` 判为假） | 否 |
| 分类法页 `/tags/`、术语页 `/tags/hugo/` | `branch`（同一次构建中 `IsBranch` 为 `true`） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 普通页面被当成包处理，或包被漏掉 | 普通页面返回**空字符串**，不是 `nil` 也不是 `page` | 先 `with .BundleType`，或显式判断 `eq .BundleType ""` |
| 没报错但结果不对 | 以为 `.md` 文件放进子目录就成了叶子包 | 叶子包要求文件名是 `index.md`（或 `index.<语言>.md`） | 把 `alpha.md` 改成 `alpha/index.md` |
| 没报错但结果不对 | 叶子包里 `range .Resources` 为空 | 资源必须与 `index.md` 放在同一目录 | 把资源文件移进包目录 |

更多排查入口见[故障排查](/troubleshooting/)。

[说明]: /content-management/page-bundles/
