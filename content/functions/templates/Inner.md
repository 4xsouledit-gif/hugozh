+++
title = "templates.Inner"
linkTitle = "Inner"
description = "执行由局部模板（partial）调用所包裹的内容块。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/templates/inner/"

[params.functions_and_methods]
signatures = ["templates.Inner [CONTEXT]"]
returnType = "any"
aliases = ["inner"]
+++

**（0.154.0 新增）**

`templates.Inner` 函数定义块式 _partial_ 模板调用中嵌套代码的注入点。这是创建[局部模板装饰器][partial decorator]所用的核心机制。

## 这一页解决什么问题

普通局部模板是「调用方传数据进去、被调模板决定输出」。**局部模板装饰器**（partial decorator）反过来：被调模板负责外层结构（卡片框、列表容器），**调用方提供内层内容**。`templates.Inner` 就是那个「把内层内容注入到这里」的标记。

它解决的是「包装器」类需求：同一套 `<div class="card">…</div>` 或 `<ul>…</ul>` 结构，被多个页面复用，而每个页面的内层内容各不相同。

## 什么时候用，什么时候别用

**该用**：

- 编写装饰器 / 包装器局部模板（卡片、面板、列表容器）；
- 需要把调用方的一段模板**重复渲染多次**（例如列表装饰器按集合逐项注入）；
- 需要控制内层内容渲染时的上下文。

**别用**：

- 普通「传参渲染」→ 用 [`partial`](/functions/partials/include/) 就够了；
- 只想拼接一段 HTML → 直接用 `partial` 或 `printf`；
- 需要在装饰器里直接取调用方的变量 → `with` 会新建作用域，改用 `templates.Inner` 的上下文参数传递数据。

## 概述

`templates.Inner` 函数在 _partial_ 模板中充当占位符。当 _partial_ 模板被当作装饰器调用时，它先捕获调用模板中的一段代码，而不是立即渲染。`templates.Inner` 函数告诉 Hugo 把捕获到的内容注入到哪个确切位置。

这标志着执行方向的逆转：被调用者变成了调用者。_partial_ 模板管理外层结构，而调用方模板仍然掌控内部内容。

## 用法

要使用该函数，调用方模板必须使用块式语法配合 [`with`][] 语句。这样装饰器才能多层嵌套。

```go-html-template {file="layouts/home.html"}
{{ with partial "components/card.html" . }}
  <p>This content is passed to the partial.</p>
{{ end }}
```

在 _partial_ 模板内部调用 `templates.Inner` 来渲染捕获到的块。

```go-html-template {file="layouts/_partials/components/card.html"}
<div class="card-frame">
  {{ templates.Inner . }}
</div>
```

## 参数

该函数接受一个可选参数：上下文。这个参数决定捕获块被渲染时其中的点（`.`）取什么值。

- 如果传入参数，例如 `{{ templates.Inner .SomeData }}`，捕获块内的点会重新绑定到那份具体数据。
- 如果不传入参数，捕获块使用首次调用该 _partial_ 模板时调用方的上下文。

## 上下文与作用域

使用装饰器时，`with` 语句会创建一个新的作用域。在调用方模板中于 `with` 块之外定义的变量，不会自动出现在捕获块内。

把上下文传给 `templates.Inner`，就能保证注入的内容即使嵌套在多层包装之中，也仍能访问到正确的数据。当装饰器用在循环或某个特定的数据覆盖层中时，这一点至关重要。

## 重复执行

装饰器可以把捕获到的内容执行零次或多次。当包装器需要为一组条目（例如列表或网格）重复同一套装饰时，这很有用。

```go-html-template {file="layouts/_partials/list-decorator.html"}
<ul class="styled-list">
  {{ range .items }}
    <li>
      {{ templates.Inner . }}
    </li>
  {{ end }}
</ul>
```

在这个例子中，调用方提供的代码会为 .items 集合中的每个条目渲染一次，每次迭代时点 `.` 都会更新为当前条目。

[`with`]: /functions/go-template/with/
[partial decorator]: /templates/partial-decorators/

## 完整示例（实测）

装饰器 `layouts/_partials/components/card.html`：

```go-html-template {file="layouts/_partials/components/card.html"}
<div class="card-frame">{{ templates.Inner . }}</div>
```

调用方：

```go-html-template
{{ with partial "components/card.html" . }}
  <p>This content is passed to the partial.</p>
{{ end }}
```

Hugo 0.167.0 实测渲染：

```html
<div class="card-frame"><p>This content is passed to the partial.</p></div>
```

**你应当看到什么**：外层 `<div class="card-frame">` 来自局部模板，内层 `<p>` 来自调用方——执行方向被反转了。

重复渲染（列表装饰器）：调用方只写一次内容，装饰器按集合逐项注入。

```go-html-template {file="layouts/_partials/list-decorator.html"}
<ul class="styled-list">
  {{ range .items }}
    <li>{{ templates.Inner . }}</li>
  {{ end }}
</ul>
```

```go-html-template
{{ with partial "list-decorator.html" (dict "items" (slice "a" "b")) }}<span>ITEM {{ . }}</span>{{ end }}
```

Hugo 0.167.0 实测渲染（空白已省略）：

```html
<ul class="styled-list">
  <li><span>ITEM a</span></li>
  <li><span>ITEM b</span></li>
</ul>
```

装饰器也可以嵌套（实测 `wrap.html` 套 `wrap.html` 正常渲染）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 调用方用 `{{ with partial … }}…{{ end }}` 包裹，装饰器内 `{{ templates.Inner . }}` | 注入内层内容；传给 `Inner` 的参数成为内容里的 `.`（实测传 `dict` 后 `{{ .k }}` 得到 `V`） | 否 |
| 装饰器把 `templates.Inner` 放在 `range` 里 | 内容被渲染多次，每轮 `.` 为当前元素（实测输出 `ITEM a`、`ITEM b`） | 否 |
| 多层装饰器嵌套 | 正常（实测） | 否 |
| 装饰器里不传参数调用 `{{ templates.Inner }}` | —— | 是：`wrong number of args for Inner: want 2 got 1` |
| 在非装饰器调用（普通 `partial`）里用 `templates.Inner` | —— | 是：`error calling Inner: no partial decorator ID on stack` |
| 返回类型 | `any`（注入渲染结果） | 否 |
