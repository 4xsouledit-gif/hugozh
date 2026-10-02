+++
title = "渲染钩子"
linkTitle = "渲染钩子"
description = "用模板覆盖 Markdown 元素到 HTML 的转换：模板放在哪里、怎么命名、能输出什么，以及配错时该怎么查。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/render-hooks/"

[params.teach]
difficulty = "进阶"
time = "约 1 小时"
prereq = [
  "站点里已经在用 Markdown 内容，并且你会看 `public/` 里生成的 HTML——本章的验证全靠对产物。",
  "知道模板放在 `layouts/` 下、函数与上下文是什么；不确定先读[模板简介](/templates/introduction/)。",
]
outcomes = [
  "说清渲染钩子与短代码的分工，知道该用哪一个；",
  "在项目里正确创建 `layouts/_markup/`，并按命名规则判断自己写的钩子为什么没生效；",
  "从每页的「上下文」小节查出可用字段，并分清 `string`、`template.HTML`、`template.HTMLAttr` 三种类型的输出方式；",
  "用「加唯一记号 + 搜索产出 HTML」证明钩子真的生效，而不是靠肉眼判断。",
]
next = ["/render-hooks/introduction/", "/render-hooks/links/", "/shortcodes/"]
+++

这一章讲的是 Hugo 里一处**不太按常理出牌**的功能。多数功能配错了会立刻报错，渲染钩子（render hook）配错了往往**什么都不说**：构建成功、页面照常渲染，只是效果没出现。所以本章的重点不是「有哪些钩子」，而是「**它在哪里生效、名字怎么取、结果对不对**」。

## 读完本章你应该能够

- 说清渲染钩子与[短代码](/shortcodes/)的分工：短代码在**调用点**插入一段内容，渲染钩子改变**某一类 Markdown 元素**的渲染方式；
- 在项目里正确创建 `layouts/_markup/`，并判断某个元素当前走的是 Hugo 默认渲染、主题提供的钩子，还是自己写的钩子；
- 按 `render-<元素>[-<限定>][.<输出格式>].<后缀>` 的规则给钩子模板命名，知道哪种写法会「静默失效」；
- 从每个钩子页面的「上下文」小节查出可用字段，并分清哪些是 `string`（需要 `safeURL`）、哪些是 `template.HTML`（直接输出）、哪些要用 `safeHTMLAttr`；
- 用「加唯一记号 + 搜索产出 HTML」的办法证明钩子真的生效，而不是靠肉眼觉得差不多；
- 遇到「没报错但结果不对」时，先怀疑结构与配置，再怀疑模板逻辑。

## 本章要点速览

### 配置位置

渲染钩子不是配置项，而是**模板文件**，只放在 `_markup` 目录里：

| 位置 | 作用范围 | 优先级 |
| --- | --- | --- |
| 项目 `layouts/_markup/` | 只对自己的站点生效 | 高，覆盖主题同名文件 |
| 主题 `themes/<主题名>/layouts/_markup/` | 由主题提供 | 低 |

改主题钩子的正确做法是在项目里放同名文件覆盖它，而不是直接改 `themes/`。`_markup` 目录还可以放在任意以页面路径命名的层级下，匹配得越深越优先。

**关键点：项目里没有 `_markup/` 不等于站上没有钩子。** 实测（Hugo 0.167，本站）：本项目 `layouts/` 下只有 `_default/baseof.html`，而站上的链接钩子与引用块钩子全部来自主题 `hugo-docs-theme`。

### 模板命名规则

```text
render-<元素>[-<限定>][.<输出格式>].<后缀>
     必填      可选        可选
```

| 段 | 例子 |
| --- | --- |
| 元素类型 | `render-link.html`、`render-image.html`、`render-table.html` |
| 限定（语言／子类型） | `render-codeblock-mermaid.html`、`render-blockquote-alert.html`、`render-passthrough-inline.html` |
| 输出格式 | `render-link.rss.xml` |

