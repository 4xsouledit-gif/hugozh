+++
title = "常规页面（regular page）"
linkTitle = "常规页面"
description = "页面类型为 page 的页面。"
date = 2026-10-02
weight = 1090
source = "https://gohugo.io/quick-reference/glossary/regular-page/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一个页面会不会被文章列表收集，并知道该用 `.RegularPages` 还是 `.Pages`"]
next = ["/methods/page/ispage/"]
+++

常规页面（regular page）是 [page kind](g) 为 `page` 的页面。另见 [section page](g)。

## 为什么重要

只有常规页面会被 `.RegularPages` 收集，section、首页、[taxonomy](g)、[term](g) 页都不在其中；列表模板里选错集合，栏目页会被当成文章混进列表，或者文章反而一个都不显示。
它也决定了 `.IsPage` 的返回值：把目录首页 `_index.md` 当作普通文章来写（例如指望它出现在文章列表和 RSS 里）就会落空——那是一个 section 或 home 页面，要单独用对应模板处理。

延伸阅读：[IsPage 方法](/methods/page/ispage/) · [内容组织](/content-management/organization/)
