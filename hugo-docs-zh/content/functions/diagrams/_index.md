+++
title = "图表函数"
linkTitle = "diagrams"
description = "在构建时把 Mermaid 图表渲染成 SVG：用 diagrams.Goat 生成图表标记，配合代码块渲染钩子。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/diagrams/"

[params.teach]
difficulty = "进阶"
time = "按需查阅；动手约 20 分钟"
prereq = [
  "站点里已经能渲染代码块，并且你知道[渲染钩子](/render-hooks/)是什么（本组通常与代码块钩子配合）。",
  "项目里装有 Go（`diagrams.Goat` 需要它），或者你愿意在构建机上装。",
]
outcomes = [
  "在 Markdown 里用 `mermaid` 代码块写图表，并让它渲染成内联 SVG 而不是一段纯文本；",
  "说清这一步发生在**构建期**（因此读者端不需要 JavaScript）还是**浏览器端**；",
  "遇到「图没出来」时，按「钩子是否生效 → Go 是否可用 → 构建日志」三层排查。",
]
next = ["/render-hooks/code-blocks/", "/content-management/diagrams/", "/functions/diagrams/goat/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`Goat`](/functions/diagrams/goat/) | 把 Mermaid 图表定义渲染成 SVG（构建期完成，产物是内联 SVG） |

## 什么时候用、什么时候别用

- **用**：希望图表在**禁用 JavaScript** 或公众号/邮件这类环境里也能显示；或想让页面少加载一个前端库；
- **别用**：图表需要交互（缩放、点击节点）→ 交给浏览器端渲染的方案更合适；
- **代价**：`diagrams.Goat` 依赖构建机上的 Go 工具链，**构建会变慢**，CI 上还要保证 Go 可用。图多时先量一下耗时再决定。

本站内容侧的应用示例见[图表](/content-management/diagrams/)；让它自动作用于所有 `mermaid` 代码块，靠的是[代码块渲染钩子](/render-hooks/code-blocks/)。

下方列出本站收录的本组全部函数。
