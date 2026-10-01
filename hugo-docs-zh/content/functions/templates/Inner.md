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
