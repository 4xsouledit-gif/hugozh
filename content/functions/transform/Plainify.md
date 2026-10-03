+++
title = "transform.Plainify"
linkTitle = "Plainify"
description = "返回删除所有 HTML 标签后的字符串。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/transform/plainify/"

[params.functions_and_methods]
signatures = ["transform.Plainify INPUT"]
returnType = "template.HTML"
aliases = ["plainify"]
+++

## 这一页解决什么问题

要把 HTML 内容变成纯文本：给搜索索引准备文本、生成 `<meta name="description">`、在 RSS 的 `<description>` 里放不带标签的摘要、给 `truncate` 提供没有标签干扰的输入。`plainify` 剥掉所有标签，只留文字。

`plainify` 与 `transform.Plainify` 是同一个函数：前者是别名。

## 什么时候用，什么时候别用

**该用**：

- 摘要、描述、搜索索引等只需要文字的场合；
- 在 [`strings.Truncate`](/functions/strings/truncate/) 之前去掉标签，避免把 `<p>` 之类的字符算进长度、或截出半个标签；
- 给 `title`、`alt` 等属性准备文本。

**别用**：

- 想要**保留结构**的纯文本 → 用页面对象的 `.Summary` 或 [`transform.HTMLToMarkdown`](/functions/transform/htmltomarkdown/)（后者保留 Markdown 结构）；
- 想输出时**不转义** → `plainify` 的返回类型虽然是 `template.HTML`，但输入里的实体**不会被解码**（实测 `<b>a &amp; b</b>` → `a &amp; b`）；需要还原实体再配合 [`transform.HTMLUnescape`](/functions/transform/htmlunescape/)；
- 想清理不受信任的 HTML 并输出 → `plainify` 会删除标签（实测 `<script>alert(1)</script>` → 空字符串、`<style>a{}</style>x` → `x`），但它是「取文本」不是安全过滤，不要把它当作消毒手段来信任；

## 上游给出的结果

```go-html-template
{{ "<b>BatMan</b>" | plainify }} → BatMan
```

## 完整示例：把 HTML 片段变成文本

```go-html-template {file="layouts/_partials/plain.html"}
{{ $s := "<p>Hello <b>World</b></p>" }}
<p>{{ $s | plainify }}</p>
<p>{{ "<p>a</p><p>b</p>" | plainify }}</p>
<p>{{ "<img src=x>" | plainify }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>Hello World
</p>
<p>a
b
</p>
<p></p>
```

**你应当看到什么**：标签被删掉，文字保留；**块级元素之间会留下换行**（第一、二行的末尾/中间有换行，`<p>` 之间也会换行），所以拿去做「一行摘要」时要再 [`strings.TrimSpace`](/functions/strings/trimspace/) 或把换行替换掉；纯图片（`<img>`）没有任何文字，结果是空的。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。下表「返回值」一列是函数原始返回。

| 输入 | 原始返回值 | 是否报错 |
| --- | --- | --- |
| `"<b>BatMan</b>"` | `BatMan` | 否 |
| `"<p>a</p><p>b</p>"` | `a\nb\n`（块级之间保留换行） | 否 |
| `"<b>a &amp; b</b>"` | `a &amp; b`（**实体不解码**） | 否 |
| `"<p>Hello <b>World</b></p>"` | `Hello World\n` | 否 |
| 空字符串 / `nil` | `""` | 否 |
| 数字 `42` | `"42"` | 否 |
| 布尔 `true` | `"true"` | 否 |
| `"<script>alert(1)</script>"` | `""`（script 标签及其内容一并删除） | 否 |
| `"<style>a{}</style>x"` | `x` | 否 |
| 返回类型 | `template.HTML`（实测 `printf "%T"` 输出 `template.HTML`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 摘要里出现多余空行 | 块级标签之间会留下换行 | 用 [`strings.TrimSpace`](/functions/strings/trimspace/) 或 `replace` 把换行换成空格 |
| 没报错但结果不对 | 文本里的 `&amp;` 没有变回 `&` | `plainify` 只删标签，不解码实体 | 再套 [`transform.HTMLUnescape`](/functions/transform/htmlunescape/) |
| 没报错但结果不对 | 只有图片的内容 `plainify` 后是空的 | 图片没有文字内容，`alt` 不会被取出来 | 需要 `alt` 就自己从标签/参数里取 |
| 没报错但结果不对 | 以为 `plainify` 能过滤危险内容就直接输出 | 它只是提取文本，不是安全过滤器 | 不可信输入不要依赖 `plainify` 做消毒 |

更多排查入口见[故障排查](/troubleshooting/)。
