+++
title = "openapi3.Unmarshal"
linkTitle = "Unmarshal"
description = "返回从给定资源反序列化得到的 OpenAPI 3 描述。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/openapi3/unmarshal/"

[params.functions_and_methods]
signatures = ["openapi3.Unmarshal RESOURCE [OPTIONS]"]
returnType = "openapi3.OpenAPIDocument"
+++

## 这一页解决什么问题

Hugo 站点里要渲染 API 文档时，通常手上有一份 OpenAPI 3 定义（JSON 或 YAML）。`openapi3.Unmarshal` 把这份定义**读成可遍历的数据结构**，于是你可以用模板列出每个路径、每个操作、每个参数，而不必手写一遍。它还会**自动解析外部引用**（本地与远程），返回一份完整的 OpenAPI 描述。

返回的对象由 [`kin-openapi`](https://github.com/getkin/kin-openapi) 创建，很多字段是结构体或指针，需要用访问器（例如 `.Paths.Map`），不能当成普通映射直接 `index`。

## 什么时候用，什么时候别用

**该用**：

- 从 `assets/` 里的 OpenAPI 文件生成 API 参考页；
- 需要遍历路径 / 操作 / schema，并用本站模板样式呈现；
- 定义里带外部 `$ref`，希望 Hugo 在构建时一并抓取（远程引用需要 `getremote` 选项）。

**别用**：

- 只想把 JSON 原样打印出来 → 用 [`transform.Remarshal`](/functions/transform/remarshal/) 或直接 `jsonify`；
- 需要运行时请求 API → Hugo 是静态构建，`openapi3.Unmarshal` 只处理**定义文件**；
- 定义是 OpenAPI 2 / Swagger → 上游未提供转换支持。

## 用法

传给 `openapi3.Unmarshal` 函数的资源必须是 [OpenAPI 文档][OpenAPI Document]，通常是 JSON 或 YAML 格式。这个资源可以是[全局资源](g)，也可以是[远程资源](g)。

该函数会自动解析并纳入所有外部引用（本地与远程都包括），返回一份完整的 [OpenAPI 描述][OpenAPI Description]，完整描述某个 API 的对外接口及其语义。

`openapi3.Unmarshal` 函数接受一个选项映射。

`getremote`
: **（0.153.0 新增）**
: (`map`) 这是 [`resources.GetRemote`][] 函数的选项映射，在 OpenAPI 文档包含远程外部引用时很有用。

## 示例

下面的示例演示如何反序列化远程资源与全局资源，以及如何检查结果。

### 远程资源

处理远程资源：

```go-html-template {copy=true}
{{ $api := "" }}
{{ $url := "https://petstore.swagger.io/v2/swagger.json" }}
{{ $opts := dict
  "headers" (dict "Authorization" "Bearer abcd")
}}
{{ with try (resources.GetRemote $url $opts) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ $api = openapi3.Unmarshal . (dict "getremote" $opts) }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

上例中，同一个 HTTP Authorization 头既用于 `resources.GetRemote` 函数发起的首次远程请求，也用于 `openapi.Unmarshal` 函数在获取远程外部引用时发起的后续请求。

### 全局资源

处理全局资源：

```go-html-template {copy=true}
{{ $api := "" }}
{{ $opts := dict
  "method" "post"
  "key" now.UnixNano
}}
{{ with resources.Get "api/petstore.json" }}
  {{ $api = openapi3.Unmarshal . (dict "getremote" $opts) }}
{{ end }}
```

对全局资源而言，以 `/` 开头的本地外部引用路径相对于 `assets` 目录解析，其余本地路径相对于入口点解析。上例中，本地路径相对于 `assets/api/petstore.json` 解析。

### 检查结构

> [!NOTE]
> 反序列化得到的数据结构由 [`kin-openapi`][] 创建。其中许多字段是结构体或指针（而不是映射），因此需要访问器或其他方法来索引与遍历。
>
> 例如 `Paths` 是指针而不是映射；要遍历 API 路径，必须像下面这个示例那样使用 `.Paths.Map` 访问器。
>
> 完整的类型定义见 [`kin-openapi` 针对 OpenAPI 3 的 godoc][`kin-openapi` godoc for OpenAPI 3]。

检查反序列化得到的数据结构：

```go-html-template {copy=true}
<pre>{{ debug.Dump $api }}</pre>
```

列出每个 API 路径的 GET 与 POST 操作：

```go-html-template {copy=true}
{{ range $path, $details := $api.Paths.Map }}
  <p>{{ $path }}</p>
  <dl>
    {{ with $details.Get }}
      <dt>GET</dt>
      <dd>{{ .Summary }}</dd>
    {{ end }}
    {{ with $details.Post }}
      <dt>POST</dt>
      <dd>{{ .Summary }}</dd>
    {{ end }}
  </dl>
{{ end }}
```

Hugo 会把它渲染为：

```html
<p>/pets</p>
<dl>
  <dt>GET</dt>
  <dd>List all pets</dd>
  <dt>POST</dt>
  <dd>Create a pet</dd>
</dl>
<p>/pets/{petId}</p>
<dl>
  <dt>GET</dt>
  <dd>Info for a specific pet</dd>
</dl>
```

[OpenAPI Description]: https://swagger.io/specification/#openapi-description
[OpenAPI Document]: https://swagger.io/specification/#openapi-document
[`kin-openapi` godoc for OpenAPI 3]: https://pkg.go.dev/github.com/getkin/kin-openapi/openapi3
[`kin-openapi`]: https://github.com/getkin/kin-openapi
[`resources.GetRemote`]: /functions/resources/getremote/#options

## 完整示例（实测）

`assets/api/petstore.json`：

```json
{
  "openapi": "3.0.0",
  "info": { "title": "Swagger Petstore", "version": "1.0.0" },
  "paths": {
    "/pets": {
      "get": { "summary": "List all pets", "responses": { "200": { "description": "ok" } } },
      "post": { "summary": "Create a pet", "responses": { "200": { "description": "ok" } } }
    },
    "/pets/{petId}": {
      "get": { "summary": "Info for a specific pet", "responses": { "200": { "description": "ok" } } }
    }
  }
}
```

模板：

```go-html-template
{{ with resources.Get "api/petstore.json" }}
  {{ $api := openapi3.Unmarshal . }}
  <p>{{ $api.Info.Title }} {{ $api.Info.Version }}</p>
  {{ range $path, $details := $api.Paths.Map }}
    <p>{{ $path }}</p>
    {{ with $details.Get }}<dt>GET</dt><dd>{{ .Summary }}</dd>{{ end }}
    {{ with $details.Post }}<dt>POST</dt><dd>{{ .Summary }}</dd>{{ end }}
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染（元素间空白已省略）：

```html
<p>Swagger Petstore 1.0.0</p>
<p>/pets</p>
<dt>GET</dt><dd>List all pets</dd>
<dt>POST</dt><dd>Create a pet</dd>
<p>/pets/{petId}</p>
<dt>GET</dt><dd>Info for a specific pet</dd>
```

**你应当看到什么**：`Paths` 必须通过 `.Map` 访问器遍历；`details.Get` / `details.Post` 在没有对应操作时为空，`with` 会自动跳过。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 合法的 OpenAPI 3 JSON | 返回 `openapi3.OpenAPIDocument`，`.Paths.Map` 可遍历 | 否 |
| `resources.Get` 找不到资源（返回 `nil`） | —— | 是：`error calling Unmarshal: interface conversion: interface is nil, not resource.UnmarshableResource` |
| 远程资源 / 远程 `$ref` | 需要联网，本站未实测；上游「远程资源」示例只给出模板写法，未给出渲染输出 | —— |
