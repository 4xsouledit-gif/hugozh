+++
title = "局部模板装饰器"
linkTitle = "局部模板装饰器"
description = "用局部模板装饰器编写可复用的包裹式组件：`with` + `templates.Inner` 的实现方式、三层嵌套示例与结果核对。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/templates/partial-decorators/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "写过局部模板（partial），知道 `partial` 函数怎么传上下文（见[内容类型](/templates/types/)）。",
  "理解 `with`、`$` 与作用域的关系（见[简介](/templates/introduction/)）。",
]
outcomes = [
  "写出一个装饰器风格的包裹组件，并用 `templates.Inner` 把调用方的代码块注入到指定位置；",
  "说清「被包裹块里的点」由谁决定，以及为什么块内取不到块外的变量；",
  "嵌套两层以上包裹组件时，能正确逐层传递上下文；",
  "判断该用装饰器还是普通局部模板（参数传递 vs 代码块注入）。",
]
next = ["/templates/shortcode/", "/templates/types/", "/functions/"]

+++

> [!NOTE]
> 局部模板装饰器是 Hugo v0.154.0 引入的新特性。

## 这一页解决什么问题

普通局部模板是「你给它数据，它输出 HTML」；但有些组件需要反过来——**你来提供内容，它决定内容放在哪**。典型例子是卡片、区块、栅格容器：外层只管结构和类名，里面装什么由调用方决定。

传统做法要为开始标签和结束标签各写一个局部模板（`open-card.html` / `close-card.html`），参数还越加越多。装饰器把这件事变成一个代码块：调用方用 `with partial "…" .` 包住一段模板代码，组件里用 `templates.Inner` 决定这段代码出现的位置。

## 概述

局部模板装饰器（partial decorator）把两个文件连接起来：调用方模板提供一段代码，装饰器决定这段代码出现在哪里。这样局部模板就能包住内容，而不必知道被包裹块的标记结构或内部逻辑。

## 实现方式

在模板中使用块式调用即可。必须用 `with` 语句来启动局部模板并为内容创建容器，这个块里可以写任何合法的模板代码，包括页面方法与函数：

```go-html-template {file="layouts/home.html"}
{{ with partial "components/wrapper.html" . }}
  <p>Everything in this block will be wrapped.</p>
  <p>{{ .Content | transform.Plainify | strings.Truncate 200 }}</p>
{{ end }}
```

在局部模板内部，把 `templates.Inner` 函数调用放在希望被包裹内容出现的位置：

```go-html-template {file="layouts/_partials/components/wrapper.html"}
<div class="wrapper-styling">
  {{ templates.Inner . }}
</div>
```

`with` 语句会创建新的作用域，因此块外定义的变量在块内不可用。若被包裹的内容需要使用外部数据，必须在调用局部模板时把这些数据放进传入的上下文中。

`templates.Inner` 的关键特性是它接受一个上下文参数。给这个函数传入上下文，就是在定义被包裹块中点（`.`）代表什么。这样即使内容嵌套了多层包裹，也能访问到正确的数据。

### 最小可运行示例

两个文件就能跑起来：

```go-html-template {file="layouts/_partials/components/wrapper.html"}
<div class="wrapper-styling">
  {{ templates.Inner . }}
</div>
```

```go-html-template {file="layouts/all.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  {{ with partial "components/wrapper.html" . }}
    <p>被包裹的第一段。</p>
    <p>页面的标题是：{{ .Title }}</p>
  {{ end }}
</body>
</html>
```

构建：

```bash
hugo
```

### 结果长什么样

打开任意页面的产物（例如 `public/index.html`），你应当看到调用方的两段 `<p>` 出现在 `<div class="wrapper-styling">` **内部**：

```html
<body>
<div class="wrapper-styling">
    <p>被包裹的第一段。</p>
    <p>页面的标题是：我的站点</p>
</div>
</body>
```

验证要点：

1. 包裹内容在 `div` **里面**——如果跑到外面去了，说明 `templates.Inner` 的位置放错了，或者局部模板里忘了调用它；
2. `{{ .Title }}` 被正确替换——这里 `.` 是 `templates.Inner .` 传进去的上下文，也就是调用时传给 `partial` 的那个点；
3. 终端没有 `ERROR`。

## 组合带来的好处

用局部模板装饰器构建包裹式组件有几点优势：

- 包裹一段代码时，不再需要为开始标签与结束标签分别准备局部模板。
- 可以避免参数膨胀：标准局部模板不必再为了覆盖内部内容的各种变化而罗列一长串参数。
- 便于清晰组合：被包裹块可以执行任意模板逻辑，而包裹组件无需接收或处理这些数据。

这种方式把容器逻辑与内容逻辑分开。包裹组件负责结构上的要求，例如特定的类名层级或 CSS 网格容器；调用方模板则保留对内部标记与数据展示方式的控制权。

**什么时候用**：组件需要「包住」调用方提供的一段模板代码（栅格、卡片、区块、折叠面板）；**什么时候别用**：只是想把一组数据渲染成固定结构——那用普通局部模板传参数更直白，也更容易被 `partialCached` 缓存。

## 示例

下面的模板演示如何嵌套三层包裹组件：区块、列与卡片，并逐层传递上下文。首页模板先构造上下文，再以装饰器方式依次调用区块、列、卡片三个局部模板：

