+++
title = "标志（flag）"
linkTitle = "标志"
description = "传递给命令行程序、以一个或两个连字符开头的选项。"
date = 2026-10-02
weight = 420
source = "https://gohugo.io/quick-reference/glossary/flag/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能读懂构建命令里的标志，并判断哪个标志该写、写在哪个位置"]
next = ["/commands/"]
+++

标志（flag）是传递给命令行程序的选项，以一个或两个连字符开头。

## 为什么重要

构建行为几乎都由标志决定：`--baseURL` 换域名、`--environment` 切环境、`--minify` 压缩输出、`--gc` 清理缓存，写错或漏写都会产出「看起来成功但不对」的结果。标志要跟在子命令之后（如 `hugo build --minify`），值可以写成 `--flag=value` 或 `--flag value`，把两者混写或把值写成下一个标志时，Hugo 可能把它当成位置参数而不是选项。CI 里的构建命令通常是本地命令的复制，少一个 `--environment` 就会让线上套用开发配置。

延伸阅读：[命令](/commands/)、[hugo build](/commands/hugo-build/)

参见：[hugo](/commands/hugo/)
