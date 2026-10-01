+++
title = "默认语言"
linkTitle = "默认语言"
description = "由 defaultContentLanguage 定义的语言，未定义时回退到 en。"
date = 2026-10-02
weight = 300
source = "https://gohugo.io/quick-reference/glossary/default-language/"
+++

## 默认语言

_默认语言_（default language）是由 [`defaultContentLanguage`][] 设置定义的值；当项目没有定义任何语言时，回退为 `en`。当项目定义了一种或多种语言而没有设置该项时，如果存在名为 `en` 的已启用语言，默认语言就是 `en`，否则是项目中第一个已启用的语言。第一个语言由最低的[_权重_](g)确定；权重相同或未定义权重时，以字典序作为最终的判定依据。

另见：[语言](g)。

[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
