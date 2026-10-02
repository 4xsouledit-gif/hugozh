+++
title = "遍历（walk）"
linkTitle = "遍历"
description = "递归地穿行嵌套数据结构，例如渲染多级菜单。"
date = 2026-10-02
weight = 1540
source = "https://gohugo.io/quick-reference/glossary/walk/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断递归模板渲染成空白与渲染重复分别对应什么问题",
]
next = ["/templates/menu/"]
+++

_遍历_（walk，动词）是递归地穿行嵌套数据结构。例如，渲染多级菜单。

## 为什么重要

凡是层数不固定的地方——多级菜单、树形内容、嵌套数据——都要靠递归遍历，Hugo 里通常写成调用自身的 partial 或模板。递归最容易出的两个问题：递归调用时忘了把当层数据传下去，子层便渲染成空白；或者没有正确的终止条件，输出重复、层级越套越深，构建跟着变慢。写递归模板时，先在当层把数据打印出来确认，再交给下一层。

延伸阅读：[菜单模板](/templates/menu/)、[模板入门](/templates/introduction/)
