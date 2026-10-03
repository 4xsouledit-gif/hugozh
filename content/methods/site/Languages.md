+++
title = "Languages"
linkTitle = "Languages"
description = "返回所有站点的语言对象集合，按语言权重排序。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/site/languages/"

[params.functions_and_methods]
signatures = ["SITE.Languages"]
returnType = "langs.Languages"
+++

## 这一页解决什么问题

**（0.156.0 起弃用）**

详见[详情](https://discourse.gohugo.io/t/56732)。

`Languages` 返回项目里**定义的语言对象集合**，按语言权重升序排列。它和 [`Site.Language`](/methods/site/language/) 的关系是「集合」与「当前项」：前者用来列语言，后者用来取当前站点的语言。

**上游未说明替代方法**：上游页面只给出上面这个弃用链接，没有点名替代品。如果你需要站点集合，用 [`hugo.Sites`](/functions/hugo/sites/) 或 [`Site.Sites`](/methods/site/sites/)；如果确实需要语言对象集合，`.Site.Languages` 在 0.167.0 实测仍可用，但应视为随时可能被移除。

## 什么时候用，什么时候别用

**该用**：

- 语言切换器需要「全部语言 + 各语言 weight」；此时也可改查 [`hugo.Sites`](/functions/hugo/sites/) 得到站点集合；
- 临时排查：确认项目到底定义了哪些语言、顺序如何。

**别用**：

- 新代码不要依赖这个已弃用的方法；
- 想取站点标题/首页链接 → 遍历 [`hugo.Sites`](/functions/hugo/sites/) 后读每个站点的 `.Title`、`.Home.RelPermalink`；
- 想取当前语言 → 用 [`Site.Language`](/methods/site/language/)。

## 完整示例（实测）

多语言站点（`[languages.de]` weight 1、`[languages.en]` weight 2）里：

```go-html-template {file="layouts/index.html"}
<ul>
  {{ range .Site.Languages }}
    <li>{{ .Name }}（weight {{ .Weight }}）</li>
  {{ end }}
</ul>
```

实测输出为：

```html
<ul>
  <li>de（weight 1）</li>
  <li>en（weight 2）</li>
</ul>
```

**你应当看到什么**：顺序是 weight 升序（`de` 在 `en` 前），与配置文件的书写顺序无关；单语言站点里这个集合只有一项。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；单语言站点与 2 语言站点分别测量。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单语言项目 | 长度为 1 的集合（实测 `len` → 1） | 否 |
| 2 语言项目 | `len` → 2，按 `weight` 升序 | 否 |
| 未配置 `weight` | 仍返回集合，顺序按回退规则（本页不展开） | 否 |
| 弃用状态 | 0.156.0 起弃用；0.167.0 实测仍可用 | 否 |
| 返回值类型 | `langs.Languages` | 否 |
