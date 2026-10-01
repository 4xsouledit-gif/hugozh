+++
title = "Get"
linkTitle = "Get"
description = "返回给定参数的值。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/methods/shortcode/get/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Get ARG"]
returnType = "any"
+++

参数可以按位置或按名称指定。在 Markdown 中调用短代码时，位置参数和命名参数只能用其中一种，不能混用。

> [!NOTE]
> 有些短代码支持位置参数，有些支持命名参数，还有些两者都支持。用法细节请参见相应短代码的文档。

## 位置参数

下面这个短代码调用使用位置参数：

```md {file="content/about.md"}
{{</* myshortcode "Hello" "world" */>}}
```

要按位置获取参数：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ printf "%s %s." (.Get 0) (.Get 1) }} → Hello world.
```

## 命名参数

下面这个短代码调用使用命名参数：

```md {file="content/about.md"}
{{</* myshortcode greeting="Hello" firstName="world" */>}}
```

要按名称获取参数：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ printf "%s %s." (.Get "greeting") (.Get "firstName") }} → Hello world.
```

> [!NOTE]
> 参数名称区分大小写。
