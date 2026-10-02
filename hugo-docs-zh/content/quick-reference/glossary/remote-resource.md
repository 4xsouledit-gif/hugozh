+++
title = "远程资源（remote resource）"
linkTitle = "远程资源"
description = "可通过 HTTP 或 HTTPS 访问的远程服务器文件。"
date = 2026-10-02
weight = 1110
source = "https://gohugo.io/quick-reference/glossary/remote-resource/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断什么时候该用 `resources.GetRemote` 而不是把文件放进 `assets/`，并知道缓存与网络失败会带来什么"]
next = ["/functions/resources/getremote/"]
+++

远程资源（remote resource）是位于远程服务器上、可通过 HTTP 或 HTTPS 访问的文件。

## 为什么重要

用 `resources.GetRemote` 把远程文件取进构建管线之后，就能像本地资源一样对它做缩放、转译、指纹化，不必先手工下载入库——它也是 [resource](g) 的三种来源之一。远程资源默认命中缓存，`hugo --ignoreCache` 才会重新获取；网络不可达时构建直接失败，CI 上要预留这种情况。

延伸阅读：[resources.GetRemote](/functions/resources/getremote/)、[Hugo Pipes 简介](/hugo-pipes/introduction/)
