+++
title = "级联"
linkTitle = "级联"
description = "把分支页面或项目配置中的值传递给后代页面。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/quick-reference/glossary/cascade/"
+++

## 级联

_级联_（cascade）一个值，就是把[分支](g)页面或项目配置中的[前置元数据](g)值应用到后代页面。如果后代页面已经定义了该字段，或者更近的祖先[分支](g)、级联数组中更靠前的元素已经为同一字段设置了值，Hugo 就不会级联该值。可以用[页面匹配器](g)把级联限制在部分页面上。

参见：[级联配置](/configuration/cascade/)
