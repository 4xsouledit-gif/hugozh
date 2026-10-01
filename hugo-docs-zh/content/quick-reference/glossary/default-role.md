+++
title = "默认角色"
linkTitle = "默认角色"
description = "由 defaultContentRole 定义的角色，未定义时回退到 guest。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/quick-reference/glossary/default-role/"
+++

## 默认角色

_默认角色_（default role）是由 [`defaultContentRole`][] 设置定义的值；当项目没有定义任何角色时，回退为 `guest`。当项目定义了一个或多个角色而没有设置该项时，默认角色是项目中的第一个角色，由最低的[_权重_](g)确定；权重相同或未定义权重时，以字典序作为最终的判定依据。

另见：[角色](g)。

[`defaultContentRole`]: /configuration/all/#defaultcontentrole
