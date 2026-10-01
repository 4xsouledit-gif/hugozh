+++
title = "urls.PathEscape"
linkTitle = "PathEscape"
description = "返回给定字符串，并对特殊字符与保留分隔符做百分号编码，使其可以安全地用作 URL 路径中的一个片段。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/urls/pathescape/"

[params.functions_and_methods]
signatures = ["urls.PathEscape INPUT"]
returnType = "string"
+++

**（0.153.0 新增）**

`urls.PathEscape` 函数执行 [`urls.PathUnescape`][] 的逆变换。

```go-html-template
{{ urls.PathEscape "my café" }} → my%20caf%C3%A9
```

用该函数转义字符串，使其可以安全地用作 URL 路径中的单个片段。

[`urls.PathUnescape`]: /functions/urls/pathunescape/