```go-html-template {file="layouts/home.html"}
{{ $ctx := dict
  "page" .
  "label" "Recent Posts"
  "pageCollection" ((site.GetPage "/posts").RegularPages)
}}

{{ with partial "components/section.html" $ctx }}
  <div class="grid-wrapper">
    {{ range .pageCollection }}
      {{ with partial "components/column.html" (dict "page" . "class" "col-half") }}
        {{ with partial "components/card.html" (dict "page" .page "url" .page.RelPermalink "title" .page.LinkTitle) }}
          <p>
            {{ .page.Content | plainify | strings.Truncate 240 }}
          </p>
        {{ end }}
      {{ end }}
    {{ end }}
  </div>
{{ end }}
```

区块组件提供语义化的容器与可选的标题：

```go-html-template {file="layouts/_partials/components/section.html"}
<section class="content-section">
  {{ with .label }}
    <h2 class="section-label">{{ . }}</h2>
  {{ end }}
  <div class="section-content">
    {{ templates.Inner . }}
  </div>
</section>
```

列组件通过应用 CSS 类来控制布局宽度：

```go-html-template {file="layouts/_partials/components/column.html"}
<div class="{{ .class | default `column-default` }}">
  {{ templates.Inner . }}
</div>
```

卡片组件定义内容的视觉边界：

```go-html-template {file="layouts/_partials/components/card.html"}
<div class="card">
  {{ with .title }}
    <h2 class="card-title">
      {{ if $.url }}
        <a href="{{ $.url }}">{{ . }}</a>
      {{ else }}
        {{ . }}
      {{ end }}
    </h2>
  {{ end }}

  <div class="card-body">
    {{ templates.Inner . }}
  </div>

  {{ with .url }}
    <div class="card-footer">
      <a href="{{ . }}">Read more</a>
    </div>
  {{ end }}
</div>
```

### 结果长什么样（三层嵌套）

在 `content/posts/` 下放两篇文章后构建，`public/index.html` 里应当出现三层套起来的结构：

```html
<section class="content-section">
  <h2 class="section-label">Recent Posts</h2>
  <div class="section-content">
    <div class="grid-wrapper">
      <div class="col-half">
        <div class="card">
          <h2 class="card-title"><a href="/posts/first/">第一篇文章</a></h2>
          <div class="card-body">
            <p>第一篇文章正文的前 240 个字符……</p>
          </div>
          <div class="card-footer"><a href="/posts/first/">Read more</a></div>
        </div>
      </div>
      <!-- 每篇文章重复一个 col-half -->
    </div>
  </div>
</section>
```

读这段输出可以确认三件事：

1. **`.label` 来自顶层**：`label` 只传给了 `section.html`，但它渲染在 `section-content` 之前——装饰器用的是自己那一层的上下文；
2. **`.class` 决定了列宽**：`dict "page" . "class" "col-half"` 里的 `col-half` 出现在 `col-half` 这个类上，没传时回退到 `column-default`；
3. **`$.url` 与 `.` 区分开**：卡片里 `$.url` 取的是传给卡片的 `url`，`.` 是 `with .title` 绑定的标题字符串。这正是装饰器里最容易写错的地方。

## 与 `partial` 调用的关系

装饰器调用用的仍然是 `partial` 函数，区别只在于外层套了 `with`，并由被调用模板通过 `templates.Inner` 把包裹内容插回指定位置。传入 `partial` 的参数会成为被调用模板的上下文，因此装饰器需要用到的数据必须随调用一起传入；被包裹块中的点则由 `templates.Inner` 的参数决定。若打算改用 `partialCached` 来省下重复渲染的开销，务必确认缓存键能区分不同调用点的包裹内容，否则容易取到不属于当前调用点的结果。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH`；装饰器还要求 Hugo ≥ v0.154.0（`hugo version` 核对）→ [安装 Hugo](/installation/) |
| 没报错但结果不对 | 整块内容都没输出 | 装饰器模板渲染结果为空字符串时，`with` 判为假，包裹块会被整块跳过 → 检查局部模板是否真的输出了内容 |
| 没报错但结果不对 | 被包裹的代码出现在 `div` 外面 | 局部模板里没调用 `templates.Inner`，或调用位置不在容器内部 |
| 没报错但结果不对 | 块内用 `.Title`、`.Content` 取不到值 | `with` 创建了新作用域，块内的点由 `templates.Inner` 的参数决定 → 要不把数据放进调用时传入的 `dict`，要不显式传 `.` |
| 没报错但结果不对 | 多个调用点渲染出同一份内容 | 用了 `partialCached` 而缓存键没区分调用点的包裹内容 → 装饰器一般别用缓存版本 |
| 报错看不懂 | `can't evaluate field pageCollection in type …` | 上一层 `templates.Inner` 传的上下文与调用方取的键不一致（例如顶层用 `dict`，内层却传了 `.`）→ 逐层核对 `templates.Inner` 的参数 |
| 报错看不懂 | `unexpected "}"` / `missing end` | `with` 块没闭合 → 装饰器每次调用都要有配对的 `{{ end }}` |

更多排查入口见[故障排查](/troubleshooting/)。
