+++
title = "IsTranslated"
linkTitle = "IsTranslated"
description = "报告给定页面是否有一个或多个翻译版本。"
date = 2026-10-02
weight = 360
source = "https://gohugo.io/methods/page/istranslated/"

[params.functions_and_methods]
signatures = ["PAGE.IsTranslated"]
returnType = "bool"
+++

## 这一页解决什么问题

多语言站点里，很多页面只有一种语言。`IsTranslated` 用一个布尔值回答「这个页面有没有**其它**语言版本」，用来决定要不要显示语言切换器、要不要输出 `hreflang`。

## 什么时候用，什么时候别用

**该用**：

- 只有当存在其它语言版本时才渲染语言切换器；
- 判断是否需要输出 `hreflang` / `og:locale:alternate`。

**别用**：

- 想**遍历**所有语言版本 → 用 [`AllTranslations`](/methods/page/alltranslations/)（含当前语言）；
- 只想要「除当前语言之外」的版本 → 用 [`Translations`](/methods/page/translations/)；
- 想判断当前站点语言 → 用 [`Language`](/methods/page/language/)。

## 用法

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
```

内容如下：

```tree
content/
├── de/
│   ├── books/
│   │   └── book-1.md
│   └── _index.md
├── en/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
└── _index.md
```

渲染 `content/en/books/book-1.md` 时：

```go-html-template
{{ .IsTranslated }} → true
```

渲染 `content/en/books/book-2.md` 时：

```go-html-template
{{ .IsTranslated }} → false
```

## 完整示例：有翻译时才显示切换器

最小站点：双语言（en / zh），`content/docs/guide/alpha.md` 与 `alpha.zh.md` 互为翻译；`content/docs/guide/beta.md` 只有英文。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ if .IsTranslated }}
  <p>本页有其它语言版本</p>
{{ else }}
  <p>本页只有一种语言</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，`alpha` 输出：

```html
<p>本页有其它语言版本</p>
```

`beta` 输出：

```html
<p>本页只有一种语言</p>
```

**你应当看到什么**：中文版 `alpha` 同样输出「有其它语言版本」——判断的是「是否存在别的语言」，与当前是哪种语言无关。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；en / zh 双语言站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面有另一个语言的版本 | `true` | 否 |
| 页面只有一种语言 | `false` | 否 |
| 当前语言是默认语言或第二语言 | 结论相同（与当前语言无关） | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 切换器只有一项 | 用 `AllTranslations` 却没判断数量 | 单语言页面也会返回含自身的切片 | 先用 `IsTranslated` 判断，或比较 `len` |
| 译文没被关联 | 两个语言的文件名/目录对不上 | 翻译靠**翻译基础名 + 路径**配对 | 保持文件名一致（`alpha.md` / `alpha.zh.md`） |
| 判断结果与预期相反 | 把「当前语言」也算成翻译 | 语义混淆 | `IsTranslated` 只看「有没有别的语言」，不看数量 |

更多排查入口见[故障排查](/troubleshooting/)。

