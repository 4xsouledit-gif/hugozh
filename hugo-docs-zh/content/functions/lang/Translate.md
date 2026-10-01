+++
title = "lang.Translate"
linkTitle = "Translate"
description = "使用 i18n 目录中的翻译表返回翻译后的字符串。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/lang/translate/"

[params.functions_and_methods]
signatures = ["lang.Translate KEY [CONTEXT]"]
returnType = "string"
aliases = ["T", "i18n"]
+++

`lang.Translate` 函数返回与给定键关联的值：先搜索当前语言的[翻译表](#翻译表)，再搜索 [`defaultContentLanguage`][] 对应的翻译表。

若未找到，该函数返回空字符串。

> [!NOTE]
> 要列出缺失的译文与回退使用的译文，请在项目配置中把 [`printI18nWarnings`][] 设为 `true`，或在构建项目时使用 `--printI18nWarnings` 命令行参数。
>
> 要为缺失的译文与回退使用的译文渲染占位符，请在项目配置中把 [`enableMissingTranslationPlaceholders`][] 设为 `true`。

## 翻译表

[翻译表（translation table）](/quick-reference/glossary/translation-table/)

例如：

```text
i18n/en.toml
i18n/pt-BR.toml
```

Hugo 按以下基本名称（base name）依次查找匹配的翻译表：

1. 当前语言的 [`locale`][]
1. 当前语言的 [key][]
1. [`defaultContentLanguage`][] 的 locale
1. [`defaultContentLanguage`][] 的 key

也支持 [RFC 5646 § 2.2.7][] 中定义的、带私有子标签（private use subtag）的人造语言。为简洁起见，可以省略 `art-x-` 前缀。例如：

```text
i18n/art-x-hugolang.toml
i18n/hugolang.toml
```

> [!NOTE]
> 私有子标签不得超过 8 个字母数字字符。

## 简单翻译

假设你的多语言项目支持两种语言：英语和波兰语。请在 `i18n` 目录中为每种语言创建一个翻译表。

```tree
i18n/
├── en.toml
└── pl.toml
```

英语翻译表：

```toml
privacy = 'privacy'
security = 'security'
```

波兰语翻译表：

```toml
privacy = 'prywatność'
security = 'bezpieczeństwo'
```

> [!NOTE]
> 下例为简洁起见使用 `T` 这个别名。

查看英语站点时：

```go-html-template
{{ T "privacy" }} → privacy
{{ T "security" }} → security
```

查看波兰语站点时：

```go-html-template
{{ T "privacy" }} → prywatność
{{ T "security" }} → bezpieczeństwo
```

## 带复数形式的翻译

假设你的多语言项目支持两种语言：英语和波兰语。请在 `i18n` 目录中为每种语言创建一个翻译表。

```tree
i18n/
├── en.toml
└── pl.toml
```

Unicode 的 [CLDR 复数规则表][CLDR] 描述了各语言的复数类别。

英语翻译表：

```toml
[day]
one = 'day'
other = 'days'

[day_with_count]
one = '{{ . }} day'
other = '{{ . }} days'
```

波兰语翻译表：

```toml
[day]
one = 'miesiąc'
few = 'miesiące'
many = 'miesięcy'
other = 'miesiąca'

[day_with_count]
one = '{{ . }} miesiąc'
few = '{{ . }} miesiące'
many = '{{ . }} miesięcy'
other = '{{ . }} miesiąca'
```

> [!NOTE]
> 下例为简洁起见使用 `T` 这个别名。

查看英语站点时：

```go-html-template
{{ T "day" 0 }} → days
{{ T "day" 1 }} → day
{{ T "day" 2 }} → days
{{ T "day" 5 }} → days

{{ T "day_with_count" 0 }} → 0 days
{{ T "day_with_count" 1 }} → 1 day
{{ T "day_with_count" 2 }} → 2 days
{{ T "day_with_count" 5 }} → 5 days
```

查看波兰语站点时：

```go-html-template
{{ T "day" 0 }} → miesięcy
{{ T "day" 1 }} → miesiąc
{{ T "day" 2 }} → miesiące
{{ T "day" 5 }} → miesięcy

{{ T "day_with_count" 0 }} → 0 miesięcy
{{ T "day_with_count" 1 }} → 1 miesiąc
{{ T "day_with_count" 2 }} → 2 miesiące
{{ T "day_with_count" 5 }} → 5 miesięcy
```

在上面的复数示例中，我们在上下文中传入了一个整数（第二个参数）。你也可以在上下文中传入一个 map，并提供 `count` 键来控制复数形式。

翻译表：

```toml
[age]
one = '{{ .name }} is {{ .count }} year old.'
other = '{{ .name }} is {{ .count }} years old.'
```

模板代码：

```go-html-template
{{ T "age" (dict "name" "Will" "count" 1) }} → Will is 1 year old.
{{ T "age" (dict "name" "John" "count" 3) }} → John is 3 years old.
```

> [!NOTE]
> 翻译表可以同时包含简单翻译与带复数形式的翻译。

## 保留键

Hugo 使用 [`nicksnyder/go-i18n`][] 包在翻译表中查找值。该包为内部用途保留了以下键：

`id`
: （`string`）唯一标识该消息。

`description`
: （`string`）描述该消息，为译者提供可能有用的补充上下文。

`hash`
: （`string`）唯一标识该消息所翻译自的原文内容。

`leftdelim`
: （`string`）Go 模板的左定界符。

`rightdelim`
: （`string`）Go 模板的右定界符。

`zero`
: （`string`）[CLDR][] 复数形式 "zero" 对应的消息内容。

`one`
: （`string`）[CLDR][] 复数形式 "one" 对应的消息内容。

`two`
: （`string`）[CLDR][] 复数形式 "two" 对应的消息内容。

`few`
: （`string`）[CLDR][] 复数形式 "few" 对应的消息内容。

`many`
: （`string`）[CLDR][] 复数形式 "many" 对应的消息内容。

`other`
: （`string`）[CLDR][] 复数形式 "other" 对应的消息内容。

如果需要为某个保留键提供译文，可以在该词前加下划线。例如：

```toml
_description = 'descripción'
_few = 'pocos'
_many = 'muchos'
_one = 'uno'
_other = 'otro'
_two = 'dos'
_zero = 'cero'
```

然后在模板中：

```go-html-template
{{ T "_description" }} → descripción
{{ T "_few" }} → pocos
{{ T "_many" }} → muchos
{{ T "_one" }} → uno
{{ T "_two" }} → dos
{{ T "_zero" }} → cero
{{ T "_other" }} → otro
```

[CLDR]: https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
[RFC 5646 § 2.2.7]: https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.7
[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
[`enableMissingTranslationPlaceholders`]: /configuration/all/#enablemissingtranslationplaceholders
[`locale`]: /configuration/all/#locale
[`nicksnyder/go-i18n`]: https://github.com/nicksnyder/go-i18n
[`printI18nWarnings`]: /configuration/all/#printi18nwarnings
[key]: /configuration/languages/#语言键
