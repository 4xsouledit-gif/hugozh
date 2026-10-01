+++
title = "默认版本"
linkTitle = "默认版本"
description = "由 defaultContentVersion 定义的版本，未定义时回退到 v1.0.0。"
date = 2026-10-02
weight = 340
source = "https://gohugo.io/quick-reference/glossary/default-version/"
+++

## 默认版本

_默认版本_（default version）是由 [`defaultContentVersion`][] 设置定义的值；当项目没有定义任何版本时，回退为 `v1.0.0`。当项目定义了一个或多个版本而没有设置该项时，默认版本是项目中的第一个版本，由最低的[_权重_](g)确定；权重相同或未定义权重时，以语义化版本的降序排序作为最终的判定依据。

另见：[版本](g)。

[`defaultContentVersion`]: /configuration/all/#defaultcontentversion
