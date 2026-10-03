+++
title = "分支"
linkTitle = "分支"
description = "页面种类为 home、section、taxonomy 或 term 的节点。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/quick-reference/glossary/branch/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断当前页面是分支还是普通内容页，从而选对可用的方法与布局"]
next = ["/content-management/sections/"]
+++

## 分支

_分支_（branch）是 [page kind](g)（页面种类）为 `home`、`section`、`taxonomy` 或 `term` 的 [node](g)（节点）。分支可以有后代。

## 为什么重要

分支对应列表类页面，普通内容页（`page`）是它的后代；一个页面是不是分支，决定它能不能用 `.Pages`、`.Sections` 这类方法，以及它该命中哪个布局。把普通页当分支来遍历，会拿到空集合或构建报错；反过来在分支页上调用只属于普通页的方法，结果也可能为空。拿不准时先打印 `.Kind` 看它实际是什么。

延伸阅读：[内容区块](/content-management/sections/) · [布局查找顺序](/templates/lookup-order/)
