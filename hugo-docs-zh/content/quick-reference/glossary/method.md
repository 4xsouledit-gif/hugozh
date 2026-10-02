+++
title = "方法（method）"
linkTitle = "方法"
description = "与对象关联、在模板动作中使用的可调用项，可返回值或执行动作。"
date = 2026-10-02
weight = 770
source = "https://gohugo.io/quick-reference/glossary/method/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断一个名字是方法还是函数，并通过它所属的对象查对用法"]
next = ["/methods/"]
+++

方法（method）用在[template action](g)中，与[object](g)关联，接收零个或多个[arguments](g)，并返回值或执行动作。例如 `IsHome` 是 `Page` 对象上的方法，当前页面是首页时返回 `true`。另请参见[function](g)。

## 为什么重要

模板里 `IsHome`、`.Title`、`.Resources.Get` 这类调用都是方法，它们挂在某个对象上，所以前面的点不能省。把方法当函数来调（漏掉接收者）或用错对象，Hugo 会报 `can't evaluate field` 或返回 nil，页面照常构建、只是内容空着。查文档时先确认它属于哪个对象，再回来看参数个数与返回值。

延伸阅读：[方法](/methods/)、[模板简介](/templates/introduction/)
