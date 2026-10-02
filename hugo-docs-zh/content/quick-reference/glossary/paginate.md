+++
title = "分页（paginate）"
linkTitle = "分页"
description = "把列表页拆分成两个或多个子集。"
date = 2026-10-02
weight = 920
source = "https://gohugo.io/quick-reference/glossary/paginate/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分清「切数据」与「画导航」两件事，并在两种分页方法之间做出选择"]
next = ["/methods/page/paginate/"]
+++

分页（paginate，动词）指把一个列表页拆分成两个或多个子集。

## 为什么重要

分页实际包含两件事：切数据（`.Paginate` 或 `.Paginator`）与画导航（页码链接），只做前一半时内容被切开了，读者却找不到进入第二页的入口。
`.Paginate` 接收集合参数，所以能先 `where`、排序再分页，绝大多数列表页都该用它；每页条数默认取项目配置，也可以在第二个参数里覆盖。
同一个列表页上重复调用分页不会报错，第二次调用会被静默忽略——「改了每页条数却没变化」多半就是这个问题。

延伸阅读：[Paginate 方法](/methods/page/paginate/) · [分页模板](/templates/pagination/)
