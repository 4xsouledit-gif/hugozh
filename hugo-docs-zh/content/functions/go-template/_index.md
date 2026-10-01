+++
title = "Go 模板函数与语句"
linkTitle = "go template"
description = "用这些函数与语句编写条件判断、循环及其它模板逻辑。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/go-template/"
+++

## 本章导读

本目录收录的是 Go 标准库 `text/template` 自带的函数与语句，Hugo 直接沿用它们的语义。它们负责模板的**控制流**：条件判断（`if`、`else`）、循环（`range`、`break`、`continue`）、上下文绑定（`with`）、模板定义与调用（`define`、`block`、`template`），以及逻辑运算（`and`、`or`、`not`）与 `len`、`urlquery` 等常用函数。

Hugo 对标准库做了少量扩展，其中 `return`、`try` 属于非标准语句，用法见各自页面。
