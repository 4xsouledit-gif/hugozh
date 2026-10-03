+++
title = "hugo.IsMultilingual"
linkTitle = "hugo.IsMultilingual"
description = "报告是否配置了两个或更多语言。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/hugo/ismultilingual/"

[params.functions_and_methods]
signatures = ["hugo.IsMultilingual"]
returnType = "bool"
+++

## 这一页解决什么问题

同一套布局要在单语言站和多语言站上都能用：多语言时才有语言切换菜单、才有 `translations`，单语言时这些区块必须消失。`hugo.IsMultilingual` 报告是否配置了**两个或更多语言**，是这类条件渲染的开关。

## 什么时候用，什么时候别用

**该用**：

- 语言切换器、`hreflang` 标签、`translations` 区块的启用条件；
- 判断「当前站点是不是多语言」时。

**别用**：

- 想判断「每种语言是否有独立域名」 → 用 [`hugo.IsMultihost`](/functions/hugo/ismultihost/)：实测两语言配置去掉各语言 `baseURL` 后，`IsMultilingual` 仍为 `true` 而 `IsMultihost` 为 `false`；
- 想拿具体语言列表 → 用 `site.Languages`、`site.Home.AllTranslations`，不要靠布尔值推断。

项目配置：

```toml
defaultContentLanguage = 'de'
defaultContentLanguageInSubdir = true
[languages]
  [languages.de]
    label = 'Deutsch'
    locale = 'de-DE'
    title = 'Projekt Dokumentation'
    weight = 1
  [languages.en]
    label = 'English'
    locale = 'en-US'
    title = 'Project Documentation'
    weight = 2
```

模板：

```go-html-template
{{ hugo.IsMultilingual }} → true
```

## 完整示例：多语言时才渲染语言切换器

```go-html-template {file="layouts/_partials/language-switcher.html"}
{{ if hugo.IsMultilingual }}
  <ul class="languages">
    {{ range site.Languages }}
      <li>{{ .LanguageName }}（{{ .Lang }}）</li>
    {{ end }}
  </ul>
{{ end }}
```

用上面那份配置，在本机（Hugo 0.167.0 extended，Windows）实测 `hugo --source <临时目录> --ignoreCache`，`public/de/index.html` 与 `public/en/index.html` 中都出现：

```html
  <ul class="languages">
      <li>Deutsch（de）</li>
      <li>English（en）</li>
  </ul>
```

**你应当看到什么**：两个语言各有一份产物（`public/de/index.html`、`public/en/index.html`，另有根目录重定向页），且都判定为多语言。删掉 `[languages]` 整段后 `IsMultilingual` 变成 `false`，该区块不再渲染（实测）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；配置为上文（两语言，无各语言 `baseURL`）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 两个语言 | `true`（`IsMultihost` 为 `false`） | 否 |
| 单语言（无 `[languages]`） | `false` | 否 |
| 只有一个 `[languages.xx]` 条目 | 上游未说明；本站未实测 | 否 |
| 传入参数 `{{ hugo.IsMultilingual "x" }}` | —— | 是：`wrong number of args for IsMultilingual: want 0 got 1` |
| 返回类型（`printf "%T"`） | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 多语言站上语言切换器不出现 | `[languages]` 只配了一个语言；或改的是默认语言已缓存的布局 | 确认 `len site.Languages > 1`，并重启 `hugo server` |
| 没报错但结果不对 | 以为 `IsMultilingual` 就等于「多域名」 | 两者语义不同 | 多域名用 [`hugo.IsMultihost`](/functions/hugo/ismultihost/) |
| 报错看不懂 | `wrong number of args for IsMultilingual: want 0 got 1` | 给它传了参数 | 它无参数，直接用在 `if` 里 |

更多排查入口见[故障排查](/troubleshooting/)。
