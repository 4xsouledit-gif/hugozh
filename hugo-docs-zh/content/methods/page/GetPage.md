+++
title = "GetPage"
linkTitle = "GetPage"
description = "根据给定路径返回 Page 对象。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/page/getpage/"
aliases = ["/functions/getpage"]

[params.functions_and_methods]
signatures = ["PAGE.GetPage PATH"]
returnType = "page.Page"
+++

`GetPage` 方法在 `Site` 对象上也可用。详见[说明][]。

在 `Page` 对象上使用 `GetPage` 方法时，请指定相对于当前目录或相对于 `content` 目录的路径。

如果 Hugo 无法把路径解析为页面，该方法返回 `nil`。如果路径有歧义，Hugo 会抛出错误并中止构建。

内容结构如下：

```tree
content/
├── works/
│   ├── paintings/
│   │   ├── _index.md
│   │   ├── starry-night.md
│   │   └── the-mona-lisa.md
│   ├── sculptures/
│   │   ├── _index.md
│   │   ├── david.md
│   │   └── the-thinker.md
│   └── _index.md
└── _index.md
```

下面的示例展示了渲染 `works/paintings/the-mona-lisa.md` 的结果：

```go-html-template {file="layouts/works/page.html"}
{{ with .GetPage "starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "./starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "../paintings/starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "/works/paintings/starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "../sculptures/david" }}
  {{ .Title }} → David
{{ end }}

{{ with .GetPage "/works/sculptures/david" }}
  {{ .Title }} → David
{{ end }}
```

[说明]: /methods/site/getpage/
