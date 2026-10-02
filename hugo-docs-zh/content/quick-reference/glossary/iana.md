+++
title = "IANA"
linkTitle = "IANA"
description = "互联网号码分配机构，负责全球 IP 地址、DNS 根区与媒体类型等资源的分配。"
date = 2026-10-02
weight = 540
source = "https://gohugo.io/quick-reference/glossary/iana/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["知道媒体类型与时区这类取值该去哪里核对，并在报 unknown time zone 时知道问题出在名字上"]
next = ["/configuration/media-types/"]
+++

IANA 是 Internet Assigned Numbers Authority（互联网号码分配机构）的缩写，这是一个非营利组织，负责管理全球 IP 地址、自治系统号、DNS 根区、媒体类型以及其它互联网协议相关资源的分配。

## 为什么重要

Hugo 的不少取值直接来自 IANA 注册表：媒体类型（如 `text/css`、`image/webp`）和时区名（如 `Asia/Shanghai`）。这些名字必须与注册表完全一致，拼错或改用常见缩写时行为差异很大——自定义媒体类型写错名字会让资源处理匹配不到，时区写成 `CST` 这类缩写则可能直接报 `unknown time zone` 并中断构建。配 `mediaTypes`、`outputFormats` 或做时间格式化时，以注册表为准比凭记忆写更省事。

延伸阅读：[媒体类型配置](/configuration/media-types/)、[Time 方法](/methods/time/)

参见：[IANA 简介](https://www.iana.org/about)
