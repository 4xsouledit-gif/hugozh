+++
title = "AllPages"
linkTitle = "AllPages"
description = "返回所有语言中所有页面的集合。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/site/allpages/"

[params.functions_and_methods]
signatures = ["SITE.AllPages"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

**（0.156.0 起弃用）**

详见[详情](https://discourse.gohugo.io/t/56732)。

按上游的描述，`AllPages` 返回「**所有语言**中所有页面的集合」——注意是跨语言，而 [`Site.Pages`](/methods/site/pages/) 只给当前语言。**上游未说明替代方法**：页面只给出上面这个弃用链接，没有点名替代品。实测 0.167.0 中它仍可用，且行为与 `Site.Pages` 的关系随项目语言数而变（见下）。

## 什么时候用，什么时候别用

**该用**：

- 几乎没有场景应在新模板里使用它；
- 需要当前语言的页面集合 → 用 [`Site.Pages`](/methods/site/pages/)；
- 需要文章列表 → 用 [`Site.RegularPages`](/methods/site/regularpages/)；
- 需要跨语言/跨维度遍历 → 用 [`hugo.Sites`](/functions/hugo/sites/) 逐个站点再取其页面集合。

**别用**：

- 想当然认为 `.Site.AllPages` 等于 `.Site.Pages`：**单语言项目里如此，多语言项目里前者是后者的语言数倍**；
- 新代码依赖它：0.156.0 起已弃用。

## 完整示例（实测）

同一份模板分别放在单语言站点与 2 语言站点中：

```go-html-template {file="layouts/index.html"}
<p>AllPages：{{ len .Site.AllPages }}</p>
<p>Pages：{{ len .Site.Pages }}</p>
<p>长度相等：{{ eq (len .Site.AllPages) (len .Site.Pages) }}</p>
```

实测结果：

| 项目 | `.Site.AllPages` | `.Site.Pages` | 是否相等 |
| --- | --- | --- | --- |
| 单语言站点（18 个页面） | 18 | 18 | `true` |
| 2 语言站点（每语言 3 个页面） | 6 | 3 | `false` |

并且单语言站点里两者的**内容也逐项一致**（实测 `eq (len …) (len …)` → `true`，列表顺序与元素相同）。

**你应当看到什么**：多语言项目的 `AllPages` 是**所有语言页面之和**，而 `Pages` 只有当前语言。这也解释了它为什么被弃用——想拿「当前语言的页面」却拿到全语言集合，几乎总是错的；需要跨语言时应当显式遍历 `hugo.Sites`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；单语言站点与 2 语言站点各测一次。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 单语言站点 | 与 `.Site.Pages` 等长且内容一致（实测 18 = 18） | 否 |
| 2 语言站点 | 跨语言合计（实测 6），大于 `.Site.Pages`（3） | 否 |
| 没有任何内容 | 仍包含首页与自动生成的分类法页面（与 `Site.Pages` 的构成相同） | 否 |
| `printf "%T" .Site.AllPages` | `page.Pages` | 否 |
| 弃用状态 | 0.156.0 起弃用；0.167.0 实测仍可用 | 否 |
