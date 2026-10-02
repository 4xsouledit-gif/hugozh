+++
title = "InSection"
linkTitle = "InSection"
description = "报告给定页面是否位于给定 section 中。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/methods/page/insection/"

[params.functions_and_methods]
signatures = ["PAGE.InSection SECTION"]
returnType = "bool"
+++

## 这一页解决什么问题

「这个页面属于哪个 section」在列表分组、栏目高亮、给文章套不同版式时都会用到。`InSection` 回答的是布尔问题，但它的参数语义容易踩坑：**它比较的是两个页面的「当前 section」，而且参数必须传 Page**（详见下文实测）。

## 什么时候用，什么时候别用

**该用**：

- 在模板里判断「当前页与某个 section 是否同属一层」，例如给同栏目文章加不同样式；
- 与 `.Site.GetPage` 配合，做「当前页是否位于某个 section 之下」的判断。

**别用**：

- 参数想传字符串（`"docs"`、`"/docs/guide"`）→ 实测**恒为 `false`**，见下文；要按路径判断请传 Page 对象；
- 想要 section 页对象本身 → 用 [`CurrentSection`](/methods/page/currentsection/) / [`FirstSection`](/methods/page/firstsection/)；
- 想判断祖先/后代关系 → 用 [`IsAncestor`](/methods/page/isancestor/) / [`IsDescendant`](/methods/page/isdescendant/)；
- 想筛选页面集合 → 用 [`where`](/functions/collections/where/) 比较 `Section` 字段。

## 用法

[section（内容区块）](/quick-reference/glossary/section/)

`Page` 对象上的 `InSection` 方法报告给定页面是否位于给定 section 中。注意，把页面与其同级页面作比较时，该方法返回 `true`。

## 基本用法

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md
│   │   ├── auction-1.md
│   │   └── auction-2.md
│   ├── 2023-12/
│   │   ├── _index.md
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md
│   ├── bidding.md
│   └── payment.md
└── _index.md
```

渲染 `auction-1` 页面时：

```go-html-template
{{ with .Site.GetPage "/" }}
  {{ $.InSection . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions" }}
  {{ $.InSection . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11" }}
  {{ $.InSection . }} → true
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11/auction-2" }}
  {{ $.InSection . }} → true
{{ end }}
```

上面的示例中，我们用 [`with`][] 语句做防御式编码：页面不存在时不输出任何内容。再加上一个 [`else`][] 分支，就可以报告错误：

```go-html-template
{{ $path := "/auctions/2023-11" }}
{{ with .Site.GetPage $path }}
  {{ $.InSection . }} → true
{{ else }}
  {{ errorf "Unable to find the section with path %s" $path }}
{{ end }}
  ```

## 理解上下文

在 `with` 块内部，[上下文](g)（即点号）是该 section 的 `Page` 对象，而不是传入模板的那个 `Page` 对象。如果写成下面这样：

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ .InSection . }} → true
{{ end }}
```

渲染 `auction-1` 页面时结果就是错的，因为这是把 section 页面与它自身作比较。

> [!NOTE]
> 用 `$` 取得传入模板的上下文。

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ $.InSection . }} → true
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

## 完整示例：判断当前页属于哪个 section

最小站点：`content/docs/guide/alpha.md`（页面）、`content/docs/guide/_index.md`、`content/docs/_index.md`、`content/posts/_index.md`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ $currentPage := . }}
{{ with .Site.GetPage "/docs/guide" }}{{ $.InSection . }} → true{{ end }}
{{ with .Site.GetPage "/docs" }}{{ $.InSection . }} → false{{ end }}
{{ with .Site.GetPage "/posts" }}{{ $.InSection . }} → false{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，在 `/docs/guide/alpha/` 上输出：

```html
true → true
false → false
false → false
```

**你应当看到什么**：只有「当前页所在的那一层 section」（`/docs/guide`）为 `true`；**更上层**的 `/docs` 为 `false`。这与直觉相反——要判断「是否在 `/docs` 之下」请用 [`IsDescendant`](/methods/page/isdescendant/)，或用 `.Ancestors` 遍历。

## 实测：参数必须是 Page

`InSection` 的签名写作 `PAGE.InSection SECTION`，但实测**传字符串恒为 `false`**，必须传 Page 对象。同一个页面 `/docs/guide/alpha/` 上的逐条结果：

传入|结果
:--|:--
`(.Site.GetPage "/docs/guide")`（当前 section）|`true`
`(.Site.GetPage "/docs/guide/beta")`（同 section 的兄弟页）|`true`
页面自身（`.`）|`true`
`(.Site.GetPage "/docs")`|`false`
`(.Site.GetPage "/")`|`false`
`(.Site.GetPage "/posts")`|`false`
`"docs"`|`false`
`"/docs"`|`false`
`"guide"`|`false`
`"/docs/guide"`|`false`
`""`|`false`

规律：**当参数页面的「当前 section」与当前页的「当前 section」相同，结果为 `true`**。字符串没有「当前 section」，所以永远为 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构见上。

| 调用位置与参数 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面调用、参数为当前 section 页 | `true` | 否 |
| 页面调用、参数为同 section 的兄弟页 | `true` | 否 |
| 页面调用、参数为页面自身 | `true` | 否 |
| 页面调用、参数为上层 / 其它 section | `false` | 否 |
| 参数为任意字符串 | `false` | 否 |
| 首页、section 页调用（参数为自身） | `true` | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `{{ if .InSection "docs" }}` 永远不成立 | 字符串参数恒为 `false` | 传 Page：`{{ with .Site.GetPage "/docs" }}{{ $.InSection . }}{{ end }}`，或改用 `IsDescendant` |
| 没报错但结果不对 | 以为它能判断「在当前 section 之下」 | 它比较的是**当前 section 是否相同** | 「在某 section 之下」用 [`IsDescendant`](/methods/page/isdescendant/) |
| 没报错但结果不对 | 在 `with` 块里写成 `.InSection .`，结果变成 `true` | `with` 改变了上下文，比较的是 section 与自身 | 用 `$` 引用外层页面（上游「理解上下文」一节） |
| 想筛页面 | `where .Pages "InSection" …` 无结果 | 它不是字段，不能这样筛 | 用 `where .Pages "Section" "docs"` |

更多排查入口见[故障排查](/troubleshooting/)。

[`else`]: /functions/go-template/else/
[`with`]: /functions/go-template/with/
