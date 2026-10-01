+++
title = "debug.Timer"
linkTitle = "debug.Timer"
description = "返回一个具名计时器，用于测量执行耗时并输出到控制台。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/debug/timer/"

[params.functions_and_methods]
signatures = ["debug.Timer NAME"]
returnType = "debug.Timer"
+++

用 `debug.Timer` 函数测量一段代码的执行时间，这有助于发现模板中的性能瓶颈。

计时器在你实例化它时启动，在调用它的 `Stop` 方法时停止。

```go-html-template
{{ $t := debug.Timer "TestSqrt" }}
{{ range 2000 }}
  {{ $f := math.Sqrt . }}
{{ end }}
{{ $t.Stop }}
```

构建站点时使用 `--logLevel info` 命令行参数。

```sh
hugo build --logLevel info
```

结果会在构建结束时显示到控制台。计时器数量不限；如果没有停止它们，它们会在构建结束时被停止。

```text
INFO  timer:  name TestSqrt count 1002 duration 2.496017496s average 2.491035ms median 2.282291ms
```
