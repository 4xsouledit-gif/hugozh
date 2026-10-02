+++
title = "urls.URLize"
linkTitle = "URLize"
description = "返回给定字符串，并把它清理为可用于 URL 的形式。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/urls/urlize/"

[params.functions_and_methods]
signatures = ["urls.URLize INPUT"]
returnType = "string"
aliases = ["urlize"]
+++

## 这一页解决什么问题

把一个人类可读的字符串变成 URL 里能用的片段：术语名 `"Victor Hugo"` 对应术语页地址里的 `victor-hugo`。Hugo 生成术语页、页面文件名对应的 slug 时用的就是这套转换，所以想**手工拼出**与 Hugo 产物一致的地址时，必须用 `urls.URLize`。

## 什么时候用，什么时候别用

**该用**：

- 按术语名查 `.Site.Taxonomies`（见下文上游示例）；
- 需要与 Hugo 自动生成的路径保持一致的场景。

**别用**：

- 想要 HTML `id`（锚点）→ 用 [`urls.Anchorize`](/functions/urls/anchorize/)：实测 `"main.go"` 经 `urlize` 得 `main.go`（保留点），经 `anchorize` 得 `maingo`（删掉点）；
- 想把含空格/中文的字符串作为**路径片段**做百分号编码 → 用 [`urls.PathEscape`](/functions/urls/pathescape/)；
- 想拼完整地址 → 用 [`urls.JoinPath`](/functions/urls/joinpath/)、[`urls.AbsURL`](/functions/urls/absurl/)、[`urls.RelURL`](/functions/urls/relurl/)。

## 用法

[`anchorize`][] 与 [`urlize`][] 两个函数很相似：

- 用 `anchorize` 函数生成 HTML `id` 属性的值
- 用 `urlize` 函数把字符串清理为可用于 URL 的形式

例如：

```go-html-template
{{ $s := "A B C" }}
{{ $s | anchorize }} → a-b-c
{{ $s | urlize }} → a-b-c

{{ $s := "a b   c" }}
{{ $s | anchorize }} → a-b---c
{{ $s | urlize }} → a-b-c

{{ $s := "< a, b, & c >" }}
{{ $s | anchorize }} → -a-b--c-
{{ $s | urlize }} → a-b-c

{{ $s := "main.go" }}
{{ $s | anchorize }} → maingo
{{ $s | urlize }} → main.go

{{ $s := "Hugö" }}
{{ $s | anchorize }} → hugö
{{ $s | urlize }} → hug%C3%B6
```

用 `urlize` 函数可以创建指向术语页面（term page）的链接。

假设项目配置如下：

```toml
[taxonomies]
author = 'authors'
```

前置元数据如下：

```toml
title = 'Les Misérables'
authors = ['Victor Hugo']
```

发布后的站点将具有这样的结构：

```tree
public/
├── authors/
│   ├── victor-hugo/
│   │   └── index.html
│   └── index.html
├── books/
│   ├── les-miserables/
│   │   └── index.html
│   └── index.html
└── index.html
```

要创建指向术语页面的链接：

```go-html-template
{{ $taxonomy := "authors" }}
{{ $term := "Victor Hugo" }}
{{ with index .Site.Taxonomies $taxonomy (urlize $term) }}
  <a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a>
{{ end }}
```

要生成与某个内容页面关联的术语页面列表，请在 `Page` 对象上使用 [`GetTerms`][] 方法。

[`anchorize`]: /functions/urls/anchorize/
[`urlize`]: /functions/urls/urlize/
[`GetTerms`]: /methods/page/getterms/

## 完整示例（实测）

```go-html-template {file="layouts/_partials/term-link.html"}
[{{ urlize "A B C" }}]|[{{ urlize "a b   c" }}]|[{{ urlize "Hugö" }}]
```

Hugo 0.167.0 实测输出：

```text
[a-b-c]|[a-b-c]|[hug%C3%B6]
```

**你应当看到什么**：与 `anchorize` 的两处差异一眼可见——`a b   c` 的连续空格被**合并**成一个短横（`a-b-c`），非 ASCII 字符 `ö` 被**百分号编码**成 `%C3%B6`（`hug%C3%B6`），而 `anchorize` 会原样保留 `hugö`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"A B C"` | `a-b-c` | 否 |
| `"a b   c"` | `a-b-c`（连续空格合并） | 否 |
| `"< a, b, & c >"` | `a-b-c`（标点被丢弃，不在首尾留短横） | 否 |
| `"main.go"` | `main.go`（点保留） | 否 |
| `"Hugö"` | `hug%C3%B6`（非 ASCII 百分号编码） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 术语链接 404 | 手工把术语名转成了 `victor hugo`、`Victor-Hugo` 之类，与 Hugo 生成的不一致 | 一律用 `urlize` 转换后再查 `Taxonomies`（上游示例即如此） |
| 没报错但结果不对 | 锚点里出现 `%C3%B6` | 用 `urlize` 生成了 `id` | 生成 `id` 用 [`urls.Anchorize`](/functions/urls/anchorize/) |
| 没报错但结果不对 | 中文标题的 URL 与预期不同 | 中文会被转成百分号编码 | 以站点实际产物的目录名为准，必要时给页面显式设置 `url` |

更多排查入口见[故障排查](/troubleshooting/)。
