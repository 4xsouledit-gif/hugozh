+++
title = "语法高亮样式"
linkTitle = "高亮样式"
description = "为代码示例选择一种语法高亮样式，并了解明暗模式的对应关系。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/quick-reference/syntax-highlighting-styles/"
+++

## 概述

Hugo 提供几种为代码示例添加语法高亮的方式：

- 在模板中使用 [`transform.Highlight`](/functions/transform/highlight/) 函数
- 在任何[内容格式](g)中使用 [`highlight`](/shortcodes/highlight/) 短代码
- 在 Markdown 内容中使用[围栏代码块](/content-management/syntax-highlighting/#fenced-code-blocks)

无论用哪种方式，样式都取自下列配置。在项目配置里设置默认样式：

```toml
[markup.highlight]
style = 'monokai'
```

详见[配置 Markup](/configuration/markup/#highlight)。

默认情况下 Hugo 用内联 CSS 应用高亮；若想改用外部样式表，把配置中的
[`noClasses`](/configuration/markup/#noclasses) 设为 `false`，再用
[`hugo gen chromastyles`](/commands/hugo_gen_chromastyles/) 命令生成样式表。

## 明暗模式

（0.164.0 新增）语法高亮样式面向浅色或深色显示而设计，部分浅色样式有对应的深色版本。使用外部样式表时，可以按用户偏好或环境切换。

完整对照图（每种样式的实际渲染效果）请见上游页面：
<https://gohugo.io/quick-reference/syntax-highlighting-styles/>

本站不在页面内嵌样式画廊——那需要为六十余种样式各渲染一段示例代码；用上面两条配置（`style` 指定样式、`hugo gen chromastyles` 生成样式表）即可切换到任意 Chroma 样式。
