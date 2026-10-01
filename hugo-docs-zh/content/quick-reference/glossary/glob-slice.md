+++
title = "Glob 切片（glob slice）"
linkTitle = "Glob 切片"
description = "由 glob 模式组成的切片，可用 `!` 加一个空格取反。"
date = 2026-10-02
weight = 490
source = "https://gohugo.io/quick-reference/glossary/glob-slice/"
+++

Glob 切片（glob slice）是由[glob patterns](g)组成的[slice](g)。在切片中，模式前加上一个感叹号（`!`）和一个空格即可将其取反。取反模式一旦命中，切片中其余模式的求值就会短路，因此适合用于早期的粗粒度排除。

下面的示例演示如何用 Glob 切片在项目配置中定义[site matrix](g)：

```toml
[sites.matrix]
languages = [ "! no", "**" ]
versions = [ "! v1.2.3", "v1.*.*", "v2.*.*" ]
roles = [ "{member, guest}" ]
```

上面的 `versions` 示例求值结果为：`(not v1.2.3) AND (v1.*.* OR v2.*.*)`。
