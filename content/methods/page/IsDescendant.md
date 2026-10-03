+++
title = "IsDescendant"
linkTitle = "IsDescendant"
description = "报告 PAGE1 是否为 PAGE2 的后代。"
date = 2026-10-02
weight = 300
source = "https://gohugo.io/methods/page/isdescendant/"

[params.functions_and_methods]
signatures = ["PAGE1.IsDescendant PAGE2"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsDescendant` 回答「PAGE1 是不是 PAGE2 的后代」。判断「当前页是否在某个栏目之下」——例如给栏目内的文章加不同版式——就用它；它与 [`IsAncestor`](/methods/page/isancestor/) 是同一关系的两个方向。

## 什么时候用，什么时候别用

**该用**：

- 判断「当前页是否位于某个 section 之下」（含更深层级）；
- 做继承语义（栏目设置是否作用于本页）。

**别用**：

- 判断「是否属于**同一层** section」→ 用 [`InSection`](/methods/page/insection/)（注意它传 Page，不传字符串）；
- 想拿祖先页面本身 → 用 [`Ancestors`](/methods/page/ancestors/)；
- 只是想看路径前缀 → 比较 `.RelPermalink` 字符串更直观，但跨语言/别名时不如本方法可靠。

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
  {{ $.IsDescendant . }} → true
{{ end }}

{{ with .Site.GetPage "/auctions" }}
  {{ $.IsDescendant . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11" }}
  {{ $.IsDescendant . }} → false
{{ end }}

{{ with .Site.GetPage "/auctions/2023-11/auction-2" }}
  {{ $.IsDescendant . }} → false
{{ end }}
```

上面的示例中，我们用 [`with`][] 语句做防御式编码：页面不存在时不输出任何内容。再加上一个 [`else`][] 分支，就可以报告错误：

```go-html-template
{{ $path := "/auctions/2023-11" }}
{{ with .Site.GetPage $path }}
  {{ $.IsDescendant . }} → true
{{ else }}
  {{ errorf "Unable to find the section with path %s" $path }}
{{ end }}
  ```

## 理解上下文

在 `with` 块内部，[上下文](g)（即点号）是该 section 的 `Page` 对象，而不是传入模板的那个 `Page` 对象。如果写成下面这样：

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ .IsDescendant . }} → true
{{ end }}
```

渲染 `auction-1` 页面时结果就是错的，因为这是把 section 页面与它自身作比较。

> [!NOTE]
> 用 `$` 取得传入模板的上下文。

```go-html-template
{{ with .Site.GetPage "/auctions" }}
  {{ $.IsDescendant . }} → true
{{ end }}
```

> [!NOTE]
> 对任何编写模板代码的人来说，透彻理解上下文都至关重要。

## 完整示例：判断当前页是否在某个栏目之下

最小站点：`content/docs/guide/alpha.md`（页面），逐层的 `content/docs/guide/_index.md`、`content/docs/_index.md`，另有 `content/posts/`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ $currentPage := . }}
{{ with .Site.GetPage "/docs" }}{{ $.IsDescendant . }} → true{{ end }}
{{ with .Site.GetPage "/posts" }}{{ $.IsDescendant . }} → false{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，在 `/docs/guide/alpha/` 上输出：

```html
true → true
false → false
```

**你应当看到什么**：即使页面在 `/docs/guide/`（更深一层），判断「是否在 `/docs` 之下」依然是 `true`——这正是它与 `InSection` 的区别：`InSection` 在同样场景下为 `false`（它比较的是同一层）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；结构见上；`/docs`、`/docs/guide` 为 section 页。

| 比较 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面 `alpha` 是否为 `/docs` 的后代 | `true` | 否 |
| 页面 `alpha` 是否为 `/posts` 的后代 | `false` | 否 |
| 页面是否为自己的后代（`.IsDescendant .`） | `false` | 否 |
| section 页 `/docs/guide`、`/docs` 是否为首页的后代 | `true` | 否 |
| 参数不是 Page（字符串等） | `false`（不报错） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 判断「是否在栏目下」却用了 `InSection` | `InSection` 只比较同一层 | 深层判断用 `IsDescendant` |
| 没报错但结果不对 | 结果恒为 `false` | 方向写反，或参数传了字符串 | 用 `子页面.IsDescendant 祖先页`，参数取 Page |
| 没报错但结果不对 | 同层页面之间判断为 `false` | 同层不是后代关系 | 同层用 `InSection` |
| 没报错但结果不对 | 在 `with` 块里上下文弄错 | `with` 改变了点号 | 用 `$` 引用外层页面（上游「理解上下文」一节） |

更多排查入口见[故障排查](/troubleshooting/)。

[`else`]: /functions/go-template/else/
[`with`]: /functions/go-template/with/
