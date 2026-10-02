+++
title = "页面集合（page collection）"
linkTitle = "页面集合"
description = "由 Page 对象构成的切片。"
date = 2026-10-02
weight = 860
source = "https://gohugo.io/quick-reference/glossary/page-collection/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断列表模板里拿到的是不是页面集合，并知道该在它上面调用排序、筛选与分组方法"]
next = ["/quick-reference/page-collections/"]
+++

页面集合（page collection）是由 `Page` 对象构成的切片。

## 为什么重要

列表页、首页、分类法页上的 `.Pages`、`.RegularPages`、`site.RegularPages` 拿到的都是页面集合，几乎每个列表模板都要 `range` 它，再用 `.ByWeight`、`.ByDate`、`Where`、`GroupBy` 这类方法决定顺序与分组。
它和单个页面对象不是一回事：在集合上取 `.Title` 之类的字段会直接报错，而集合为空时模板会安静地渲染出空列表——「页面明明有内容，列表却是空的」多数情况下是集合本身取错了。

延伸阅读：[页面集合速查](/quick-reference/page-collections/) · [页面集合方法](/methods/pages/)
