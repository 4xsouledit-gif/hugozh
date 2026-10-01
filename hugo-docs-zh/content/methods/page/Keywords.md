+++
title = "Keywords"
linkTitle = "Keywords"
description = "返回前置元数据中定义的关键词切片。"
date = 2026-10-02
weight = 370
source = "https://gohugo.io/methods/page/keywords/"

[params.functions_and_methods]
signatures = ["PAGE.Keywords"]
returnType = "[]string"
+++

默认情况下，Hugo 在创建[相关内容][]集合时会用到关键词。

```toml
title = 'How to make spicy tuna hand rolls'
keywords = ['tuna','sriracha','nori','rice']
```

在模板中列出关键词：

```go-html-template
{{ range .Keywords }}
  {{ . }}
{{ end }}
```

或者使用 [`delimit`][] 函数：

```go-html-template
{{ delimit .Keywords ", " ", and " }} → tuna, sriracha, nori, and rice
```

关键词也可以用作一种有用的[分类法][]：

```toml
[taxonomies]
tag = 'tags'
keyword = 'keywords'
category = 'categories'
```

[`delimit`]: /functions/collections/delimit/
[相关内容]: /content-management/related-content/
[分类法]: /content-management/taxonomies/
