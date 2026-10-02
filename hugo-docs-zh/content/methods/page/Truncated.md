+++
title = "Truncated"
linkTitle = "Truncated"
description = "报告内容长度是否超过摘要长度。"
date = 2026-10-02
weight = 860
source = "https://gohugo.io/methods/page/truncated/"

[params.functions_and_methods]
signatures = ["PAGE.Truncated"]
returnType = "bool"
+++

## 这一页解决什么问题

列表页显示摘要后，要不要再给一个「阅读更多」？`.Truncated` 回答这个问题：**内容是否比摘要长**。它是 `bool`，所以可以安全地放进 `if`：

```go-html-template
{{ .Summary }}
{{ if .Truncated }}<a href="{{ .RelPermalink }}">阅读更多</a>{{ end }}
```

它和 [`.Summary`](/methods/page/summary/) 是配套的一对：`.Summary` 给内容，`.Truncated` 告诉你「这段内容是否被截断过」。

## 什么时候用，什么时候别用

**该用**：

- 列表/卡片上按需显示「阅读更多」；
- 判断「正文是否比自动摘要长」——决定要不要加分隔符或改摘要长度。

**别用**：

- 想判断「内容是否为空」→ 用 `.WordCount`、`.RawContent` 或 `.Content`；
- 想知道摘要长度 → 用 [`len`](/functions/go-template/len/)（`.Summary` 长度含 HTML 标签）；
- 想要「永远显示阅读更多」→ 直接写链接就好，不需要判断。

> [!NOTE]
> 如果你在前置元数据中定义摘要，`Truncated` 方法会返回 `false`（上游说明；实测确认）。

## 用法

你可以手动定义[摘要][]，也可以在前置元数据中定义，或者让它自动生成。手动摘要优先于前置元数据摘要，前置元数据摘要优先于自动摘要。

如果内容长度超过摘要长度，`Truncated` 方法返回 `true`。这在需要有条件地渲染“阅读更多”链接时很有用：

```go-html-template
{{ range .Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
  {{ if .Truncated }}
    <a href="{{ .RelPermalink }}">Read more...</a>
  {{ end }}
{{ end }}
```

## 完整示例：按需显示「阅读更多」

测试站的三个页面：

```md
<!-- content/posts/post-1.md：有 <!--more--> 分隔符 -->
第一篇的开场段落。

<!--more-->

## 第一节
```

```md
<!-- content/posts/post-2.md：短内容，没有分隔符 -->
第二篇正文，只有一小段。
```

```toml
# content/posts/summary-front.md：前置元数据里写了 summary
summary = "手写摘要。"
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

| 页面 | `.Truncated` | 是否会渲染「阅读更多」 |
| --- | --- | --- |
| `/posts/post-1/`（有 `<!--more-->`） | `true` | 是 |
| `/posts/bundle-1/`（有 `<!--more-->`） | `true` | 是 |
| `/posts/post-2/`（短内容、无分隔符） | `false` | 否 |
| `/posts/summary-front/`（front matter `summary`） | `false` | 否 |
| `/posts/empty-body/`（正文为空） | `false` | 否 |

**你应当看到什么**：只有**确实被截断**的页面才出现「阅读更多」。两条 `<!--more-->` 的页面都是 `true`；front matter 写了 `summary` 的页面即使正文很长也是 `false`（上游已说明的规则）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有 `<!--more-->` 且其后有内容 | `true`（实测） | 否 |
| 短内容、自动摘要=全文 | `false`（实测） | 否 |
| front matter 定义了 `summary` | `false`（上游已说明，实测确认） | 否 |
| 正文为空 | `false`（实测） | 否 |
| 在 `if` 中使用 | 安全，无需额外判空 | 否 |
| 返回类型 | `bool` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[summary]: /content-management/summaries/
