+++
title = "资源打包"
linkTitle = "资源打包"
description = "把多个同类型资源拼接为一份资源并发布。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/hugo-pipes/bundling/"
+++

## 方法签名与用途

`resources.Concat` 把一个资源切片拼接为一份资源，并以目标路径作为缓存键。签名如下：

```text
resources.Concat TARGETPATH [RESOURCE...]
```

返回值类型是 `resource.Resource`，因此拼接结果可以继续接入 Hugo Pipes 的其他环节。切片中的每个资源必须具有相同的媒体类型；媒体类型不同的资源不能拼接在一起。

## 基本用法

先用 `resources.Get` 从 `assets` 目录取回资源，再用 `slice` 组成切片传给 `resources.Concat`：

```go-html-template
{{ $plugins := resources.Get "js/plugins.js" }}
{{ $global := resources.Get "js/global.js" }}
{{ $js := slice $plugins $global | resources.Concat "js/bundle.js" }}
```

拼接后的内容顺序与切片中资源的顺序一致，所以要根据依赖关系安排 `slice` 的参数次序，例如先放第三方库，再放站点自身的脚本。

## 与压缩、指纹组合

拼接结果仍是资源对象，可以接着做压缩与指纹：

```go-html-template
{{ $reset := resources.Get "css/reset.css" }}
{{ $main := resources.Get "css/main.css" }}
{{ $css := slice $reset $main | resources.Concat "css/bundle.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" crossorigin="anonymous">
```

压缩与指纹的含义分别见[资源压缩](/hugo-pipes/minification/)与[资源指纹](/hugo-pipes/fingerprint/)，本节只讨论拼接环节。

## 发布时机

拼接结果不会自动写入 `public` 目录。只有调用它的 `Publish`、`Permalink` 或 `RelPermalink` 方法时，Hugo 才会把资源发布到目标路径。因此模板中至少要引用一次结果，例如把 `RelPermalink` 放进 `link` 或 `script` 标签。若想直接把内容内联进页面，可以改用 `.Content`。

## 缓存与 --gc

Hugo Pipes 以整条管道链为缓存单位：同一条链在一次站点构建中只执行一次，其余调用直接读取缓存；`resources.Concat` 另外用目标路径作为缓存键。所以同一个目标路径的拼接结果会被复用，适合在多个模板中引用同一份打包资源。

构建时可以用 `hugo build --gc` 在构建完成后清理未使用的缓存文件，减小缓存目录体积。目标目录中的陈旧文件属于另一类问题，需要通过清理发布目录的参数处理，详见[命令](/commands/)与[基本用法](/getting-started/basic-usage/)。

## 常见坑

- 媒体类型必须一致。把 CSS 与 JS 拼进同一份资源不会得到可用结果，应按类型分别打包。
- 目标路径既是缓存键，也是最终的发布路径。建议让一个目标路径只对应一种拼接组合，避免同一路径被用于内容不同的资源列表。
- 资源不存在时 `resources.Get` 会返回空值，直接参与拼接会出错，可以先用 `with` 判断资源是否存在。
- 拼接只是文本层面的连接，不会自动补分号或换行。如果某个源文件末尾缺少换行，拼接后可能与下一个文件粘连出错，请检查源文件。

## 相关页面

- [Hugo Pipes 简介](/hugo-pipes/)
- [资源压缩](/hugo-pipes/minification/)
- [资源指纹](/hugo-pipes/fingerprint/)
