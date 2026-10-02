+++
title = "分页页（pager）"
linkTitle = "分页页"
description = "分页过程中产生的、包含列表页某个子集及导航链接的对象。"
date = 2026-10-02
weight = 910
source = "https://gohugo.io/quick-reference/glossary/pager/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分清 pager 与 paginator，知道当前页内容该取谁、页码导航该遍历谁"]
next = ["/methods/pager/"]
+++

分页页（pager）在 [pagination](g) 过程中创建，包含列表页的一个子集，以及指向其他分页页的导航链接。

## 为什么重要

每个 pager 只装一页内容：列表正文用当前 pager 的 `.Pages`，页码导航则要遍历 [paginator](g) 里的全部 pager，两者取错就会出现「每页都显示同一批文章」或页码条少一项。
pager 上的 `.PageNumber`、`.URL`、`.TotalPages` 等值还决定了翻页链接长什么样，翻页 404 或链接重复基本都能在这里找到原因。

延伸阅读：[分页器方法](/methods/pager/) · [分页模板](/templates/pagination/)
