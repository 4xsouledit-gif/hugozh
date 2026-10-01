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
