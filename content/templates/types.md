+++
title = "内容类型"
linkTitle = "内容类型"
description = "各类模板的职责与回退关系：base、home、page、section、taxonomy、term、single、list、all、partial、view、render hook、shortcode，每类都带最小示例。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/templates/types/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "读过[简介](/templates/introduction/)，知道上下文、动作与 `define` / `block` 的基本用法。",
  "站点能正常构建，`layouts/` 目录里至少有一个模板文件。",
]
outcomes = [
  "说清 `layouts/` 下每个文件名负责哪一类页面，以及谁是谁的回退；",
  "写出一个可用的基础模板，并让页面模板通过 `define` 把自己的内容填进 `block`；",
  "知道局部模板（partial）与视图模板（view）的区别，需要跨页面复用时能选对；",
  "新增或改名模板后，用构建产物验证它真的被用上了。",
]
next = ["/templates/lookup-order/", "/render-hooks/", "/templates/partial-decorators/"]

+++

## 这一页解决什么问题

`layouts/` 目录里的每个文件都有明确的职责：有的渲染首页，有的渲染文章页，有的只是被别的模板调用。**模板没被用上、或者用错了模板**，是「页面能打开但内容不对」这类问题最常见的根因。

这一页是本章的总览：先看目录长什么样，再逐个说明每类模板的职责、回退关系与最小示例。看完之后，你应该能拿着一个 URL 说出它由哪个文件渲染。

## 模板目录与查找依据

Hugo 在站点根目录的 `layouts/` 目录中查找模板。虽然多数站点用不到全部模板，但一个中等复杂度的站点通常长这样：

```tree
layouts/
├── _markup/
│   ├── render-image.html   <-- render hook
│   └── render-link.html    <-- render hook
├── _partials/
│   ├── footer.html
│   └── header.html
├── _shortcodes/
│   ├── audio.html
│   └── video.html
├── books/
│   ├── page.html
│   └── section.html
├── films/
│   ├── _views/
│   │   └── card.html       <-- view template
│   ├── page.html
│   └── section.html
├── baseof.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
└── term.html
```

具体用哪个模板由查找顺序（lookup order）决定，判定时综合模板类型（template type）、页面种类（page kind）、内容类型（content type）、section（内容区块）、语言与输出格式。要为某类页面写出可预期的模板，就必须先理解这套顺序。

> [!NOTE]
> 创建模板时必须彻底理解模板查找顺序。模板的选择依据是模板类型、页面种类、内容类型、section、语言与输出格式。

目录约定上有两条容易踩的规则：

- **以下划线开头的目录是特殊用途**：`_partials`（局部模板）、`_shortcodes`（短代码模板）、`_markup`（渲染钩子）、`_views`（视图模板），它们不参与页面路径匹配；
- **其他任何目录都代表一条页面路径**，可以任意嵌套。因此 `layouts/books/page.html` 只作用于 `/books/` 下的内容，而 `layouts/page.html` 作用于其余常规页面。

## 基础模板（base）

基础模板（base template）是其他模板可以叠加的骨架，通常定义 `html`、`head`、`body` 等公共结构，以及跨页面复用的页头、页脚、导航与脚本引入。

Hugo 只会在被解析的模板同时满足下面两个条件时才套用基础模板：

- 至少包含一个 `define` 动作；
- 除 `define` 动作、空白与模板注释外不含其他内容。

> [!NOTE]
> 不满足这两个条件时，Hugo 就把该模板原样执行，**不会**套用基础模板。

套用时，基础模板中的 `block` 动作会被目标模板中同名的 `define` 动作替换：

下面的基础模板用 `partial` 引入 `head`、`header` 与 `footer`，`block` 动作则是占位符，会被目标模板里同名的 `define` 动作替换：

