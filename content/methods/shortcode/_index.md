+++
title = "Shortcode 方法"
linkTitle = "Shortcode"
description = "在你的短代码模板中使用这些方法。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/shortcode/"
aliases = ["/variables/shortcodes"]
+++

## 这一页解决什么问题

[短代码](g)（shortcode）的模板放在 `layouts/_shortcodes/` 下，它渲染时拿到的上下文（点号 `.`）不是页面，而是一个**短代码对象**。本章列出的就是「在这个上下文里能做什么」：读调用方传进来的参数、拿到标签之间的内容、知道自己是第几次被调用、访问所在的页面与站点、在嵌套调用里找到父级、以及保存本次调用的临时数据。

不熟悉短代码本身（模板放哪、两种记法有什么区别）的读者，请先读[短代码](/shortcodes/)一章，再回来查具体方法的边界。

## 读完本章你应该能够

- 在短代码模板里按**位置**和**名称**取参数，并写出同时兼容两种调用方式的模板；
- 理解 `{{</* */>}}`（标准记法）与 `{{%/* */%}}`（Markdown 记法）下 `.Inner` 的差别，知道何时需要 `RenderString`、何时需要 `InnerDeindent`；
- 用 `.Name` 与 `.Position` 写出「一眼能定位到出错文件与行号」的错误消息；
- 用 `.Ordinal` 为重复调用的短代码生成唯一 ID，并分清嵌套调用的序号规则；
- 用 `.Parent` 让子短代码继承父短代码的参数；
- 用 `.Store`（或已弃用的 `.Scratch`）在两次短代码调用之间保持隔离的状态。

## 阅读顺序

1. **取参数**：[Get](/methods/shortcode/get/) → [Params](/methods/shortcode/params/) → [IsNamedParams](/methods/shortcode/isnamedparams/)——先能用对调用方的写法；
2. **处理内容**：[Inner](/methods/shortcode/inner/) → [InnerDeindent](/methods/shortcode/innerdeindent/)——再决定标签之间的 Markdown 怎么渲染；
3. **拿上下文**：[Page](/methods/shortcode/page/) → [Site](/methods/shortcode/site/) → [Parent](/methods/shortcode/parent/)——需要页面数据、站点数据或嵌套继承时；
4. **定位与状态**：[Name](/methods/shortcode/name/) → [Position](/methods/shortcode/position/) → [Ordinal](/methods/shortcode/ordinal/) → [Store](/methods/shortcode/store/) → [Scratch](/methods/shortcode/scratch/)（0.139.0 起弃用，改用 `Store`）；
5. **生成链接**：[Ref](/methods/shortcode/ref/) → [RelRef](/methods/shortcode/relref/)——短代码里指向其他页面时（注意它们与内容文件里的 [ref](/shortcodes/ref/) / [relref](/shortcodes/relref/) 短代码不是一回事）。
