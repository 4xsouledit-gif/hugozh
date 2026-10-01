+++
title = "reflect.IsResource"
linkTitle = "IsResource"
description = "报告给定值是否为资源（Resource）对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/reflect/isresource/"

[params.functions_and_methods]
signatures = ["reflect.IsResource INPUT"]
returnType = "bool"
+++

**（0.154.0 新增）**

项目结构如下：

```tree
project/
├── assets/
│   ├── a.json
│   ├── b.avif
│   └── c.jpg
└── content/
    └── example/
        ├── index.md
        ├── d.json
        ├── e.avif
        └── f.jpg
```

下例给出 `reflect.IsResource` 函数返回的值：

```go-html-template {file="layouts/page.html"}
{{ with resources.Get "a.json" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with resources.Get "b.avif" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with resources.Get "c.jpg" }}
  {{ reflect.IsResource . }} → true
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ with .Resources.Get "d.json" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with .Resources.Get "e.avif" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with .Resources.Get "f.jpg" }}
  {{ reflect.IsResource . }} → true
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ with site.GetPage "/example" }}
  {{ reflect.IsResource . }} → true
{{ end }}
```
