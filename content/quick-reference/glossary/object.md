+++
title = "对象（object）"
linkTitle = "对象"
description = "可以带有关联方法，也可以不带的数据结构。"
date = 2026-10-02
weight = 820
source = "https://gohugo.io/quick-reference/glossary/object/"

[params.teach]
difficulty = "参考"
time = "按需查阅"
prereq = [
  "在文档里遇到不认识的 Hugo 术语时查阅。",
]
outcomes = [
  "分清「对象」与「值」：对象上可以挂方法，`.Title` 这类写法取的就是对象的方法；",
  "判断一个模板变量拿到的是对象、切片还是映射，从而决定用 `range` 还是直接取字段。",
]
next = ["/methods/", "/functions/"]
+++

对象（object）是一种数据结构，可以带有关联的 [methods](g)，也可以不带。

## 为什么重要

模板里几乎所有「点出来的东西」都是对象：`.`（页面）、`site`、`.`Params`、资源。**对象与普通值的区别是它身上挂着方法**——`$page.Title`、`$resource.Width` 都是方法调用，不是读一个字段。写模板时若把对象当字符串用（例如想直接打印它），得到的是调试用的结构描述，而不是你要的文本；反过来，把字符串当对象用（`$s.Title`）会直接报 `can't evaluate field`。

判断类型最快的办法是 `printf "%T" $x` 或 [`debug.Dump`](/functions/debug/dump/)，别靠猜。

延伸阅读：[方法](/methods/)、[检查与调试](/troubleshooting/inspection/)
