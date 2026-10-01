+++
title = "资源压缩"
linkTitle = "资源压缩"
description = "压缩 CSS、JS、JSON、HTML、SVG 与 XML 资源。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/hugo-pipes/minification/"
+++

## 方法签名与用途

`resources.Minify` 返回给定资源的最小化版本，参数就是资源对象：

```text
resources.Minify RESOURCE
```

它还有一个别名 `minify`，这也是管道写法中最常用的形式。两者完全等价：

```go-html-template
{{ $css := resources.Get "css/main.css" }}
{{ $style := $css | minify }}
```

返回值类型同样是 `resource.Resource`。可以压缩的资源类型为 CSS、JS、JSON、HTML、SVG 与 XML，其他类型不在支持范围内。

## 链式调用示例

最小化通常紧跟在构建或拼接之后、指纹之前：

```go-html-template
{{ $main := resources.Get "css/main.scss" | css.Sass }}
{{ $style := $main | minify | fingerprint }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}" integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous">
```

由字符串生成的资源也可以压缩，适合把少量样式直接内联到页面里：

```go-html-template
{{ $content := printf "body{color:%s}" site.Params.color }}
{{ $r := resources.FromString "css/inline.css" $content | minify }}
<link rel="stylesheet" href="{{ $r.RelPermalink }}">
```

## 发布时机

和其他 Hugo Pipes 的产物一样，压缩结果在你调用 `Publish`、`Permalink` 或 `RelPermalink` 时才会发布到 `public` 目录；不想生成文件而要把结果直接写进页面时，使用 `.Content`。

## 缓存与 --gc

Hugo Pipes 以整条管道链为缓存单位。同一条链在一次构建中只执行一次，之后都命中缓存，因此压缩虽然要消耗计算，但并不会随模板执行次数线性增长。链越长，首次执行的代价越高，这也是把构建、压缩、指纹放在同一条链里即可的原因。

`hugo build --gc` 会在构建完成后清理未使用的缓存文件。完整参数说明见[命令](/commands/)。

## 常见坑

- 不要对已经是压缩产物的资源重复压缩。重复调用不会带来收益，只会让管道更长、更难阅读；压缩在源头做一次即可。
- 压缩只适用于上游列出的文本类型。图片等二进制资源没有“最小化”这一步，需要处理它们时应使用图像处理能力，参见[内容管理](/content-management/)。
- 压缩会改动注释与空白。如果压缩后样式或脚本表现异常，先检查源文件是否依赖注释或空白，例如用注释充当分隔、或依赖自动分号插入的写法。
- 压缩与指纹是两件事：压缩改变内容，指纹改变文件名并生成完整性值。顺序上先压缩、后指纹，指纹才能反映最终发布出去的内容。

## 相关页面

- [Hugo Pipes 简介](/hugo-pipes/)
- [资源打包](/hugo-pipes/bundling/)
- [资源指纹](/hugo-pipes/fingerprint/)
