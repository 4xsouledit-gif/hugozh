+++
title = "Params"
linkTitle = "Params"
description = "返回项目配置中定义的自定义参数映射。"
date = 2026-10-02
weight = 190
source = "https://gohugo.io/methods/site/params/"

[params.functions_and_methods]
signatures = ["SITE.Params"]
returnType = "maps.Params"
+++

## 这一页解决什么问题

`Params` 是配置里 `[params]` 表的**映射本身**。它是主题与站点之间的契约：站点在 `[params]` 下声明可调项，主题用 `.Site.Params.xxx` 读取，双方不必改模板。

它和 [`Site.Param`](/methods/site/param/) 的关系是「整张表」与「查一个键」。区别在于含连字符的键：链式语法 `{{ .Site.Params.copyright-year }}` 会被解析成减法，必须换成 `index` 函数。

## 什么时候用，什么时候别用

**该用**：

- 模板要读站点级自定义配置（副标题、作者信息、社交链接、日期布局）；
- 想把主题的可配置项集中在一处。

**别用**：

- 页面自己的参数 → 用页面的 `.Params`（[methods/page/params](/methods/page/params/)）；
- 大块结构化数据（名单、表格、多语言文案）→ 放进 `data/` 目录，用 [`hugo.Data`](/functions/hugo/data/) 读，模板会更干净；
- 键名含连字符却用链式写法 → 会得到错误结果或执行失败，改用 [`index`](/functions/collections/indexfunction/)。

## 用法

项目配置如下：

```toml
[params]
  subtitle = 'The Best Widgets on Earth'
  copyright-year = '2023'
  [params.author]
    email = 'jsmith@example.org'
    name = 'John Smith'
  [params.layouts]
    rfc_1123 = 'Mon, 02 Jan 2006 15:04:05 MST'
    rfc_3339 = '2006-01-02T15:04:05-07:00'
```

通过[链式](g)调用[标识符](g)来访问自定义参数：

```go-html-template
{{ .Site.Params.subtitle }} → The Best Widgets on Earth
{{ .Site.Params.author.name }} → John Smith

{{ $layout := .Site.Params.layouts.rfc_1123 }}
{{ .Site.Lastmod.Format $layout }} → Tue, 17 Oct 2023 13:21:02 PDT
```

在上面这个模板示例中，每个键都是合法的标识符，例如没有哪个键包含连字符。要访问不是合法标识符的键，请使用 [`index`][] 函数：

```go-html-template
{{ index .Site.Params "copyright-year" }} → 2023
```

## 完整示例（实测）

配置如上（`subtitle`、`author.name`、`copyright-year`、`layouts.rfc_1123`）。在任意模板里：

```go-html-template {file="layouts/_partials/meta.html"}
<p>{{ .Site.Params.subtitle }}</p>
<p>{{ .Site.Params.author.name }} &lt;{{ .Site.Params.author.email }}&gt;</p>
<p>版权年份：{{ index .Site.Params "copyright-year" }}</p>
{{ $layout := .Site.Params.layouts.rfc_1123 }}
<p>最后更新：{{ .Site.Lastmod.Format $layout }}</p>
```

Hugo 渲染为（站点内容中最晚的日期为 `2023-05-03T09:00:00-07:00`，时区 `America/Los_Angeles`）：

```html
<p>The Best Widgets on Earth</p>
<p>John Smith &lt;jsmith@example.org&gt;</p>
<p>版权年份：2023</p>
<p>最后更新：Wed, 03 May 2023 09:00:00 -0700</p>
```

**你应当看到什么**：前三个键走链式语法，含连字符的 `copyright-year` 走 `index`；最后一行把**配置里的布局字符串**直接交给 `.Site.Lastmod.Format`——这就是「参数驱动格式化」的典型用法，改配置即可改变输出格式。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 顶层字符串参数 | 原样返回字符串 | 否 |
| 嵌套映射（`author.name`） | 返回嵌套值 | 否 |
| 键含连字符（`copyright-year`） | 必须用 `index .Site.Params "copyright-year"`，返回 `2023` | 否 |
| 取不存在的键 | `nil`（打印为空，`with` 判为假） | 否 |
| 没有 `[params]` 表 | 空映射 `map[]`，链式取值为空 | 否 |
| `printf "%T" .Site.Params` | `hmaps.Params` | 否 |
| 把参数值当别的类型用 | 取决于配置里的类型，例如把字符串交给 `int` 转换会失败 | 视写法 |
