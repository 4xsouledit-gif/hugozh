+++
title = "URL 函数"
linkTitle = "urls"
description = "用这些函数处理 URL。"
date = 2026-10-02
weight = 300
source = "https://gohugo.io/functions/urls/"
+++

## 这一页解决什么问题

这一章收录模板里处理 URL 的全部函数：把站内路径变成可用的地址、在绝对与相对之间切换、拼接片段、解析与编码、生成锚点与 slug、以及在页面之间做经过校验的链接。上游这些页原来只有签名和几行说明，本站为每页补上了「什么时候用 / 什么时候别用」「可直接粘贴的实测示例」与「返回值边界」。

## 读完本章你应该能够

- 按需求选对函数：需要完整地址、相对地址、语言前缀、还是页面间链接；
- 说清最容易踩的两组坑：**带前导斜杠的输入会丢掉站点子路径**（[`urls.AbsURL`](/functions/urls/absurl/)、[`urls.AbsLangURL`](/functions/urls/abslangurl/)、[`urls.RelURL`](/functions/urls/relurl/)、[`urls.RelLangURL`](/functions/urls/rellangurl/) 都有这个问题），以及 [`urls.Anchorize`](/functions/urls/anchorize/) 与 [`urls.URLize`](/functions/urls/urlize/) 的分工；
- 知道哪些函数在输入不合法时会**直接让构建失败**（[`urls.Parse`](/functions/urls/parse/)、[`urls.Ref`](/functions/urls/ref/)、[`urls.RelRef`](/functions/urls/relref/)）。

## 建议阅读顺序

1. **先分清「绝对 / 相对」与「是否带语言前缀」**：[urls.AbsURL](/functions/urls/absurl/)、[urls.RelURL](/functions/urls/relurl/)、[urls.AbsLangURL](/functions/urls/abslangurl/)、[urls.RelLangURL](/functions/urls/rellangurl/)；
2. **页面之间的链接（会校验目标）**：[urls.Ref](/functions/urls/ref/)、[urls.RelRef](/functions/urls/relref/)；
3. **拼接与解析**：[urls.JoinPath](/functions/urls/joinpath/)、[urls.Parse](/functions/urls/parse/)；
4. **编码与清理**：[urls.PathEscape](/functions/urls/pathescape/)、[urls.PathUnescape](/functions/urls/pathunescape/)、[urls.Anchorize](/functions/urls/anchorize/)、[urls.URLize](/functions/urls/urlize/)。

本站在这些页里反复强调一条经验：**能交给 `ref`/`relref` 的页面链接，就不要手工拼路径**——手工拼出来的地址不会在校验期报错，只会在线上 404。
