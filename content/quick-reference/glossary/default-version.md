+++
title = "默认版本"
linkTitle = "默认版本"
description = "由 defaultContentVersion 定义的版本，未定义时回退到 v1.0.0。"
date = 2026-10-02
weight = 340
source = "https://gohugo.io/quick-reference/glossary/default-version/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能判断站点默认发布哪个版本的内容，并定位「配置了多版本却只出来一套内容」的原因"]
next = ["/configuration/versions/"]
+++

## 默认版本

_默认版本_（default version）是由 [`defaultContentVersion`][] 设置定义的值；当项目没有定义任何版本时，回退为 `v1.0.0`。当项目定义了一个或多个版本而没有设置该项时，默认版本是项目中的第一个版本，由最低的[weight](g)确定；权重相同或未定义权重时，以语义化版本的降序排序作为最终的判定依据。

另见：[version](g)。

## 为什么重要

版本是内容变体的又一根轴：同一逻辑页面可以为多个版本各写一份内容，而默认版本决定没有显式指定版本时用哪一份。它最容易被忽略的后果是版本号写得不规范——`v1`、`1.0`、`v1.0.0` 混用时排序和回退会按语义化规则处理，你以为的「最新版」可能不是默认版本；配置了版本却没设 `defaultContentVersion` 时，Hugo 静默挑一个，页面上看到的就是那个版本的内容。

延伸阅读：[版本配置](/configuration/versions/)、[多语言](/content-management/multilingual/)

[`defaultContentVersion`]: /configuration/all/#defaultcontentversion
