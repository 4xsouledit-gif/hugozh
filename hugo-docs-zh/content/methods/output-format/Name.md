+++
title = "Name"
linkTitle = "Name"
description = "返回给定输出格式的标识符。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/output-format/name/"

[params.functions_and_methods]
signatures = ["OUTPUTFORMAT.Name"]
returnType = "string"
+++

## 这一页解决什么问题

`Name` 返回输出格式的**标识符**——就是项目配置 `[outputs]` 里写的那个名字（`html`、`rss`、`md`……），也是 [`OutputFormats.Get`](/methods/page/outputformats/#get) 用来查找的名字。它回答的是「这份输出是哪一种格式」，而不是「它叫什么文件」。

需要按输出格式分流模板（比如让 `md` 出口不渲染导航）、给标签加 `data-format` 标记，或者排查「某个格式到底有没有启用」时，用它。

## 什么时候用，什么时候别用

**该用**：

- 按输出格式名做条件判断：先取出对象，再写 `{{ if eq .Name "md" }}`；
- 排查启用情况：把 `range site.Home.OutputFormats` 打印出来，看名字列表是否和配置一致；
- 生成 `data-*` 标记或日志里的标识，方便与配置对照。

**别用**：

- 想要文件后缀（`xml`、`md`）→ 用 [`MediaType`](/methods/output-format/mediatype/) 的 `Suffixes` / `FirstSuffix`；
- 想要可点击的地址 → 用 [`Permalink`](/methods/output-format/permalink/) 或 [`RelPermalink`](/methods/output-format/relpermalink/)；
- 想判断 `link` 元素的 `rel` 值 → 用 [`Rel`](/methods/output-format/rel/)。**名字与 rel 值是两回事**：实测 `Get "rss"` 得到的 `.Rel` 是 `alternate`，不是 `rss`。

## 基本用法

要使用该方法，你必须先通过 [`Get`][] 或 [`Canonical`][] 方法，从页面的 [`OutputFormats`][] 集合中选出特定的 [output format](g)（输出格式）。

```go-html-template
{{ with .Site.Home.OutputFormats.Get "rss" }}
  {{ .Name }} → rss
{{ end }}
```

## 完整示例：列出首页启用的输出格式

```go-html-template {file="layouts/_partials/output-formats.html"}
<ul>
  {{ range site.Home.OutputFormats }}
    <li data-format="{{ .Name }}">{{ .RelPermalink }}</li>
  {{ end }}
</ul>
```

测量条件：Hugo 0.167.0 extended，单语言最小站点，`baseURL = "https://example.org/"`，首页输出格式为默认的 `html` 与 `rss`。Hugo 渲染为（`range` 会留下空行，这里省略）：

```html
<ul>
  <li data-format="html">/</li>
  <li data-format="rss">/index.xml</li>
</ul>
```

**你应当看到什么**：`data-format` 上的值就是配置里的格式名。把 `baseURL` 换成 `https://example.org/docs/`（站点部署在子路径）后实测变成 `<li data-format="html">/docs/</li>` 与 `<li data-format="rss">/docs/index.xml</li>`——**名字不变、地址变**。名字来自配置，地址来自 `baseURL`，两者不要混用。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 首页 `rss` 输出格式 | `rss` | 否 |
| 首页 `html` 输出格式 | `html` | 否 |
| 自定义 `[outputFormats.search]` | `search`（与配置键名一致，全小写） | 否 |
| `Get` 的名字大小写不一致（`"RSS"`、`"RsS"`） | 仍返回 `rss`——实测**查找不区分大小写** | 否 |
| `Get` 的名字不存在（`"RSX"`）或传空字符串 | 得到空值：`with`/`if` 判为假，`.Name` 是空串 | 否 |
| 把媒体类型当名字用（`"application/json"`） | 空值——`Get` 只按标识符查找 | 否 |
| 该 kind 没启用这个格式（实测普通页面默认只有 `html`，`Get "rss"`） | 空值，`with` 不进分支 | 否 |
| 返回类型 | `string`，不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `{{ with site.Home.OutputFormats.Get "rss" }}` 里面什么都不输出 | 该 kind 没有启用 `rss`（实测普通页面默认只有 `html`） | 在 `[outputs]` 里给对应 kind 加上 `rss`，再用 `hugo config` 核对 |
| 没报错但结果不对 | 以为 `.Name` 会给出文件后缀 | 名字是配置标识符（`rss`），后缀（`xml`）挂在媒体类型上 | 后缀取 `MediaType.FirstSuffix.Suffix` |
| 没报错但结果不对 | 判断「是不是 feed」写成 `{{ if eq .Name "feed" }}`，永远不成立 | `feed` 是 `baseName`（文件名），不是格式标识符 | 用 `[outputFormats.x]` 里的键 `x` 当名字 |
| 没报错但结果不对 | 产物里出现空的 `href=""` | `Get` 取不到时不报错，给的是空值 | 用 `with` 包住整段，或先检查该 kind 是否启用了这个格式 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Canonical`]: /methods/page/outputformats/#canonical
[`Get`]: /methods/page/outputformats/#get
[`OutputFormats`]: /methods/page/outputformats/
