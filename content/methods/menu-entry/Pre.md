+++
title = "Pre"
linkTitle = "Pre"
description = "返回给定菜单条目的 `pre` 属性。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/menu-entry/pre/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Pre"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

菜单文案之外，条目常常还要带一点装饰：链接**前面**放一个 emoji 图标、一个「→」、或者「★」表示推荐。Hugo 为这种前置装饰留了 `pre` 属性，`Pre` 方法就是把它读出来（对应的后置装饰见 [`Post`](/methods/menu-entry/post/)）。

它返回 `template.HTML` 类型，但**内容不会自动当 Markdown 处理**——`pre` 里写 `:point_right:` 这种 emoji 短代码，要自己接一个 `markdownify` 才会变成真正的符号。

## 什么时候用，什么时候别用

**该用**：

- 纯装饰文本：emoji、箭头、星标、`新` 字；
- 想让装饰随菜单配置走（同一个模板、不同菜单配不同前缀）。

**别用**：

- 要输出结构化的东西（图标字体元素、带 class 的 `<span>`）→ 用 [`Params`](/methods/menu-entry/params/) 挂数据，在模板里决定结构，别把 HTML 塞进配置字符串；
- 要显示菜单文字 → 用 [`Name`](/methods/menu-entry/name/)；
- 想让每个条目都带同样的前缀 → 直接写在模板里，不必逐条配 `pre`。

## 用法

在下面的项目配置中，我们启用了 [emoji 短代码][]的渲染，并在每个菜单条目的前面（pre）和后面（post）各添加一个 emoji 短代码：

```toml
enableEmoji = true

[[menus.emojidemo]]
name = 'About'
pageRef = '/about'
post = ':point_left:'
pre = ':point_right:'
weight = 10

[[menus.emojidemo]]
name = 'Contact'
pageRef = '/contact'
post = ':arrow_left:'
pre = ':arrow_right:'
weight = 20
```

要渲染该菜单：

```go-html-template
<ul>
  {{ range .Site.Menus.emojidemo }}
    <li>
      {{ .Pre | markdownify }}
      <a href="{{ .URL }}">{{ .Name }}</a>
      {{ .Post | markdownify }}
    </li>
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li>
    &#x1f449;
    <a href="/about/">About</a>
    &#x1f448;
  </li>
  <li>
    &#x27a1;&#xfe0f;
    <a href="/contact/">Contact</a>
    &#x2b05;&#xfe0f;
  </li>
</ul>
```

每个 `<li>` 里的第一行来自 `.Pre`，最后一行来自 `.Post`。

## 完整示例：加不加 markdownify 的差别

```go-html-template
直接输出：{{ range site.Menus.emojidemo }}{{ .Pre }}|{{ end }}
markdownify：{{ range site.Menus.emojidemo }}{{ .Pre | markdownify }}|{{ end }}
原始值：{{ range site.Menus.emojidemo }}[{{ printf "%q" .Pre }}]{{ end }}
```

实测输出：

```text
直接输出：:point_right:|:arrow_right:|
markdownify：&#x1f449;|&#x27a1;&#xfe0f;|
原始值：[":point_right:"][":arrow_right:"]
```

**你应当看到什么**：不加 `markdownify` 时，`.Pre` 就是配置里那串字符（`:point_right:`），emoji 短代码不会展开；加了 `markdownify` 才渲染成符号。所以**只要用了 emoji/短代码写法，就必须配 `markdownify`**，同时项目配置里要有 `enableEmoji = true`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，配置 `enableEmoji = true`，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 条目写了 `pre` | 原样返回该字符串（实测 `":point_right:"`） | 否 |
| 条目没写 `pre` | 空字符串（直接输出等于什么都没渲染） | 否 |
| 加了 `markdownify` 且 `enableEmoji = true` | emoji 短代码被渲染成实体，例如 `:point_right:` → `&#x1f449;` | 否 |
| 加了 `markdownify` 但没开 `enableEmoji` | 保持原样文本（emoji 短代码不生效） | 否 |
| 内容是普通文字 | 原样输出 | 否 |
| 返回类型 | `template.HTML`（因此直接输出时**不会**被转义成 HTML 实体） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上真的显示出 `:point_right:` 字样 | 没接 `markdownify`，emoji 短代码不会自动展开 | 写成 `{{ .Pre \| markdownify }}` |
| 没报错但结果不对 | 加了 `markdownify` 也没变成 emoji | 项目配置没开 `enableEmoji` | 配置里加 `enableEmoji = true` |
| 没报错但结果不对 | 想加带 class 的图标却渲染不出结构 | 把 HTML 字符串塞进了 `pre` | 改用 [`Params`](/methods/menu-entry/params/) 存数据，模板里生成元素 |

更多排查入口见[故障排查](/troubleshooting/)。

[emoji 短代码]: /quick-reference/emojis/
