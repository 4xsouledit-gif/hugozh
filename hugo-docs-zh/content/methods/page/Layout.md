+++
title = "Layout"
linkTitle = "Layout"
description = "返回前置元数据中定义的页面布局。"
date = 2026-10-02
weight = 410
source = "https://gohugo.io/methods/page/layout/"

[params.functions_and_methods]
signatures = ["PAGE.Layout"]
returnType = "string"
+++

在前置元数据中指定 `layout` 字段即可指向特定模板。详见[说明][]。

```toml
title = 'Contact'
layout = 'contact'
```

Hugo 会用 contact.html 渲染该页面。

```tree
layouts/
├── baseof.html
├── contact.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
└── term.html
```

虽然在模板中很少用到，但你可以这样取值：

```go-html-template
{{ .Layout }}
```

如果前置元数据中没有定义 `layout` 字段，`Layout` 方法返回空字符串。

[说明]: /templates/lookup-order/#target-a-template
