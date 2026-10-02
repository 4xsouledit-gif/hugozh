+++
title = "简洁 URL（pretty URL）"
linkTitle = "简洁 URL"
description = "不包含文件扩展名的 URL。"
date = 2026-10-02
weight = 1020
source = "https://gohugo.io/quick-reference/glossary/pretty-url/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断站点当前输出的是简洁 URL 还是 ugly URL，并知道换风格会连带影响哪些链接"]
next = ["/content-management/urls/"]
+++

简洁 URL（pretty URL）是不包含文件扩展名的 URL。

## 为什么重要

Hugo 默认输出简洁 URL：`content/posts/my-post.md` 对应 `/posts/my-post/`，目录形式也让静态托管更容易处理，迁移内容时不必改动一堆链接。
一旦启用 [ugly URL](g)，地址会变成 `/posts/my-post.html`，那么硬编码的链接、`aliases` 和外部引用都要跟着改；判断当前用的是哪种，看 `hugo list all` 里的 `permalink` 列即可。

延伸阅读：[URL 管理](/content-management/urls/) · [ugly URL 配置](/configuration/ugly-urls/)
