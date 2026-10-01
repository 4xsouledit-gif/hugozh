+++
title = "参数配置"
linkTitle = "参数配置"
description = "用 params 区段定义自定义站点参数，并在模板中读取。"
date = 2026-10-01
weight = 200
source = "https://gohugo.io/configuration/params/"
+++

## 用途

`params` 区段用于存放自定义参数：任何不属于 Hugo 内置配置项的键值对都可以写在 `[params]` 下。这些参数不会改变 Hugo 的构建行为，只是把数据交给模板使用，因此很适合放置站点副标题、联系方式、第三方服务 ID 一类的内容。

```toml
baseURL = 'https://example.org/'
locale = 'en-US'
title = 'Project Documentation'

[params]
subtitle = 'Reference, Tutorials, and Explanations'

[params.contact]
email = 'info@example.org'
phone = '+1 206-555-1212'
```

## 在模板中读取

在模板里通过 `Site` 对象的 `Params` 方法访问自定义参数：

```go-html-template
{{ .Site.Params.subtitle }} → Reference, Tutorials, and Explanations
{{ .Site.Params.contact.email }} → info@example.org
```

嵌套的映射（map）用点号逐层访问，`[params.contact]` 对应 `.Site.Params.contact`，其下的 `email` 对应 `.Site.Params.contact.email`。

## 键名的大小写与分隔符

键名建议使用 camelCase 或 snake_case。TOML、YAML 和 JSON 都允许 kebab-case 键名，但 kebab-case 不是合法的标识符，无法用于链式访问，因此下面两种写法都可以：

```go-html-template
{{ .Site.params.camelCase.foo }}
{{ .Site.params.snake_case.foo }}
```

而下面这种写法会失败：

```go-html-template
{{ .Site.params.kebab-case.foo }}
```

原因在于模板语言把 `-` 解释为减号而不是名称的一部分。若确实需要 kebab-case 键名，只能通过索引语法读取，所以更稳妥的做法是在配置阶段就避开它。

## 多语言项目

多语言项目把 `params` 区段写在各个语言键之下，每个语言拥有各自独立的参数，互不干扰：

```toml
baseURL = 'https://example.org/'
defaultContentLanguage = 'en'

[languages.de]
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.de.params]
subtitle = 'Referenz, Tutorials und Erklärungen'

[languages.de.params.contact]
email = 'info@de.example.org'
phone = '+49 30 1234567'

[languages.en]
direction = 'ltr'
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2

[languages.en.params]
subtitle = 'Reference, Tutorials, and Explanations'

[languages.en.params.contact]
email = 'info@example.org'
phone = '+1 206-555-1212'
```

## 命名空间

为避免命名冲突，模块和主题的作者应当为自己特有的参数加上命名空间，而不是直接占用 `params` 下的顶层键名：

```toml
[params.modules.myModule.colors]
background = '#efefef'
font = '#222222'
```

站点侧读取这些设置时，同样从命名空间开始逐层访问：

```go-html-template
{{ $cfg := .Site.Params.module.mymodule }}

{{ $cfg.colors.background }} → #efefef
{{ $cfg.colors.font }} → #222222
```

## 要点回顾

| 项目 | 说明 |
| --- | --- |
| 区段名 | `params`，可嵌套任意层映射 |
| 键名风格 | camelCase 或 snake_case（kebab-case 无法链式访问） |
| 模板入口 | `.Site.Params`、`.Site.Params.<键>` |
| 多语言 | `[languages.<lang>.params]` |
| 模块/主题 | 建议加命名空间，如 `[params.modules.myModule]` |

相关阅读：[配置站点](/configuration/)、[目录结构](/getting-started/directory-structure/)。
