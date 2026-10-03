+++
title = "transform.HTMLToMarkdown"
linkTitle = "HTMLToMarkdown"
description = "返回转换为 Markdown 后的给定 HTML。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/transform/htmltomarkdown/"

[params.functions_and_methods]
signatures = ["transform.HTMLToMarkdown INPUT"]
returnType = "string"
+++

（0.151.0 新增）

## 这一页解决什么问题

手上有 HTML（抓取的片段、`.Content`、别人给的 `<p>` 块），但要把它**当文本处理或存成 Markdown**：生成 `.md` 输出格式、把网页内容转进内容文件、给 AI/搜索索引提供带结构的纯文本、在只有 Markdown 的位置（例如某些 API 字段）复用已有内容。

`transform.HTMLToMarkdown` 把 HTML 转成 Markdown：标签变成 Markdown 语法（`<b>` → `**`、`<h2>` → `##`、`<a>` → `[...](...)`、表格 → GFM 表格），文本内容保留。

`transform.HTMLToMarkdown` 函数借助 [`html-to-markdown`][] Go 包把 HTML 转换为 Markdown。

> [!NOTE]
> 该函数是实验性的，其 API 将来可能变化。

## 什么时候用，什么时候别用

**该用**：

- 把 `.Content`（渲染好的 HTML）转回 Markdown，用于 Markdown 输出格式或对外接口；
- 抓取来的 HTML 片段需要变成可编辑、可版本管理的文本；
- 想要**保留结构**的纯文本（对比 [`transform.Plainify`](/functions/transform/plainify/)，后者把结构也丢掉）。

**别用**：

- 只想去掉标签得到一行文字 → 用 [`transform.Plainify`](/functions/transform/plainify/) 更直接；
- 想把 Markdown 渲染成 HTML → 方向相反，用 [`transform.Markdownify`](/functions/transform/markdownify/)；
- 想**完整还原**原始 Markdown → 不可能：转换是有损的（自定义短代码、渲染钩子产物、内联样式、`class` 都会丢）；
- 输出要放进 HTML 页面 → 返回值是 `string`，Markdown 里的 `*`、`#` 原样输出即可；但若要把结果当 HTML 用，得先经过 Markdown 渲染。

## 用法

```go-html-template
{{ .Content | transform.HTMLToMarkdown | safeHTML }}
```

## 插件

转换过程由以下 `html-to-markdown` 插件实现：

插件|说明
:--|:--
Base|实现基本的共享功能
CommonMark|按 [CommonMark][] 规范实现 Markdown
Table|按 [GitHub 风格 Markdown][] 规范实现表格

## 完整示例：把 HTML 片段转成 Markdown

```go-html-template {file="layouts/_partials/to-md.html"}
{{ $s := "<b>加粗</b>与<a href=\"/x/\">链接</a>" }}
<p>{{ $s | transform.HTMLToMarkdown }}</p>
<p>{{ "<ul><li>x</li><li>y</li></ul>" | transform.HTMLToMarkdown }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>**加粗**与[链接](/x/)</p>
<p>- x
- y</p>
```

**你应当看到什么**：`<b>` 变成 `**`、`<a>` 变成 `[文字](地址)`、`<ul>/<li>` 变成 `- ` 列表；Markdown 里的 `*`、`#` 在 HTML 页面上原样显示（它们此时只是文本）。要得到最终排版，还需要再过一次 Markdown 渲染。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。下表「结果」一列是函数原始返回。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"<b>a</b>"` | `**a**` | 否 |
| `"<h2>T</h2><p>x</p>"` | `## T\n\nx` | 否 |
| `"<a href=\"/x/\">x</a>"` | `[x](/x/)` | 否 |
| `"<ul><li>x</li><li>y</li></ul>"` | `- x\n- y` | 否 |
| `"<table><tr><th>a</th></tr><tr><td>1</td></tr></table>"` | GFM 表格（`\| a \|` / `\|---\|` / `\| 1 \|`） | 否 |
| `"<img src=\"/i.png\" alt=\"pic\">"` | `![pic](/i.png)` | 否 |
| `"<p>a<br>b</p>"` | `a  \nb`（行尾两个空格表示软换行） | 否 |
| `"<script>alert(1)</script>"` | `""`（脚本被丢弃） | 否 |
| `""`、`nil` | `""` | 否 |
| 纯文本（如 `"plain"`）、数字 `42` | 原样返回 `plain`、`42` | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 转换后内容「少了很多」 | 转换是有损的：短代码、渲染钩子产物、内联样式、`class` 不保留 | 不要期望可逆；关键结构请保留在原始 Markdown 里 |
| 没报错但结果不对 | 输出里的 `**`、`#` 没有排版效果 | 返回的是 Markdown 文本，需要再渲染 | 用 [`transform.Markdownify`](/functions/transform/markdownify/) 或交给 `.RenderString` |
| 没报错但结果不对 | 列表/表格后面缺空行，与原 Markdown 不同 | 各 Markdown 实现要求的空行规则不同 | 输出后交给 Markdown 渲染器时留意空行，必要时手工补齐 |
| 没报错但结果不对 | `<script>`、`<style>` 里的内容消失了 | 转换时会丢弃脚本与样式（实测） | 这是预期行为；需要保留就自己去原始 HTML 里取 |

更多排查入口见[故障排查](/troubleshooting/)。

[CommonMark]: https://spec.commonmark.org/current/
[GitHub 风格 Markdown]: https://github.github.com/gfm/
[`html-to-markdown`]: https://github.com/JohannesKaufmann/html-to-markdown?tab=readme-ov-file#readme
