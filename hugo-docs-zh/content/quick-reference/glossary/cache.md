+++
title = "缓存"
linkTitle = "缓存"
description = "存储数据以加快后续同类请求的软件组件。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/quick-reference/glossary/cache/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断构建变慢或改了资源不生效是不是缓存造成的，并知道怎么验证"]
next = ["/configuration/caches/"]
+++

## 缓存

_缓存_（cache）是一种软件组件，它存储数据，以便后续对同一数据的请求更快得到结果。

## 为什么重要

Hugo 缓存的是耗时的中间结果：图片处理、Sass 编译、远程资源的下载结果，默认落在项目的 `resources/_gen` 与系统缓存目录。CI 上不保留缓存，每次构建都要重新下载与重新处理，时间会明显变长；反过来，改了资源却看到旧结果，通常也是缓存没失效。用 `hugo --ignoreCache` 或删掉 `resources/_gen` 重跑一次，就能确认是不是缓存造成的。

延伸阅读：[缓存配置](/configuration/caches/) · [HTTP 缓存](/configuration/http-cache/)
