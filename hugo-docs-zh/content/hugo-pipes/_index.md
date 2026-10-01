+++
title = "Hugo Pipes"
linkTitle = "Hugo Pipes"
description = "Hugo 的资源管道，用于转换与优化资源。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/hugo-pipes/"
+++

## 本章内容

Hugo Pipes 是一组用于处理资源的函数。所谓资源（resource），是位于 `assets` 目录中，或位于通过模块挂载映射到 `assets` 目录中的文件；此外还有可从 HTTP 或 HTTPS 服务器取得的远程资源。用这些函数可以把 Sass 编译为 CSS、用 PostCSS 处理样式表、打包并转译 JavaScript，再压缩、加指纹并发布到站点。

本章各个页面分别介绍：

- [简介](/hugo-pipes/introduction/)：资源的查找、获取、复制、发布与缓存机制。
- [把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)：使用 `css.Sass` 函数与 Dart Sass。
- [PostCSS](/hugo-pipes/postcss/)：使用 `css.PostCSS` 函数与任意 PostCSS 插件。
- [JavaScript 构建](/hugo-pipes/js/)：使用 `js.Build` 函数打包、转译与压缩 JavaScript。

## 处理资源的一般步骤

无论处理哪一类资源，流程都是相同的：先取得资源，再把资源送进一条由若干函数首尾相接组成的管道链，最后把结果发布出去。

```go-html-template
{{ $style := resources.Get "sass/main.scss" | css.Sass | resources.Minify }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}">
```

上例中的竖线就是 Go 模板的管道语法，它把前一个函数的结果作为最后一个参数传给后一个函数，因此写法是从左到右依次变换。

## 取得资源

全局资源用下列方法取得：`resources.Get`、`resources.GetMatch`、`resources.Match`、`resources.ByType`。远程资源用 `resources.GetRemote` 取得。要复制已有资源，用 `resources.Copy`。若资源与某个页面打包在一起，则属于页面资源，需通过 `Page` 对象上的方法访问，详见[页面资源](/content-management/page-resources/)。

## 发布与指纹

Hugo 在调用资源的 `.Permalink`、`.RelPermalink` 或 `.Publish` 方法时把它发布到 `publishDir`（默认是 `public`）。若不想产生独立文件，可以用 `.Content` 把资源内容直接内联到页面中。生产环境通常还会追加指纹，例如 `resources.Fingerprint`，以便利用浏览器缓存并在必要时通过 `integrity` 属性做子资源完整性校验。

## 缓存与并发

Hugo Pipes 的调用以整条管道链为键进行缓存：一条管道链在同一次站点构建中只会在第一次遇到时执行，其余调用直接读取缓存结果。因此即便某个模板要执行成千上万次，也不会因此拖慢构建速度。

## 配置

与构建相关的设置位于 `[build]` 配置分类中，例如 `noJSConfigInAssets` 与 `cachebusters`；PostCSS 自身的选项则写在项目根目录的 `postcss.config.js` 一类配置文件中。若在处理样式表时希望改变资源缓存的使用时机，可留意该分类下的相关键，具体含义见[配置 Hugo](/configuration/)。
