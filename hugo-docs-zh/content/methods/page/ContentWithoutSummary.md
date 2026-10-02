+++
title = "ContentWithoutSummary"
linkTitle = "ContentWithoutSummary"
description = "返回给定页面渲染后的内容，但不含内容摘要。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/page/contentwithoutsummary/"

[params.functions_and_methods]
signatures = ["PAGE.ContentWithoutSummary"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

列表页已经用 `.Summary` 展示了开头，详情页里往往不想**再重复**一遍这段开头。`ContentWithoutSummary` 返回去掉摘要之后的正文 HTML，正适合「摘要单独排版 + 其余正文」的版式。

## 什么时候用，什么时候别用

**该用**：

- 页面顶部已经有独立的摘要区块，正文区要从摘要之后开始；
- 摘要与正文之间有分隔线、广告位、作者信息等插入内容。

**别用**：

- 想输出**完整**正文 → 用 [`Content`](/methods/page/content/)；
- 想输出摘要本身 → 用 `.Summary`；
- 摘要定义在前置元数据（`summary = "…"`）里 → 返回值与 `.Content` 相同（上游已说明），此时用本方法没有意义。

## 用法

在使用手动或自动[内容摘要][]时，`Page` 对象上的 `ContentWithoutSummary` 方法会把 Markdown 与短代码渲染为 HTML，并在结果中剔除内容摘要。

如果你在前置元数据中定义内容摘要，`ContentWithoutSummary` 方法的返回值与 `Content` 相同。

```go-html-template
{{ .ContentWithoutSummary }}
```

## 完整示例：摘要与正文各输出一次

最小站点：`content/docs/guide/alpha.md` 的正文第一段之后有一行 `<!--more-->`（手动摘要标记）。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<div class="body">{{ .ContentWithoutSummary }}</div>
```

`hugo --source <站点目录> --ignoreCache` 构建后，正文部分渲染为：

```html
<div class="body"><h2 id="section-1">Section 1</h2>
<p>正文一。</p>
<h3 id="section-11">Section 1.1</h3>
<p>正文二。</p>
<h2 id="section-2">Section 2</h2>
<span class="hello">你好，短代码</span>

<p>正文三。</p>
</div>
```

同一个页面上，`.Content` 的开头则是摘要那段：

```html
<p>这是摘要部分，位于 more 注释之前。</p>
<h2 id="section-1">Section 1</h2>
```

**你应当看到什么**：`.Summary` 里的那句「这是摘要部分，位于 more 注释之前。」**不在**正文里了，其余内容与 `.Content` 完全一致；标题的 `id`、短代码的输出都保留。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 用 `<!--more-->` 手动定义摘要，`beta.md` 正文很短、没有摘要标记。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正文含 `<!--more-->` | 返回该标记**之后**的渲染 HTML | 否 |
| 正文没有摘要标记 | 与 `.Content` 相同 | 否 |
| 摘要在前置元数据中定义 | 与 `.Content` 相同（上游已说明） | 否 |
| 页面没有正文 | 空字符串 | 否 |
| 返回类型 | `template.HTML`（按 HTML 输出） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 返回值与 `.Content` 一模一样 | 摘要定义在前置元数据里，或正文没有摘要标记 | 使用 `<!--more-->`，或接受「摘要即正文开头」的行为 |
| 没报错但结果不对 | 摘要段落仍出现在正文里 | 把 `.Summary` 和 `.Content` 混用，而不是 `.ContentWithoutSummary` | 正文区改用 `.ContentWithoutSummary` |
| 版式出现多余空行 | 正文开头有一行空白 | 渲染结果本身以换行开头 | 用 CSS 的 `:first-child` 处理，或在 `<div>` 内不加额外空行 |

更多排查入口见[故障排查](/troubleshooting/)。

[内容摘要]: /content-management/summaries/#manual-summary
