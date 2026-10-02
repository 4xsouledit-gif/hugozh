+++
title = "AllTranslations"
linkTitle = "AllTranslations"
description = "返回给定页面的全部翻译版本（含当前语言），先按语言权重、再按语言名称排序。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/page/alltranslations/"

[params.functions_and_methods]
signatures = ["PAGE.AllTranslations"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

`AllTranslations` 一次拿到一个页面**所有语言版本**的 Page 集合（包含当前语言），用来渲染语言切换器：把每个翻译版本的链接、语言标签与 `hreflang` 一起输出，搜索引擎才会把这些页面识别为一组。

要点：返回值是**页面集合**，不是「其它语言」。单语言页面调用它也会得到一个只含自己的切片（`len` 为 1），而不是空集合。

## 什么时候用，什么时候别用

**该用**：

- 渲染语言切换器、`hreflang` 链接、多语言站点地图；
- 想知道某个页面一共有几种语言版本。

**别用**：

- 只想判断「有没有别的语言版本」→ 用 [`IsTranslated`](/methods/page/istranslated/)（返回布尔值，更省事）；
- 只想要「除当前语言之外」的版本 → 用 [`Translations`](/methods/page/translations/)，它不含当前页面；
- 想遍历站点的其它语言 → 那是 [`hugo.Sites`](/functions/hugo/sites/) 与各站点 `.Pages` 的范畴。

## 用法

上游给出的多语言示例：

使用如下项目配置：

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
{{ with .AllTranslations }}
  <ul>
    {{ range . }}
      <li>
        <a href="{{ .RelPermalink }}" hreflang="{{ .Language.Locale }}">{{ .LinkTitle }} ({{ or .Language.Label .Language.Name }})</a>
      </li>
    {{ end }}
  </ul>
{{ end }}
```

Hugo 会在各站点的 `book-1` 页面上渲染出这个列表：

```html
<ul>
  <li><a href="/books/book-1/" hreflang="en-US">Book 1 (English)</a></li>
  <li><a href="/de/books/book-1/" hreflang="de-DE">Book 1 (Deutsch)</a></li>
  <li><a href="/fr/books/book-1/" hreflang="fr-FR">Book 1 (Français)</a></li>
</ul>
```

在英文站点与德文站点的 `book-2` 页面上，Hugo 会渲染出：

```html
<ul>
  <li><a href="/books/book-1/" hreflang="en-US">Book 1 (English)</a></li>
  <li><a href="/de/books/book-1/" hreflang="de-DE">Book 1 (Deutsch)</a></li>
</ul>
```

## 完整示例：渲染语言切换器

最小站点：`hugo.toml` 中 `defaultContentLanguage = 'en'`，`[languages.en]`（`locale = 'en-US'`，`weight = 1`）、`[languages.zh]`（`locale = 'zh-CN'`，`weight = 2`）；`content/docs/guide/alpha.md` 与 `content/docs/guide/alpha.zh.md` 互为翻译。把下面的代码放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
<ul>
{{ range .AllTranslations }}
  <li><a href="{{ .RelPermalink }}" hreflang="{{ .Language.Locale }}">{{ .LinkTitle }}</a></li>
{{ end }}
</ul>
```

`hugo --source <站点目录> --ignoreCache` 构建后，英文版 alpha 渲染为：

```html
<ul>
  <li><a href="/docs/guide/alpha/" hreflang="en-US">Alpha 页</a></li>
  <li><a href="/zh/docs/guide/alpha/" hreflang="zh-CN">Alpha 中文</a></li>
</ul>
```

中文版 alpha 渲染出**同一个集合**，顺序也相同。

**你应当看到什么**：英文排在前、中文排在后，与 `[languages]` 里的 `weight` 一致；每一项的 `.Language.Locale` 来自该语言自己的 `locale`，而不是站点默认语言；没有翻译的页面（如 `beta.md`）同样会输出一行——那一行就是它自己。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；双语言站点（en `weight = 1`、zh `weight = 2`），另有一个只有英文的 `beta.md`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面有翻译 | `page.Pages`，含当前语言版本，按语言权重升序 | 否 |
| 页面没有任何翻译（`beta.md`） | `len` 为 **1** 的切片，元素是页面自己（**不是空切片**） | 否 |
| 在首页调用 | 每种语言的首页各一项 | 否 |
| 译文缺少中间层 `_index.md` | 集合内容不受影响，译文项的 `.RelPermalink` 仍带语言前缀 | 否 |
| 返回类型 | `page.Pages`（可直接交给 `range`、`len`、`first`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 语言切换器里出现了当前语言，还带 `active` 类判不出来 | 集合包含当前页面 | 用 `eq .Language $.Language` 判断当前项，或改用 `Translations` |
| 没报错但结果不对 | 语言切换器在单语言页面上仍显示一项 | 无翻译时返回含自身的切片 | 用 `IsTranslated` 或 `gt (len .AllTranslations) 1` 判断后再渲染 |
| 没报错但结果不对 | 译文链接指向错误路径 | 手写路径拼接，没有用译文页自己的 `.RelPermalink` | 一律取集合内页面的 `.RelPermalink`（已含语言前缀） |

更多排查入口见[故障排查](/troubleshooting/)。
