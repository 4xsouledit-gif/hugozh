+++
title = "模板函数"
linkTitle = "templates"
description = "查询模板系统自身：判断模板是否存在、取当前模板名，以及在局部模板里拿到调用方内容。"
date = 2026-10-02
weight = 270
source = "https://gohugo.io/functions/templates/"

[params.teach]
difficulty = "进阶"
time = "按需查阅"
prereq = [
  "你已经写过至少一个[局部模板](/functions/partials/include/)或短代码模板，知道模板是通过名字被调用的。",
]
outcomes = [
  "用 `templates.Exists` 在调用前判断模板是否存在，避免构建期直接报错；",
  "用 `templates.Current` 查出当前正在执行的是哪个模板（排查「到底走的哪个模板」）；",
  "用 `templates.Inner` 在局部模板里拿到调用方传入的 `.Inner`；",
  "用 `templates.Defer` 把耗时的模板求值推迟到构建结束（含在 `range` 内取用 `.Page` 时的限制）。",
]
next = ["/templates/lookup-order/", "/templates/introduction/", "/functions/partials/include/"]
+++

## 这一组包含什么

| 函数 | 用途 |
| --- | --- |
| [`Current`](/functions/templates/current/) | 当前执行的模板名，排查「究竟走了哪个模板」 |
| [`Defer`](/functions/templates/defer/) | 把求值推迟到构建结束，用于必须延后才知道结果的场合 |
| [`Exists`](/functions/templates/exists/) | 判断某个模板是否存在，用于「有则用、没有则回退」 |
| [`Inner`](/functions/templates/inner/) | 在局部模板里取调用方传入的内容 |

## 什么时候用

- 「改了模板但页面没变」→ 先用 `templates.Current` 确认实际生效的是哪个文件。Hugo 的模板查找有优先级（项目 → 主题），改错层不会报错，只会静默不生效，查找顺序见[模板查找顺序](/templates/lookup-order/)；
- 「主题可能提供、也可能不提供某个局部模板」→ 用 `templates.Exists` 做回退，而不是让构建失败；
- 需要缓存局部模板的渲染结果 → 那是 [`partials.IncludeCached`](/functions/partials/includecached/)，不在本组。

下方列出本站收录的本组全部函数。