七个元素名固定为 `blockquote`、`codeblock`、`heading`、`image`、`link`、`passthrough`、`table`；限定名由 Hugo 给定（代码块用语言名，引用块用 `alert`／`regular`，透传元素用 `block`／`inline`）。**限定名拼错不会报错，只会永远不匹配。**

### 钩子输出的三种值类型

| 类型 | 典型来源 | 输出时 |
| --- | --- | --- |
| `template.HTML`（可信 HTML） | `.Text`；`transform.HighlightCodeBlock` 的 `.Wrapped`／`.Inner` | 直接 `{{ .Text }}` |
| `string`（普通字符串） | `.Destination`、`.Title`、`.PlainText`、`.Type`、`.Anchor` | 当正文会自动转义；当 URL 属性要套 `safeURL` |
| `template.HTMLAttr`（属性片段） | 用 `printf "%s=%q"` 拼出的属性 | 必须套 `safeHTMLAttr`，否则引号会变成 `&#34;` |

「三种类型」是本站为便于排查所做的归纳，依据是各页示例中的 `safeURL`／`safeHTMLAttr` 写法与上下文字段表里标注的类型；官方文档没有这一提法。

### 配错时的典型报错

| 现象 | 原因 |
| --- | --- |
| **没有任何报错**，页面完全没变化 | 文件位置或文件名不对；限定名拼错；站点缺少依赖的配置项（如 `wrapStandAloneImageWithinParagraph`、Passthrough 扩展） |
| 报错带模板文件名与行号 | 模板里的 `{{ if }}`／`{{ range }}`／`{{ with }}` 没配平 |
| `can't evaluate field ...` | 用了别的钩子才有的字段 |
| 一条自定义消息 | 模板里的 `errorf` 主动报错（例如公式渲染失败） |

完整的排查顺序与修法见[简介](/render-hooks/introduction/#配错时的典型报错与常见坑)；更系统的排查方法见[故障排查](/troubleshooting/)。

## 建议的阅读顺序

1. **[简介](/render-hooks/introduction/)** —— 先读这一页。配置位置、命名规则、查找顺序、输出值类型与典型报错都在这里，后面各页不再重复。
2. **[链接](/render-hooks/links/)** —— 结构最简单的一个钩子，适合拿来练手；顺带讲清「自定义钩子会顶掉内建钩子」这件事。
3. **[图片](/render-hooks/images/)** —— 结构与链接几乎一样，但多一个 `IsBlock` 与一项容易漏配的站点配置。
4. **[标题](/render-hooks/headings/)** —— 字段最少，风险却最大：漏一个 `Anchor`，目录与锚点导航整体失效。
5. **[代码块](/render-hooks/code-blocks/)** —— 内容最多的一页：信息字符串的两类属性、按语言拆模板、Mermaid 与 `Store` 中转。
6. **[引用块](/render-hooks/blockquotes/)** —— 唯一一个「普通元素 + 警示块」两条分支的钩子，含本站主题的实际实现。
7. **[表格](/render-hooks/tables/)** —— 双层循环结构，练习「自己接管 HTML 结构就不能漏标签」。
8. **[原样透传](/render-hooks/passthrough/)** —— 最特殊的一页：钩子触发的**前提**是站点先开启了 Goldmark 扩展，示例是在构建时渲染数学公式。

只想解决眼前问题的话，不必按顺序读：从上面挑对应的那一页即可，每页都自带「什么时候用 / 什么时候别用」「验证方法」与「常见坑」。

## 相关章节

- [短代码](/shortcodes/) —— 在调用点插入内容，与渲染钩子分工互补；
- [模板](/templates/) —— 钩子模板也是模板，写法与查找顺序同源；
- [Markdown 属性](/content-management/markdown-attributes/) —— 多个钩子的 `Attributes` 字段都来自这里；
- [图表](/content-management/diagrams/) —— 代码块钩子的典型应用（GoAT 与 Mermaid）；
- [数学公式](/content-management/mathematics/) —— 透传钩子的典型应用（KaTeX）。
