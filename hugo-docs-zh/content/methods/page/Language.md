+++
title = "Language"
linkTitle = "Language"
description = "返回给定页面的 Language 对象。"
date = 2026-10-02
weight = 390
source = "https://gohugo.io/methods/page/language/"

[params.functions_and_methods]
signatures = ["PAGE.Language"]
returnType = "langs.Language"
+++

`Page` 对象上的 `Language` 方法返回给定页面的 `Language` 对象，其内容来自项目配置中的语言定义。

你也可以在 `Site` 对象上使用 `Language` 方法。详见[说明][]。

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
  {{ .Language.Direction }} → ltr
  ```

`IsDefault`
: **（0.153.0 新增）**
: （`bool`）报告这是否为[默认语言](g)。

  ```go-html-template
  {{ .Language.IsDefault }} → true
  ```

`Label`
: **（0.158.0 新增）**
: （`string`）返回语言定义中的 [`label`][]。

  ```go-html-template
  {{ .Language.Label }} → Deutsch
  ```

`Lang`
: **（0.158.0 起弃用）**
: 请改用 [`Name`](#name)。

`LanguageCode`
: **（0.158.0 起弃用）**
: 请改用 [`Locale`](#locale)。

`LanguageDirection`
: **（0.158.0 起弃用）**

请改用 [`Direction`](#direction)。
`LanguageName`
: **（0.158.0 起弃用）**
: 请改用 [`Label`](#label)。

`Locale`
: **（0.158.0 新增）**
: （`string`）返回语言定义中的 [`locale`][]，找不到时回退到 [`Name`](#name)。

  ```go-html-template
  {{ .Language.Locale }} → de-DE
  ```

`Name`
: **（0.153.0 新增）**
: （`string`）返回由 [RFC 5646][] 定义的语言标签，即语言定义中转为小写的键名。

  ```go-html-template
  {{ .Language.Name }} → de
  ```

`Weight`
: **（0.158.0 起弃用）**

## 示例

用下面的代码创建一个语言选择器，让用户在当前页面的不同翻译版本之间切换。

```go-html-template {file="layouts/_partials/language-selector.html" copy=true}
{{ with .Rotate "language" }}
  <nav class="language-selector">
    <ul>
      {{ range . }}
        {{ if eq .Language $.Language }}
          <li class="active">
            <a aria-current="page" href="{{ .Permalink }}" hreflang="{{ .Language.Locale }}">{{ .Language.Label }}</a>
          </li>
        {{ else }}
          <li>
            <a href="{{ .Permalink }}" hreflang="{{ .Language.Locale }}">{{ .Language.Label }}</a>
          </li>
        {{ end }}
      {{ end }}
    </ul>
  </nav>
{{ end }}
```

[RFC 5646]: https://datatracker.ietf.org/doc/html/rfc5646
[`direction`]: /configuration/languages/#direction
[`label`]: /configuration/languages/#label
[`locale`]: /configuration/languages/#locale
[说明]: /methods/site/language/
