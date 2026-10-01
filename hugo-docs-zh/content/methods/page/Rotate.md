+++
title = "Rotate"
linkTitle = "Rotate"
description = "返回沿指定维度变化、而在其他维度上与当前页面取值相同的一组页面（含当前页面），并按该维度的默认排序顺序排列。"
date = 2026-10-02
weight = 720
source = "https://gohugo.io/methods/page/rotate/"

[params.functions_and_methods]
signatures = ["PAGE.Rotate DIMENSION"]
returnType = "page.Pages"
+++

**（0.153.0 新增）**

页面对象上的 rotate 方法返回沿指定[维度](g)变化的一组页面，其他维度保持不变。结果包含当前页面，并按指定维度的规则排序。例如，沿[语言](g)旋转会返回所有与当前页面共享同一[版本](g)和[角色](g)的语言变体。

`DIMENSION` 参数必须是 `language`、`version` 或 `role` 之一。

## 排序顺序

用以下规则来理解 Hugo 如何对 `Rotate` 方法返回的集合排序。

| 维度 | 主排序 | 次排序 |
| :--- | :--- | :--- |
| Language | 权重升序 | 字典序升序 |
| Version | 权重升序 | 语义化版本降序 |
| Role | 权重升序 | 字典序升序 |

## 示例

要渲染当前页面各语言变体的列表（含当前页面），且这些变体共享当前版本和角色：

```go-html-template
{{/* Returns languages sorted by weight ascending, then lexicographically ascending */}}
{{ range .Rotate "language" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要渲染当前页面各版本变体的列表（含当前页面），且这些变体共享当前语言和角色：

```go-html-template
{{/* Returns versions sorted by weight ascending, then semantic version descending */}}
{{ range .Rotate "version" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要渲染当前页面各角色变体的列表（含当前页面），且这些变体共享当前语言和版本：

```go-html-template
{{/* Returns roles sorted by weight ascending, then lexicographically ascending */}}
{{ range .Rotate "role" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```
