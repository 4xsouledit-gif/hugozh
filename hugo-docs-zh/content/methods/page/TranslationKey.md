+++
title = "TranslationKey"
linkTitle = "TranslationKey"
description = "返回给定页面的翻译 key。"
date = 2026-10-02
weight = 840
source = "https://gohugo.io/methods/page/translationkey/"

[params.functions_and_methods]
signatures = ["PAGE.TranslationKey"]
returnType = "string"
+++

## 这一页解决什么问题

多语言站点里，Hugo 需要知道「英文的 `book-1.md` 和德文的 `buch-1.md` 是同一篇文章」。这个身份就是**翻译 key**，`.TranslationKey` 返回它。默认由文件路径推导——所以中英文同名文件（`post-1.md` 与 `post-1.zh.md`）自动配对；文件名不同时，用 front matter 的 `translationKey` 手工绑定。

配对的直接用途是 [`.Translations`](/methods/page/translations/)（列出其他语言版本）和语言切换器。

## 什么时候用，什么时候别用

**该用**：

- 调试「为什么这两个页面没有互相识别为翻译」；
- 需要自己按翻译 key 分组页面（例如 `where` 或 `dict` 归类各语言版本）；
- 校验内容结构（同一 key 应在各语言下各出现一次）。

**别用**：

- 只想列出译文 → 用 [`.Translations`](/methods/page/translations/)；
- 想做语言切换器（含当前语言）→ 用 [`.Rotate "language"`](/methods/page/rotate/)；
- 想判断页面是否有译文 → 用 [`.IsTranslated`](/methods/page/istranslated/)。

## 用法

翻译 key 在给定页面的所有译文之间建立关联。翻译 key 由文件路径推导而来；如果前置元数据中定义了 `translationKey` 参数，则由该参数决定。

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
```

内容如下：

```tree
content/
├── de/
│   ├── books/
│   │   ├── buch-1.md
│   │   └── book-2.md
│   └── _index.md
├── en/
│   ├── books/
│   │   ├── book-1.md
│   │   └── book-2.md
│   └── _index.md
└── _index.md
```

前置元数据如下：

```toml
title = 'Book 1'
translationKey = 'foo'
```

```toml
title = 'Buch 1'
translationKey = 'foo'
```

渲染上述任一页面时：

```go-html-template
{{ .TranslationKey }} → page/foo
```

如果两种语言中 Book 2 的前置元数据都没有包含翻译 key：

```go-html-template
{{ .TranslationKey }} → page/books/book-2
```

## 完整示例：文件名配对与手工配对

测试站有两种语言（`en`、`zh`），内容文件采用**同目录同文件名 + 语言后缀**的方式：

```tree
content/posts/
├── post-1.md        <-- 英文
├── post-1.zh.md     <-- 中文（自动配对）
├── post-2.md        <-- 英文，front matter: translationKey = 'shared'
└── post-2.zh.md     <-- 中文，front matter: translationKey = 'shared'
```

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
<p>{{ .TranslationKey }}</p>
```

实测（Hugo 0.167.0）：

| 渲染的页面 | 是否写了 `translationKey` | `.TranslationKey` |
| --- | --- | --- |
| `/posts/post-1/` | 否 | `/posts/post-1` |
| `/zh/posts/post-1/` | 否 | `/posts/post-1`（与英文版**相同**） |
| `/posts/post-2/` | 是（`shared`） | `shared` |
| `/zh/posts/post-2/` | 是（`shared`） | `shared` |

**你应当看到什么**：同名的中英文页面自动得到**同一个** key（逻辑路径，不含语言段），所以不需要手工配置；文件名不同时（如 `book-1` / `buch-1`）才需要 front matter 里的 `translationKey` 把它们绑到一起。

> [!NOTE]
> 上游示例把这两种情形写作 `page/foo` 与 `page/books/book-2`（带 `page/` 前缀）。**本站实测 Hugo 0.167.0 返回的值没有这个前缀**：front matter 写了什么就是什么（`shared`），没写时返回逻辑路径（`/posts/post-1`）。这是版本差异，做字符串比较时请以你所用版本的实测值为准，不要硬编码前缀。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 未写 `translationKey` | 页面逻辑路径（实测 `/posts/post-1`） | 否 |
| 写了 `translationKey` | 该值原样（实测 `shared`，无 `page/` 前缀） | 否 |
| 不同语言、相同文件名 | 返回相同值（实测中英文均为 `/posts/post-1`） | 否 |
| 不同语言、不同文件名 | 默认**不**配对；需要 `translationKey` 显式绑定 | 否 |
| 返回类型 | `string` | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
