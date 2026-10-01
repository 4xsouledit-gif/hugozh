+++
title = "transform.XMLEscape"
linkTitle = "XMLEscape"
description = "返回删除不允许的字符后再转义为对应 XML 形式的给定字符串。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/transform/xmlescape/"

[params.functions_and_methods]
signatures = ["transform.XMLEscape INPUT"]
returnType = "string"
+++

`transform.XMLEscape` 函数先删除 XML 规范中定义的[不允许的字符][]，再把结果中的以下字符替换为 [HTML 实体][]来完成转义：

- `"` → `&#34;`
- `'` → `&#39;`
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `\t` → `&#x9;`
- `\n` → `&#xA;`
- `\r` → `&#xD;`

例如：

```go-html-template
{{ transform.XMLEscape "<p>abc</p>" }} → &lt;p&gt;abc&lt;/p&gt;
```

在由 Go 的 [`html/template`][] 包渲染的模板中使用 `transform.XMLEscape` 时，请把该字符串声明为安全 HTML，以免二次转义。例如在 RSS 模板中：

```xml {file="layouts/rss.xml"}
<description>{{ .Summary | transform.XMLEscape | safeHTML }}</description>
```

[HTML 实体]: https://developer.mozilla.org/en-US/docs/Glossary/Entity
[`html/template`]: https://pkg.go.dev/html/template
[不允许的字符]: https://www.w3.org/TR/xml/#charsets
