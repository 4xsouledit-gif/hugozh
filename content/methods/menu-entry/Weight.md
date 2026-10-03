+++
title = "Weight"
linkTitle = "Weight"
description = "返回给定菜单条目的 `weight` 属性。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/menu-entry/weight/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Weight"]
returnType = "int"
+++

## 这一页解决什么问题

`weight` 决定条目在菜单里的先后，但菜单模板有时需要**把顺序值本身拿来用**：按数值过滤（只显示前一段的栏目）、给条目加 `data-weight`、调试「为什么这个排前面」。

`Weight` 方法就是取值。它的关键点是**回退**：条目自己没写 `weight` 时，会去条目的页面拿 `Weight`；页面也没有才是 `0`。也就是说，排序用的和这个方法返回的是同一个值（见 [`ByWeight`](/methods/menu/byweight/)）。

## 什么时候用，什么时候别用

**该用**：

- 按 `weight` 阈值过滤条目：`{{ if le .Weight 42 }}`；
- 把顺序带到前端（`data-weight`、`style="order:…"`）；
- 排查排序问题：打印 `.Weight` 看它到底取到了什么。

**别用**：

- 只是想排序 → 什么都不用写（默认就按 weight），或显式用 [`ByWeight`](/methods/menu/byweight/)；
- 想按 `weight` 取前 N 个 → 用 [`Limit`](/methods/menu/limit/)；取后 N 个 → [`Reverse`](/methods/menu/reverse/) + `Limit`；
- 想给**页面**排序 → 那是页面集合上的方法，不是菜单条目的。

## 用法

如果[自动][]定义菜单条目，`Weight` 方法返回该页面的 [`Weight`][]。

如果在[前置元数据][front matter]或[项目配置][]中定义菜单条目，`Weight` 方法返回 `weight` 属性，若不存在则回退到该页面的 `Weight`。

在这个刻意构造的示例中，我们按 weight 限制菜单条目的数量：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    {{ if le .Weight 42 }}
      <li><a href="{{ .URL }}">{{ .Name }}</a></li>
    {{ end }}
  {{ end }}
</ul>
```

## 完整示例：按 weight 阈值筛选

菜单 `threshold` 的三条权重分别是 5、42、100：

```toml
[[menus.threshold]]
name = 'Low'
pageRef = '/about'
weight = 5

[[menus.threshold]]
name = 'Mid'
pageRef = '/contact'
weight = 42

[[menus.threshold]]
name = 'High'
pageRef = '/services'
weight = 100
```

```go-html-template
<ul>
  {{ range .Site.Menus.threshold }}
    {{ if le .Weight 42 }}
      <li><a href="{{ .URL }}">{{ .Name }}</a></li>
    {{ end }}
  {{ end }}
</ul>
```

实测输出（`range` 与 `if` 留下的空行已省略）：

```html
<ul>
  <li><a href="/about/">Low</a></li>
  <li><a href="/contact/">Mid</a></li>
</ul>
```

**你应当看到什么**：`High`（100）被 `le .Weight 42` 排除，只剩两条。注意筛选**不改变顺序**——条目仍按 weight 排列；`if` 只是决定渲染哪几个。

再看回退行为（`main` 三条都写了 `weight`；`noweight` 的第一条只写 `pageRef = '/contact'`，该页面的 `weight` 是 `7`，第二条只写 `identifier`；`auto` 由页面前置元数据 `menus = ['auto']` 自动加入，页面 `weight` 是 `42`）：

```go-html-template
main：{{ range site.Menus.main }}{{ .Name }}={{ .Weight }},{{ end }}
noweight：{{ range site.Menus.noweight }}{{ .Name }}={{ .Weight }},{{ end }}
auto：{{ range site.Menus.auto }}{{ .Name }}={{ .Weight }},{{ end }}
```

实测输出：

```text
main：Services=10,About=20,Contact=30,
noweight：Contact us=7,=0,
auto：Auto Short=42,
```

**你应当看到什么**：`noweight` 的第一个条目本身没写 `weight`，取到的是它页面的 `Weight`（`7`）；第二个条目既没写 `weight` 也没有页面，所以是 `0`。`auto` 是自动加入菜单的条目，取到页面 `weight`（`42`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 条目写了 `weight` | 原样返回（实测 `10`、`20`、`30`、`5`、`42`、`100`） | 否 |
| 条目没写 `weight`，但解析到页面 | 页面 `Weight`（实测 `7`、`42`） | 否 |
| 条目没写 `weight`，也没有页面 | `0`（实测） | 否 |
| 参与排序时 `weight` 为 `0` | **排在所有非 0 条目之后**（见 [`ByWeight`](/methods/menu/byweight/) 的实测） | 否 |
| 返回类型 | `int`（不是字符串，可直接与数字比较：`le .Weight 42`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 想「排最前」的条目跑到了最后 | `weight = 0`（或没写且页面也没有）被排到最后 | 从 `1` 起编号，别用 `0` 表示「最前」 |
| 没报错但结果不对 | `if le .Weight 42` 筛出来的条目比预期多 | 条目没写 `weight` 时回退到页面 `Weight`，值可能来自页面 | 显式给条目写 `weight`，别依赖回退 |
| 报错看不懂 | `at <.Weight>: can't evaluate field Weight in type …` | 在非菜单条目的对象上用了 `.Weight`（例如把循环变量换成了别的） | 确认 `range` 的确实是 `site.Menus.<名字>`，循环里的 `.` 才是条目 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Weight`]: /methods/page/weight/
[自动]: /content-management/menus/#define-automatically
[front matter]: /content-management/menus/#define-in-front-matter
[项目配置]: /content-management/menus/#define-in-project-configuration
