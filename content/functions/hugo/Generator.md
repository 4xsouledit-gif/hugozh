+++
title = "hugo.Generator"
linkTitle = "hugo.Generator"
description = "返回一个 HTML meta 元素，用于标明生成本站的软件。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/hugo/generator/"

[params.functions_and_methods]
signatures = ["hugo.Generator"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

你要在 `<head>` 里放一行「本页由 Hugo 生成」的元信息，让浏览器插件、审计工具和搜索引擎知道你用了什么生成器。`hugo.Generator` 直接返回一个**完整的 `meta` 元素**（含标签本身），不是内容片段——所以模板里不需要再写外层标签。

## 什么时候用，什么时候别用

**该用**：

- 想把生成器信息写进页面 `<head>`，一行搞定；
- 想让 `meta` 里的版本号随升级自动更新（你自己硬编码就会写死）。

**别用**：

- 想拿到版本号字符串本身 → 用 [`hugo.Version`](/functions/hugo/version/)；`hugo.Generator` 返回的是 HTML 标签；
- 想自己控制 `meta` 的属性 → 手写 `<meta name="generator" content="Hugo {{ hugo.Version }}">`。

上游给出的示意输出：

```go-html-template
{{ hugo.Generator }} → <meta name="generator" content="Hugo 0.167.0">
```

## 完整示例：放进 head 局部模板

```go-html-template {file="layouts/_partials/head.html"}
<head>
  <meta charset="utf-8">
  {{ hugo.Generator }}
</head>
```

在本机（Hugo 0.167.0 extended，Windows）实测渲染为：

```html
<head>
  <meta charset="utf-8">
  <meta name="generator" content="Hugo 0.167.0">
</head>
```

**你应当看到什么**：`meta` 标签原样出现在产物里，**没有被转义成 `&lt;meta …&gt;`**——因为返回值类型是 `template.HTML`。这也是它与你手写字符串最大的区别。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点（HTML 模板）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hugo.Generator }}` | `template.HTML`，形如 `<meta name="generator" content="Hugo 0.167.0">` | 否 |
| 输出到 HTML 模板 | 原样输出标签，不转义 | 否 |
| 空值 / `nil` | 不适用：恒有值 | 否 |
| 传入参数 `{{ hugo.Generator "x" }}` | —— | 是：`wrong number of args for Generator: want 0 got 1` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物里出现两行甚至多行 generator | 局部模板被引用了两次（例如 `head.html` 在 baseof 与 single 里各调一次） | 只在唯一的 head 局部模板里调用一次 |
| 没报错但结果不对 | 想取版本号做逻辑判断却拿到了整段 HTML | 把 `hugo.Generator` 当字符串用了 | 版本号用 [`hugo.Version`](/functions/hugo/version/) |
| 报错看不懂 | `wrong number of args for Generator: want 0 got 1` | 给它传了参数 | 它无参数，直接写 `{{ hugo.Generator }}` |

更多排查入口见[故障排查](/troubleshooting/)。
