+++
title = "Page"
linkTitle = "Page"
description = "返回给定页面的 Page 对象。"
date = 2026-10-02
weight = 470
source = "https://gohugo.io/methods/page/page/"

[params.functions_and_methods]
signatures = ["PAGE.Page"]
returnType = "page.Page"
+++

## 这一页解决什么问题

同一个局部模板（partial）常常既被**短代码**调用、又被**页面模板**调用，而这两种调用传进来的「点号」不是同一个东西：

- 短代码调用 partial 时，点号是短代码上下文，里面**有** `.Page`；
- 页面模板调用 partial 时，点号**就是** `Page` 对象本身。

`.Page` 方法让 partial 在两种情况下都能拿到页面对象：写 `.Page.Title`，两种调用都成立。

## 什么时候用，什么时候别用

**该用**：

- 共享 partial 需要页面对象（标题、链接、参数），而调用方可能是短代码、渲染钩子或页面模板；
- 从短代码上下文里取当前页面：`{{ .Page.RelPermalink }}`。

**别用**：

- 只在页面模板里用 → 直接用点号（`.Title`）就已经是页面对象，`.Page` 属于绕路；
- 只在短代码模板里用 → 直接用 `.Page` 是对的，但如果 partial 只服务短代码，把参数显式传进去（`{{ partial "x.html" (dict "page" .Page) }}`）更清晰；
- 想「层层向下」写 `.Page.Page.Page` → 上游明确说「别这么干」。

## 用法

这是一个便捷方法，当_局部模板_同时被_短代码_和其他模板类型调用时很有用。

```go-html-template {file="layouts/_shortcodes/foo.html"}
{{ partial "my-partial.html" . }}
```

当_短代码_模板调用该_局部模板_时，会把当前[上下文](g)（即点号）传递过去。该上下文包含 `Page`、`Params`、`Inner`、`Name` 等标识符。

```go-html-template {file="layouts/page.html"}
{{ partial "my-partial.html" . }}
```

当_页面_模板调用该_局部模板_时，也会传递当前上下文（即点号）。但此时点号_就是_ `Page` 对象。

```go-html-template {file="layouts/_partials/my-partial.html"}
The page title is: {{ .Page.Title }}
```

要同时处理这两种情况，_局部模板_必须能通过 `Page.Page` 访问 `Page` 对象。

> [!NOTE]
> 是的，这意味着你也可以写 `.Page.Page.Page.Page.Title`。
>
> 但别这么干。

## 完整示例：一份 partial 两种调用

partial（`layouts/_partials/ctx.html`）：

```go-html-template {file="layouts/_partials/ctx.html"}
@@ ctx_page={{ .Page.Path }}|{{ .Page.Title }}
```

**页面模板**里调用它（点号就是 `Page`）：

```go-html-template {file="layouts/_default/single.html"}
{{ partial "ctx.html" . }}
```

**短代码**里调用它（点号是短代码上下文，`.Page` 是当前页面）：

```go-html-template {file="layouts/_shortcodes/ctx.html"}
{{ partial "ctx.html" . }}
```

内容文件里写 `{{</* ctx */>}}`。

实测（Hugo 0.167.0，页面 `/posts/plain-demo/`）：

```text
@@ ctx_page=/posts/plain-demo|Plain 演示      <-- 来自页面模板
@@ ctx_page=/posts/plain-demo|Plain 演示      <-- 来自短代码
```

**你应当看到什么**：两行完全一致。无论调用方是谁，`.Page` 都指向同一个页面对象——这正是这个便捷方法存在的意义。

## 返回值边界（实测）

| 调用场景 | `.Page` 的含义 | 是否报错 |
| --- | --- | --- |
| 页面模板（点号 = Page） | 点号本身，`.Page.Title` 正常 | 否 |
| 短代码模板（点号 = 短代码上下文） | 当前页面对象 | 否 |
| 把 partial 传给一个 `dict`（没有 `Page` 键） | 取不到页面：实测 `.Page.Path`、`.Page.Title` 都渲染为空串 | **否**（0.167.0 实测不报错，静默输出空值） |
| 返回类型 | `page.Page` | 否 |

> [!WARNING]
> 第三行是最容易「静默出错」的情形：把点号换成 `dict` 之后，`.Page` 不再是页面，模板不报错但输出空内容。共享 partial 的调用方一旦改成传 `dict`，就要改成显式键（例如 `dict "page" .` → `{{ .page.Title }}`）。

更多排查入口见[故障排查](/troubleshooting/)。
