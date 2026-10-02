+++
title = "ByName"
linkTitle = "ByName"
description = "返回给定菜单，其条目按 name 排序。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/menu/byname/"

[params.functions_and_methods]
signatures = ["MENU.ByName"]
returnType = "navigation.Menu"
+++

## 这一页解决什么问题

菜单条目的默认顺序由 `weight` 决定，而 `weight` 是为「导航里谁排前面」手工编排的数字。当你想按**显示名字**排列时（页脚按字母序列出全部栏目、A–Z 索引、作者列表），`weight` 就碍事了：每次改名都得回头改数字。

`ByName` 把这件事交给名字本身：返回同一个菜单，但条目按 `name` 排序，`weight` 不参与。

**读懂本页的诀窍**：`ByName` 不改动原菜单，它返回一份排序后的**新菜单**（类型仍是 `navigation.Menu`），所以既能直接交给 `range`，也能继续链 [`Reverse`](/methods/menu/reverse/)、[`Limit`](/methods/menu/limit/)。

## 什么时候用，什么时候别用

**该用**：

- 显示顺序应当跟随名字（字母序），而不是手工维护的 `weight`；
- 想按名字降序 → `.ByName.Reverse`；想只取前几个 → `.ByName.Limit 5`；
- 菜单条目来自不同配置片段、`weight` 不统一，但名字可靠。

**别用**：

- 想按 `weight` 排序（导航的常规顺序）→ 直接用 `site.Menus.main`，或显式写 [`ByWeight`](/methods/menu/byweight/)；
- 想按名字之外的字段排序（`Identifier`、`Parent`、`Post`、`Pre`、`Title`、`URL`、`Weight`）→ 用 [`sort`](/functions/collections/sort/) 函数（见下文）；
- 想要「重要栏目在前」这类业务顺序 → 那应该由 `weight` 表达，不要用名字凑。

## 用法

`ByName` 方法返回给定菜单，其条目按 `name` 排序。

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

要按 `name` 排序条目：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByName }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测）：

```html
<ul>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact/">Contact</a></li>
  <li><a href="/services/">Services</a></li>
</ul>
```

也可以使用 [`sort`][] 函数对菜单条目排序。例如按 `name` 降序排序：

```go-html-template
<ul>
  {{ range sort .Site.Menus.main "Name" "desc" }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

对菜单条目使用 sort 函数时，可指定以下任意键：`Identifier`、`Name`、`Parent`、`Post`、`Pre`、`Title`、`URL` 或 `Weight`。

## 完整示例：同一份菜单的五种顺序

用上面那份 `main` 菜单，把五种写法放进同一个模板对照：

```go-html-template
默认：      {{ range site.Menus.main }}{{ .Name }},{{ end }}
ByName：    {{ range site.Menus.main.ByName }}{{ .Name }},{{ end }}
ByWeight：  {{ range site.Menus.main.ByWeight }}{{ .Name }},{{ end }}
Reverse：   {{ range site.Menus.main.ByName.Reverse }}{{ .Name }},{{ end }}
Limit 2：   {{ range site.Menus.main.ByName.Limit 2 }}{{ .Name }},{{ end }}
```

实测输出：

```text
默认：      Services,About,Contact,
ByName：    About,Contact,Services,
ByWeight：  Services,About,Contact,
Reverse：   Services,Contact,About,
Limit 2：   About,Contact,
```

**你应当看到什么**：默认顺序与 `ByWeight` 一模一样——菜单的默认排序就是 `weight` 升序（见 [`ByWeight`](/methods/menu/byweight/)）。`ByName` 把它们按字母重排，`Reverse` 再倒过来。输出末尾多出的逗号是示例里分隔符写法的副产品，不是 Hugo 加的。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 菜单不存在（`site.Menus.nope`） | 空；`range` 不进入循环 | 否 |
| 菜单存在但没有条目 | 空菜单 | 否 |
| 只有一个条目 | 原样返回 | 否 |
| 两个条目 `name` 相同 | 继续按 `identifier` 比较（实测：两个 `Beta` 中 `alpha` 排在 `beta` 前） | 否 |
| `name` 大小写混合 | 大小写不敏感：实测 `apple` → `Banana` → `cherry`，不是大写优先 | 否 |
| `name` 里含数字 | 按字符比较，不按数值：实测 `item10` 排在 `item9` 之前 | 否 |
| `.ByName.Limit 0` | 空 | 否 |
| `len site.Menus.nope` | —— | 是：`error calling len: reflect: call of reflect.Value.Type on zero Value`。未定义的菜单只能 `range`/`with`，不能 `len` |
| 返回类型 | `navigation.Menu`（不是 `nil` 判断意义上的「可能为 nil」：未定义菜单返回的是 nil 菜单，`range` 依旧安全） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 字母序和你脑子里排的不一样 | `ByName` 大小写不敏感、按字符逐位比较，`item10` 在 `item9` 之前 | 想让数字参与数值比较，就自己包一层 `sort` 或改用 `weight` |
| 没报错但结果不对 | 排完序发现导航顺序变了但「重要的没在前」 | 字母序本来就不表达优先级 | 优先级交给 `weight`，用默认顺序或 [`ByWeight`](/methods/menu/byweight/) |
| 报错看不懂 | `error calling len: ...` | 对未定义的菜单取 `len` | 先用 `with site.Menus.main` 判断，或在配置/前置元数据里真正定义该菜单 |

更多排查入口见[故障排查](/troubleshooting/)。

[`sort`]: /functions/collections/sort/
