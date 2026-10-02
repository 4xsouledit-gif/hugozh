+++
title = "HasShortcode"
linkTitle = "HasShortcode"
description = "报告给定页面是否调用了指定的短代码。"
date = 2026-10-02
weight = 250
source = "https://gohugo.io/methods/page/hasshortcode/"

[params.functions_and_methods]
signatures = ["PAGE.HasShortcode NAME"]
returnType = "bool"
+++

## 这一页解决什么问题

短代码常常需要配套资源（一段 CSS、一个图表库、一段初始化脚本）。`HasShortcode` 让你**只在该页面真的用到了这个短代码时**才加载这些资源，避免每个页面都背上无关的依赖。

## 什么时候用，什么时候别用

**该用**：

- 按页按需加载 JS/CSS（上游示例的 Plotly 场景）；
- 在 `<head>` 里根据短代码决定要不要输出 `<script>` / `<link>`；
- 校验内容是否用了某个短代码（例如「必须有图表」的编辑部规则）。

**别用**：

- 想判断页面是否**有某个标题/片段** → 用 [`Fragments`](/methods/page/fragments/)；
- 想控制短代码**渲染什么** → 那是短代码模板自己的事，`HasShortcode` 只回答「有没有」；
- 在列表页上判断子页面是否用了某短代码 → 它只看**当前页面自己的正文**。

## 用法

举个例子，我们用 [Plotly][] 渲染一张图表：

```md {file="content/example.md"}
{{</* plotly */>}}
{
  "data": [
    {
      "x": ["giraffes", "orangutans", "monkeys"],
      "y": [20, 14, 23],
      "type": "bar"
    }
  ],
}
{{</* /plotly */>}}
```

这个短代码很简单：

```go-html-template {file="layouts/_shortcodes/plotly.html"}
{{ $id := printf "plotly-%02d" .Ordinal }}
<div id="{{ $id }}"></div>
<script>
  Plotly.newPlot(document.getElementById({{ $id }}), {{ .Inner | safeJS }});
</script>
```

现在我们可以只在调用 `plotly` 短代码的页面上按需加载所需的 JavaScript：

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ if .HasShortcode "plotly" }}
    <script src="https://cdn.plot.ly/plotly-2.28.0.min.js"></script>
  {{ end }}
</head>
```

## 完整示例：只在用到短代码的页面加载资源

最小站点：`layouts/_shortcodes/hello.html` 的内容是 `<span class="hello">你好，短代码</span>`；`content/docs/guide/alpha.md` 的正文里有一次调用 `{{</* hello */>}}`；`content/docs/guide/beta.md` 没有调用。模板放在 `layouts/baseof.html` 的 `<head>` 里：

```go-html-template {file="layouts/baseof.html"}
{{ if .HasShortcode "hello" }}
  <link rel="stylesheet" href="/css/hello.css">
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，`alpha` 的 HTML 里有这一行：

```html
<link rel="stylesheet" href="/css/hello.css">
```

`beta` 的 HTML 里**没有**任何输出。

**你应当看到什么**：判断只看**当前页面正文里真实发生的调用**。实测 `alpha` 得到 `true`，`beta` 与译文页面（`alpha.zh.md`，正文没有该调用）都得到 `false`。注意本页上面用来展示语法的转义写法（形如 `{{</* plotly */>}}`）**不是**一次真实调用，它只会渲染成文字。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`hello` 短代码模板存在于 `layouts/_shortcodes/`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面正文调用了该短代码 | `true` | 否 |
| 页面正文没有调用 | `false` | 否 |
| 译文页面没有调用 | `false`（按各自语言的正文判断） | 否 |
| 页面正文只有**转义写法**（用于展示语法） | `false`（不会当成调用） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 资源没加载 | 明明用了短代码却输出 `false` | 正文里写的是转义写法（只显示文字），或调用写在了别的 shortcode 的 `.Inner` 里 | 写成真实调用；检查短代码嵌套 |
| 构建报错 | `template for shortcode "…" not found` | 页面调用了不存在的短代码 | 在 `layouts/_shortcodes/` 里补上模板 |
| 列表页判断失效 | 在列表/首页上判断子页面 | 只统计当前页面正文 | 在 `range` 到具体页面后再判断 |

更多排查入口见[故障排查](/troubleshooting/)。

[Plotly]: https://plotly.com/javascript/
