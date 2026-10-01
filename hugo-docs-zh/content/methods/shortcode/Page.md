+++
title = "Page"
linkTitle = "Page"
description = "返回调用该短代码的 Page 对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/shortcode/page/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Page"]
returnType = "hugolib.pageForShortcode"
+++

内容如下：

```toml
title = 'Les Misérables'
author = 'Victor Hugo'
publication_year = 1862
isbn = '978-0451419439'
```

调用这个短代码：

```md
{{</* book-details */>}}
```

我们可以用 `Page` 方法访问前置元数据中的值：

```go-html-template {file="layouts/_shortcodes/book-details.html"}
<ul>
  <li>Title: {{ .Page.Title }}</li>
  <li>Author: {{ .Page.Params.author }}</li>
  <li>Published: {{ .Page.Params.publication_year }}</li>
  <li>ISBN: {{ .Page.Params.isbn }}</li>
</ul>
```
