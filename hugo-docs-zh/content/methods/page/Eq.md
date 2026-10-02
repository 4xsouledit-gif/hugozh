+++
title = "Eq"
linkTitle = "Eq"
description = "报告两个 Page 对象是否相等。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/page/eq/"

[params.functions_and_methods]
signatures = ["PAGE1.Eq PAGE2"]
returnType = "bool"
+++

## 这一页解决什么问题

`Eq` 回答「这两个 Page 对象是不是同一个页面」。看起来 `eq` 就够了，但 Go 模板的 `eq` 比较页面对象时不可靠，判断**页面身份**必须用 `.Eq`。最典型的场景是「列出同 section 的页面，但排除当前页」。

## 什么时候用，什么时候别用

**该用**：

- 在 `range` 里排除当前页（同栏目其它文章、相关文章、「返回列表」）；
- 判断用不同路径取到的 Page 是否指向同一页面。

**别用**：

- 比较**字符串**（URL、标题）→ 用 `eq`。`.Eq "x"` 实测恒为 `false`：不报错，但你什么也筛不出来；
- 比较页面字段 → 用 `eq .Title …`、`eq .RelPermalink …`；
- 只是为了排序去重 → `.Pages` 等集合本身已去重，不需要 `.Eq`。

## 用法

在这个刻意构造的例子中，我们列出当前 section 中除当前页面之外的所有页面。

```go-html-template {file="layouts/page.html"}
{{ $currentPage := . }}
{{ range .CurrentSection.Pages }}
  {{ if not (.Eq $currentPage) }}
    <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
  {{ end }}
{{ end }}
```

## 完整示例：列出同 section 的其它页面

最小站点：`content/docs/guide/` 下有 `alpha.md`、`beta.md`、`gamma.md`、`delta.md`、`eqtest.md` 与叶子包 `bundle/index.md`，各自带 `date`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ $currentPage := . }}
<ul>
{{ range .CurrentSection.RegularPages }}{{ if not (.Eq $currentPage) }}<li>{{ .LinkTitle }}</li>{{ end }}{{ end }}
</ul>
```

`hugo --source <站点目录> --ignoreCache` 构建后，在 `alpha` 页面上输出：

```html
<ul>
<li>Eq Test</li><li>Delta</li><li>Gamma</li><li>Beta</li><li>叶子包</li>
</ul>
```

**你应当看到什么**：列表里没有当前页 `Alpha 页`；其余顺序由 `.CurrentSection.RegularPages` 的默认排序（`date` 从新到旧）决定，没有 `date` 的叶子包排在最后。

三种「相等」的真值（同一个站点实测）：

```go-html-template
{{ .Eq . }} → true
{{ .Eq (.Site.GetPage "/docs/guide/beta") }} → false
{{ .Eq "x" }} → false
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha` 位于 `/docs/guide/`，`beta` 与它同 section。

| 比较对象 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面自身 | `true` | 否 |
| 同 section 的另一个页面 | `false` | 否 |
| 字符串（如 `"x"`） | `false` | 否 |
| `nil` | `false` | 否 |
| 数字（如 `1`） | `false` | 否 |
| 返回类型 | `bool` | 否 |

> [!IMPORTANT]
> 传错类型**不会报错**，只是恒为 `false`。所以「筛不出东西」时，先确认传进去的是不是 Page 对象。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 `.Eq "some/path"` 排除，一个也没排除掉 | `.Eq` 比较 Page 对象，字符串恒为 `false` | 先用 `.Site.GetPage` 取到 Page，或改用 `.RelPermalink` 比较 |
| 没报错但结果不对 | 列表里混进了当前页 | 只比较了标题或 URL，没比对象 | 用 `not (.Eq $currentPage)` |
| 没报错但结果不对 | 在 `with` / `range` 里 `.Eq` 的「当前页」不对 | 点号（上下文）被改变 | 循环前存变量：`{{ $currentPage := . }}`，循环内用 `$` 或该变量 |

更多排查入口见[故障排查](/troubleshooting/)。

