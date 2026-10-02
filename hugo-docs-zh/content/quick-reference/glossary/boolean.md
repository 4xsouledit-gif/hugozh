+++
title = "布尔值"
linkTitle = "布尔值"
description = "只有 true 与 false 两个取值的数据类型。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/quick-reference/glossary/boolean/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断一个开关为什么没按预期生效，并检查它在配置里其实是布尔还是字符串"]
next = ["/functions/compare/"]
+++

## 布尔值

_布尔值_（boolean）是只有两个取值的数据类型，即 `true` 或 `false`。

## 为什么重要

布尔值大多是开关：页面是否输出某种格式、是否隐藏、菜单项是否只对当前语言显示，背后都是布尔字段。最常见的坑是把布尔写成字符串（如 `"true"`）或用 `yes`、`no` 之类的 YAML 方言，条件判断结果与预期相反，而构建不会报错。改成不带引号的 `true`、`false` 后，再到构建产物里复核一次。

延伸阅读：[比较函数](/functions/compare/) · [前置元数据](/content-management/front-matter/)
