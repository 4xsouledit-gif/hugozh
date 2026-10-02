+++
title = "collections.Querify"
linkTitle = "querify"
description = "根据给定的映射、切片或键值对序列，返回 URL 查询字符串。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/functions/collections/querify/"

[params.functions_and_methods]
signatures = ["collections.Querify MAP|SLICE|KEY VALUE..."]
returnType = "string"
aliases = ["querify"]
+++

## 这一页解决什么问题

要生成带查询参数的 URL（`/search/?q=hugo&page=2`）时，`querify` 负责把键值对编成查询字符串。它接受三种等价输入：映射、切片、以及一串标量参数。

一个必须知道的细节：查询串里的 `&` 在 **HTML 源码**中会被转义成 `&amp;`（这是正确的 HTML 编码，浏览器解析后仍是 `&`），所以你在「查看源代码」时看到的是 `a=1&amp;b=2`。

## 什么时候用，什么时候别用

**该用**：

- 给站内链接拼查询参数（搜索、筛选、分页链接）；
- 给外部 URL 追加参数；
- 把前置元数据或配置里的映射整体变成查询串。

**别用**：

- 拼**路径** → 用 [`urls.RelURL`](/functions/urls/relurl/)、[`urls.AbsURL`](/functions/urls/absurl/)；
- 只想转义单个值 → `querify` 一次只处理一组键值对，单独转义可用 `urlquery`（本站未单独收录该函数页）；
- 需要生成 `?a=1&a=2` 这类重复 key → 用切片输入时按「两两一组」解读，重复 key 的语义上游未说明。

## 用法

把键值对指定为映射、切片，或者一串标量值。例如下面几种写法等价：

```go-html-template
{{ collections.Querify (dict "a" 1 "b" 2) }}
{{ collections.Querify (slice "a" 1 "b" 2) }}
{{ collections.Querify "a" 1 "b" 2 }}
```

要在 URL 后追加查询字符串：

```go-html-template
{{ $qs := collections.Querify (dict "a" 1 "b" 2) }}
{{ $href := printf "https://example.org?%s" $qs }}

<a href="{{ $href }}">Link</a>
```

Hugo 会把它渲染成：

```html
<a href="https://example.org?a=1&amp;b=2">Link</a>
```

你也可以传入项目配置或前置元数据中的映射。例如：

```toml
title = 'Example'
[params.query]
a = 1
b = 2
```

```go-html-template
{{ collections.Querify .Params.query }}
```

## 完整示例：拼一个搜索链接

```go-html-template {file="layouts/_partials/search-link.html"}
{{ $qs := querify "a" 1 "b" 2 }}
<p>{{ $qs }}</p>
<p>映射输入：{{ querify (dict "a" 1) }}</p>
<p>切片输入：{{ querify (slice "a" "b") }}</p>
<p>值里有空格：{{ querify "a" "x y" }}</p>
<p><a href="/search/?{{ $qs }}">搜索</a></p>
```

Hugo 渲染为：

```html
<p>a=1&amp;b=2</p>
<p>映射输入：a=1</p>
<p>切片输入：a=b</p>
<p>值里有空格：a=x+y</p>
<p><a href="/search/?a%3d1%26b%3d2">搜索</a></p>
```

**你应当看到什么**：`&` 在 HTML **源码**里写成 `&amp;`、`+` 写成 `&#43;`（浏览器里显示为 `a=1&b=2` 和 `a=x+y`）；最后一行是个容易踩的点——把查询串**直接插进 `href` 的查询部分**时，Hugo 会再做一次 URL 编码（实测 `=` 变 `%3d`、`&` 变 `%26`），链接仍可用但不好看。要得到上游示例那种 `…?a=1&amp;b=2`，请先把完整 URL 用 `printf` 拼好再插入：

```go-html-template
{{ $qs := querify (dict "a" 1 "b" 2) }}
{{ $href := printf "https://example.org?%s" $qs }}
<a href="{{ $href }}">Link</a>
```

实测这一段渲染为 `<a href="https://example.org?a=1&amp;b=2">Link</a>`，与上游示例一致。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 映射输入 | 查询串（实测 `querify (dict "a" 1)` 得 `a=1`） | 否 |
| 标量序列输入 | 查询串（实测 `a=1&b=2`） | 否 |
| 切片输入（成对元素） | 查询串（实测 `querify (slice "a" "b")` 得 `a=b`） | 否 |
| 值含空格 | 编码为 `+`（实测 `a=x+y`） | 否 |
| 值不是标量（如切片） | —— | 是：`error calling querify: unable to cast []int{1, 2} of type []int to string` |
| 输出中的 `&` | 在 HTML 源码中被转义成 `&amp;`（浏览器显示为 `&`） | 否 |
| 直接插进 `href` 的查询部分 | 会被再做一次 URL 编码：实测 `/search/?{{ $qs }}` 渲染成 `/search/?a%3d1%26b%3d2`（链接可用）；改用 `printf` 先拼完整 URL 则得到 `…?a=1&amp;b=2` | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 复制出来的链接带 `&amp;` | 你看到的是 HTML 源码，浏览器里是正常的 `&` | 不用改；要检查真实链接请在浏览器里点开 |
| 报错看不懂 | `unable to cast … to string` | 值给了切片/映射这类非标量 | 先把值拼成字符串，例如用 [`collections.Delimit`](/functions/collections/delimit/) |
| 没报错但结果不对 | 参数顺序错乱 | 切片输入按两两一组解释，元素个数为奇数时的行为上游未说明 | 用 `dict` 输入更安全 |
| 没报错但结果不对 | 中文参数没有按预期显示 | `querify` 做的是 URL 编码，中文会被百分号编码 | 这是正确行为；需要可读性请在页面里展示原文 |

更多排查入口见[故障排查](/troubleshooting/)。
