+++
title = "Section"
linkTitle = "Section"
description = "返回给定页面所属顶层 section 的名称。"
date = 2026-10-02
weight = 740
source = "https://gohugo.io/methods/page/section/"

[params.functions_and_methods]
signatures = ["PAGE.Section"]
returnType = "string"
+++

## 这一页解决什么问题

`.Section` 返回页面所属的**顶层 section 名称**（字符串，不含斜杠）。最常见的用途是配合 [`where`](/functions/collections/where/) 按栏目筛选页面：

```go-html-template
{{ range where site.RegularPages "Section" "lessons" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

注意两点：它给的是**顶层**名字（`/docs/guide/page-a.md` 得到 `docs`，不是 `guide`），而且对列表页（section/taxonomy/term）也有值（实测：`/docs/guide/` 得到 `docs`，term 页 `/tags/alpha/` 得到 `tags`）。

## 什么时候用，什么时候别用

**该用**：

- 按栏目筛选/分组页面（`where … "Section" …`）；
- 需要「这个页面属于哪个大栏目」的字符串（不是 Page 对象）。

**别用**：

- 想要 section 的 **Page 对象**（要 `RelPermalink`、`Title`）→ 用 [`.CurrentSection`](/methods/page/currentsection/) 或 [`.Parent`](/methods/page/parent/)；
- 想要直接的父 section → 用 [`.Parent`](/methods/page/parent/)；
- 想要顶层 section 页 → 用 [`.FirstSection`](/methods/page/firstsection/)；
- 想按「内容类型」筛 → 用 [`.Type`](/methods/page/type/)（写了 `type` front matter 时两者会不同，见下）。

**`.Section` 与 `.Type` 的差别（上游）**：默认两者相同（都由顶层目录推导）；一旦某页 front matter 里写了 `type`，按 `Type` 筛出的集合就会与按 `Section` 筛出的不同。实测本站 `/posts/typed-page.md`（`type = "books"`）：`.Section` 为 `posts`，`.Type` 为 `books`。

## 用法

[section（内容区块）](/quick-reference/glossary/section/)

内容结构如下：

```tree
content/
├── lessons/
│   ├── math/
│   │   ├── _index.md
│   │   ├── lesson-1.md
│   │   └── lesson-2.md
│   └── _index.md
└── _index.md
```

渲染 lesson-1.md 时：

```go-html-template
{{ .Section }} → lessons
```

上例中 “lessons” 就是顶层 section。

`Section` 方法常与 [`where`][] 函数搭配使用，用来构建页面集合。

```go-html-template
{{ range where .Site.RegularPages "Section" "lessons" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

这与把 [`Type`][] 方法与 `where` 函数搭配使用类似

```go-html-template
{{ range where .Site.RegularPages "Type" "lessons" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

不过，如果有一个或多个页面在前置元数据中定义了 `type` 字段，那么基于 `Type` 的页面集合会与基于 `Section` 的页面集合不同。

## 完整示例：只列某个栏目的页面

测试站结构：`/posts/`（顶层 section）、`/docs/`（其中还有子 section `/docs/guide/`）、`/tags/` 分类法。

模板：

```go-html-template {file="layouts/index.html"}
<ul>
  {{ range where site.RegularPages "Section" "posts" }}
    <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
  {{ end }}
</ul>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | `.Section` | 说明 |
| --- | --- | --- |
| `/posts/post-2/` | `posts` | 顶层 section |
| `/docs/guide/page-a/` | `docs` | **顶层**，不是 `guide` |
| `/docs/guide/`（section 页） | `docs` | 列表页也有值 |
| `/tags/alpha/`（term 页） | `tags` | 分类法名 |
| `/posts/typed-page/`（front matter `type = "books"`） | `posts` | `.Type` 才是 `books` |

**你应当看到什么**：`where … "Section" "posts"` 能一次选出 `/posts/` 下所有页面（含深层的），因为顶层 section 名对整棵子树都一样。若想按更细的目录筛选，用 `.Path` 或 `where … "Type"` 配合自定义 `type`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 常规页面 | 顶层 section 名（实测 `posts`、`docs`） | 否 |
| 嵌套 section 的页面 | 仍是**顶层**名（实测 `/docs/guide/page-a/` → `docs`） | 否 |
| section 页 | 顶层 section 名（实测 `/docs/guide/` → `docs`） | 否 |
| taxonomy / term 页 | 分类法名（实测 `/tags/alpha/` → `tags`） | 否 |
| front matter 写了 `type` | `.Section` 不受影响（仍是目录名），与 `.Type` 不同（实测） | 否 |
| 首页 | 本站未单独实测（首页不属于任何顶层 section，上游未说明具体返回值） | 否 |
| 返回类型 | `string`（不含斜杠、不含前后导斜杠） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Type`]: /methods/page/type/
[`where`]: /functions/collections/where/
