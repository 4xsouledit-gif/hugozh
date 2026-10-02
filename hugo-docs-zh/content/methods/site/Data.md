+++
title = "Data"
linkTitle = "Data"
description = "返回由 data 目录中的文件构成的数据结构。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/site/data/"

[params.functions_and_methods]
signatures = ["SITE.Data"]
returnType = "map"
+++

## 这一页解决什么问题

**（0.156.0 起弃用）**

请改用 [`hugo.Data`](/functions/hugo/data/) 函数。

两个写法取到的是同一份数据：`data/` 目录下的每个文件按**文件名（去掉扩展名）**成为一个键，文件内容成为对应的值。实测 `data/quotes.yaml` 的内容就是一个切片，因此 `.Site.Data.quotes` 可以直接 `range`。

## 什么时候用，什么时候别用

**该用**：

- 用 [`hugo.Data`](/functions/hugo/data/) 读取 `data/` 目录（上游指定的替代写法）；
- 数据是「站点全局、不随页面变化」的静态表格：作者名单、赞助商、URL 映射、价格表。

**别用**：

- `.Site.Data`：0.156.0 起弃用，新模板请写 `hugo.Data`；
- 随页面变化的数据 → 用页面前置元数据 / 页面参数（[methods/page/params](/methods/page/params/)）；
- 需要在 `_index.md` 里手写的内容 → 那属于内容，不属于 `data/`。

## 用法

`data/quotes.yaml`：

```yaml
- text: Stay hungry, stay foolish.
  author: Steve Jobs
- text: Simplicity is the soul of efficiency.
  author: Austin Freeman
```

任意模板中（如 home 模板 `layouts/index.html`）：

```go-html-template {file="layouts/index.html"}
<ul>
  {{ range hugo.Data.quotes }}
    <li>{{ .text }} —— {{ .author }}</li>
  {{ end }}
</ul>
<p>共 {{ len hugo.Data.quotes }} 条</p>
```

## 完整示例（实测）

沿用上面的数据文件，在同一模板里对照两种写法：

```go-html-template {file="layouts/index.html"}
<p>hugo.Data：{{ len hugo.Data.quotes }} 条</p>
<p>.Site.Data：{{ len .Site.Data.quotes }} 条</p>
<p>第一条作者：{{ (index .Site.Data.quotes 0).author }}</p>
{{ with .Site.Data.nope }}
  <p>找到 nope</p>
{{ else }}
  <p>nope 不存在</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>hugo.Data：2 条</p>
<p>.Site.Data：2 条</p>
<p>第一条作者：Steve Jobs</p>
<p>nope 不存在</p>
```

**你应当看到什么**：两种写法结果一致（所以迁移是安全的替换）；`with` 对不存在的键走了 `else` 分支——不存在的键**不报错**，只是取不到值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，`data/quotes.yaml` 含 2 条记录，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Site.Data` 整体 | `map[string]interface {}`（实测 `printf "%T"`） | 否 |
| `.Site.Data.quotes`（文件顶层就是列表） | 长度 2 的切片，可 `range`、可 `index` | 否 |
| 取不存在的键（`.Site.Data.nope`） | `nil`（`with` 判为假） | 否 |
| 没有 `data/` 目录 | 空映射 `map[]` | 否 |
| `hugo.Data`（推荐写法） | 与 `.Site.Data` 完全一致 | 否 |
