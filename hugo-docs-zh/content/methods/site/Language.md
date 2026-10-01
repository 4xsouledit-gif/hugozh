+++
title = "Language"
linkTitle = "Language"
description = "返回给定站点的 Language 对象。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/site/language/"

[params.functions_and_methods]
signatures = ["SITE.Language"]
returnType = "langs.Language"
+++

`Site` 对象上的 `Language` 方法返回给定站点的 `Language` 对象，其内容来自项目配置中的语言定义。

你也可以在 `Page` 对象上使用 `Language` 方法。详见[说明][]。

## 方法

在 `Language` 对象上使用这些方法。

下面的示例都基于如下语言定义。

```toml
[languages.de]
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
weight = 2
```

`Direction`
: **（0.158.0 新增）**
: （`string`）返回语言定义中的 [`direction`][]。

  ```go-html-template
  {{ .Site.Language.Direction }} → ltr
  ```

`IsDefault`
: **（0.153.0 新增）**
: （`bool`）报告这是否为[默认语言](g)。

  ```go-html-template
  {{ .Site.Language.IsDefault }} → true
  ```

`Label`
: **（0.158.0 新增）**
: （`string`）返回语言定义中的 [`label`][]。

  ```go-html-template
  {{ .Site.Language.Label }} → Deutsch
  ```

`Lang`
: **（0.158.0 起弃用）**
: 请改用 [`Name`](#name)。

`LanguageCode`
: **（0.158.0 起弃用）**
: 请改用 [`Locale`](#locale)。

`LanguageDirection`
: **（0.158.0 起弃用）**
: 请改用 [`Direction`](#direction)。

`LanguageName`
: **（0.158.0 起弃用）**
: 请改用 [`Label`](#label)。

`Locale`
: **（0.158.0 新增）**
: （`string`）返回语言定义中的 [`locale`][]，找不到时回退到 [`Name`](#name)。

  ```go-html-template
  {{ .Site.Language.Locale }} → de-DE
  ```

`Name`
: **（0.153.0 新增）**
: （`string`）返回由 [RFC 5646][] 定义的语言标签，即语言定义中转为小写的键名。

  ```go-html-template
  {{ .Site.Language.Name }} → de
  ```

`Weight`
: **（0.158.0 起弃用）**

## 示例

上面的一些方法常用于 _base_ 模板，作为 `html` 元素的属性。

```go-html-template
<html
  lang="{{ .Site.Language.Locale }}"
  dir="{{ or .Site.Language.Direction `ltr` }}"
>
```

[RFC 5646]: https://datatracker.ietf.org/doc/html/rfc5646
[`direction`]: /configuration/languages/#direction
[`label`]: /configuration/languages/#label
[`locale`]: /configuration/languages/#locale
[说明]: /methods/page/language/
