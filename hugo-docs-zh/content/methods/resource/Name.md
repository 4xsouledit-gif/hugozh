+++
title = "Name"
linkTitle = "Name"
description = "返回给定资源的名称，可以是在前置元数据中定义的名称，未定义时回退到其文件路径。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/resource/name/"

[params.functions_and_methods]
signatures = ["RESOURCE.Name"]
returnType = "string"
+++

`Resource` 对象上的 `Name` 方法返回的值取决于资源类型。

## 全局资源

对于[global resource](g)（全局资源），`Name` 方法返回资源的路径，相对于 `assets` 目录。

```tree
assets/
└── images/
    └── Sunrise in Bryce Canyon.jpg
```

```go-html-template
{{ with resources.Get "images/Sunrise in Bryce Canyon.jpg" }}
  {{ .Name }} → /images/Sunrise in Bryce Canyon.jpg
{{ end }}
```

## 页面资源

对于[page resource](g)（页面资源），如果在前置元数据的 `resources` 数组中创建了条目，`Name` 方法返回 `name` 参数的值。

```tree
content/
├── example/
│   ├── images/
│   │   └── a.jpg
│   └── index.md
└── _index.md
```

```toml
title = 'Example'
[[resources]]
src = 'images/a.jpg'
name = 'Sunrise in Bryce Canyon'
```

```go-html-template
{{ with .Resources.Get "images/a.jpg" }}
  {{ .Name }} → Sunrise in Bryce Canyon
{{ end }}
```

也可以改用 `name` 而不是路径来捕获该图像：

```go-html-template
{{ with .Resources.Get "Sunrise in Bryce Canyon" }}
  {{ .Name }} → Sunrise in Bryce Canyon
{{ end }}
```

如果没有在前置元数据的 `resources` 数组中创建条目，`Name` 方法返回文件路径，相对于页面包。

```tree
content/
├── example/
│   ├── images/
│   │   └── Sunrise in Bryce Canyon.jpg
│   └── index.md
└── _index.md
```

```go-html-template
{{ with .Resources.Get "images/Sunrise in Bryce Canyon.jpg" }}
  {{ .Name }} → images/Sunrise in Bryce Canyon.jpg
{{ end }}
```

## 远程资源

对于[remote resource](g)（远程资源），`Name` 方法返回带哈希值的文件名。

```go-html-template
{{ with resources.GetRemote "https://example.org/images/a.jpg" }}
  {{ .Name }} → /a_18432433023265451104.jpg
{{ end }}
```
