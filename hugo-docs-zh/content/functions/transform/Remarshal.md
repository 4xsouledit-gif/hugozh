+++
title = "transform.Remarshal"
linkTitle = "Remarshal"
description = "返回按指定格式序列化后的字符串，它由一串序列化数据或一个映射编组而成。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/transform/remarshal/"

[params.functions_and_methods]
signatures = ["transform.Remarshal FORMAT INPUT"]
returnType = "string"
+++

## 用法

格式必须是 `json`、`toml`、`yaml` 或 `xml` 之一。如果输入是一串序列化数据，它必须是合法的 JSON、TOML、YAML 或 XML。

> [!NOTE]
> 该函数主要是 Hugo 文档自身使用的辅助工具，用于把配置与前置元数据示例转换为 JSON、TOML 与 YAML。
>
> 它不是通用转换器；如果 Hugo 文档站有需要，它可能在不另行通知的情况下发生变化。

## 示例

下面的示例把数据从一种序列化格式转换为另一种。

### TOML 转 JSON

该示例把一串 TOML 转换为 JSON：

```go-html-template
{{ $s := `
  baseURL = 'https://example.org/'
  locale = 'en-US'
  title = 'ABC Widgets'
`}}
<pre>{{ transform.Remarshal "json" $s }}</pre>
```

生成的 HTML：

```html
<pre>{
   &#34;baseURL&#34;: &#34;https://example.org/&#34;,
   &#34;locale&#34;: &#34;en-US&#34;,
   &#34;title&#34;: &#34;ABC Widgets&#34;
}
</pre>
```

在浏览器中的渲染结果：

```text
{
   "baseURL": "https://example.org/",
   "locale": "en-US",
   "title": "ABC Widgets"
}
```

### 映射转 YAML

该示例把一个映射转换为 YAML：

```go-html-template
{{ $m := dict
  "a" "Hugo rocks!"
  "b" (dict "question" "What is 6x7?" "answer" 42)
  "c" (slice "foo" "bar")
}}
<pre>{{ transform.Remarshal "yaml" $m }}</pre>
```

生成的 HTML：

```html
<pre>a: Hugo rocks!
b:
  answer: 42
  question: What is 6x7?
c:
- foo
- bar
</pre>
```

在浏览器中的渲染结果：

```text
a: Hugo rocks!
b:
  answer: 42
  question: What is 6x7?
c:
- foo
- bar
```
