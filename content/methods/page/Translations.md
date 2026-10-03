+++
title = "Translations"
linkTitle = "Translations"
description = "返回给定页面的所有译文（不含当前语言），按语言权重再按语言名称排序。"
date = 2026-10-02
weight = 850
source = "https://gohugo.io/methods/page/translations/"

[params.functions_and_methods]
signatures = ["PAGE.Translations"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

「本文还有哪些语言版本？」——`.Translations` 返回**除当前语言之外**的所有译文页面，用 `range` 就能渲染语言列表：

```go-html-template
{{ with .Translations }}
  <ul>{{ range . }}<li><a href="{{ .RelPermalink }}">{{ .Language.Lang }}</a></li>{{ end }}</ul>
{{ end }}
```

它和 [`.Rotate "language"`](/methods/page/rotate/) 的差别只有一处：`.Translations` **不含当前语言**，`.Rotate` 含。做「切换到其他语言」用 `.Translations`；做「语言切换器（含当前项高亮）」用 `.Rotate`。

## 什么时候用，什么时候别用

**该用**：

- 「其他语言版本」链接列表、`hreflang` 链接；
- 需要「这一页有没有别的语言」时（配合 `with`，空集合走 `else`）。

**别用**：

- 想做含当前语言的语言切换器 → 用 [`.Rotate "language"`](/methods/page/rotate/)；
- 想知道「有没有译文」这一个布尔问题 → 用 [`.IsTranslated`](/methods/page/istranslated/)；
- 想列出所有语言站点（不管这一页有没有译文）→ 用 [`hugo.Sites`](/functions/hugo/sites/)。

**对照（实测，本站 `en` + `zh`）**：

| 页面 | `.Translations` | `.Rotate "language"` |
| --- | --- | --- |
| `/posts/post-2/`（有中文版） | `zh` → `/posts/post-2/` | `en`、`zh` |
| `/docs/ref/`（没有中文版） | 空（`with` 走 `else`） | 只有 `en` |

## 用法

项目配置如下：

```toml
defaultContentLanguage = 'en'

[languages.en]
contentDir = 'content/en'
label = 'English'
locale = 'en-US'
weight = 1

[languages.de]
contentDir = 'content/de'
label = 'Deutsch'
locale = 'de-DE'
weight = 2

[languages.fr]
contentDir = 'content/fr'
label = 'Français'
locale = 'fr-FR'
weight = 3
```

内容如下：

```tree
content/
├── de/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
├── en/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
├── fr/
│   ├── books/
│   │   └── book-1.md
│   └── _index.md
└── _index.md
```

模板如下：

```go-html-template
{{ with .Translations }}
  <ul>
    {{ range . }}
      <li>
        <a href="{{ .RelPermalink }}" hreflang="{{ .Language.Locale }}">{{ .LinkTitle }} ({{ or .Language.Label .Language.Name }})</a>
      </li>
    {{ end }}
  </ul>
{{ end }}
```

在英文站点的 `book-1` 页面上，Hugo 会渲染出这个列表：

```html
<ul>
  <li><a href="/de/books/book-1/" hreflang="de-DE">Book 1 (Deutsch)</a></li>
  <li><a href="/fr/books/book-1/" hreflang="fr-FR">Book 1 (Français)</a></li>
</ul>
```

在英文站点的 `book-2` 页面上，Hugo 会渲染出这个列表：

```html
<ul>
  <li><a href="/de/books/book-1/" hreflang="de-DE">Book 1 (Deutsch)</a></li>
</ul>
```

## 完整示例：其他语言版本

测试站配置：

```toml
defaultContentLanguage = 'en'

[languages.en]
weight = 1
title = 'MP EN'
label = 'English'
locale = 'en-US'

[languages.zh]
weight = 2
title = 'MP ZH'
label = '中文'
locale = 'zh-CN'
```

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ with .Translations }}
  <ul class="translations">
    {{ range . }}
      <li><a href="{{ .RelPermalink }}" hreflang="{{ .Language.Locale }}">{{ .Language.Lang }}</a></li>
    {{ end }}
  </ul>
{{ else }}
  <p>本文暂无其他语言版本</p>
{{ end }}
```

实测（Hugo 0.167.0）：

| 渲染的页面 | 渲染结果 |
| --- | --- |
| `/posts/post-1/`（英文，有 `post-1.zh.md`） | `<ul class="translations"><li><a href="/zh/posts/post-1/" hreflang="zh-CN">zh</a></li></ul>` |
| `/zh/posts/post-1/`（中文） | `<ul class="translations"><li><a href="/posts/post-1/" hreflang="en-US">en</a></li></ul>` |
| `/docs/ref/`（没有中文版） | `<p>本文暂无其他语言版本</p>` |

**你应当看到什么**：英文页只列出 `zh`（不含自己），中文页只列出 `en`；没有译文的页面得到**空集合**，`with` 会走 `else`。所以 `.Translations` 天然是「安全的」——不需要额外判空就能用，但仍建议用 `with` 给出兜底文案。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有译文 | 译文页面集合，不含当前语言（实测） | 否 |
| 没有译文 | 空集合，`with`/`if` 为假（实测 `/docs/ref/`） | 否 |
| 排序 | 按语言 weight，其次按语言名称（上游说明） | 否 |
| 单语言站点 | 空集合 | 否 |
| 返回类型 | `page.Pages`（可 `range`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
