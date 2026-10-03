+++
title = "hugo.IsMultihost"
linkTitle = "hugo.IsMultihost"
description = "报告每个已配置的语言是否拥有各自独立的 base URL。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/hugo/ismultihost/"

[params.functions_and_methods]
signatures = ["hugo.IsMultihost"]
returnType = "bool"
+++

## 这一页解决什么问题

多语言站有两种发布形态：所有语言共用一个域名、按子路径区分（`example.org/de/`、`example.org/en/`），或者每种语言一个域名（`de.example.org`、`en.example.org`）。后者的产物组织结构完全不同（没有站点根目录下的入口页，而是每种语言各写一套）。`hugo.IsMultihost` 报告当前配置是否属于后者——**每个语言都有各自的 `baseURL`** 时为真。

## 什么时候用，什么时候别用

**该用**：

- 主题/布局要兼容两种多语言形态，需要分别处理（例如 multihost 下不要硬编码一个"站点根"）；
- 排查「为什么产物里没有根目录 `index.html`」——multihost 下这是正常的（实测）。

**别用**：

- 只想判断「是否配置了多个语言」 → 用 [`hugo.IsMultilingual`](/functions/hugo/ismultilingual/)：只有两个及以上语言时它为真，而 `IsMultihost` 还额外要求每种语言有独立 `baseURL`（实测：同一份两语言配置，去掉各语言的 `baseURL` 后 `IsMultihost` 变假，`IsMultilingual` 仍为真）；
- 想拿当前语言的地址 → 用 `site.BaseURL`、`.Permalink` 等方法。

项目配置：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = true
[languages]
  [languages.de]
    baseURL = 'https://de.example.org/'
    label = 'Deutsch'
    locale = 'de-DE'
    title = 'Projekt Dokumentation'
    weight = 1
  [languages.en]
    baseURL = 'https://en.example.org/'
    label = 'English'
    locale = 'en-US'
    title = 'Project Documentation'
    weight = 2
```

模板：

```go-html-template
{{ hugo.IsMultihost }} → true
```

## 完整示例：按发布形态输出不同的说明

```go-html-template {file="layouts/index.html"}
<p>语言数：{{ len site.Languages }}</p>
<p>多语言：{{ hugo.IsMultilingual }}</p>
<p>多主机：{{ hugo.IsMultihost }}</p>
{{ if hugo.IsMultihost }}
  <p>每种语言有独立域名，产物按语言分目录输出。</p>
{{ end }}
```

用上面那份配置，在本机（Hugo 0.167.0 extended，Windows）实测 `hugo --source <临时目录> --ignoreCache` 后，`public/de/index.html` 与 `public/en/index.html` 内容均为：

```html
<p>语言数：2</p>
<p>多语言：true</p>
<p>多主机：true</p>
  <p>每种语言有独立域名，产物按语言分目录输出。</p>
```

**你应当看到什么**：不再有站点根目录下的 `public/index.html`，而是 `public/de/index.html`、`public/en/index.html` 各一份（实测）。把各语言的 `baseURL` 删掉再构建，`IsMultihost` 就变成 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；配置为上文（两语言 + 各自 `baseURL`）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 两语言，各有独立 `baseURL` | `true` | 否 |
| 两语言，共用站点 `baseURL`（无各语言 `baseURL`） | `false`（同时 `IsMultilingual` 为 `true`） | 否 |
| 单语言 | `false` | 否 |
| 传入参数 `{{ hugo.IsMultihost "x" }}` | —— | 是：`wrong number of args for IsMultihost: want 0 got 1` |
| 返回类型（`printf "%T"`） | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么改 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 部署后根域名返回 404，找不到首页 | multihost 配置下不生成根目录入口页（实测产物只有 `public/<lang>/index.html`） | 在每个语言的域名上配置首页/重定向，或改用单域名 + 子路径的配置 |
| 没报错但结果不对 | 以为配了两个语言就一定是 multihost | 还需每种语言各写 `baseURL` | 用 [`hugo.IsMultilingual`](/functions/hugo/ismultilingual/) 判语言数，用本函数判发布形态 |
| 报错看不懂 | `wrong number of args for IsMultihost: want 0 got 1` | 给它传了参数 | 它无参数，直接用在 `if` 里 |

更多排查入口见[故障排查](/troubleshooting/)。
