+++
title = "BuildDrafts"
linkTitle = "BuildDrafts"
description = "报告当前构建是否启用了草稿发布。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/site/builddrafts/"

[params.functions_and_methods]
signatures = ["SITE.BuildDrafts"]
returnType = "bool"
+++

## 这一页解决什么问题

**（0.156.0 起弃用）**

`BuildDrafts` 报告**本次构建**是否包含草稿（前置元数据里 `draft = true` 的页面）。上游在 0.156.0 标记弃用，只留下「详见[详情](https://discourse.gohugo.io/t/56732)」——**上游未说明替代方法**。

它回答的其实是一个命令行问题，而不是内容问题：同一个站点，`hugo` 与 `hugo -D` 会得到不同的返回值。

## 什么时候用，什么时候别用

**该用**：几乎没有。它是历史 API，新代码不要依赖。

**别用**：

- 想控制草稿是否进构建 → 用命令行 `hugo -D` / `hugo server -D`，而不是在模板里判断；
- 想在模板里区分「开发环境」与「生产环境」→ 用 [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/) 或 [`hugo.Environment`](/functions/hugo/environment/)；
- 想跳过某个草稿页面 → 在页面自己的前置元数据里用 `draft`，或读页面的 `.Draft`（见 [methods/page](/methods/page/)）。

## 完整示例（实测）

同一份模板、同一个站点，只改命令行：

```go-html-template {file="layouts/index.html"}
{{ if .Site.BuildDrafts }}
  <p class="draft-banner">这是含草稿的构建</p>
{{ end }}
```

实测结果：

| 命令 | `.Site.BuildDrafts` | 渲染出的 HTML |
| --- | --- | --- |
| `hugo` | `false` | 空（`if` 不成立，整段 `<p>` 不输出） |
| `hugo -D` | `true` | `<p class="draft-banner">这是含草稿的构建</p>` |

**你应当看到什么**：模板一个字没改，输出却不同——所以任何「把它写进模板」的用法都会让页面内容随命令行漂移，这正是它被弃用的原因。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，站点内容不含草稿页面，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `hugo`（不含草稿） | `false` | 否 |
| `hugo -D`（含草稿） | `true` | 否 |
| 站点内没有任何草稿页面 | 仍只由命令行决定（`-D` 时为 `true`） | 否 |
| 返回值类型 | `bool` | 否 |
