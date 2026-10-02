+++
title = "MainSections"
linkTitle = "MainSections"
description = "返回项目配置中定义的主要 section 名称切片，若未定义则回退到包含页面最多的顶层 section。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/site/mainsections/"

[params.functions_and_methods]
signatures = ["SITE.MainSections"]
returnType = "[]string"
+++

## 这一页解决什么问题

首页要列「主要栏目」时，最难的是**不知道栏目叫什么**：主题作者不能把 `books`、`films` 写死，而站点的 section 名千差万别。`MainSections` 给出一条两边都能接受的规则：

- 站点配置里写了 `mainSections` → 原样返回这个列表；
- 没写 → 自动返回**页面最多的那个顶层 section**（返回的是 section 名称字符串，不是页面对象）。

于是主题可以照常写首页列表，用户想调整主栏目时只改配置。

## 什么时候用，什么时候别用

**该用**：

- 首页/侧栏的「最新文章」「主要栏目」列表，且要能在不同站点间通用；
- 需要「按 section 名筛选页面集合」时，把结果交给 [`where`](/functions/collections/where/) 的 `in` 运算符。

**别用**：

- 想遍历所有顶层 section → 用 [`Site.Sections`](/methods/site/sections/)（返回页面对象集合，能拿 `.Title`、`.RelPermalink`）；
- 想筛某一个固定 section → 直接 `where .Site.RegularPages "Section" "eq" "books"`，不必绕道配置；
- 想按内容自动排序取「最热」→ `MainSections` 只看**页面数量**，不做权重、日期或人工排序。

## 用法

项目配置：

```toml
mainSections = ['books','films']
```

模板：

```go-html-template
{{ .Site.MainSections }} → [books films]
```

如果项目配置中没有定义 `mainSections`，这个方法返回的切片只包含一个元素——即包含页面最多的顶层 section。

在如下内容结构中，`films` section 包含的页面最多：

```tree
content/
├── books/
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── film-1.md
│   ├── film-2.md
│   └── film-3.md
└── _index.md
```

模板：

```go-html-template
{{ .Site.MainSections }} → [films]
```

制作主题时，与其在首页列出最相关页面时把 section 名称写死，不如指导用户在他们的项目配置中设置 `mainSections`。

这样你的 _home_ 模板就可以这样写：

```go-html-template {file="layouts/home.html"}
{{ range where .Site.RegularPages "Section" "in" .Site.MainSections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例（实测）

最小站点里有 `books`（4 页）与 `films`（3 页）两个 section，配置 `mainSections = ['books','films']`。home 模板：

```go-html-template {file="layouts/index.html"}
<p>主栏目：{{ .Site.MainSections }}</p>
{{ range where .Site.RegularPages "Section" "in" .Site.MainSections }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

Hugo 渲染为（`range` 留下的空行已省略）：

```html
<p>主栏目：[books films]</p>

  <h2><a href="/films/film-3/">Film Three</a></h2>

  <h2><a href="/films/film-2/">Film Two</a></h2>

  <h2><a href="/films/film-1/">Film One</a></h2>

  <h2><a href="/books/pride-and-prejudice/">Pride and Prejudice</a></h2>

  <h2><a href="/books/jamaica-inn/">Jamaica Inn</a></h2>

  <h2><a href="/books/death-on-the-nile/">Death on the Nile</a></h2>

  <h2><a href="/books/and-then-there-were-none/">And Then There Were None</a></h2>
```

去掉配置里的 `mainSections` 后重跑（同一份内容），实测：

```html
<p>主栏目：[films]</p>

  <h2><a href="/films/film-1/">Film 1</a></h2>

  <h2><a href="/films/film-2/">Film 2</a></h2>

  <h2><a href="/films/film-3/">Film 3</a></h2>
```

只渲染了 `films` 下的 3 页——因为回退规则选中了页面最多的顶层 section。

**你应当看到什么**：`where … "in" .Site.MainSections` 里的 `in` 是**成员比较**，左侧 section 名只要出现在右侧切片里就命中；因此配置多个 section 时会同时列出它们，顺序由页面集合的默认排序决定，而不是按 `mainSections` 里的书写顺序。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，`books` 4 页、`films` 3 页，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 配置了 `mainSections = ['books','films']` | `[books films]`（字符串切片） | 否 |
| 未配置 `mainSections` | `[films]`——页面最多的顶层 section，只有一项 | 否 |
| 两个 section 页面数相同 | 由 Hugo 的回退规则决定（本页不展开） | 否 |
| 站点没有任何 section | `[]`（空切片，`range` 不产生输出） | 否 |
| 配置里写了不存在的 section 名 | 原样返回该名字（不做校验），`where` 筛出空集合 | 否 |
| `printf "%T" .Site.MainSections` | `[]string` | 否 |
