+++
title = "Summary"
linkTitle = "Summary"
description = "返回给定页面的摘要。"
date = 2026-10-02
weight = 810
source = "https://gohugo.io/methods/page/summary/"

[params.functions_and_methods]
signatures = ["PAGE.Summary"]
returnType = "template.HTML"

[[params.examples]]
id    = "methods/page-summary-vs-description"
title = "真实页面上的 .Summary 与 .Description"
args  = { path = "/getting-started/quick-start/" }
note  = "上表那个 fixture 例子需要专门的测试内容；这一条跑的是**本站真实页面**，由 `site.GetPage` 取到后现场读取属性。"
+++

## 这一页解决什么问题

列表页要显示每篇文章的开头一段（生成 `<meta name="description">`、做卡片摘要），`.Summary` 就是这份「摘要 HTML」。它有三种来源，优先级依次是：

1. **手动摘要**：正文里的 `<!--more-->` 分隔符之前的全部内容；
2. **前置元数据摘要**：front matter 里的 `summary` 字段；
3. **自动摘要**：[`summaryLength`](/configuration/all/) 决定的字数截断。

实测这三条规则确实按此顺序生效（见下表）。想看「摘要是不是比正文短」，用 [`.Truncated`](/methods/page/truncated/)。

## 什么时候用，什么时候别用

**该用**：

- 列表页/卡片显示摘要，并配合 `.Truncated` 决定是否显示「阅读更多」；
- SEO：把摘要塞进 `<meta name="description">`（需要先 `plainify`）。

**别用**：

- 想要完整正文 → 用 [`.Content`](/methods/page/content/)；
- 想要纯文本摘要 → `.Summary` 是 HTML，需要 `{{ .Summary | plainify }}`；
- 想自己控制截断长度 → 用 `<!--more-->` 或 front matter `summary`，自动摘要的长度在[站点配置](/configuration/all/)里改；
- 想要不含摘要的正文（例如 RSS 全文）→ 用 [`ContentWithoutSummary`](/methods/page/contentwithoutsummary/)。

## 用法

<!-- Do not remove the manual summary divider below. -->
<!-- If you do, you will break its first literal usage on this page. -->

<!--more-->

你可以手动定义[摘要][]，也可以在前置元数据中定义，或者让它自动生成。手动摘要优先于前置元数据摘要，前置元数据摘要优先于自动摘要。

要在列出某个 section 中的页面时，在每个链接下方附上摘要：

```go-html-template
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
{{ end }}
```

> [!WARNING]
> 自动生成的 `.Summary` 可能会从中间截断块级标签（例如 `blockquote`），导致浏览器去补全结束标签。详情以及避免该问题的方法请参见[自动摘要][]。

取决于内容长度和摘要的定义方式，摘要可能等同于内容本身。要判断内容长度是否超过摘要长度，请使用 `Page` 对象上的 [`Truncated`][] 方法。这在需要有条件地渲染“阅读更多”链接时很有用：

```go-html-template
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
  {{ if .Truncated }}
    <a href="{{ .RelPermalink }}">Read more...</a>
  {{ end }}
{{ end }}
```

> [!NOTE]
> 如果你在前置元数据中定义摘要，`Truncated` 方法会返回 `false`。

## 完整示例：三种摘要来源对照

测试站的三个内容文件：

```md
<!-- content/posts/bundle-1/index.md（用 <!--more--> 手动分隔） -->
叶子包的开场段落。

<!--more-->

## 包内标题
包内正文。
```

```toml
# content/posts/summary-front.md（前置元数据摘要）
summary = "手写摘要。"
```

```md
<!-- content/posts/post-2.md（没有分隔符、也没有 summary） -->
第二篇正文，只有一小段。
```

列表模板：

```go-html-template {file="layouts/_default/list.html"}
{{ range .RegularPages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
  {{ if .Truncated }}<a href="{{ .RelPermalink }}">阅读更多</a>{{ end }}
{{ end }}
```

实测（Hugo 0.167.0）：

| 页面 | `.Summary` 的值 | `.Truncated` |
| --- | --- | --- |
| `/posts/bundle-1/` | `<p>叶子包的开场段落。</p>` | `true` |
| `/posts/post-1/`（有 `<!--more-->`） | `<p>第一篇的开场段落。</p>` | `true` |
| `/posts/summary-front/`（front matter `summary`） | `手写摘要。` | `false` |
| `/posts/post-2/`（短内容、无分隔符） | `<p>第二篇正文，只有一小段。</p>` | `false` |
| `/posts/empty-body/`（正文为空） | 空字符串 | `false` |

**你应当看到什么**：手动分隔符与自动摘要都带 `<p>` 包裹，而 front matter 的 `summary` **原样输出**（`手写摘要。` 没有 `<p>`）；前三种情况下 `.Truncated` 只有「内容确实被截断」时才为 `true`。

### 本站实跑：真实页面上的 `.Summary`

{{< examples >}}

模板用 `site.GetPage` 取到本站一个真实页面，再现场读它的 `description`、`.Summary`、`.WordCount` 与 `.ReadingTime`——也就是列表页拿到的同一份数据。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正文含 `<!--more-->` | 分隔符之前的 HTML（实测带 `<p>`） | 否 |
| front matter 有 `summary` | 该字符串原样（实测无 `<p>`） | 否 |
| 都没有、内容很短 | 自动摘要 = 全部内容，`.Truncated` 为 `false` | 否 |
| 正文为空 | 空字符串（实测） | 否 |
| 返回类型 | `template.HTML`（输出不转义） | 否 |
| 想要纯文本 | 需自行 `plainify` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Truncated`]: /methods/page/truncated/
[automatic summary]: /content-management/summaries/#automatic-summary
[summary]: /content-management/summaries/
