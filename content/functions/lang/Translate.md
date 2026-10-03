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

## 这一页解决什么问题

模板里写死的界面文案（「阅读更多」「发表于」「隐私」）在多语言站点上是错的。`lang.Translate` 按**键**去 `i18n/` 目录下的翻译表里取值：当前语言有就取当前语言，没有就回退到默认语言。它是多语言站点里唯一应该出现「界面文案」的地方——文本不写在模板里，而写在翻译表里。

别名有三个：`T`、`i18n`、`lang.Translate`，三者等价。

## 什么时候用，什么时候别用

**该用**：

- 界面文案（按钮、标签、提示语）与需要按语言变化的短文本；
- 需要**复数形式**（`1 day` / `2 days`）的计数文案。

**别用**：

- 页面**内容**本身的多语言 → 用语言的页面包（`content/about.zh.md` 这类），不要塞进翻译表；
- 想要一个可被站点配置覆盖的值 → 用 `site.Params`；
- 想合并缺失译文的**页面列表** → 用 [`lang.Merge`](/functions/lang/merge/)。

> [!WARNING]
> 缺失的 key **不会报错**，返回空字符串（实测）。页面上会安静地少一段文字——排查时请用 `--printI18nWarnings`。

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

## 完整示例（实测）

测量站点：`defaultContentLanguage='en'`，语言 `en`（`locale='en-US'`）与 `zh`（`locale='zh-CN'`）；`i18n/en.toml` 与 `i18n/zh.toml` 内容如下（`zh.toml` 只提供 `privacy`、`security` 与 `day`/`day_with_count` 的 `other` 形式）。

```toml {file="i18n/en.toml"}
privacy = 'privacy'
security = 'security'
[day]
one = 'day'
other = 'days'
[day_with_count]
one = '{{ . }} day'
other = '{{ . }} days'
[age]
one = '{{ .name }} is {{ .count }} year old.'
other = '{{ .name }} is {{ .count }} years old.'
```

```go-html-template {file="layouts/_partials/menu.html"}
[{{ T "privacy" }}]|[{{ i18n "security" }}]|[{{ T "day" 1 }}]|[{{ T "day" 2 }}]|[{{ T "no_such_key" }}]
```

Hugo 0.167.0 实测输出，`en` 站点：

```text
[privacy]|[security]|[day]|[days]|[]
```

`zh` 站点（同一段模板）：

```text
[隐私]|[安全]|[1 天]|[2 天]|[]
```

**你应当看到什么**：`T`/`i18n`/`lang.Translate` 三种写法取到同一个值；复数按计数选择 `one`/`other`；`zh` 站点在 `zh.toml` 里只写了 `other`，所以 `T "day" 1` 也得 `1 天`；不存在的 key 得到**空字符串**（最后一对方括号里什么都没有）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；双语站点，翻译表如上一节。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 当前语言有该 key（实测 `T "privacy"`） | 该语言的译文（`en` 得 `privacy`，`zh` 得 `隐私`） | 否 |
| 当前语言缺该 key、默认语言有（实测 `zh` 站点的 `T "age"`） | **回退到默认语言的译文**：实测返回英文 `Will is 1 year old.` | 否 |
| 两种语言都没有该 key（实测 `T "no_such_key"`） | `""`（空字符串） | **否**——静默返回空串 |
| 整数上下文（实测 `T "day" 0/1/2/5`） | `en`：`days`/`day`/`days`/`days`；`zh`（只有 `other`）：`0 天`/`1 天`/`2 天`/`5 天` | 否 |
| map 上下文（实测 `T "age" (dict "name" "Will" "count" 1)`） | `Will is 1 year old.`（`count` 控制复数） | 否 |
| 返回类型 | `string`，永远不是 `nil` | 否 |

> [!NOTE]
> 想看到「哪些 key 缺了、回退到了哪种语言」，用 `hugo --printI18nWarnings` 构建（或在配置里打开 `printI18nWarnings`）。上游在页首的提示里给出了这两个开关。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上少了一段文字，控制台没有任何提示 | 缺失的 key 返回空字符串、不报错（实测） | 用 `--printI18nWarnings` 列出缺失项；或给 key 起名时统一前缀便于排查 |
| 没报错但结果不对 | 中文站点显示英文 | `zh.toml` 里没有这个 key，回退到了默认语言（实测） | 在 `zh.toml` 里补上该 key |
| 没报错但结果不对 | 复数形式不对 | 翻译表里缺少该语言需要的 CLDR 复数类别（例如中文只需要 `other`，波兰语需要 `one`/`few`/`many`/`other`） | 对照 [CLDR 复数规则表][CLDR] 补齐类别 |
| 没报错但结果不对 | 翻译表根本没被读取 | 文件名与语言不匹配：Hugo 依次按当前语言的 `locale`、语言 key、默认语言的 `locale`、默认语言的 key 查找（见上文「翻译表」） | 把文件名改成与语言配置一致的 `i18n/zh.toml` / `i18n/en.toml` |
| 没报错但结果不对 | 占位符没有被替换 | 复数消息里的 `{{ . }}` 需要传入上下文（整数或带 `count` 的 map） | 调用时带上第二个参数 |

更多排查入口见[故障排查](/troubleshooting/)。

[CLDR]: https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
[RFC 5646 § 2.2.7]: https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.7
[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
[`enableMissingTranslationPlaceholders`]: /configuration/all/#enablemissingtranslationplaceholders
[`locale`]: /configuration/all/#locale
[`nicksnyder/go-i18n`]: https://github.com/nicksnyder/go-i18n
[`printI18nWarnings`]: /configuration/all/#printi18nwarnings
[key]: /configuration/languages/#语言键
