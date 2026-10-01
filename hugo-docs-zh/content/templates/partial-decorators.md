+++
title = "局部模板装饰器"
linkTitle = "局部模板装饰器"
description = "用局部模板装饰器编写可复用的包裹式组件，并用 templates.Inner 注入内容。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/templates/partial-decorators/"
+++

> [!NOTE]
> 局部模板装饰器是 Hugo v0.154.0 引入的新特性。

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

## 组合带来的好处

用局部模板装饰器构建包裹式组件有几点优势：

- 包裹一段代码时，不再需要为开始标签与结束标签分别准备局部模板。
- 可以避免参数膨胀：标准局部模板不必再为了覆盖内部内容的各种变化而罗列一长串参数。
- 便于清晰组合：被包裹块可以执行任意模板逻辑，而包裹组件无需接收或处理这些数据。

这种方式把容器逻辑与内容逻辑分开。包裹组件负责结构上的要求，例如特定的类名层级或 CSS 网格容器；调用方模板则保留对内部标记与数据展示方式的控制权。

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

## 与 `partial` 调用的关系

装饰器调用用的仍然是 `partial` 函数，区别只在于外层套了 `with`，并由被调用模板通过 `templates.Inner` 把包裹内容插回指定位置。传入 `partial` 的参数会成为被调用模板的上下文，因此装饰器需要用到的数据必须随调用一起传入；被包裹块中的点则由 `templates.Inner` 的参数决定。若打算改用 `partialCached` 来省下重复渲染的开销，务必确认缓存键能区分不同调用点的包裹内容，否则容易取到不属于当前调用点的结果。
