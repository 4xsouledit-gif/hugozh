+++
title = "参数配置"
linkTitle = "参数配置"
description = "用 params 区段定义自定义站点参数，并在模板中读取。"
date = 2026-10-01
weight = 200
source = "https://gohugo.io/configuration/params/"
+++

## 这一页解决什么问题

`[params]` 是放**自定义数据**的地方：任何不属于 Hugo 内置配置项的键值对都可以写在这里。它们不改变构建行为，只交给模板读取——站点副标题、联系方式、主题开关都属于这一类。

需要分清一件事：`params` 里的键 Hugo **既不认识也不校验**，写错了不会报错，只会让模板取到空值。这就是本页最常见的「改了没反应」。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| 顶层 `[params]` | 模板需要站点级自定义数据（副标题、版权、社交链接） | 键名与模板中对不上 → 取到空字符串；继续在空值上取字段还会报 `nil pointer` |
| 嵌套表 `[params.contact]` | 一组相关的数据打包存放 | 层级写错（`[params.contact] email` 与 `[params] contact.email` 含义不同）→ 模板取不到 |
| kebab-case 键名 | 想沿用现有的命名习惯 | 模板无法链式访问（`-` 被当作减号），只能用 `index` 读取；上游建议在配置阶段就避开 |
| `[languages.<lang>.params]` | 多语言站点各语言文案不同 | 只写在顶层 → 所有语言共用一份，另一种语言会显示错误文案 |

**边界**：`params` 是映射，取不到的键返回空值而不是报错；判断「本来就没有」还是「写错了」，先用 `hugo config` 看生效值。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 模板里读到的是空 | 参数名（含大小写）与配置不一致，或写在了 `[params]` 之外的层级 | 用 `hugo config` 查看生效的 `params`，逐字核对键名 |
| 报 `nil pointer evaluating` 一类错误 | 在一个取不到的 `nil` 值上继续链式取字段（例如 `contact` 不存在却访问 `.Site.Params.contact.email`） | 先用 `with` 判空，或用 `index` 提供兜底；见[模板简介](/templates/introduction/) |
| 多语言站点的文案串了 | 参数写在顶层，而各语言另有 `[languages.<lang>.params]` | 需要按语言区分就写到语言键下；要统一就只写顶层 |
| kebab-case 的键取不到 | `-` 在模板里被当作减号，不能用于链式访问 | 改用 camelCase / snake_case，或用 `index` 读取 |
| 报错看不懂 | `params` 不做校验，多数情况不会报错 | 见[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
