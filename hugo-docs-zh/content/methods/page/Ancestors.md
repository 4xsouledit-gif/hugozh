+++
title = "Ancestors"
linkTitle = "Ancestors"
description = "返回 Page 对象集合，给定页面的每一级祖先 section 各对应一个对象。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/page/ancestors/"

[params.functions_and_methods]
signatures = ["PAGE.Ancestors"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

深层页面（`/docs/guide/alpha/`）常常要回答「我在哪」：画面包屑、给祖先 section 加高亮、把当前页的 section 链交给 `where` 过滤。`Ancestors` 就是这条链——从**最近的父级**一路到首页。

## 什么时候用，什么时候别用

**该用**：

- 面包屑导航：取 `.Ancestors.Reverse` 得到「首页 → … → 当前页」的顺序；
- 给所有祖先 section 打标记（导航高亮）；
- 想一次拿到从父级到根的完整 Page 集合。

**别用**：

- 只要**直接父级**一个页面 → 用 `.Parent`，不必遍历；
- 要当前页面所在的**最内层 section** → 用 [`CurrentSection`](/methods/page/currentsection/)；要最外层 → [`FirstSection`](/methods/page/firstsection/)；
- 要某个 section 的子级列表 → 用 `.Pages` / `.Sections`：`Ancestors` 向上走，不向下走。

## 用法

内容结构如下：

```tree
content/
├── auctions/
│   ├── 2023-11/
│   │   ├── _index.md     <-- front matter: weight = 202311
│   │   ├── auction-1.md
│   │   └── auction-2.md
│   ├── 2023-12/
│   │   ├── _index.md     <-- front matter: weight = 202312
│   │   ├── auction-3.md
│   │   └── auction-4.md
│   ├── _index.md         <-- front matter: weight = 30
│   ├── bidding.md
│   └── payment.md
├── books/
│   ├── _index.md         <-- front matter: weight = 10
│   ├── book-1.md
│   └── book-2.md
├── films/
│   ├── _index.md         <-- front matter: weight = 20
│   ├── film-1.md
│   └── film-2.md
└── _index.md
```

模板如下：

```go-html-template
{{ range .Ancestors }}
  <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
{{ end }}
```

在 2023 年 11 月的拍卖页面上，Hugo 渲染出：

```html
<a href="/auctions/2023-11/">Auctions in November 2023</a>
<a href="/auctions/">Auctions</a>
<a href="/">Home</a>
```

上面的例子中可以看到，Hugo 按由近及远的顺序排列祖先。这样实现面包屑导航就很简单：

```go-html-template
<nav aria-label="breadcrumb" class="breadcrumb">
  <ol>
    {{ range .Ancestors.Reverse }}
      <li>
        <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
      </li>
    {{ end }}
    <li class="active">
      <a aria-current="page" href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
    </li>
  </ol>
</nav>
```

再配合一些 CSS，上面的代码会渲染出类似下面的效果，其中每段面包屑都链接到对应页面：

```text
Home > Auctions > Auctions in November 2023 > Auction 1
```

## 完整示例：面包屑导航

最小站点：`content/docs/guide/alpha.md`（页面），以及逐层的 `content/docs/guide/_index.md`、`content/docs/_index.md`、`content/_index.md`。把下面的代码放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<nav aria-label="breadcrumb"><ol>
{{ range .Ancestors.Reverse }}<li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>{{ end }}
<li class="active"><a aria-current="page" href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
</ol></nav>
```

`hugo --source <站点目录> --ignoreCache` 构建后，`/docs/guide/alpha/` 渲染为：

```html
<nav aria-label="breadcrumb"><ol>
<li><a href="/">首页</a></li><li><a href="/docs/">文档</a></li><li><a href="/docs/guide/">指南</a></li>
<li class="active"><a aria-current="page" href="/docs/guide/alpha/">Alpha 页</a></li>
</ol></nav>
```

**你应当看到什么**：`.Ancestors.Reverse` 把「首页」放到最前；每一项都是**真正的 Page 对象**，所以 `.RelPermalink`、`.LinkTitle`、`.Kind` 都能直接用。不反转则得到「指南 → 文档 → 首页」。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；内容结构为 `content/docs/guide/alpha.md` 加逐层 `_index.md`。

| 调用位置 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面 `/docs/guide/alpha/` | `/docs/guide` → `/docs` → `/`（由近及远，共 3 项） | 否 |
| section 页 `/docs/guide/` | `/docs` → `/`（**不含自身**） | 否 |
| 顶层 section 页 `/docs/` | `/`（只有首页） | 否 |
| 首页 | 空切片，`range` 不输出 | 否 |
| 多语言站点 | 祖先按**当前语言**解析；译文缺少中间层 `_index.md` 时该层不会出现在链上 | 否 |
| 返回类型 | `page.Pages`（可用 `.Reverse`、`len`、`first`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 面包屑顺序颠倒，首页排最后 | `.Ancestors` 是「由近及远」 | 用 `.Ancestors.Reverse` |
| 没报错但结果不对 | 面包屑里没有当前页 | `Ancestors` 只含祖先，不含自身 | 循环之后单独加一项当前页（见上例） |
| 没报错但结果不对 | 译文页的层级「少了一层」 | 对应的 `_index.md` 没有译文，该层 section 页在当前语言下不存在 | 给中间层补 `_index.md` 译文，或接受层级差异 |
| 什么都没输出 | 首页上 `range .Ancestors` 空转 | 首页没有祖先，返回空切片 | 用 `if` 判断，或首页单独输出自己的标题 |

更多排查入口见[故障排查](/troubleshooting/)。
