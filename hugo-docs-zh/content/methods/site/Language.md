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

## 这一页解决什么问题

`Language` 返回**当前站点的语言对象**：这个站点是哪种语言（`Name`）、使用什么 locale（`Locale`）、显示名是什么（`Label`）、书写方向是什么（`Direction`），以及它是不是默认语言（`IsDefault`）。

它最常见的用途只有一个：在 `base` 模板里给 `<html>` 写 `lang` 与 `dir` 属性。多语言站点里，每个语言会各自渲染一遍模板，`.Site.Language` 就是「现在轮到哪个语言」的答案。

## 什么时候用，什么时候别用

**该用**：

- `<html lang="…" dir="…">`、`hreflang`、feed 的 `<language>` 一类语言元信息；
- 需要按语言分支显示文案时判断 `Name` 或 `IsDefault`。

**别用**：

- 用已弃用的 `Lang`、`LanguageCode`、`LanguageName`、`LanguageDirection`（0.158.0 起弃用），它们分别对应 `Name`、`Locale`、`Label`、`Direction`；
- 想遍历项目里所有语言 → 用 [`Site.Languages`](/methods/site/languages/)（已弃用）或 [`hugo.Sites`](/functions/hugo/sites/)；
- 想取站点标题 → 用 [`Site.Title`](/methods/site/title/)，语言对象的 `Label` 是语言显示名，不是站点标题；
- 页面自己的语言 → 用页面上的 `Language` 方法（见 [methods/page](/methods/page/)）。

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

## 完整示例（实测）

单语言站点若不写 `[languages]`，只有 `Name` 与 `Locale` 有确定值：

```go-html-template {file="layouts/index.html"}
<p>Name：{{ .Site.Language.Name }}</p>
<p>Locale：{{ .Site.Language.Locale }}</p>
<p>Label：[{{ .Site.Language.Label }}]</p>
<p>Direction：[{{ .Site.Language.Direction }}]</p>
<p>IsDefault：{{ .Site.Language.IsDefault }}</p>
```

一个 `locale = 'en-US'`、未定义 `[languages]` 的站点实测渲染为：

```html
<p>Name：en</p>
<p>Locale：en-US</p>
<p>Label：[]</p>
<p>Direction：[]</p>
<p>IsDefault：true</p>
```

多语言站点（`[languages.de]` 与 `[languages.en]` 都写了 `label`、`locale`、`direction`）里，同一模板在德语站点实测渲染为：

```html
<p>Name：de</p>
<p>Locale：de-DE</p>
<p>Label：[Deutsch]</p>
<p>Direction：[ltr]</p>
<p>IsDefault：false</p>
```

**你应当看到什么**：`Label` 与 `Direction` 是**配置里写了才有**的字段（没写就是空字符串，不报错），而 `Name` 与 `Locale` 总有值。所以 base 模板里的 `dir` 要像上游示例那样用 `or … \`ltr\`` 兜底。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；分别在单语言站点与含 `[languages.de]`、`[languages.en]` 的站点测量。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 未配置 `[languages]`，`locale = 'en-US'` | `Name` → `en`，`Locale` → `en-US`，`IsDefault` → `true` | 否 |
| 未配置 `label` / `direction` | `Label`、`Direction` 均为空字符串 | 否 |
| 配置了 `label = 'Deutsch'` / `direction = 'ltr'` | 原样返回 | 否 |
| 非默认语言站点 | `IsDefault` → `false` | 否 |
| 弃用的 `Lang` / `LanguageCode` | 实测仍分别返回 `en` / `en-US`（可用但不应用新代码） | 否 |
| `printf "%T" .Site.Language` | `*langs.Language` | 否 |

[RFC 5646]: https://datatracker.ietf.org/doc/html/rfc5646
[`direction`]: /configuration/languages/#direction
[`label`]: /configuration/languages/#label
[`locale`]: /configuration/languages/#locale
[说明]: /methods/page/language/
