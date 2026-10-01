+++
title = "TableOfContents"
linkTitle = "TableOfContents"
description = "返回给定页面的目录。"
date = 2026-10-02
weight = 820
source = "https://gohugo.io/methods/page/tableofcontents/"

[params.functions_and_methods]
signatures = ["PAGE.TableOfContents"]
returnType = "template.HTML"
+++

`Page` 对象上的 `TableOfContents` 方法返回页面内容中 Markdown [ATX][] 和 [setext][] 标题构成的有序或无序列表。

这段模板代码：

```go-html-template
{{ .TableOfContents }}
```

会生成这样的 HTML：

```html
<nav id="TableOfContents">
  <ul>
    <li><a href="#section-1">Section 1</a>
      <ul>
        <li><a href="#section-11">Section 1.1</a></li>
        <li><a href="#section-12">Section 1.2</a></li>
      </ul>
    </li>
    <li><a href="#section-2">Section 2</a></li>
  </ul>
</nav>
```

默认情况下，`TableOfContents` 方法返回 2 级和 3 级标题构成的无序列表。你可以在项目配置中调整：

```toml
[markup.tableOfContents]
endLevel = 3
ordered = false
startLevel = 2
```

[ATX]: https://spec.commonmark.org/current/#atx-headings
[setext]: https://spec.commonmark.org/current/#setext-headings
