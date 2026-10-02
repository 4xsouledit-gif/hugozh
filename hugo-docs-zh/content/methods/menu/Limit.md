+++
title = "Limit"
linkTitle = "Limit"
description = "返回给定菜单，并限制为前 N 个条目。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/menu/limit/"

[params.functions_and_methods]
signatures = ["MENU.Limit N"]
returnType = "navigation.Menu"
+++

## 这一页解决什么问题

导航条常常只能放几个：侧栏主推前 5 个栏目、首页页脚只列 3 个热门入口、移动端只显示 4 个。`Limit` 就是「只留前 N 个」的开关：它接收一个整数 `N`，返回截断后的菜单（类型仍是 `navigation.Menu`），其余条目直接丢掉。

它几乎总是跟在排序方法后面：先决定顺序，再决定留几个。

## 什么时候用，什么时候别用

**该用**：

- 「取前 N 个」这类需求，且希望截断发生在**排序之后**：`.ByWeight.Limit 5`、`.ByName.Limit 3`；
- 想同时拿到「倒数的 N 个」→ 先 [`Reverse`](/methods/menu/reverse/) 再 `Limit`（实测 `.ByWeight.Reverse.Limit 2` 得到 weight 最大的两个）。

**别用**：

- 想跳过前几个、取中间一段 → 菜单上没有对应方法，改用 [`first`](/functions/collections/first/)、[`after`](/functions/collections/after/)、[`last`](/functions/collections/last/) 函数（它们同样接受 `navigation.Menu`，实测可用）：
  `{{ range after 2 site.Menus.main }}`；
- 想按条件筛选（只要 `weight > 10` 的）→ 用 `range` 加 `if`，见 [Weight](/methods/menu-entry/weight/)；
- 想「只显示当前页所属的 section」→ 那是 [`IsMenuCurrent`](/methods/page/ismenucurrent/) / [`HasMenuCurrent`](/methods/page/hasmenucurrent/) 的事。

## 用法

`Limit` 方法返回给定菜单，并限制为前 N 个条目。

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

要按 name 排序条目，并限制为前 2 个：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByName.Limit 2 }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测）：

```html
<ul>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact">Contact</a></li>
</ul>
```

## 完整示例：Limit 与三个替代函数

```go-html-template
Limit 2：  {{ range site.Menus.main.ByName.Limit 2 }}{{ .Name }},{{ end }}
first 2：  {{ range first 2 site.Menus.main }}{{ .Name }},{{ end }}
after 2：  {{ range after 2 site.Menus.main }}{{ .Name }},{{ end }}
last 2：   {{ range last 2 site.Menus.main }}{{ .Name }},{{ end }}
倒序 Limit：{{ range site.Menus.main.ByWeight.Reverse.Limit 2 }}{{ .Name }},{{ end }}
```

实测输出：

```text
Limit 2：  About,Contact,
first 2：  Services,About,
after 2：  Contact,
last 2：   About,Contact,
倒序 Limit：Contact,About,
```

**你应当看到什么**：`Limit 2` 紧跟 `ByName`，所以拿的是**按名字排序后的**前两个；`first 2` 没有排序方法，拿的是默认（weight）顺序的前两个——两者结果不同，正说明 `Limit` 只是「截断」，排序要靠前面的方法。`after 2` 给出「从第 3 个开始」，这是 `Limit` 做不到的。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；菜单 `main` 共 3 个条目。

| `N` | 结果 | 是否报错 |
| --- | --- | --- |
| `2`（正常） | 前 2 个 | 否 |
| `0` | 空菜单，`range` 不进入循环 | 否 |
| `99`（大于条目数） | 全部 3 个，**不报错、不补空位** | 否 |
| `-1`（负数） | —— | 是：`error calling Limit: runtime error: slice bounds out of range [:-1]` |
| `"2"`（字符串） | —— | 是：`expected integer; found "2"` |
| 未定义菜单（`site.Menus.nope.Limit 2`） | 空，不报错 | 否 |
| `.Limit 0` 后再链 `ByWeight` | 仍是空（截断已发生） | 否 |
| 返回类型 | `navigation.Menu` | 否 |

两栏对照着记：**`N` 超界是安全的（给你全部），`N` 为负或类型不对才会失败**。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 想取「最后两条」，`Limit 2` 却是前两条 | `Limit` 只取前 N 个 | 先 [`Reverse`](/methods/menu/reverse/) 或改用 [`last`](/functions/collections/last/) 函数 |
| 没报错但结果不对 | `Limit` 出来的不是想要的顺序 | 忘了先排序，截断发生在默认（weight）顺序上 | 写成 `.ByName.Limit N` 或 `.ByWeight.Limit N` |
| 报错看不懂 | `slice bounds out of range [:-1]` | `N` 传了负数 | 先判断 `N`，或保证它是非负整数 |
| 报错看不懂 | `expected integer; found "2"` | `N` 写成了带引号的字符串 | 去掉引号：`.Limit 2` |

更多排查入口见[故障排查](/troubleshooting/)。
