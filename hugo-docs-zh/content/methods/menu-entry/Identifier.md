+++
title = "Identifier"
linkTitle = "Identifier"
description = "返回给定菜单条目的 `identifier` 属性。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/menu-entry/identifier/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Identifier"]
returnType = "string"
+++

## 这一页解决什么问题

`name` 是给人看的（可能重复、可能要翻译），所以 Hugo 让每个菜单条目可以另有一个 `identifier`：机器用来认出「这是哪个条目」。它有三个用途——子条目的 `parent` 靠它指向父项、翻译表靠它作键、菜单模板靠它区分同名条目。

`Identifier` 方法就是把配置里的这个值读出来。

**读懂本页的诀窍**：`Identifier` **没有**「没写就退回 `name`」这一层。配置里没写 `identifier`，它就返回空字符串——想要那个回退，用 [`KeyName`](/methods/menu-entry/keyname/)。

## 什么时候用，什么时候别用

**该用**：

- 菜单条目靠 `identifier` 建立了层级或翻译关系，模板里需要复现这个键；
- 多语言站点用翻译表本地化菜单文案（见下文示例）；
- 排查 `parent` 为什么没匹配上：把 `.Identifier` 打出来，和 `parent` 的值对一下。

**别用**：

- 想要「一定能拿到名字」的键 → 用 [`KeyName`](/methods/menu-entry/keyname/)，它会退回 `name`；
- 想显示给用户看 → 用 [`Name`](/methods/menu-entry/name/)（可能要翻译）或 [`Title`](/methods/menu-entry/title/)；
- 想拿条目所属的 section → 用 `.Page.Section`（见下文实测）。

## 用法

`Identifier` 方法返回菜单条目的 `identifier` 属性。如果[自动][]定义菜单条目，它返回该页面所属的 section（内容区块）。

```toml
[[menus.iddemo]]
identifier = 'about'
name = 'About'
pageRef = '/about'
weight = 10

[[menus.iddemo]]
identifier = 'contact'
name = 'Contact'
pageRef = '/contact'
weight = 20
```

下面的示例在多语言项目中查询翻译表时使用了 `Identifier` 方法，若翻译表中不存在匹配的键，则回退到 `name` 属性：

```go-html-template
<ul>
  {{ range .Site.Menus.iddemo }}
    <li><a href="{{ .URL }}">{{ or (T .Identifier) .Name }}</a></li>
  {{ end }}
</ul>
```

配合 `i18n/zh-cn.toml`：

```toml
[about]
other = '关于'

[contact]
other = '联系我们'
```

Hugo 渲染结果为（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li><a href="/about/">关于</a></li>
  <li><a href="/contact/">联系我们</a></li>
</ul>
```

> [!NOTE]
> 在上面的菜单定义中，只有当两个或更多菜单条目同名，或需要使用翻译表本地化名称时，才必须提供 `identifier` 属性。

## 完整示例：Identifier 与 KeyName 的差别

给同一个菜单做两份定义：一份两个条目都有 `identifier`，一份第二个没有。

```toml
[[menus.keydemo]]
identifier = 'about'
name = 'About'
pageRef = '/about'
weight = 10

[[menus.keydemo]]
name = 'Contact'
pageRef = '/contact'
weight = 20
```

```go-html-template
{{ range site.Menus.keydemo }}[Identifier={{ printf "%q" .Identifier }} KeyName={{ printf "%q" .KeyName }}]{{ end }}
```

实测输出：

```text
[Identifier="about" KeyName="about"] [Identifier="" KeyName="Contact"]
```

**你应当看到什么**：第二个条目没写 `identifier`，`Identifier` 直接给空字符串；`KeyName` 才退回 `name`。所以**查翻译表时用 `KeyName` 更稳**——用 `Identifier` 的话，没写 `identifier` 的条目会查到空键。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 条目的定义方式 | `.Identifier` | 是否报错 |
| --- | --- | --- |
| 项目配置里显式写了 `identifier` | 原样返回（实测 `"about"`） | 否 |
| 项目配置里有 `name`、`pageRef`，但没写 `identifier` | 空字符串（**不**退回 `name`） | 否 |
| 前置元数据 `menus = ['main']` 加入的条目 | 空字符串（实测；即使页面在 `blog` section 里也是空） | 否 |
| 项目配置 `sectionPagesMenu = 'main'` 自动生成的条目 | 该页面所属 section 名（实测 `"blog"`、`"products"`） | 否 |
| 只写了 `identifier`、没有 `name` | 返回该 `identifier`，而同一条目的 [`Name`](/methods/menu-entry/name/) 为空字符串 | 否 |
| 需要 section 名时 | 不要用 `Identifier`；用 `.Page.Section`（实测自动条目 `Identifier` 为 `""` 时，`.Page.Section` 仍是 `blog`） | 否 |
| 返回类型 | `string`（永不返回 `nil`，但可能是 `""`） | 否 |

上游把「自动定义」写成一类；实测只有 `sectionPagesMenu` 这条路会返回 section 名，用前置元数据 `menus = ['…']` 加入的条目返回的是空字符串——差别就在这里。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 翻译表查不出文案，全部回退到英文 `name` | 条目没写 `identifier`，`T ""` 自然是空 | 改用 [`KeyName`](/methods/menu-entry/keyname/)，或给每个条目补上 `identifier` |
| 没报错但结果不对 | 子条目的 `parent` 匹配不上 | `parent` 比的是父条目的 `identifier`（没写时才是 `name`），大小写敏感 | 打印 `.Identifier` 与 `parent` 对照，保持完全一致 |
| 没报错但结果不对 | 自动生成的 section 菜单里取不到 section | 用 `Identifier` 只在 `sectionPagesMenu` 这条路有效；前置元数据的自动条目为空 | 直接取 `.Page.Section` |

更多排查入口见[故障排查](/troubleshooting/)。

[自动]: /content-management/menus/#define-automatically
