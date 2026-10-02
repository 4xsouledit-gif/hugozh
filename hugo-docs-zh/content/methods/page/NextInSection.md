+++
title = "NextInSection"
linkTitle = "NextInSection"
description = "返回某个 section 中相对于给定页面的下一个常规页面。"
date = 2026-10-02
weight = 450
source = "https://gohugo.io/methods/page/nextinsection/"

[params.functions_and_methods]
signatures = ["PAGE.NextInSection"]
returnType = "page.Page"
+++

## 这一页解决什么问题

[`.Next`](/methods/page/next/) 会在**全站**常规页面里找「下一跳」，而 `.NextInSection` 把它限制在当前页面所属的 **section 内部**：只在该 section 的常规页面里找，不会跨到别的 section。

「当前 section」指页面的直接父 section。`/docs/guide/page-a.md` 的 section 是 `/docs/guide`，不是 `/docs`——嵌套 section 之间不会互相穿透。这一点和 `.Next` 的「全站」语义正好互补。

## 什么时候用，什么时候别用

**该用**：

- 系列文章（同一 section 内）的「上一篇 / 下一篇」，不希望导航跳出该系列；
- 需要和文章列表页的顺序一致的翻页体验——`.NextInSection`/`.PrevInSection` 所用的集合就是该 section 的常规页面。

**别用**：

- 想让全站文章串成一条线 → 用 [`.Next`](/methods/page/next/)；
- 在 section 页、首页、taxonomy/term 页上想遍历页面 → 用 [`.Pages`](/methods/page/pages/) 或 [`.RegularPages`](/methods/page/regularpages/) 自己 `range`；
- 想要首页那种「第一篇 / 最后一篇」判断 → 用 `with` 判空就够，不需要额外方法。

**两者怎么选**（实测对照，同一个页面 `/posts/post-2/`）：

| 方法 | 实测结果 | 含义 |
| --- | --- | --- |
| `.Next` | `/docs/ref/` | 全站降序集合里排在后面的一页（跳出了 `/posts/`） |
| `.NextInSection` | `/posts/post-1/` | 仅 `/posts/` 内部 |
| `.Prev` | `/docs/guide/page-b/` | 全站集合 |
| `.PrevInSection` | `/posts/post-3/` | 仅 `/posts/` 内部 |

## 排序规则

Hugo 按以下排序层级对当前 section 的常规页面排序，据此确定_下一个_和_上一个_页面：

字段|优先级|排序方向
:--|:--|:--
[`weight`][]|1|降序
[`date`][]|2|降序
[`linkTitle`][]|3|降序
[`path`][]|4|降序

用于确定_下一个_和_上一个_页面的这个已排序页面集合独立于其他页面集合，因此可能导致意外的行为。

例如，有如下内容结构：

```tree
content/
├── pages/
│   ├── _index.md
│   ├── page-1.md   <-- front matter: weight = 10
│   ├── page-2.md   <-- front matter: weight = 20
│   └── page-3.md   <-- front matter: weight = 30
└── _index.md
```

以及这些模板：

```go-html-template {file="layouts/section.html"}
{{ range .Pages.ByWeight }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ with .PrevInSection }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .NextInSection }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

当你访问 page-2 时：

- `PrevInSection` 方法指向 page-3
- `NextInSection` 方法指向 page-1

要反转_下一个_和_上一个_的含义，你可以修改[项目配置][]中的排序方向，或者使用 `Pages` 对象上的 [`Next`][] 和 [`Prev`][] 方法以获得更大的灵活性。

## 示例

写出防御性代码，先检查页面是否存在：

```go-html-template
{{ with .PrevInSection }}
  <a href="{{ .RelPermalink }}">Previous</a>
{{ end }}

{{ with .NextInSection }}
  <a href="{{ .RelPermalink }}">Next</a>
{{ end }}
```

## 完整示例：只在系列内部翻页

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<nav>
  {{ with .PrevInSection }}<a href="{{ .RelPermalink }}">Prev: {{ .LinkTitle }}</a>{{ end }}
  {{ with .NextInSection }}<a href="{{ .RelPermalink }}">Next: {{ .LinkTitle }}</a>{{ end }}
</nav>
```

实测（测试站 `/posts/` 内 weight 10/20/30/60/70/80/90/100），访问 `/posts/post-2/`（`weight = 20`）时渲染为：

```html
<nav>
  <a href="/posts/post-3/">Prev: 第三篇</a>
  <a href="/posts/post-1/">Next: 第一篇</a>
</nav>
```

对照 `/docs/ref/`（它是 `/docs/` 里唯一的常规页面）：两个方法都返回 `nil`，上面的模板只渲染出空的 `<nav></nav>`。

**你应当看到什么**：`PrevInSection` 指向 weight 更大的 `post-3`、`NextInSection` 指向 weight 更小的 `post-1`——顺序是**降序**的，和默认升序的 `.Pages` 列表方向相反。这正是上游说「可能导致意外的行为」的原因。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| section 内 weight 最大的页面 | `.PrevInSection` 为 `nil`（实测 `/docs/guide/page-c/`） | 否 |
| section 内 weight 最小的页面 | `.NextInSection` 为 `nil`（实测 `/docs/guide/page-a/`） | 否 |
| section 内只有一个常规页面 | 两个方法都为 `nil`（实测 `/docs/ref/`） | 否 |
| section 页 / 首页 / taxonomy / term 页 | 全部为 `nil`（实测 `/posts/`、`/docs/guide/`、`/tags/alpha/`） | 否 |
| `{{ .NextInSection.RelPermalink }}` 直接取值 | —— | 是：`nil pointer evaluating page.Page.RelPermalink` |
| 嵌套 section | 只在本层 section 内查找，不穿透父/子 section（实测 `/docs/guide/page-a/` 的 `PrevInSection` 是 `/docs/guide/page-b/`，不会是 `/docs/ref/`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Next`]: /methods/pages/next/
[`Prev`]: /methods/pages/prev/
[`date`]: /methods/page/date/
[`linkTitle`]: /methods/page/linktitle/
[`path`]: /methods/page/path/
[`weight`]: /methods/page/weight/
[项目配置]: /configuration/page/
