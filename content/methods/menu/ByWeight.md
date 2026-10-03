+++
title = "ByWeight"
linkTitle = "ByWeight"
description = "返回给定菜单，其条目先按 weight、再按 name、最后按 identifier 排序。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/menu/byweight/"

[params.functions_and_methods]
signatures = ["MENU.ByWeight"]
returnType = "navigation.Menu"
+++

## 这一页解决什么问题

导航里「谁排前面」是设计决定，而 `weight` 是表达这个决定的数字：越小越靠前。`ByWeight` 就是把这层意图落实成顺序的方法——返回同一个菜单，条目按 `weight` 升序排列。

它值得单独读一页，因为**菜单的默认顺序就是 `ByWeight`**：直接 `range site.Menus.main` 时，Hugo 已经替你调用过它。理解 `ByWeight`，等于理解了菜单不排序时的行为。

**读懂本页的诀窍**：`weight` 相同才轮到 `name`，`name` 相同才轮到 `identifier`。另外，实测在 Hugo 0.167.0 上，**`weight` 为 `0`（或没写）的条目会被排到所有有权重的条目之后**——这一点上游没写，下文「返回值边界」有实测数据。

## 什么时候用，什么时候别用

**该用**：

- 明确希望在模板里表达「按 weight 排」，让读者一眼看出顺序来源；
- 与 [`Reverse`](/methods/menu/reverse/)、[`Limit`](/methods/menu/limit/) 链式组合（例如「weight 最大的两个」写成 `.ByWeight.Reverse.Limit 2`）；
- 排查顺序问题：先用 `{{ range site.Menus.main.ByWeight }}` 打一遍，确认是不是 `weight` 写错了。

**别用**：

- 想按显示名字排 → 用 [`ByName`](/methods/menu/byname/)；
- 想按别的字段排（`Identifier`、`URL`…）→ 用 [`sort`](/functions/collections/sort/) 函数；
- 只是想「让顺序生效」→ 什么都不用写，默认就是它。

## 用法

`ByWeight` 方法返回给定菜单，其条目先按 [`weight`](g)、再按 `name`、最后按 `identifier` 排序。这是默认的排序方式。

请看下面的菜单定义：

```toml
[[menus.main]]
identifier = 'about'
name = 'About'
pageRef = '/about'
weight = 20

[[menus.main]]
identifier = 'services'
name = 'Services'
pageRef = '/services'
weight = 10

[[menus.main]]
identifier = 'contact'
name = 'Contact'
pageRef = '/contact'
weight = 30
```

要按 `weight`、再按 `name`、最后按 `identifier` 排序条目：

```go-html-template
<ul>
  {{ range .Site.Menus.main.ByWeight }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测）：

```html
<ul>
  <li><a href="/services/">Services</a></li>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact/">Contact</a></li>
</ul>
```

> [!NOTE]
> 在上面的菜单定义中，只有当两个或更多菜单条目同名，或需要使用翻译表本地化名称时，才必须提供 `identifier` 属性。

也可以使用 [`sort`][] 函数对菜单条目排序。例如按 `weight` 降序排序：

```go-html-template
<ul>
  {{ range sort .Site.Menus.main "Weight" "desc" }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

对菜单条目使用 sort 函数时，可指定以下任意键：`Identifier`、`Name`、`Parent`、`Post`、`Pre`、`Title`、`URL` 或 `Weight`。

## 完整示例：默认顺序与 ByWeight 是同一件事

菜单 `main` 的三条分别是 Services(10)、About(20)、Contact(30)：

```go-html-template
raw：     {{ range site.Menus.main }}{{ .Name }},{{ end }}
ByWeight：{{ range site.Menus.main.ByWeight }}{{ .Name }},{{ end }}
ByName：  {{ range site.Menus.main.ByName }}{{ .Name }},{{ end }}
```

实测输出：

```text
raw：     Services,About,Contact,
ByWeight：Services,About,Contact,
ByName：  About,Contact,Services,
```

**你应当看到什么**：`raw`（不加方法）与 `ByWeight` 输出完全一致——默认排序就是按 weight。只有显式调用 `ByName` 之类的方法才会改变顺序。

再验证一次「weight 是排序主键」：把 `weight` 与页面 `weight` 混着写：

```toml
[[menus.sortmix]]
name = 'P7'          # 条目没写 weight，页面 /contact 的 weight 是 7
pageRef = '/contact'

[[menus.sortmix]]
name = 'P42'         # 条目没写 weight，页面 /about 的 weight 是 42
pageRef = '/about'

[[menus.sortmix]]
name = 'E5'
pageRef = '/product'
weight = 5

[[menus.sortmix]]
name = 'E100'
pageRef = '/product'
weight = 100
```

```go-html-template
{{ range site.Menus.sortmix.ByWeight }}{{ .Name }}({{ .Weight }}),{{ end }}
```

实测输出：

```text
E5(5),P7(7),P42(42),E100(100),
```

**你应当看到什么**：`P7`、`P42` 虽然没写条目级 `weight`，却按**页面 weight** 参与了排序——排序用的就是 `.Weight` 这个方法返回的值（见 [Weight](/methods/menu-entry/weight/)）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 菜单不存在（`site.Menus.nope`） | 空；`range` 不进入循环 | 否 |
| 空菜单 | 空菜单 | 否 |
| 普通 `weight` | 升序：`5 → 10 → 90`（实测） | 否 |
| `weight` 为 `0`，或条目/页面都没写 weight | **排在所有非 0 条目之后**：实测一组 `5、10、90、0、0、0` 排成 `5, 10, 90, 0, 0, 0` | 否 |
| `weight` 相同 | 再按 `name`（大小写不敏感），实测 `apple` 在 `Zebra` 之前；`name` 也相同才比 `identifier`（实测 `Alpha`、两个 `Beta` → `Beta` 按 `alpha`、`beta` 排） | 否 |
| `name` 含数字且 `weight` 相同 | 按字符比较：实测 `item10` 在 `item9` 之前 | 否 |
| 链 `.Reverse.Limit 2` | 取 weight 最大的两个（实测 `Contact,About`） | 否 |
| `len site.Menus.nope` | —— | 是：`error calling len: reflect: call of reflect.Value.Type on zero Value` |
| 返回类型 | `navigation.Menu` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 明明写了 `weight = 0` 想排最前，却排到了最后 | 实测 `weight = 0` 被当作「未设置」，排在所有非 0 条目之后 | 从 `1` 开始编号，或给前面留负数之外的间隔（如 10、20、30） |
| 没报错但结果不对 | 两个条目顺序不受 `weight` 控制 | 它们的 `weight` 相同，于是比 `name`、再比 `identifier` | 给两者不同 `weight`，或显式设 `identifier` 控制并列时的顺序 |
| 没报错但结果不对 | 条目没写 `weight`，顺序却跟着页面走 | `.Weight` 会回退到页面 `weight` | 显式写条目级 `weight`，别依赖回退 |

更多排查入口见[故障排查](/troubleshooting/)。

[`sort`]: /functions/collections/sort/
