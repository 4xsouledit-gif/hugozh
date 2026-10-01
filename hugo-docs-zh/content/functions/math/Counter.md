+++
title = "math.Counter"
linkTitle = "math.Counter"
description = "返回一个全局计数器值，函数每被调用一次就递增一次。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/math/counter/"

[params.functions_and_methods]
signatures = ["math.Counter"]
returnType = "uint64"
+++

该计数器对单语言与多语言项目都是全局的，每次构建的初始值为&nbsp;1。

```go-html-template {file="layouts/page.html"}
{{ warnf "page.html called %d times" math.Counter }}
```

```text
WARN  page.html called 1 times
WARN  page.html called 2 times
WARN  page.html called 3 times
```

可以用这个函数来：

- 生成如上例所示的唯一警告信息；[`warnf`][] 函数会抑制重复的消息
- 为 `resources.FromString` 函数生成唯一的目标路径，此时目标路径同时也是缓存键

> [!NOTE]
> 由于并发的原因，同一页面在给定模板中返回的值每次构建都可能不同。不能用这个函数给每个页面分配固定的 id。

[`warnf`]: /functions/fmt/warnf/
