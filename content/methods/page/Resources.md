+++
title = "Resources"
linkTitle = "Resources"
description = "返回页面资源集合。"
date = 2026-10-02
weight = 710
source = "https://gohugo.io/methods/page/resources/"

[params.functions_and_methods]
signatures = ["PAGE.Resources"]
returnType = "resource.Resources"
+++

## 这一页解决什么问题

[页面包](g)（page bundle）里的图片、数据文件、附件都叫**页面资源**。`.Resources` 是它们的集合，配套四个查找方法（`Get`、`GetMatch`、`Match`、`ByType`），让你在模板里按名字、按通配符或按类型拿到资源，再交给 [image processing](/content-management/image-processing/) 处理。

它和全局资源函数（[`resources.Get`](/functions/resources/get/)）的区别：`.Resources` 只查**当前页面包里**的文件，路径是**相对于包目录**的。

## 什么时候用，什么时候别用

**该用**：

- 页面包里的封面图/插图：`.Resources.Get "cover.png"`；
- 一批图片：`.Resources.Match "images/*.jpg"`、`.Resources.ByType "image"`；
- 包内的数据文件：`.Resources.Get "data.json"`。

**别用**：

- 资源放在 `assets/` 目录（全局资源）→ 用 [`resources.Get`](/functions/resources/get/) 等函数；
- 只想输出资源 URL、不做匹配 → 仍然要先用 `.Resources.Get`（或 `GetMatch`）拿到对象；
- 页面不是页面包（没有 `index.md`）→ 实测所有查找方法都返回 `nil`/空（见下）。

**四个方法怎么选**：

| 方法 | 参数 | 返回 | 找不到时 |
| --- | --- | --- | --- |
| `Get` | 精确路径 | 单个资源 | `nil` |
| `GetMatch` | glob 模式 | 第一个匹配 | `nil` |
| `Match` | glob 模式 | 资源集合 | 空 |
| `ByType` | 媒体类型（`image`/`text`…） | 资源集合 | 空 |

## 用法

`Page` 对象上的 `Resources` 方法返回页面资源的集合。页面资源是[页面包](g)中的文件。

要处理全局资源或远程资源，请参见 [`resources`][] 函数。

### 方法

在 `Resources` 对象上使用这些方法。

`ByType`
: （`resource.Resources`）返回给定[媒体类型](g)的页面资源集合；如果没有找到则返回 `nil`。媒体类型通常是 `image`、`text`、`audio`、`video` 或 `application` 之一。

  ```go-html-template
  {{ range .Resources.ByType "image" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
  ```

  如果处理的是全局资源而不是页面资源，请使用 [`resources.ByType`][] 函数。

`Get`
: （`resource.Resource`）返回给定路径的页面资源；如果没有找到则返回 `nil`。

  ```go-html-template
  {{ with .Resources.Get "images/a.jpg" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
  ```

  如果处理的是全局资源而不是页面资源，请使用 [`resources.Get`][] 函数。

`GetMatch`
: （`resource.Resource`）返回路径匹配给定 [glob 模式](g)的第一个页面资源；如果没有找到则返回 `nil`。

  ```go-html-template
  {{ with .Resources.GetMatch "images/*.jpg" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
  ```

  如果处理的是全局资源而不是页面资源，请使用 [`resources.GetMatch`][] 函数。

`Match`
: （`resource.Resources`）返回路径匹配给定 [glob 模式](g)的页面资源集合；如果没有找到则返回 `nil`。

  ```go-html-template
  {{ range .Resources.Match "images/*.jpg" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
  ```

  如果处理的是全局资源而不是页面资源，请使用 [`resources.Match`][] 函数。

`Mount`
: **（0.140.0 新增）**
: （`resource.ResourceGetter`）挂载给定的资源，把基础路径（第一个参数）重映射到目标路径（第二个参数），并返回一个[资源获取器](g)。目标路径中的前导斜杠表示绝对路径。相对目标路径让你可以相对另一组资源（例如[页面包](g)）来挂载资源：

  ```go-html-template
  {{ $common := resources.Match "/js/headlessui/*.*" }}
  {{ $importContext := (slice $.Page ($common.Mount "/js/headlessui" ".")) }}
  ```

### 模式匹配

使用 `GetMatch` 和 `Match` 方法时，Hugo 会按不区分大小写的 [glob 模式](g)来判断是否匹配。语法规则和示例请参见 [glob 模式速查指南][]。

## 完整示例：页面包里的图片与数据文件

测试站的页面包 `content/posts/bundle-1/`：

```tree
content/posts/bundle-1/
├── index.md
├── cover.png     <-- 20×10 像素
└── data.json
```

模板（`layouts/_default/single.html`）：

```go-html-template {file="layouts/_default/single.html"}
{{ range .Resources }}{{ .Name }}（{{ .ResourceType }}）{{ end }}
{{ with .Resources.Get "cover.png" }}<img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">{{ end }}
{{ range .Resources.ByType "image" }}{{ .Name }}={{ .Width }}x{{ .Height }}{{ end }}
```

实测（Hugo 0.167.0）渲染 `/posts/bundle-1/`：

```html
data.json（application） cover.png（image）
<img src="/posts/bundle-1/cover.png" width="20" height="10" alt="">
cover.png=20x10
```

实测各方法的返回值：

| 调用 | 结果 |
| --- | --- |
| `.Resources` | `data.json`（`application`）、`cover.png`（`image`） |
| `.Resources.Get "cover.png"` | 资源对象：`cover.png`、`image/png`、`20x10` |
| `.Resources.Get "nope.png"` | `nil` |
| `.Resources.GetMatch "*.png"` | `cover.png` |
| `.Resources.Match "*"` | `data.json`、`cover.png` |
| `.Resources.ByType "image"` | `cover.png`（含 `.Width`/`.Height`） |

**你应当看到什么**：`Get` 用**精确相对路径**，`GetMatch`/`Match` 用 glob，`ByType` 用媒体类型；图片资源才有 `.Width`/`.Height`/`.RelPermalink`，`application` 类型的 `data.json` 没有这些字段——对它取 `.Width` 会报错。**所有查找方法在非页面包上返回空**（实测 `/posts/post-2/` 上 `Get`、`GetMatch`、`Match`、`ByType` 全部为 `nil`/空）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面是页面包，资源存在 | 资源对象 / 资源集合 | 否 |
| 资源不存在 | `Get`、`GetMatch` 返回 `nil`；`Match`、`ByType` 返回空 | 否 |
| 页面不是页面包 | 全部为空（实测） | 否 |
| 对非图片资源取 `.Width`/`.Height` | —— | 是：字段不存在 |
| 路径大小写 | glob 匹配不区分大小写（上游说明） | 否 |
| `Mount` | 返回资源获取器（0.140.0 起；上游示例；本站未单独实测） | 否 |
| 返回类型 | `resource.Resources`（可 `range`、可 `.ByType`、可 `.Match`） | 否 |

更多排查入口见[故障排查](/troubleshooting/)。

[`resources.ByType`]: /functions/resources/bytype/
[`resources.GetMatch`]: /functions/resources/getmatch/
[`resources.Get`]: /functions/resources/get/
[`resources.Match`]: /functions/resources/match/
[`resources`]: /functions/resources/
[glob patterns quick reference guide]: /quick-reference/glob-patterns/
