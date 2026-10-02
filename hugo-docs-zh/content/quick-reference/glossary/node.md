+++
title = "节点（node）"
linkTitle = "节点"
description = "逻辑树中的任意页面，可以是分支包，也可以是常规页面。"
date = 2026-10-02
weight = 800
source = "https://gohugo.io/quick-reference/glossary/node/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能用 `.IsNode` 判断一个页面是不是节点，并解释取子页面集合为什么会为空"]
next = ["/methods/page/isnode/"]
+++

节点（node）是[logical tree](g)中的任意页面。节点可以是[branch](g)，其[page kind](g)为 `home`、`section`、`taxonomy` 或 `term`；也可以是[regular page](g)（常规页面），其 page kind 为 `page`。

## 为什么重要

判断当前页是不是节点用 `.IsNode`：首页、section、分类法、术语页为真，普通内容页为假。模板里想区分「列表页还是内容页」时，这个判断决定该不该输出子页面列表。若在普通页上照节点的方式去取子页面集合，结果往往是空值——页面照常构建，只是那一块没有内容。

延伸阅读：[IsNode](/methods/page/isnode/)、[Kind](/methods/page/kind/)
