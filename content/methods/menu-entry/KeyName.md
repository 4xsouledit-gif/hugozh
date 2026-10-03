+++
title = "KeyName"
linkTitle = "KeyName"
description = "返回给定菜单条目的 `identifier` 属性，若不存在则回退到其 `name` 属性。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/menu-entry/keyname/"

[params.functions_and_methods]
signatures = ["MENUENTRY.KeyName"]
returnType = "string"
+++

## 这一页解决什么问题

查翻译表、按名字给条目分类，都需要一个「认得出这个条目」的键。但配置里的键名是两种写法混用的：讲究的条目写了 `identifier`，随手写的条目只有 `name`。如果直接用 [`Identifier`](/methods/menu-entry/identifier/)，没写 `identifier` 的条目会拿到空字符串——翻译表于是一条都命中不了。

`KeyName` 就是为这种混用准备的：有 `identifier` 就用它，没有就退回 `name`。**它返回的一定是「能当键用」的值**。

## 什么时候用，什么时候别用

**该用**：

- 多语言站点的菜单文案本地化：`{{ or (T (.KeyName | lower)) .Name }}`（见下文示例）；
- 菜单条目来源混杂（有的写 `identifier`，有的只写 `name`），需要统一取键；
- 调试：打印 `.KeyName` 看每个条目最终用哪个键。

**别用**：

- 明确要配置里的 `identifier` 本身（例如与 `parent` 值对照）→ 用 [`Identifier`](/methods/menu-entry/identifier/)；
- 要显示给用户的文字 → 用 [`Name`](/methods/menu-entry/name/)；`KeyName` 的回落链虽然最终也会落到页面的 `LinkTitle`/`Title`，但它的语义是「键」，不要拿它当文案；
- 要页面标题 → 用 [`Title`](/methods/menu-entry/title/)。

## 用法

在下面的菜单定义中，第二个条目没有 `identifier`，因此 `Identifier` 方法改为返回其 `name` 属性：

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

下面的示例在多语言项目中查询翻译表时使用了 `KeyName` 方法，若翻译表中不存在匹配的键，则回退到 `name` 属性：

```go-html-template
<ul>
  {{ range .Site.Menus.keydemo }}
    <li><a href="{{ .URL }}">{{ or (T (.KeyName | lower)) .Name }}</a></li>
  {{ end }}
</ul>
```

在上面的示例中，需要把 `.KeyName` 返回的值传给 [`strings.ToLower`](/functions/strings/tolower/) 函数，因为翻译表中的键是小写的。

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

## 完整示例：KeyName 的回落链条

```go-html-template
{{ range site.Menus.keydemo }}[Identifier={{ printf "%q" .Identifier }} KeyName={{ printf "%q" .KeyName }} Name={{ printf "%q" .Name }}]{{ end }}
```

实测输出：

```text
[Identifier="about" KeyName="about" Name="About"] [Identifier="" KeyName="Contact" Name="Contact"]
```

再换成只有 `pageRef`、连 `name` 都不写的条目：

```toml
[[menus.bare]]
pageRef = '/about'
weight = 10
```

```go-html-template
{{ range site.Menus.bare }}[KeyName={{ printf "%q" .KeyName }} Name={{ printf "%q" .Name }}]{{ end }}
```

实测输出：

```text
[KeyName="About short" Name="About short"]
```

**你应当看到什么**：条目只有 `pageRef`，`KeyName` 走完了整条回落链——`identifier`（无）→ `name`（无）→ 页面的 `LinkTitle`（`About short`）。也就是说 `KeyName` 与 [`Name`](/methods/menu-entry/name/) 共享同一套回退规则，差别只在最前面多试一次 `identifier`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 条目的定义方式 | `.KeyName` | 是否报错 |
| --- | --- | --- |
| 有 `identifier` | 该 `identifier`（实测 `"about"`） | 否 |
| 无 `identifier`，有 `name` | 该 `name`（实测 `"Contact"`） | 否 |
| 无 `identifier`、无 `name`，但解析到页面 | 页面的 `LinkTitle`，没有则页面 `Title`（实测 `"About short"`） | 否 |
| 无 `identifier`、无 `name`、无页面（例如只写了 `identifier` 之外的字段缺失） | 空字符串 | 否 |
| `sectionPagesMenu` 自动条目 | 该页面所属 section 名（实测 `"blog"`、`"products"`） | 否 |
| 返回类型 | `string`（可能为 `""`，但不会 `nil`） | 否 |

一句话对照：**`Identifier` 只认 `identifier`；`KeyName` = `identifier` → `name` → 页面 `LinkTitle` → 页面 `Title`。**

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 翻译表有的条目能翻、有的不能 | 混用了 `Identifier` 与 `KeyName`，前者对没写 `identifier` 的条目返回空 | 统一用 `KeyName` |
| 没报错但结果不对 | 翻译表命中不了 | 翻译表的键是小写的，`.KeyName` 可能是大写的 `About` | 传 `lower`：`T (.KeyName \| lower)` |
| 没报错但结果不对 | 拿 `KeyName` 当文案显示，出现了页面 `LinkTitle` | `KeyName` 的语义是「键」，回落链会走到页面标题 | 显示用 [`Name`](/methods/menu-entry/name/) |

更多排查入口见[故障排查](/troubleshooting/)。
