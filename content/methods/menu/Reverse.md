+++
title = "Reverse"
linkTitle = "Reverse"
description = "返回给定菜单，并反转其条目的排序顺序。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/menu/reverse/"

[params.functions_and_methods]
signatures = ["MENU.Reverse"]
returnType = "navigation.Menu"
+++

## 这一页解决什么问题

菜单默认按 `weight` 从小到大排，但需求常常正好相反：页脚想让最新/最重的栏目排在最上面，侧栏想按名字倒序（Z–A），「取 weight 最大的两个」也需要先把顺序倒过来。

`Reverse` 就是这一步：返回同一个菜单，但把当前顺序整个翻转。它本身**不排序**——翻转的是前一步给出的顺序，所以用法几乎总是「先排好，再 Reverse」。

## 什么时候用，什么时候别用

**该用**：

- 想要降序：`.ByWeight.Reverse`、`.ByName.Reverse`；
- 想取尾部几个：`.ByName.Reverse` 后接 [`Limit`](/methods/menu/limit/)，等价于「取最后 N 个」（实测 `.ByWeight.Reverse.Limit 2` 得到 weight 最大的两个）。

**别用**：

- 想要「按某字段降序」且不接受整体颠倒 → 用 [`sort`](/functions/collections/sort/) 函数的 `"desc"` 参数：`sort site.Menus.main "Name" "desc"`（实测与 `.ByName.Reverse` 结果一致）；
- 想只取最后 N 个、且不关心其余顺序 → 用 [`last`](/functions/collections/last/) 函数更直白；
- 想改变原始菜单的顺序 → `Reverse` 返回新菜单，原菜单不变（实测）；要「改」就得把结果赋给变量再用。

## 用法

`Reverse` 方法返回给定菜单，并反转其条目的排序顺序。

请看下面的菜单定义：

```toml
[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 10

[[menus.main]]
name = 'About'
pageRef = '/about'
weight = 20

[[menus.main]]
name = 'Contact'
pageRef = '/contact'
weight = 30
```

要按 name 降序排序条目：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByName.Reverse }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测）：

```html
<ul>
  <li><a href="/services/">Services</a></li>
  <li><a href="/contact">Contact</a></li>
  <li><a href="/about/">About</a></li>
</ul>
```

## 完整示例：Reverse 不改动原菜单

```go-html-template
{{ $rev := site.Menus.main.ByName.Reverse }}
原菜单：  {{ range site.Menus.main }}{{ .Name }},{{ end }}
反转后：  {{ range $rev }}{{ .Name }},{{ end }}
再读原菜单：{{ range site.Menus.main }}{{ .Name }},{{ end }}
```

实测输出：

```text
原菜单：  Services,About,Contact,
反转后：  Services,Contact,About,
再读原菜单：Services,About,Contact,
```

**你应当看到什么**：第三行和第一行完全一样——`Reverse` 返回的是一份新菜单，`site.Menus.main` 本身没有被改动。所以每次都要把结果交给 `range` 或存进变量，不能指望「反转一次之后一直生效」。

也可以和 [`sort`](/functions/collections/sort/) 函数对照，两者结果一致：

```go-html-template
{{ range sort site.Menus.main "Name" "desc" }}{{ .Name }},{{ end }} → Services,Contact,About,
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 3 个条目 | 顺序完全颠倒 | 否 |
| 1 个条目 | 原样返回 | 否 |
| 空菜单 | 空菜单 | 否 |
| 菜单不存在（`site.Menus.nope.Reverse`） | 空；`range` 不进入循环 | 否 |
| 连续两次 `.Reverse.Reverse` | 回到原顺序 | 否 |
| 对原菜单的副作用 | 无（实测：反转后原菜单顺序不变） | 否 |
| `.ByName.Reverse` 与 `.ByWeight.Reverse` | 结果可能不同——它们反转的是各自排序后的顺序 | 否 |
| 返回类型 | `navigation.Menu` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 写了 `.Reverse`，页面顺序却没变 | `Reverse` 返回新菜单，没有赋值给任何变量，`range` 用的还是原菜单 | 写成 `{{ range site.Menus.main.Reverse }}` 或先 `{{ $m := site.Menus.main.Reverse }}` |
| 没报错但结果不对 | 倒序结果和预期的不一样 | `Reverse` 只翻转上一步的顺序；上一步若是默认顺序，得到的是 weight 降序 | 先确定排序方法：`.ByName.Reverse` 与 `.ByWeight.Reverse` 含义不同 |
| 没报错但结果不对 | 只想取最后两条，结果拿到前两条 | 忘记先 `Reverse` 再 [`Limit`](/methods/menu/limit/) | 写成 `.ByName.Reverse.Limit 2`，或改用 [`last`](/functions/collections/last/) |

更多排查入口见[故障排查](/troubleshooting/)。
