+++
title = "templates.Exists"
linkTitle = "Exists"
description = "报告相对于 `layouts` 目录的给定路径下是否存在模板文件。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/templates/exists/"

[params.functions_and_methods]
signatures = ["templates.Exists PATH"]
returnType = "bool"
+++

## 这一页解决什么问题

当模板路径是**动态拼出来的**（例如「每种内容类型一个 headers 局部模板」），如果路径不存在，`partial` 会直接让构建失败。`templates.Exists` 先问一句「这个模板在不在」，于是你可以给出回退方案，而不是让整站构建炸掉。

判断范围是项目自身与所有主题组件的 `layouts` 目录。

## 什么时候用，什么时候别用

**该用**：

- 按 `Type`、`Layout`、语言等动态选择局部模板，并准备默认回退；
- 主题里给用户留「可选覆盖」的扩展点；
- 构建时避免「缺一个可选模板就失败」。

**别用**：

- 路径是写死的 → 直接写 `partial "foo.html"` 即可，让缺失在构建期暴露；
- 想检查资源文件 / 内容文件 → 那是 `resources.Get`、`.Resources.Get` 或 [`os.FileExists`](/functions/os/fileexists/) 的职责；
- 想检查「模板会不会被用到」→ 用构建诊断（如 `--printUnusedTemplates`）而不是本函数。

模板文件是指项目自身或其任一主题组件 `layouts` 目录中的任何文件。

把 `templates.Exists` 函数用于动态模板路径：

```go-html-template
{{ $partialPath := printf "headers/%s.html" .Type }}
{{ if templates.Exists ( printf "_partials/%s" $partialPath ) }}
  {{ partial $partialPath . }}
{{ else }}
  {{ partial "headers/default.html" . }}
{{ end }}
```

在上例中，如果给定内容类型没有对应的 "headers" _partial_ 模板，Hugo 会回退到默认模板。

## 完整示例（实测）

```go-html-template
{{ templates.Exists "_partials/components/card.html" }} → true
{{ templates.Exists "_partials/nope.html" }}           → false
{{ templates.Exists "index.txt" }}                     → true
{{ templates.Exists "nope.txt" }}                      → false
{{ templates.Exists "" }}                              → false
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致（实测站点里确实存在 `layouts/_partials/components/card.html` 与 `layouts/index.txt`）。

**你应当看到什么**：路径相对于 `layouts` 目录书写；局部模板要带上 `_partials/` 前缀，否则查不到。

## 返回值边界（实测）

| 路径 | 结果 | 是否报错 |
| --- | --- | --- |
| 存在的模板（含 `_partials/` 前缀） | `true` | 否 |
| 不存在的模板 | `false` | 否 |
| 空字符串 | `false` | 否 |
| 返回类型 | `bool` | 否 |
