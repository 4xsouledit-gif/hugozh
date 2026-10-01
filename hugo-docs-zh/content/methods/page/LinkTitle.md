+++
title = "LinkTitle"
linkTitle = "LinkTitle"
description = "返回给定页面的链接标题。"
date = 2026-10-02
weight = 430
source = "https://gohugo.io/methods/page/linktitle/"

[params.functions_and_methods]
signatures = ["PAGE.LinkTitle"]
returnType = "string"
+++

`LinkTitle` 方法返回前置元数据中定义的 `linkTitle` 字段；若未定义，则回退到 [`Title`][] 方法的返回值。

```toml
title = 'Seventeen delightful recipes for healthy desserts'
linkTitle = 'Dessert recipes'
```

```go-html-template
{{ .LinkTitle }} → Dessert recipes
```

如上所示，当页面标题很长时，在前置元数据中定义链接标题是有好处的。在模板中生成锚元素时可以用它：

```go-html-template
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

[`Title`]: /methods/page/title/
