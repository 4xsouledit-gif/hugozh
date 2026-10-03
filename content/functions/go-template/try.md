+++
title = "try"
linkTitle = "try"
description = "对给定表达式求值，并返回一个 TryValue 对象。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/functions/go-template/try/"

[params.functions_and_methods]
signatures = ["try EXPR"]
returnType = "TryValue"
+++

**（0.141.0 新增）**

`try` 函数是对 Go [`text/template`][] 包的非标准扩展。它引入了一种在模板中处理错误的机制，模仿其它编程语言中的 `try-catch` 结构。

## 这一页解决什么问题

模板里某些表达式会失败：除以零、`len` 传了数字、`resources.GetRemote` 网络出错……默认行为是**整个站点构建失败**。`try` 把「求值」和「处理失败」分开：它不直接返回结果，而是返回一个 `TryValue` 对象，你用 `.Value` 取成功的结果、用 `.Err` 取错误。这样就能把「可能失败」的表达式降级成警告。

## 什么时候用，什么时候别用

**该用**：

- 可预期的失败：远程资源获取、外部数据不规整（见本页「示例」）；
- 想让构建**继续**，同时把问题记录到控制台（`warnf`）；
- 需要在模板里给失败留兜底输出。

**别用**：

- 模板转译阶段的错误（例如 [`return`](/functions/go-template/return/) 用法不对）→ `try` 捕获不到，构建照样失败；
- 想掩盖真正需要修的问题 → 构建期就该失败的错误不要用 `try` 吞掉；
- 可以用 `with` / `if` 提前判空避免的失败 → 优先判空，`try` 是兜底而不是常规手段。

## 方法

在 `TryValue` 对象上使用以下方法。

`Err`
: （`string`）如果发生错误，返回表达式所抛出错误的字符串表示；如果表达式求值无错误，则返回 `nil`。

`Value`
: （`any`）如果求值成功，返回表达式的结果；如果求值过程中发生错误，则返回 `nil`。

## 说明

举例来说，让一个数除以零：

```go-html-template
{{ $x := 1 }}
{{ $y := 0 }}
{{ $result := div $x $y }}
{{ printf "%v divided by %v equals %v" $x $y .Value }}
```

如你所料，上面的例子会抛出错误并导致构建失败：

```terminfo
Error: error calling div: can't divide the value by 0
```

与其让构建失败，我们可以捕获这个错误并发出警告：

```go-html-template
{{ $x := 1 }}
{{ $y := 0 }}
{{ with try (div $x $y) }}
  {{ with .Err }}
    {{ warnf "%s" . }}
  {{ else }}
    {{ printf "%v divided by %v equals %v" $x $y .Value }}
  {{ end }}
{{ end }}
```

表达式抛出的错误会作为警告记录到控制台：

```terminfo
WARN error calling div: can't divide the value by 0
```

现在改变参数，避免除以零：

```go-html-template
{{ $x := 42 }}
{{ $y := 6 }}
{{ with try (div $x $y) }}
  {{ with .Err }}
    {{ warnf "%s" . }}
  {{ else }}
    {{ printf "%v divided by %v equals %v" $x $y .Value }}
  {{ end }}
{{ end }}
```

Hugo 把上面的代码渲染为：

```html
42 divided by 6 equals 7
```

## 示例

使用 [`resources.GetRemote`][] 函数获取远程资源（例如数据或图片）时，错误处理必不可少。调用该函数时，如果 HTTP 请求失败，Hugo 会让构建失败。

与其让构建失败，我们可以捕获这个错误并发出警告：

```go-html-template
{{ $url := "https://broken-example.org/images/a.jpg" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ warnf "%s" . }}
  {{ else with .Value }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    {{ warnf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

在上面的代码中请注意，最后一个条件块内的上下文是 `try` 函数返回的 `TryValue` 对象。此时 `Err` 与 `Value` 方法都没有返回任何值，所以当前上下文没有用处。如果需要，用 `$` 访问[模板上下文][template context]。

> [!NOTE]
> Hugo 不会把状态码为 404 的 HTTP 响应视为错误。这种情况下 `resources.GetRemote` 返回 `nil`。

[`resources.GetRemote`]: /functions/resources/getremote/
[`text/template`]: https://pkg.go.dev/text/template
[template context]: /templates/introduction/#上下文

## 完整示例（实测）

```go-html-template
{{ $x := 1 }}
{{ $y := 0 }}
{{ with try (div $x $y) }}
  {{ with .Err }}
    {{ warnf "%s" . }}
  {{ else }}
    {{ printf "%v divided by %v equals %v" $x $y .Value }}
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测：`1 / 0` 时构建**继续**，控制台出现一条警告；把参数改成 `42 / 6` 后，模板渲染出：

```html
42 divided by 6 equals 7
```

实测控制台警告（`1 / 0`）：

```text
WARN  template: index.txt:158:31: executing "index.txt" at <div 1 0>: error calling div: can't divide the value by 0
```

**你应当看到什么**：`.Err` 非空时走 `warnf` 分支；成功时 `.Err` 为 `nil`，走 `else` 分支并用 `.Value` 取值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，最小站点。

| 表达式 | `.Value` | `.Err` |
| --- | --- | --- |
| `try (div 6 3)` | `2`（`int64`） | `nil`（`with .Err` 判为假） |
| `try (div 1 0)` | `nil` | 非空错误；`printf "%v"` 得到 `error calling div: can't divide the value by 0` |
| `try (len 42)` | `nil` | `error calling len: len of type int` |
| 返回类型 | `TryValue` 对象 | `.Err` 签名标注为 `string`，`.Value` 标注为 `any` |

> [!NOTE]
> 上游说明：Hugo 不把 HTTP 404 视为错误，`resources.GetRemote` 遇到 404 时返回 `nil`，此时 `.Err` 与 `.Value` 都是 `nil`（该条需要联网，本站未实测）。
