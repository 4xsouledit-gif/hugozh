+++
title = "crypto.MD5"
linkTitle = "MD5"
description = "返回给定输入的 MD5 校验和，并编码为十六进制字符串。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/crypto/md5/"

[params.functions_and_methods]
signatures = ["crypto.MD5 INPUT"]
returnType = "string"
aliases = ["md5"]
+++

```go-html-template
{{ md5 "Hello world" }} → 3e25960a79dbc69b674cd4ec67a72c62
```

如果你想用 [Gravatar][] 生成唯一头像，这个函数会很有用：

```html
<img src="https://www.gravatar.com/avatar/{{ md5 "your@email.com" }}?s=100&d=identicon">
```

[Gravatar]: https://en.gravatar.com/
