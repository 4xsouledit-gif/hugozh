+++
title = "简介"
linkTitle = "简介"
description = "介绍资源的查找与获取、资产目录、资源发布、管道写法与缓存。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/hugo-pipes/introduction/"
+++

## 在 assets 中查找资源

这里讨论的是全局资源与远程资源：

全局资源
: `assets` 目录中的文件，或位于任何挂载到 `assets` 目录的目录中的文件。

远程资源
: 位于远程服务器上、可通过 HTTP 或 HTTPS 访问的文件。

若资源的作用域属于某个 `Page`，请参阅[页面资源](/content-management/page-resources/)一节。

## 取得资源

要用 Hugo Pipes 处理一个资源，必须先把它取出来。

对于全局资源，使用：

- `resources.ByType`
- `resources.Get`
- `resources.GetMatch`
- `resources.Match`

对于远程资源，使用：

- `resources.GetRemote`

## 复制资源

请使用 `resources.Copy` 函数。

## 资产目录

资源文件必须存放在资产目录中。该目录默认为 `assets`，可通过配置文件的 `assetDir` 键修改。

## 资源发布

当你调用 `.Permalink`、`.RelPermalink` 或 `.Publish` 时，Hugo 会把资源发布到 `publishDir`（通常是 `public`）。你也可以用 `.Content` 把资源内容内联到输出中。

## Go 管道

为了便于阅读，本文档中的 Hugo Pipes 示例使用 Go 管道写法：

```go-html-template
{{ $style := resources.Get "sass/main.scss" | css.Sass | resources.Minify | resources.Fingerprint }}
<link rel="stylesheet" href="{{ $style.Permalink }}">
```

## 缓存

Hugo Pipes 的每次调用都以整条*管道链*为键进行缓存。一条管道链的例子是：

```go-html-template
{{ $mainJs := resources.Get "js/main.js" | js.Build "main.js" | minify | fingerprint }}
```

一条管道链在同一次站点构建中只会于第一次遇到时执行，其余情况都从缓存读取结果。因此，即便某个模板要被执行成千上万次，Hugo Pipes 也不会对构建速度造成负面影响。
