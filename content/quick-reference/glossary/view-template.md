+++
title = "视图模板（view template）"
linkTitle = "视图模板"
description = "用 Page 对象上的 Render 方法调用的模板。"
date = 2026-10-02
weight = 1530
source = "https://gohugo.io/quick-reference/glossary/view-template/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断某个页面是用哪份视图模板渲染的，以及视图名写错会报什么错",
]
next = ["/templates/types/"]
+++

_视图模板_（view template）是用 `Page` 对象上的 [`Render`][] 方法调用的模板。

参见：[视图模板](/templates/types/#视图模板view)

## 为什么重要

视图模板是 [template](g) 的一种用途：在某个页面里渲染**另一个**页面的内容，典型场景是列表里每一项的摘要或卡片。它由 `Page` 的 `Render` 方法按视图名调用，不写视图名时用默认视图，名字写错则 Hugo 直接报找不到模板——这一点比模板查找顺序好排查。它和普通模板的区别不在语法，而在「谁渲染谁」：改之前先确认是哪一页在调用它。

延伸阅读：[模板类型](/templates/types/)、[Page.Render](/methods/page/render/)

[`Render`]: /methods/page/render/
