+++
title = "Content"
linkTitle = "Content"
description = "返回给定页面渲染后的内容。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/page/content/"

[params.functions_and_methods]
signatures = ["PAGE.Content"]
returnType = "template.HTML"
+++

## 这一页解决什么问题

正文在 Hugo 里写成 Markdown，读者看到的是 HTML，`Content` 就是这两者之间的那道门：它返回**渲染后**的 HTML（Markdown 已转换、短代码已执行、渲染钩子已生效），是单页模板里绕不开的一行。

## 什么时候用，什么时候别用

**该用**：

- 在 `single.html` 里输出文章正文；
- 需要正文的 HTML 片段做二次处理（截取、包一层容器）。

**别用**：

- 想输出**纯文本**（搜索索引、`meta description`）→ 用 [`Plain`](/methods/page/plain/) 或 [`PlainWords`](/methods/page/plainwords/)；
- 想单独输出摘要 → 用 `.Summary`；想剔除摘要 → [`ContentWithoutSummary`](/methods/page/contentwithoutsummary/)；
- 想从一段 Markdown **字符串**生成 HTML（不是页面正文）→ 用 [`transform.Markdownify`](/functions/transform/markdownify/)；
- 想拿**未渲染**的原始 Markdown → 用 `.RawContent`。

## 用法

`Page` 对象上的 `Content` 方法把 Markdown 与短代码（shortcode）渲染为 HTML。

```go-html-template
{{ .Content }}
```

## 完整示例：输出正文并确认它是渲染后的 HTML

最小站点：`content/docs/guide/alpha.md` 的正文含 `<!--more-->`、三个标题和一个短代码调用。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<article>
  <h1>{{ .Title }}</h1>
  {{ .Content }}
</article>
```

`hugo --source <站点目录> --ignoreCache` 构建后，`public/docs/guide/alpha/index.html` 里的正文部分形如：

```html
<article>
  <h1>极长的页面标题，用来演示 LinkTitle 的回退与覆盖</h1>
  <p>这是摘要部分，位于 more 注释之前。</p>
  <h2 id="section-1">Section 1</h2>
  <p>正文一。</p>
  <h3 id="section-11">Section 1.1</h3>
  <p>正文二。</p>
  <h2 id="section-2">Section 2</h2>
  <span class="hello">你好，短代码</span>

  <p>正文三。</p>
</article>
```

**你应当看到什么**：Markdown 变成了 `<h2>` / `<p>`，标题自动带上了 `id`（可直接做锚点），短代码变成了它模板的输出。`<!--more-->` 注释本身不会出现在结果里，但摘要仍然生效（可用 `.Summary` 取到）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；正文含中文、`<!--more-->`、标题与一个短代码调用。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面有正文 | 渲染后的 HTML，类型 `template.HTML`（不会再被转义） | 否 |
| 页面没有正文（只含前置元数据的 section 页） | 空字符串 | 否 |
| 正文含短代码调用 | 短代码模板的输出已内联进 HTML | 否 |
| 正文含 `<!--more-->` | 注释不输出，但 `.Summary` 仍可截取摘要 | 否 |
| 在页面自己的模板里调用 `.Content` | 正常工作，不会递归 | 否 |
| 返回类型 | `template.HTML`（按 HTML 输出） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 页面上出现标签文字 | 屏幕上直接显示 `<h2>` 这类字符 | 把 `.Content` 传给了会转义的上下文（如字符串拼接后再输出） | 不要再套转义；需要拼接时用 `printf "%s"` 后交给 `safeHTML` |
| 没报错但结果不对 | 正文里的短代码没有效果 | 短代码模板缺失，或内容里的调用被转义 | 检查 `layouts/_shortcodes/`，并确认内容中的调用写法 |
| 没报错但结果不对 | 正文里手写的 HTML 标签消失 | Goldmark 默认丢弃原始 HTML | 在 `[markup.goldmark.renderer]` 中设 `unsafe = true` |

更多排查入口见[故障排查](/troubleshooting/)。
