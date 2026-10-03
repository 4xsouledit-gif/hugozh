+++
title = "urlquery"
linkTitle = "urlquery"
description = "返回其参数文本表示的转义结果，适合嵌入 URL 查询串。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/go-template/urlquery/"

[params.functions_and_methods]
signatures = ["urlquery VALUE [VALUE...]"]
returnType = "string"
+++

## 这一页解决什么问题

要在 URL 的查询串里带上参数值（例如把当前页面地址发给分享按钮），必须先把值做百分号编码，否则其中的 `&`、`=`、`#` 会被当成 URL 结构。`urlquery` 就是这个编码器：把参数转义成可以安全嵌进查询串的形式。

注意它用的是 Go `net/url` 的 QueryEscape 语义：空格编码成 `+`，非 ASCII 编码成 `%XX`——实测 `{{ urlquery "中文" }}` → `%E4%B8%AD%E6%96%87`。

## 什么时候用，什么时候别用

**该用**：

- 拼接查询串参数：`href="?q={{ urlquery $term }}"`；
- 把 URL 作为参数值传给另一个地址（本页「用法」里的例子）；
- 分享链接、搜索框回填。

**别用**：

- 要编码整条路径而不是查询值 → 用 [`path`](/functions/path/) 命名空间的路径函数，`urlquery` 会把 `/` 也编码掉；
- 输出 HTML 时需要原样保留转义结果 → 记得加 [`safeURL`](/functions/safe/url/)（见「用法」示例），否则 `%` 会被 HTML 转义处理；
- 只是要拼接站内地址 → 用 [`urls.RelURL`](/functions/urls/relurl/) / [`urls.AbsURL`](/functions/urls/absurl/)。

## 用法

这段模板代码：

```go-html-template
{{ $u := urlquery "https://" "example.com" | safeURL }}
<a href="https://example.org?url={{ $u }}">Link</a>
```

渲染结果为：

```html
<a href="https://example.org?url=https%3A%2F%2Fexample.com">Link</a>
```

更多信息参见 Go 的 [`text/template`](https://pkg.go.dev/text/template) 文档。

## 完整示例（实测）

```go-html-template
{{ $u := urlquery "https://" "example.com" | safeURL }}
<a href="https://example.org?url={{ $u }}">Link</a>
```

Hugo 0.167.0 实测渲染为：

```html
<a href="https://example.org?url=https%3A%2F%2Fexample.com">Link</a>
```

再看几个值：

```go-html-template
{{ urlquery "a b" }}    → a+b
{{ urlquery "a&b=c" }}  → a%26b%3Dc
{{ urlquery "中文" }}    → %E4%B8%AD%E6%96%87
{{ urlquery 42 }}       → 42
```

Hugo 0.167.0 实测：以上逐条与 `→` 后一致。多个参数会先拼接成一个字符串再编码（`urlquery "https://" "example.com"` 相当于对 `https://example.com` 编码）。

## 返回值边界（实测）

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 多个参数 | 先拼接再编码 | 否 |
| 含空格 | `+`（QueryEscape 语义） | 否 |
| 非 ASCII | `%XX` 序列 | 否 |
| 非字符串（`42`） | `42` | 否 |
| 不传参数 | 空字符串 `""` | 否（实测不报错） |
| 返回类型 | `string`（实测 `%T` → `string`） | 否 |
