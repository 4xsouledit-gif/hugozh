+++
title = "partials.IncludeCached"
linkTitle = "IncludeCached"
description = "执行给定模板并缓存结果，可选择性地传入一个或多个变体键。若局部模板包含 return 语句，则返回该语句的值，否则返回渲染输出。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/partials/includecached/"
+++

没有 [`return`][] 语句时，`partialCached` 函数返回 `template.HTML` 类型的字符串。有 `return` 语句时，`partialCached` 函数可以返回任意数据类型。

对于不需要每次调用都重新渲染的复杂模板，`partialCached` 函数可以带来显著的性能提升。

> [!NOTE]
> 每个站点（或每种语言）都有自己的 `partialCached` 缓存，因此每个站点只会执行一次*局部模板*。
>
> Hugo 并行渲染页面，因此对 `partialCached` 函数的并发调用会使*局部模板*被渲染不止一次。等到 Hugo 缓存了渲染后的*局部模板*，之后进入构建流水线的页面就会使用缓存结果。

在*局部模板*中，以 `./` 或 `../` 开头的路径相对于调用方*局部模板*解析。请参见 [`partials.Include`](/functions/partials/include/#相对路径)。

最简单的用法如下：

```go-html-template
{{ partialCached "footer.html" . }}
```

向 `partialCached` 传入额外参数可以为缓存的*局部模板*创建变体。例如，如果某个复杂的*局部模板*在同一 section（内容区块）内的页面上渲染结果应当完全相同，就可以按 section 创建变体，让该*局部模板*在每个 section 中只渲染一次：

```go-html-template {file="layouts/baseof.html"}
{{ partialCached "footer.html" . .Section }}
```

需要创建唯一变体时，可以按需传入任意数据类型的额外参数：

```go-html-template
{{ partialCached "footer.html" . .Params.country .Params.province }}
```

变体参数对底层*局部模板*不可见，它们只用于生成唯一的缓存键。

要从*局部模板*返回值，请使用 `return` 语句：

```go-html-template
{{ if math.ModBool . 2 }}
  {{ return "even" }}
{{ end }}
{{ return "odd" }}
```

[`return`]: /functions/go-template/return/
