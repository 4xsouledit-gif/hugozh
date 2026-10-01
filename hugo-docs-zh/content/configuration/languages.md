+++
title = "语言配置"
linkTitle = "语言配置"
description = "配置多语言项目的基础设置、各语言设置与多主机部署。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/configuration/languages/"
+++

## 基础设置

先配置以下基础设置：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = false
disableDefaultLanguageRedirect = false
disableLanguages = []
```

键名|类型|默认值|说明
:--|:--|:--|:--
`defaultContentLanguage`|`string`|`en`|项目的默认语言，需符合 [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646#section-2.1) 描述的语法。定义了一个或多个语言时，该值必须与某个已定义的[语言键](#语言键)一致。
`defaultContentLanguageInSubdir`|`bool`|`false`|是否把默认内容语言发布到与 `defaultContentLanguage` 同名的子目录中。
`disableDefaultLanguageRedirect`|`bool`|`false`|（自 v0.140.0 起）是否禁用为默认内容语言生成别名重定向。当 `defaultContentLanguageInSubdir` 为 `true` 时，该设置阻止根目录重定向到语言子目录；反之，当它为 `false` 时，该设置阻止语言子目录重定向到根目录。此设置已被更通用的 `disableDefaultSiteRedirect` 取代。
`disableLanguages`|`[]string`|空|在构建过程中要禁用的语言键切片。虽然可用，但更推荐使用每个语言下的 `disabled` 键。

## 各语言设置

在 `languages` 键下逐个配置语言：

```toml
[languages.en]
direction = ''
disabled = false
label = ''
locale = ''
title = ''
weight = 0
```

上例中的 `en` 即[语言键](#语言键)。

键名|类型|默认值|说明
:--|:--|:--|:--
`direction`|`string`|`ltr`|语言方向，从左到右为 `ltr`，从右到左为 `rtl`。可在模板中配合全局 `dir` HTML 属性使用，也可通过 `Site` 或 `Page` 对象上的 `Language.Direction` 方法取值。
`disabled`|`bool`|`false`|构建站点时是否禁用该语言。
`label`|`string`|空|语言名称，通常用于渲染语言切换器。可通过 `Site` 或 `Page` 对象上的 `Language.Label` 方法取值。
`languageCode`|`string`|—|（自 v0.158.0 起弃用）请改用 `locale`。
`languageDirection`|`string`|—|（自 v0.158.0 起弃用）请改用 `direction`。
`languageName`|`string`|—|（自 v0.158.0 起弃用）请改用 `label`。
`locale`|`string`|空|符合 [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646#section-2.1) 的语言标签。`language.Translate` 函数优先用它来选择翻译表，日期、货币、数字与百分比的本地化也优先用它，两者都会回退到语言键。
`title`|`string`|空|该语言的站点标题。可通过 `Site` 对象上的 `Title` 方法取值。
`weight`|`int`|`0`|语言权重。设为非零值时，它是该语言的首要排序依据。

`locale` 还会被 Hugo 用于填充：

- 内置别名模板中 `html` 元素的 `lang` 属性
- 内置 RSS 模板中的 `language` 元素
- 内置 Open Graph 模板中的 `locale` 属性

可在模板中通过 `Site` 或 `Page` 对象上的 `Language.Locale` 方法取该值。

## 排序顺序

Hugo 先按权重升序排列语言，权重相同时按字典序升序排列。这会影响构建顺序与补全（complement）的选择。

## 本地化设置

有些配置设置可以针对每种语言分别定义。例如：

```toml
[languages.en]
label = 'English'
locale = 'en-US'
timeZone = 'America/New_York'
title = 'Project Documentation'
weight = 1
[languages.en.pagination]
path = 'page'
[languages.en.params]
subtitle = 'Reference, Tutorials, and Explanations'
```

可以在 `languages` 对象下分别定义的键包括：`contentDir`、`params`、`menus`、`title`、`weight`、`label`、`locale`、`direction`、`disabled`，以及站点级配置分类（例如 `markup`、`mediaTypes`、`pagination`、`permalinks`、`related`、`sitemap`、`taxonomies`、`outputs`、`outputFormats`、`privacy`、`security`、`services`、`frontmatter` 等）。

任何未在 `languages` 对象中定义的键，都会回退到项目配置根部的全局值。

## 语言键

语言键必须符合 [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646#section-2.1) 描述的语法。例如：

```toml
defaultContentLanguage = 'de'
[languages.de]
weight = 1
[languages.en-US]
weight = 2
[languages.pt-BR]
weight = 3
```

也支持 [RFC 5646 § 2.2.7](https://datatracker.ietf.org/doc/html/rfc5646#section-2.2.7) 定义的人工语言私有子标签。语言键中省略 `art-x-` 前缀，例如：

```toml
defaultContentLanguage = 'en'
[languages.en]
weight = 1
[languages.hugolang]
weight = 2
```

> 私有子标签不得超过 8 个字母数字字符。

## 示例

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = true
disableDefaultLanguageRedirect = false

[languages.de]
contentDir = 'content/de'
direction = 'ltr'
disabled = false
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.de.params]
subtitle = 'Referenz, Tutorials und Erklärungen'

[languages.en]
contentDir = 'content/en'
direction = 'ltr'
disabled = false
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2

[languages.en.params]
subtitle = 'Reference, Tutorials, and Explanations'
```

> 上例中，如果采用按文件名翻译的方式，请省略 `contentDir`。详见[多语言](/content-management/multilingual/)。

## 多主机

Hugo 支持在多主机配置中部署多种语言，也就是说可以为每种 `language` 配置 `baseURL`。

> 只要为一种语言定义了 `baseURL`，就必须为所有语言各定义一个唯一的 `baseURL`。

例如：

```toml
defaultContentLanguage = 'fr'
[languages.en]
baseURL = 'https://en.example.org/'
label = 'English'
title = 'In English'
weight = 2
[languages.fr]
baseURL = 'https://fr.example.org'
label = 'Français'
title = 'En Français'
weight = 1
```

按上面的配置，Hugo 会发布两个站点，各有自己的根目录：

```tree
public
├── en
└── fr
```
