+++
title = "templates.Current"
linkTitle = "Current"
description = "返回当前正在执行的模板的相关信息。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/templates/current/"

[params.functions_and_methods]
signatures = ["templates.Current"]
returnType = "tpl.CurrentTemplateInfo"
+++

> [!NOTE]
> 该函数是实验性的，可能发生变化。

**（0.146.0 新增）**

`templates.Current` 函数提供内省（introspection）能力，可以用来查看当前正在执行的模板的细节。调试复杂的模板层次、理解渲染过程中的执行流向时，这个能力很有用。

## 方法

在 `CurrentTemplateInfo` 对象上使用以下方法。

`Ancestors`
: （`tpl.CurrentTemplateInfos`）返回一个切片，包含当前执行链上每个模板的信息，从当前模板的父级开始，逐级向上直到最初被调用的模板。它不包含通过 `define` 与 `block` 套用的 _base_ 模板。可以在该结果上链式调用 `Reverse` 方法，得到按执行先后排列的切片。

`Base`
: （`tpl.CurrentTemplateInfoCommonOps`）返回一个对象，表示套用到当前模板上的 _base_ 模板（如果有）。可能为 `nil`。

`Filename`
: （`string`）返回当前模板的绝对路径。内嵌模板（embedded template）会返回空字符串。

`Name`
: （`string`）返回当前模板的名称。通常是相对于 `layouts` 目录的路径。

`Parent`
: （`tpl.CurrentTemplateInfo`）返回一个对象，表示当前模板的父级（如果有）。可能为 `nil`。

## 示例

下面的示例有助于直观理解模板的执行过程，需要在项目配置中把 `debug` 参数设为 `true`：

```toml
[params]
debug = true
```

### 模板边界

要直观标出模板开始与结束执行的位置：

```go-html-template {file="layouts/page.html"}
{{ define "main" }}
  {{ if site.Params.debug }}
    <div class="debug">[entering {{ templates.Current.Filename }}]</div>
  {{ end }}

  <h1>{{ .Title }}</h1>
  {{ .Content }}

  {{ if site.Params.debug }}
    <div class="debug">[leaving {{ templates.Current.Filename }}]</div>
  {{ end }}
{{ end }}
```

### 调用栈

要显示导致当前模板被执行的那条模板链，可以创建一个 _partial_ 模板来遍历它的祖先：

```go-html-template {file="layouts/_partials/template-call-stack.html"}
{{ with templates.Current }}
  <div class="debug">
    {{ range .Ancestors }}
      {{ .Filename }}<br>
      {{ with .Base }}
        {{ .Filename }}<br>
      {{ end }}
    {{ end }}
  </div>
{{ end }}
```

然后在任意模板中调用这个 _partial_ 模板：

```go-html-template {file="layouts/_partials/footer/copyright.html"}
{{ if site.Params.debug }}
  {{ partial "template-call-stack.html" . }}
{{ end }}
```

渲染出的模板栈大致如下：

```text
/home/user/project/layouts/_partials/footer/copyright.html
/home/user/project/themes/foo/layouts/_partials/footer.html
/home/user/project/layouts/page.html
/home/user/project/themes/foo/layouts/baseof.html
```

要让各条目的顺序反过来，可以在 `Ancestors` 方法后链式调用 `Reverse` 方法：

```go-html-template {file="layouts/_partials/template-call-stack.html"}
{{ with templates.Current }}
  <div class="debug">
    {{ range .Ancestors.Reverse }}
      {{ with .Base }}
        {{ .Filename }}<br>
      {{ end }}
      {{ .Filename }}<br>
    {{ end }}
  </div>
{{ end }}
```

### VS Code

要渲染出点击后能在 Microsoft Visual Studio Code 中打开该模板的链接，可以创建一个 _partial_ 模板，其中的锚点元素使用 `vscode` URI 方案：

```go-html-template {file="layouts/_partials/template-open-in-vs-code.html"}
{{ with templates.Current.Parent }}
  <div class="debug">
    <a href="vscode://file/{{ .Filename }}">{{ .Name }}</a>
    {{ with .Base }}
      <a href="vscode://file/{{ .Filename }}">{{ .Name }}</a>
    {{ end }}
  </div>
{{ end }}
```

然后在任意模板中调用这个 _partial_ 模板：

```go-html-template {file="layouts/page.html"}
{{ define "main" }}
  <h1>{{ .Title }}</h1>
  {{ .Content }}

  {{ if site.Params.debug }}
    {{ partial "template-open-in-vs-code.html" . }}
  {{ end }}
{{ end }}
```

用同样的办法可以把整个调用栈渲染成链接：

```go-html-template {file="layouts/_partials/template-call-stack.html"}
{{ with templates.Current }}
  <div class="debug">
    {{ range .Ancestors }}
      <a href="vscode://file/{{ .Filename }}">{{ .Filename }}</a><br>
      {{ with .Base }}
        <a href="vscode://file/{{ .Filename }}">{{ .Filename }}</a><br>
      {{ end }}
    {{ end }}
  </div>
{{ end }}
```
