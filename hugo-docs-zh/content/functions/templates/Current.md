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

## 这一页解决什么问题

模板层次一复杂（项目模板 + 主题模板 + 局部模板），「现在到底在执行哪个文件」就说不清了。`templates.Current` 提供内省：返回当前模板的信息对象，可以读到模板名、绝对路径、调用它的父模板、套用的 base 模板，以及整条调用链（`Ancestors`）。调试时把名字打进页面，比在脑子里推模板查找规则可靠得多。

**（0.146.0 新增）**，上游标注为实验性，接口可能变化。

## 什么时候用，什么时候别用

**该用**：

- 排查「为什么这个页面用了主题的模板而不是项目的」；
- 给模板边界打调试标记（进入 / 离开某个模板）；
- 生成点击即可在 VS Code 打开模板的链接。

**别用**：

- 生产环境常驻输出 → 它属于调试手段，用 `[params] debug = true` 之类的开关包起来；
- 想查「渲染这个页面会用到哪些候选模板」→ 用模板查找规则文档或构建诊断，而不是 `Current`；
- 想要稳定的公开 API → 上游已声明实验性。

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

## 完整示例（实测）

`layouts/baseof.html`：

```go-html-template {file="layouts/baseof.html"}
<!doctype html>
<html><body>
BASE-START
{{ block "main" . }}{{ end }}
BASE-END
</body></html>
```

`layouts/index.html`：

```go-html-template {file="layouts/index.html"}
{{ define "main" }}name={{ templates.Current.Name }} parent={{ with templates.Current.Parent }}{{ .Name }}{{ else }}NIL{{ end }} base={{ with templates.Current.Base }}{{ .Name }}{{ else }}NIL{{ end }}{{ end }}
```

Hugo 0.167.0 实测渲染：

```html
<!doctype html>
<html><body>
BASE-START
name=index.html parent=NIL base=baseof.html
BASE-END
</body></html>
```

在局部模板中调用（`layouts/_partials/current-probe.html`）：

```go-html-template {file="layouts/_partials/current-probe.html"}
CURRENT-NAME: {{ templates.Current.Name }}
CURRENT-FILE: {{ templates.Current.Filename }}
```

Hugo 0.167.0 实测渲染：

```text
CURRENT-NAME: _partials/current-probe.html
CURRENT-FILE: C:\Users\...\layouts\_partials\current-probe.html
```

**你应当看到什么**：`Name` 是相对于 `layouts` 的路径（局部模板带 `_partials/` 前缀），`Filename` 是绝对路径（随机器不同）。`Base` 指向套用的 `baseof.html`；首页模板里 `Parent` 实测为 `nil`，而从局部模板里调用时 `Parent.Name` 实测是调用它的模板（`index.html`）。`Ancestors` 实测从局部模板能取到 `index.html`。

## 返回值边界（实测）

| 属性 | 结果 | 是否报错 |
| --- | --- | --- |
| `.Name` | 相对 `layouts` 的模板名（实测 `index.html`、`_partials/current-probe.html`） | 否 |
| `.Filename` | 绝对路径（内嵌模板返回空字符串，上游说明） | 否 |
| `.Base` | 有 baseof 时返回其对象（实测 `.Name` → `baseof.html`） | 否 |
| `.Parent` | 首页模板实测为 `nil`；局部模板中实测为调用方模板（`index.html`） | 否 |
| `.Ancestors` | 当前模板的祖先链（实测从局部模板取到 `index.html`）；可在其上链式调用 `.Reverse` | 否 |
| 返回类型 | `tpl.CurrentTemplateInfo` | 否 |
