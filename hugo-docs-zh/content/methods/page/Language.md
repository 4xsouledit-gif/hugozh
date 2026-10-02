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

## 这一页解决什么问题

`Language` 返回当前页面所属语言的 **Language 对象**：语言标签、区域、显示名、书写方向、是否默认语言。多语言站点里输出 `lang` 属性、`hreflang`、语言切换器都要用它。

## 什么时候用，什么时候别用

**该用**：

- 输出 `<html lang="…">` 或 `hreflang`；
- 语言切换器里显示各语言的名称；
- 判断当前是否为默认语言。

**别用**：

- 想**遍历**页面上的其它语言版本 → 用 [`AllTranslations`](/methods/page/alltranslations/)；
- 想取整个站点的语言列表 → 用 `hugo.Sites` 或 `site.Languages`；
- 想判断「有没有译文」→ 用 [`IsTranslated`](/methods/page/istranslated/)。

## 用法

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

## 完整示例：输出当前语言信息

最小站点：`hugo.toml` 里 `[languages.en]`（`locale = 'en-US'`、`label = 'English'`）与 `[languages.zh]`（`locale = 'zh-CN'`、`label = '简体中文'`）；`content/docs/guide/alpha.md` 与 `alpha.zh.md` 互为翻译。模板：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .Language.Name }}|{{ .Language.Locale }}|{{ .Language.Label }}|{{ .Language.IsDefault }}</p>
```

`hugo --source <站点目录> --ignoreCache` 构建后，英文版 alpha 输出：

```html
<p>en|en-US|English|true</p>
```

中文版 alpha 输出：

```html
<p>zh|zh-CN|简体中文|false</p>
```

**你应当看到什么**：`.Language.Name` 是配置里的语言**键名**（`en` / `zh`）；`.Locale` 来自该语言的 `locale`；`.Label` 来自 `label`，中文站点因此显示中文名。同一次构建中 `.Language.Direction` 输出为空字符串（配置里没有写 `direction`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；en（weight 1，默认语言）与 zh（weight 2）双语言站点。

| 字段 | 英文页面 | 中文页面 | 是否报错 |
| --- | --- | --- | --- |
| `.Language.Name` | `en` | `zh` | 否 |
| `.Language.Locale` | `en-US` | `zh-CN` | 否 |
| `.Language.Label` | `English` | `简体中文` | 否 |
| `.Language.IsDefault` | `true` | `false` | 否 |
| `.Language.Direction` | 空字符串（未配置 `direction`） | 空字符串 | 否 |
| `.Language.Weight` | 已弃用（0.158.0 起），改取语言定义或 `hugo.Sites` | 同左 | 否 |
| 返回类型 | `langs.Language` | — | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| `lang` 属性为空 | 输出 `.Language.LanguageCode` | 该字段 0.158.0 起弃用 | 改用 `.Language.Locale` |
| 语言名显示成 `en` | 用了 `.Language.LanguageName` 或 `.Name` | 这两个字段的含义不同（键名 vs 显示名） | 显示名用 `.Language.Label` |
| 切换器把当前语言也列出来 | 用了 `AllTranslations` 且未过滤 | 集合包含当前语言 | 用 `eq .Language $.Language` 判断（见上游示例） |
| `RTL` 语言排版错乱 | 没有输出 `dir` | `direction` 需要显式配置 | 在语言定义里写 `direction`，模板输出 `.Language.Direction` |

更多排查入口见[故障排查](/troubleshooting/)。

[`direction`]: /configuration/languages/#direction
[`label`]: /configuration/languages/#label
[`locale`]: /configuration/languages/#locale
[说明]: /methods/site/language/
[RFC 5646]: https://datatracker.ietf.org/doc/html/rfc5646
