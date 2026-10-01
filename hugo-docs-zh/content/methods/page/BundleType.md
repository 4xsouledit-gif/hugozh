+++
title = "BundleType"
linkTitle = "BundleType"
description = "返回给定页面的页面包类型；若该页面不是页面包，则返回空字符串。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/page/bundletype/"

[params.functions_and_methods]
signatures = ["PAGE.BundleType"]
returnType = "string"
+++

页面包（page bundle）是把内容与关联[资源](g)封装在一起的目录。页面包有两种类型：[叶子包](g)与[分支包](g)。详见[说明][]。

`Page` 对象上的 `BundleType` 方法对分支包返回 `branch`，对叶子包返回 `leaf`，若该页面不是页面包则返回空字符串。

```tree
content/
├── films/
│   ├── film-1/
│   │   ├── a.jpg
│   │   └── index.md  <-- leaf bundle
│   ├── _index.md     <-- branch bundle
│   ├── b.jpg
│   ├── film-2.md
│   └── film-3.md
└── _index.md         <-- branch bundle
```

在模板中取值：

```go-html-template
{{ .BundleType }}
```

[说明]: /content-management/page-bundles/
