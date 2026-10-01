+++
title = "hugo.Deps"
linkTitle = "hugo.Deps"
description = "返回项目依赖的切片，依赖可以是模块，也可以是本地主题组件。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/hugo/deps/"

[params.functions_and_methods]
signatures = ["hugo.Deps"]
returnType = "[]hugo.Dependency"
+++

## 用法

`hugo.Deps` 函数返回项目依赖的切片，依赖可以是模块，也可以是本地主题组件。

## 方法

在 `hugo.Deps` 返回的每个 `hugo.Dependency` 对象上使用以下方法。

`Owner`
: （`hugo.Dependency`）在依赖树中，这是第一个把当前模块声明为依赖的模块（例如 `github.com/gohugoio/hugo-mod-bootstrap-scss/v5`）。

`Path`
: （`string`）返回模块路径，或 `themes` 目录下的路径（例如 `github.com/gohugoio/hugo-mod-jslibs-dist/popperjs/v2`）。

`Replace`
: （`hugo.Dependency`）返回替换当前依赖的那个依赖。

`Time`
: （`time.Time`）返回该版本的创建时间（例如 `2022-02-13 15:11:28 +0000 UTC`）。

`Vendor`
: （`bool`）报告该依赖是否被 vendor（内置于项目）。

`Version`
: （`string`）返回模块版本（例如 `v2.21100.20000`）。

## 示例

下面是一个列出依赖的表格示例：

```go-html-template
<h2>Dependencies</h2>
<table class="table table-dark">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Owner</th>
      <th scope="col">Path</th>
      <th scope="col">Version</th>
      <th scope="col">Time</th>
      <th scope="col">Vendor</th>
    </tr>
  </thead>
  <tbody>
    {{ range $index, $element := hugo.Deps }}
    <tr>
      <th scope="row">{{ add $index 1 }}</th>
      <td>{{ with $element.Owner }}{{ .Path }}{{ end }}</td>
      <td>
        {{ $element.Path }}
        {{ with $element.Replace }}
        => {{ .Path }}
        {{ end }}
      </td>
      <td>{{ $element.Version }}</td>
      <td>{{ with $element.Time }}{{ . }}{{ end }}</td>
      <td>{{ $element.Vendor }}</td>
    </tr>
    {{ end }}
  </tbody>
</table>
```