```go-html-template {file="layouts/baseof.html"}
<!DOCTYPE html>
<html lang="{{ site.Language.Locale }}" dir="{{ or site.Language.Direction `ltr` }}">
<head>
  {{ partial "head.html" . }}
</head>
<body>
  <header>
    {{ partial "header.html" . }}
  </header>
  <main>
    {{ block "main" . }}
      This will be replaced with content from the
      corresponding "define" action found in the template
      to which this _base_ template is applied.
    {{ end }}
  </main>
  <footer>
    {{ partial "footer.html" . }}
  </footer>
</body>
</html>
```

```go-html-template {file="layouts/home.html"}
{{ define "main" }}
  This will replace the content of the "block" action
  found in the _base_ template.
{{ end }}
```

`{{ block "main" . }}` 里的占位文字只在**没有**任何模板提供 `main` 块时才会出现。所以它其实是一个排查工具：页面上出现这段英文占位文字，就说明命中的模板没有定义 `main`。

## 首页（home）

`home` 模板渲染站点首页。

例如，Hugo 会把下面的 `home` 模板套用到基础模板上，然后渲染页面内容与站点的常规页面列表：

```go-html-template {file="layouts/home.html"}
{{ define "main" }}
  {{ .Content }}
  {{ range .Site.RegularPages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

> [!NOTE]
> [页面集合速查](/quick-reference/page-collections/)汇总了筛选、排序与分组页面集合的方法与函数。

## 常规页面（page）

`page` 模板渲染常规页面（regular page）。

例如，Hugo 会把下面的 `page` 模板套用到基础模板上，然后渲染页面标题与页面内容：

```go-html-template {file="layouts/page.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

## 列表页（section）

`section` 模板渲染某个 section（内容区块）内的页面列表。

例如，Hugo 会把下面的 `section` 模板套用到基础模板上，然后渲染页面标题、页面内容，以及当前 section 中的页面列表：

```go-html-template {file="layouts/section.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

> [!NOTE]
> [页面集合速查](/quick-reference/page-collections/)汇总了筛选、排序与分组页面集合的方法与函数。

## 分类法（taxonomy）

`taxonomy` 模板渲染某个分类法（taxonomy）下的术语列表。

例如，Hugo 会把下面的 `taxonomy` 模板套用到基础模板上，然后渲染页面标题、页面内容，以及当前分类法中的术语（term）列表：

```go-html-template {file="layouts/taxonomy.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

> [!NOTE]
> [页面集合速查](/quick-reference/page-collections/)汇总了筛选、排序与分组页面集合的方法与函数。

在 `taxonomy` 模板中，`Data` 对象提供以下分类法专用方法：

- `Singular`
- `Plural`
- `Terms`

`Terms` 方法返回一个分类法对象，可以继续调用它的任何方法，包括 `Alphabetical` 与 `ByCount`。例如用 `ByCount` 按关联页面数排序渲染术语列表：

```go-html-template {file="layouts/taxonomy.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Data.Terms.ByCount }}
    <h2><a href="{{ .Page.RelPermalink }}">{{ .Page.LinkTitle }}</a> ({{ .Count }})</h2>
  {{ end }}
{{ end }}
```

这里遍历到的每一项都是「术语 + 计数」，所以要用 `.Page` 取术语页面、用 `.Count` 取关联页面数。

## 分类法条目（term）

`term` 模板渲染与某个术语关联的页面列表。

例如，Hugo 会把下面的 `term` 模板套用到基础模板上，然后渲染页面标题、页面内容，以及当前术语关联的页面列表：

```go-html-template {file="layouts/term.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

> [!NOTE]
> [页面集合速查](/quick-reference/page-collections/)汇总了筛选、排序与分组页面集合的方法与函数。

在 `term` 模板中，`Data` 对象提供以下术语专用方法：

- `Singular`
- `Plural`
- `Term`

## 单页模板（single）

`single` 模板是 `page` 模板的回退：如果没有 `page` 模板，Hugo 就会去找 `single` 模板。

例如，Hugo 会把下面的 `single` 模板套用到基础模板上，然后渲染页面标题与页面内容：

```go-html-template {file="layouts/single.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
{{ end }}
```

## 列表模板（list）

`list` 模板是 `home`、`section`、`taxonomy`、`term` 四种模板的回退：这几类模板有一类不存在时，Hugo 就会去找 `list` 模板。

例如，Hugo 会把下面的 `list` 模板套用到基础模板上，然后渲染页面标题、页面内容与页面列表：

```go-html-template {file="layouts/list.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}
  {{ range .Pages }}
    <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ end }}
{{ end }}
```

## 兜底模板（all）

`all` 模板是 `home`、`page`、`section`、`taxonomy`、`term`、`single`、`list` 全部模板类型的最终回退：这些模板一个都不存在时，Hugo 会用 `all` 模板。

例如，Hugo 会把下面的 `all` 模板套用到基础模板上，然后按页面种类分别渲染：

```go-html-template {file="layouts/all.html"}
{{ define "main" }}
  {{ if eq .Kind "home" }}
    {{ .Content }}
    {{ range .Site.RegularPages }}
      <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
    {{ end }}
  {{ else if eq .Kind "page" }}
    <h1>{{ .Title }}</h1>
    {{ .Content }}
  {{ else if in (slice "section" "taxonomy" "term") .Kind }}
    <h1>{{ .Title }}</h1>
    {{ .Content }}
    {{ range .Pages }}
      <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
    {{ end }}
  {{ else }}
    {{ errorf "Unsupported page kind: %s" .Kind }}
  {{ end }}
{{ end }}
```

**什么时候用**：从零搭站点、还没写完整模板时，先放一个 `all.html` 就能让全站先渲染出来；**什么时候别用**：正式站点建议按页面种类分开写，因为一个文件里塞进所有分支后，改首页样式时很容易误伤文章页。

## 局部模板（partial）

局部模板（partial）通常用于渲染站点的某个组件，也可以用来返回值。

例如下面的局部模板渲染版权信息：

```go-html-template {file="layouts/_partials/footer.html"}
<p>Copyright {{ now.Year }}. All rights reserved.</p>
```

通过调用 `partial` 或 `partialCached` 函数执行局部模板，可以在第二个参数传入上下文：

```go-html-template {file="layouts/baseof.html"}
{{ partial "footer.html" . }}
```

与其他模板类型不同，Hugo 在查找局部模板时**不考虑**当前页面种类、内容类型、逻辑路径、语言与输出格式；但它仍会套用与其他模板类型相同的**名称**匹配逻辑——先找最具体的，找不到再逐步退到更笼统的版本。

例如下面这次调用：

```go-html-template {file="layouts/baseof.html"}
{{ partial "footer.section.de.html" . }}
```

Hugo 会按下面的顺序查找模板：

1. `layouts/_partials/footer.section.de.html`
1. `layouts/_partials/footer.section.html`
1. `layouts/_partials/footer.de.html`
1. `layouts/_partials/footer.html`

**什么时候用**：页头、页脚、卡片、图标这类「多处出现、参数简单」的片段；**什么时候别用**：需要按页面种类自动选不同模板时（那是 `Render` 的职责，见下文「视图模板」）。`partialCached` 会缓存渲染结果，适合页脚这类与上下文无关的片段；一旦模板内容依赖上下文，用缓存就要小心取到别的页面的结果。

## 行内局部模板（inline partial）

局部模板也可以在其他模板内部用 `define` 声明。需要注意的是模板命名空间是全局的，必须保证名称唯一，否则会互相覆盖：

```go-html-template
Value: {{ partial "my-inline-partial.html" . }}

{{ define "_partials/my-inline-partial.html" }}
  {{ $value := 32 }}
  {{ return $value }}
{{ end }}
```

注意 `define` 的名字必须是 `_partials/` 前缀加文件名——这正说明它注册到了全局的局部模板命名空间里。返回值的写法是 `{{ return … }}`，调用处直接拿到 32。

## 视图模板（view）

视图模板（view）与局部模板类似，但通过在 `Page` 对象上调用 `Render` 方法来使用，两者有几点关键区别：

| `Render` 方法 | `partial` 函数 |
| --- | --- |
| 默认以 `Page` 对象为上下文；可以额外传入 `CONTEXT` 参数替换它，用来组合对象、切片、映射与标量 | 必须显式指定上下文，可以传入对象、切片、映射与标量的组合 |
| Hugo 通过[模板查找顺序](/templates/lookup-order/)自动解析模板，可以针对任意页面种类、内容类型、逻辑路径、语言或输出格式 | 查找时不考虑当前页面种类、内容类型、逻辑路径、语言与输出格式 |
| 模板可以放在 `layouts` 目录下的任意层级 | 模板必须放在 `layouts/_partials` 目录中 |
| 没有缓存版本 | 有缓存版本：`partialCached` 函数 |

例如，Hugo 会把下面的 `home` 模板套用到基础模板上，然后渲染页面内容，并为站点 `films` section 中的每个页面渲染一个卡片组件：

```go-html-template {file="layouts/home.html"}
{{ define "main" }}
  {{ .Content }}
  <ul>
    {{ range where site.RegularPages "Section" "films" }}
      {{ .Render "_views/card" }}
    {{ end }}
  </ul>
{{ end }}
```

```go-html-template {file="layouts/films/_views/card.html"}
<div class="card">
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
  {{ .Summary }}
</div>
```

**什么时候用**：同一批内容需要在不同页面以不同版式出现（列表里的卡片、首页的精选块）；**什么时候别用**：只是想在页脚插一段固定 HTML，用 `partial` 更简单。

视图模板的命名与组织方式，见 `Render` 方法文档。

## 渲染钩子（render hook）

渲染钩子（render hook）模板用来改写 Markdown 到 HTML 的转换。

例如下面的渲染钩子给每个标题右侧加上一个锚点链接：

```go-html-template {file="layouts/_markup/render-heading.html"}
<h{{ .Level }} id="{{ .Anchor }}" {{- with .Attributes.class }} class="{{ . }}" {{- end }}>
  {{ .Text }}
  <a href="#{{ .Anchor }}">#</a>
</h{{ .Level }}>
```

渲染钩子的完整说明见[渲染钩子](/render-hooks/)。

## 短代码（shortcode）

短代码（shortcode）模板用于渲染站点的某个组件。与局部模板、视图模板不同，短代码模板是**从内容页面里调用**的。

例如下面的短代码模板从全局资源（global resource）渲染一个音频元素：

```go-html-template {file="layouts/_shortcodes/audio.html"}
{{ with resources.Get (.Get "src") }}
  <audio controls preload="auto" src="{{ .RelPermalink }}"></audio>
{{ end }}
```

然后在 Markdown 内容中调用它：

```md {file="content/example.md"}
{{</* audio src=/audio/test.mp3 */>}}
```

短代码模板的完整说明见[短代码模板](/templates/shortcode/)。

## 其他专用模板

还有几类专用模板负责生成站点级文件：

- [站点地图](/templates/sitemap/)（`sitemap.xml`）
- [RSS 订阅源](/templates/rss/)（`index.xml`）
- [404 错误页面](/templates/404/)（`404.html`）
- [robots.txt](/templates/robots/)

## 各模板类型的职责与回退

把上面的内容压缩成一张对照表，排查问题时先在这里定位：

| 模板 | 职责 | 谁的回退 |
| --- | --- | --- |
| `home` | 渲染站点首页 | — |
| `page` | 渲染常规页面 | — |
| `section` | 渲染某个 section（内容区块）内的页面列表 | — |
| `taxonomy` | 渲染某个分类法（taxonomy）下的术语列表；`.Data` 提供 `Singular`、`Plural`、`Terms` 等方法 | — |
| `term` | 渲染与某个术语关联的页面列表；`.Data` 提供 `Singular`、`Plural`、`Term` | — |
| `single` | 渲染常规页面 | `page` 的回退 |
| `list` | 渲染列表类页面 | `home`、`section`、`taxonomy`、`term` 的回退 |
| `all` | 渲染任意 HTML 页面 | 以上全部模板类型的最终回退 |

列表类模板中常用 `.Pages` 或 `.Site.RegularPages` 遍历页面，需要过滤、排序或分组时可选用相应的方法与函数（见[页面集合速查](/quick-reference/page-collections/)）。

除页面模板外，`layouts/` 下还有几类组件模板：局部模板（partial，位于 `_partials/`）、行内局部模板（inline partial，用 `define` 在模板内部声明）、视图模板（view，通过页面的 `Render` 方法调用）、渲染钩子（render hook，位于 `_markup/`，改写 Markdown 到 HTML 的转换）、短代码（shortcode，位于 `_shortcodes/`，供内容页面调用），以及站点地图、RSS、404 页面、robots.txt 等专用模板。

## 最小可运行示例：验证模板选对了没有

复制下面两个文件到项目里，就能看到「哪类页面用哪个模板」的实际效果。

```go-html-template {file="layouts/all.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  <p>ALL: {{ .Kind }} / {{ .Title }}</p>
</body>
</html>
```

这**不是**完整模板，但足够验证查找规则。构建后检查产物：

```bash
hugo
```

`public/index.html` 里应当出现 `ALL: home / 站点标题`；任意文章页 `public/<路径>/index.html` 里应当出现 `ALL: page / 文章标题`。`.Kind` 的取值就是上面回退表里的名字。

**接着做一次对照实验**：再创建一个 `layouts/section.html`，内容写成

```go-html-template {file="layouts/section.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  <p>SECTION: {{ .Kind }} / {{ .Title }}</p>
</body>
</html>
```

重新构建后，section 首页（例如 `public/posts/index.html`）应当从 `ALL:` 变成 `SECTION:`，而文章页仍然是 `ALL:`。**这就是验证模板是否被命中的通用方法**：给每个模板加一句独一无二的标记，构建后到 `public/` 里搜它。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 新建的模板完全没生效 | 文件名或所在目录不符合查找规则（例如把 `page.html` 放进了 `layouts/_default/`）→ 对照[模板查找顺序](/templates/lookup-order/)与[新版模板系统概览](/templates/new-templatesystem-overview/) |
| 没报错但结果不对 | 页面上出现英文占位文字 `This will be replaced…` | 页面模板没有提供对应的 `define "main"`，基础模板里的 `block` 占位内容被输出 → 检查该模板是否只有 `{{ define … }}` 与注释 |
| 没报错但结果不对 | 页面模板写的 `define` 生效了，但没有页头页脚 | 模板里混进了 `define` 之外的内容（例如多了一行 HTML 或一个 `{{ .Content }}`），Hugo 就不再套用基础模板 → 把额外内容移进 `define` 块内 |
| 没报错但结果不对 | 两个页面互相「串了」样式 | 用了错误的模板回退（例如缺 `section.html` 时落到 `list.html`，而 `list.html` 是给别的页面写的）→ 按本页回退表补齐具体模板 |
| 报错看不懂 | 构建时出现 `found no layout file for …` 警告 | `layouts/` 下一个可用模板都没有（连 `all.html` 也没有），该页面不会产出内容 → 先放一个兜底模板 |
| 报错看不懂 | `template: … : function "…" not defined` | 调用了不存在的函数名或写错了命名空间（大小写敏感）→ 到[函数](/functions/)里核对全名 |

更多排查入口见[故障排查](/troubleshooting/)。
