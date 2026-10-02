+++
title = "页面类型（page kind）"
linkTitle = "页面类型"
description = "对页面的分类，取值为 home、page、section、taxonomy 或 term 之一。"
date = 2026-10-02
weight = 870
source = "https://gohugo.io/quick-reference/glossary/page-kind/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["根据目录结构和文件名判断一个页面属于哪种页面类型，并预判它会用哪个模板、哪些判断方法返回真"]
next = ["/methods/page/kind/"]
+++

页面类型（page kind）是对页面的分类，取值为 `home`、`page`、`section`、`taxonomy` 或 `term` 之一。

参见：[Kind](/methods/page/kind/)

## 为什么重要

模板查找顺序、`.IsPage` / `.IsSection` / `.IsBranch` 的返回值、`where` 筛选以及 `cascade` 里的 `kind` 条件，全都以页面类型为依据；判断错类型最常见的后果是首页或 section 列表页套用了文章模板，渲染出一片空白或只出现一个条目。
页面类型只由内容在 `content/` 中的位置决定，前置元数据改不了它：`_index.md` 会成为首页或 section 页，`index.md` 是叶子包的内容页，而 [taxonomy](g) 与 [term](g) 页由分类法配置生成。
排查时先用 `.Kind`（或 `debug.Dump`）把当前页面的类型打印出来，再决定模板走哪个分支。

延伸阅读：[Kind 方法](/methods/page/kind/) · [模板查找顺序](/templates/lookup-order/)
