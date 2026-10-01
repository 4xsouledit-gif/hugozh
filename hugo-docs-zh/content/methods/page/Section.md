+++
title = "Section"
linkTitle = "Section"
description = "返回给定页面所属顶层 section 的名称。"
date = 2026-10-02
weight = 740
source = "https://gohugo.io/methods/page/section/"

[params.functions_and_methods]
signatures = ["PAGE.Section"]
returnType = "string"
+++

[section（内容区块）](/quick-reference/glossary/section/)

内容结构如下：

```tree
content/
├── lessons/
│   ├── math/
│   │   ├── _index.md
│   │   ├── lesson-1.md
│   │   └── lesson-2.md
│   └── _index.md
└── _index.md
```

渲染 lesson-1.md 时：

```go-html-template
{{ .Section }} → lessons
```

上例中 “lessons” 就是顶层 section。

`Section` 方法常与 [`where`][] 函数搭配使用，用来构建页面集合。

```go-html-template
{{ range where .Site.RegularPages "Section" "lessons" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

这与把 [`Type`][] 方法与 `where` 函数搭配使用类似

```go-html-template
{{ range where .Site.RegularPages "Type" "lessons" }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

不过，如果有一个或多个页面在前置元数据中定义了 `type` 字段，那么基于 `Type` 的页面集合会与基于 `Section` 的页面集合不同。

[`Type`]: /methods/page/type/
[`where`]: /functions/collections/where/
