+++
title = "hugo.Sites"
linkTitle = "hugo.Sites"
description = "返回所有维度上全部站点的集合。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/hugo/sites/"

[params.functions_and_methods]
signatures = ["hugo.Sites"]
returnType = "page.Sites"
+++

## 这一页解决什么问题

配置了多语言、甚至多版本（versions）之后，一个 Hugo 项目实际上会渲染出**许多个站点**：每个语言 × 每个版本各一个。要做语言/版本切换器、要列出所有入口，就得拿到全部站点的集合。`hugo.Sites` 返回这个集合，`hugo.Sites.Default` 则是其中被认定为默认的那一个（默认语言 + 默认版本 + 默认角色）。

## 什么时候用，什么时候别用

**该用**：

- 语言/版本切换器：遍历所有站点，输出各自首页链接；
- 需要跨站点读取信息（例如列出所有语言的标题）。

**别用**：

- 只需要**当前**站点 → 用 `site` 或页面上下文里的 `.Site`；`hugo.Sites` 是全集；
- 想拿某个页面的其它语言版本 → 用 `.Translations` / `.AllTranslations`（页面维度），它与站点集合不是一回事；
- 只想判断「是不是多语言」 → 用 [`hugo.IsMultilingual`](/functions/hugo/ismultilingual/)。

**（0.156.0 新增）**

## 排序

返回的集合按层级排序，后一个维度用于打破前一个维度的并列：

1. 先按语言（Language）的 weight 升序排序；如果 weight 相同或未定义，则退回字典序。
1. 再按版本（Version）的 weight 升序排序；并列时 Hugo 默认按语义化版本降序排列。
1. 最后按角色（Role）的 weight 升序排序；仍并列时用字典序作为最终回退。

## 用法

使用以下项目配置：

```toml
defaultContentLanguage = 'en'
defaultContentLanguageInSubdir = true
defaultContentVersionInSubdir = true

[languages.de]
contentDir = 'content/de'
direction = 'ltr'
label = 'Deutsch'
locale = 'de-DE'
title = 'Projekt Dokumentation'
weight = 1

[languages.en]
contentDir = 'content/en'
direction = 'ltr'
label = 'English'
locale = 'en-US'
title = 'Project Documentation'
weight = 2

[versions.'v1.0.0']
[versions.'v2.0.0']
[versions.'v3.0.0']
```

这个模板：

```go-html-template
<ul>
  {{ range hugo.Sites }}
    <li><a href="{{ .Home.RelPermalink }}">{{ .Title }} {{ .Version.Name }}</a></li>
  {{ end }}
</ul>
```

会生成一串指向各站点首页的链接：

```html
<ul>
  <li><a href="/v3.0.0/de/">Projekt Dokumentation v3.0.0</a></li>
  <li><a href="/v2.0.0/de/">Projekt Dokumentation v2.0.0</a></li>
  <li><a href="/v1.0.0/de/">Projekt Dokumentation v1.0.0</a></li>
  <li><a href="/v3.0.0/en/">Project Documentation v3.0.0</a></li>
  <li><a href="/v2.0.0/en/">Project Documentation v2.0.0</a></li>
  <li><a href="/v1.0.0/en/">Project Documentation v1.0.0</a></li>
</ul>
```

渲染指向默认站点首页的链接：

```go-html-template
{{ with hugo.Sites.Default }}
  <a href="{{ .Home.RelPermalink }}">{{ .Title }}</a>
{{ end }}
```

使用上面的配置时，这会渲染指向英语版 v3.0.0 站点首页的链接。默认站点是使用默认语言、默认版本与默认角色的那个站点，与它在集合中的位置无关。在这个例子里，三个德语站点因为语言 weight 较小而排在前面，但根据 `defaultContentLanguage` 配置，英语才是默认语言。

## 完整示例：列出所有站点并标出默认站点

```go-html-template {file="layouts/index.html"}
<p>站点总数：{{ len hugo.Sites }}</p>
<ul>
  {{ range hugo.Sites }}
    <li><a href="{{ .Home.RelPermalink }}">{{ .Title }} {{ .Version.Name }}（{{ .Language.Lang }}）</a></li>
  {{ end }}
</ul>
<p>默认站点：{{ with hugo.Sites.Default }}{{ .Title }} {{ .Version.Name }}{{ end }}</p>
```

用本页上文那份配置（2 语言 × 3 版本），在本机（Hugo 0.167.0 extended，Windows）实测 `hugo --source <临时目录> --ignoreCache` 后，任一产物（如 `public/v3.0.0/en/index.html`）内容为（`range` 留下的空行已省略）：

```html
<p>站点总数：6</p>
<ul>
    <li><a href="/v3.0.0/de/">Projekt Dokumentation v3.0.0（de）</a></li>
    <li><a href="/v2.0.0/de/">Projekt Dokumentation v2.0.0（de）</a></li>
    <li><a href="/v1.0.0/de/">Projekt Dokumentation v1.0.0（de）</a></li>
    <li><a href="/v3.0.0/en/">Project Documentation v3.0.0（en）</a></li>
    <li><a href="/v2.0.0/en/">Project Documentation v2.0.0（en）</a></li>
    <li><a href="/v1.0.0/en/">Project Documentation v1.0.0（en）</a></li>
</ul>
<p>默认站点：Project Documentation v3.0.0</p>
```

**你应当看到什么**：6 个站点（德语因语言 weight 较小排在前面），而默认站点是**英语 v3.0.0**——`defaultContentLanguage = 'en'` 决定默认语言，与它在列表中的位置无关。每个站点的首页地址都带上了「版本/语言」两级路径。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点；多语言 + 多版本配置见上文。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 2 语言 × 3 版本 | 集合长度 6 | 否 |
| 单语言、未配置 `[versions]` | 长度 1；`.Version.Name` 实测为 `v1.0.0`（Hugo 自动补的匿名版本） | 否 |
| `.Home.RelPermalink` | 与站点对应的首页地址（实测 `/v3.0.0/en/`；单语言下为 `/`） | 否 |
| `hugo.Sites.Default` | 默认站点（实测英语 + v3.0.0）；类型 `*page.siteWrapper` | 否 |
| 返回类型（`printf "%T"`） | `page.Sites` | 否 |
| 传入参数 `{{ hugo.Sites "x" }}` | —— | 是：`wrong number of args for Sites: want 0 got 1` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 切换器里的顺序与预期不符 | 集合按语言 weight → 版本 weight/语义化版本降序 → 角色 weight 排序 | 需要自定义顺序时，用 `sort` 对 `hugo.Sites` 重新排序 |
| 没报错但结果不对 | 切换器里少了某些语言/版本 | `[languages]` 或 `[versions]` 条目没配对，或内容目录缺失导致该站点没有页面 | 用本页示例先打印 `len hugo.Sites` 与实际条目核对 |
| 没报错但结果不对 | 以为 `hugo.Sites.Default` 是列表中的第一个 | 默认站点由 `defaultContentLanguage` 等决定，与顺序无关（实测第一个是德语站点，默认却是英语 v3.0.0） | 需要默认站点时显式用 `hugo.Sites.Default` |
| 报错看不懂 | `wrong number of args for Sites: want 0 got 1` | 给它传了参数 | 它无参数，直接写 `{{ hugo.Sites }}` |

更多排查入口见[故障排查](/troubleshooting/)。

[`defaultContentLanguage`]: /configuration/all/#defaultcontentlanguage
