+++
title = "urls.PathUnescape"
linkTitle = "PathUnescape"
description = "返回给定字符串，并把所有百分号编码序列替换为对应的未转义字符。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/urls/pathunescape/"

[params.functions_and_methods]
signatures = ["urls.PathUnescape INPUT"]
returnType = "string"
+++

**（0.153.0 新增）**

`urls.PathUnescape` 函数执行 [`urls.PathEscape`][] 的逆变换。

```go-html-template
{{ urls.PathUnescape "A%2Fb%2Fc%3Fd=%C3%A9&f=g+h" }} → A/b/c?d=é&f=g+h
```

用该函数解码 URL 路径中的单个片段。

[`urls.PathEscape`]: /functions/urls/pathescape/
