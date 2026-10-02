+++
title = "PageRef"
linkTitle = "PageRef"
description = "返回给定菜单条目的 `pageRef` 属性。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/menu-entry/pageref/"

[params.functions_and_methods]
signatures = ["MENUENTRY.PageRef"]
returnType = "string"
+++

## 这一页解决什么问题

`pageRef` 是菜单条目里「我要指向哪个页面」的写法：Hugo 拿它去内容里找页面，找到就把条目和页面绑在一起。`PageRef` 方法返回的**就是配置里你写的那串字符串**——不是页面、不是链接，而是原始值。

正因为它给的是「你写的原话」，用途很窄：只有当你需要「找不到页面时，至少把 `pageRef` 当兜底链接显示出来」这类场景才用得上。日常渲染菜单请用 [`URL`](/methods/menu-entry/url/)。

> [!NOTE]
> 该方法的使用场景很少。
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

## 说明

如果在项目配置中[定义菜单条目][defining a menu entry]时指定了 `pageRef` 属性，Hugo 在渲染该条目时会查找匹配的页面。

如果找到匹配的页面：

- [`URL`][] 方法返回该页面的相对永久链接
- [`Page`][] 方法返回对应的 `Page` 对象
- `Page` 对象上的 [`HasMenuCurrent`][] 和 [`IsMenuCurrent`][] 方法返回预期值

如果没有找到匹配的页面：

- [`URL`][] 方法返回该条目的 `url` 属性（如果已设置），否则返回空字符串
- [`Page`][] 方法返回 `nil`
- `Page` 对象上的 [`HasMenuCurrent`][] 和 [`IsMenuCurrent`][] 方法返回 `false`

> [!NOTE]
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

## 什么时候用，什么时候别用

**该用**：

- 需要一个「页面找不到时也不会空掉」的兜底链接：`{{ or .URL .PageRef }}`（见下文实测）；
- 排查 `pageRef` 为什么没绑定到页面：把 `.PageRef` 打出来，确认字符串是否与内容路径一致。

**别用**：

- 正常渲染菜单链接 → 用 [`URL`](/methods/menu-entry/url/)；
- 想拿绑定的页面对象 → 用 [`Page`](/methods/menu-entry/page/)；
- 想拿菜单条目的名字 → 用 [`Name`](/methods/menu-entry/name/)。

## 示例

这个示例是刻意构造的。

> [!NOTE]
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

请看下面的内容结构：

```tree
content/
├── products.md
└── _index.md
```

以及下面的菜单定义：

```toml
[[menus.refdemo]]
name = 'Products'
pageRef = '/products'
weight = 10

[[menus.refdemo]]
name = 'Services'
pageRef = '/services-missing'
weight = 20
```

使用下面的模板代码：

```go-html-template {file="layouts/_partials/menu.html"}
<ul>
  {{ range .Site.Menus.refdemo }}
    <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染出如下 HTML（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li><a href="/products/">Products</a></li>
  <li><a href="">Services</a></li>
</ul>
```

注意上面第二个 `anchor` 元素的 `href` 属性为空，因为 Hugo 找不到 `services` 页面。

使用下面的模板代码：

```go-html-template {file="layouts/_partials/menu.html"}
<ul>
  {{ range .Site.Menus.refdemo }}
    <li><a href="{{ or .URL .PageRef }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
```

Hugo 渲染出如下 HTML（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li><a href="/products/">Products</a></li>
  <li><a href="/services-missing">Services</a></li>
</ul>
```

注意上面这段代码中，Hugo 把第二个 `anchor` 元素的 `href` 属性填成了项目配置里定义的 `pageRef` 属性，因为模板代码回退到了 `PageRef` 方法。

## 完整示例：把三个方法的返回值摆在一起

```go-html-template
{{ range site.Menus.refdemo }}[{{ .Name }} URL={{ printf "%q" .URL }} PageRef={{ printf "%q" .PageRef }} Page={{ with .Page }}{{ .RelPermalink }}{{ else }}nil{{ end }}]{{ end }}
```

实测输出：

```text
[Products URL="/products/" PageRef="/products" Page=/products/] [Services URL="" PageRef="/services-missing" Page=nil]
```

**你应当看到什么**：`Products` 的 `.URL` 是解析后的永久链接（`/products/`，带结尾斜杠），而 `.PageRef` 仍是你写的原话（`/products`，不带斜杠）——两者格式不同，不要混用。`Services` 的页面没找到：`.Page` 为 `nil`、`.URL` 为空，只有 `.PageRef` 还留着配置值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | `.PageRef` | 是否报错 |
| --- | --- | --- |
| 配置里写了 `pageRef`，页面存在 | 原样返回配置字符串（实测 `"/products"`，不补结尾斜杠） | 否 |
| 配置里写了 `pageRef`，页面不存在 | 仍原样返回配置字符串（实测 `"/services-missing"`） | 否 |
| 条目只有 `url`、没有 `pageRef` | 空字符串（实测 `""`） | 否 |
| 条目只有 `name`、两者都没有 | 空字符串 | 否 |
| 返回类型 | `string`（可能为 `""`，不会 `nil`） | 否 |

> [!NOTE]
> 在几乎所有的场景中，你都应该改用 [`URL`][] 方法。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 菜单里出现空 `href` | `pageRef` 没匹配到页面，而条目也没有 `url` | 核对内容路径；或按上文用 `{{ or .URL .PageRef }}` 兜底，或换用 `url` |
| 没报错但结果不对 | 拿 `.PageRef` 当链接直接输出，地址少了结尾斜杠 | `.PageRef` 是配置原字符串，`.URL` 才是解析后的永久链接 | 正常链接一律用 [`URL`](/methods/menu-entry/url/) |
| 没报错但结果不对 | `pageRef` 明明对，`.Page` 却是 `nil` | 路径写成了内容文件路径而非页面路径，或大小写/扩展名不对 | 用 `/products`（不要 `.md`），必要时先 `hugo list all` 看页面路径 |

更多排查入口见[故障排查](/troubleshooting/)。

[`HasMenuCurrent`]: /methods/page/hasmenucurrent/
[`IsMenuCurrent`]: /methods/page/ismenucurrent/
[`Page`]: /methods/menu-entry/page/
[`URL`]: /methods/menu-entry/url/
[defining a menu entry]: /content-management/menus/#define-in-project-configuration
