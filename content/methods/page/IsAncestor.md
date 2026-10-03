+++
title = "IsAncestor"
linkTitle = "IsAncestor"
description = "报告 PAGE1 是否为 PAGE2 的祖先。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/methods/page/isanancestor/"

[params.functions_and_methods]
signatures = ["PAGE1.IsAncestor PAGE2"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsAncestor` 回答「PAGE1 是不是 PAGE2 的祖先」。做面包屑、栏目高亮、权限或可见性继承时常用；它与 [`IsDescendant`](/methods/page/isdescendant/) 是**同一关系的两个方向**，与 [`Ancestors`](/methods/page/ancestors/) 的区别是：`Ancestors` 给出整条链，`IsAncestor` 只回答是或否。

## 什么时候用，什么时候别用

**该用**：

- 判断「当前栏目是不是这篇文章的祖先」（导航高亮）；
- 需要链式继承语义（父类的设置是否作用于子页面）。

**别用**：

- 想拿祖先页面本身 → 用 [`Ancestors`](/methods/page/ancestors/)，或直接父级用 `.Parent`；
- 想判断「两页是否同一层」→ 用 [`InSection`](/methods/page/insection/)；
- 想筛页面集合 → 先在 `range` 里取页面，再比较，`.IsAncestor` 不是字段。

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

渲染 `auctions` 页面时：

```go-html-template
{{ with .Site.GetPage "/" }}
  {{ $.IsAncestor . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions" }}
  {{ $.IsAncestor . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11" }}
  {{ $.IsAncestor . }} → true
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11/auction-2" }}
  {{ $.IsAncestor . }} → true
{{ end }}
```

上面的示例中，我们用 [`with`][] 语句做防御式编码：页面不存在时不输出任何内容。再加上一个 [`else`][] 分支，就可以报告错误：

```go-html-template
{{ $path := "/auctions/2023-11" }}
{{ with .Site.GetPage $path }}
  {{ $.IsAncestor . }} → true
{{ else }}
  {{ errorf "Unable to find the section with path %s" $path }}
{{ end }}
  ```

## 理解上下文

在 `with` 块内部，[上下文](g)（即点号）是该 section 的 `Page` 对象，而不是传入模板的那个 `Page` 对象。如果写成下面这样：

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ .IsAncestor . }} → true
{{ end }}
```

渲染 `auction-1` 页面时结果就是错的，因为这是把 section 页面与它自身作比较。

> [!NOTE]
> 用 `$` 取得传入模板的上下文。

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ $.IsAncestor . }} → true
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

## 完整示例：判断当前栏目是否为文章的祖先

最小站点：`content/docs/guide/alpha.md`（页面），逐层的 `content/docs/guide/_index.md`、`content/docs/_index.md`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ $currentPage := . }}
{{ with .Site.GetPage "/docs" }}{{ $.IsAncestor . }} → true{{ end }}
{{ with .Site.GetPage "/docs/guide" }}{{ $.IsAncestor . }} → true{{ end }}
{{ with .Site.GetPage "/posts" }}{{ $.IsAncestor . }} → false{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，在 `/docs/guide/alpha/` 上输出：

```html
true → true
true → true
false → false
```

**你应当看到什么**：`/docs` 与 `/docs/guide` 都是该页面的祖先（与 `Ancestors` 给出的链一致），`/posts` 不是。注意第二行是「拿 section 去判断文章」，方向不能反——反方向要用 `IsDescendant`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构 `content/docs/guide/alpha.md` 加逐层 `_index.md`。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| `/docs` 是否为 `alpha` 的祖先 | `true` | 否 |
| `/docs/guide` 是否为 `alpha` 的祖先 | `true` | 否 |
| `/posts` 是否为 `alpha` 的祖先 | `false` | 否 |
| 页面是否为自己的祖先（`.IsAncestor .`） | `false` | 否 |
| 参数不是 Page（字符串等） | `false`（不报错，与 `Eq` 同类行为） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 判断结果总是 `false` | 方向写反，或参数是字符串而不是 Page | 用 `祖先页.IsAncestor 子页面`；参数用 `.Site.GetPage` 取 Page |
| 没报错但结果不对 | 想找「父级页面」却拿到布尔值 | 它只回答是不是，不返回页面 | 要页面用 `Ancestors` / `.Parent` |
| 没报错但结果不对 | 在 `with` 块里上下文弄错 | `with` 改变了点号 | 用 `$` 引用外层页面（上游「理解上下文」一节） |
| 什么都是 true | 比较了同一层 section | 同层不是祖先关系，但若与 `InSection` 混用会误判 | 「同一层」用 `InSection`，祖先关系用 `IsAncestor` |

更多排查入口见[故障排查](/troubleshooting/)。

[`else`]: /functions/go-template/else/
[`with`]: /functions/go-template/with/
