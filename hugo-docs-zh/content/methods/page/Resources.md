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

`Page` 对象上的 `Resources` 方法返回页面资源的集合。页面资源是[页面包](g)中的文件。

要处理全局资源或远程资源，请参见 [`resources`][] 函数。

## 方法

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

## 模式匹配

使用 `GetMatch` 和 `Match` 方法时，Hugo 会按不区分大小写的 [glob 模式](g)来判断是否匹配。语法规则和示例请参见 [glob 模式速查指南][]。

[`resources.ByType`]: /functions/resources/bytype/
[`resources.GetMatch`]: /functions/resources/getmatch/
[`resources.Get`]: /functions/resources/get/
[`resources.Match`]: /functions/resources/match/
[`resources`]: /functions/resources/
[glob patterns quick reference guide]: /quick-reference/glob-patterns/
