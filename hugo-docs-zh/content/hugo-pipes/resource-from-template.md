+++
title = "从模板创建资源"
linkTitle = "从模板创建资源"
description = "把模板资源按给定上下文执行后发布。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/hugo-pipes/resource-from-template/"
+++

## 方法签名与用途

`resources.ExecuteAsTemplate` 把一个资源当作 Go 模板来解析和执行，并返回执行结果对应的资源，缓存键是目标路径：

```text
resources.ExecuteAsTemplate TARGETPATH CONTEXT RESOURCE
```

三个参数依次是目标路径、执行上下文与资源本身；目标路径同时决定发布后的位置与文件名。当调用结果的 `Publish`、`Permalink` 或 `RelPermalink` 方法时，Hugo 会把资源发布到目标路径。

## 准备模板资源

假设你想让一份 CSS 使用项目配置中的颜色值。先把模板放进 `assets` 目录：

```go-html-template
body {
  background-color: {{ site.Params.style.bg_color }};
  color: {{ site.Params.style.text_color }};
}
```

对应的项目配置如下：

```toml
[params.style]
bg_color = '#fefefe'
text_color = '#222'
```

## 在模板中执行

在 `baseof.html` 之类的模板里写：

```go-html-template
{{ with resources.Get "css/template.css" }}
  {{ with resources.ExecuteAsTemplate "css/main.css" $ . }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

这个例子做了三件事：

1. 把模板文件取回为资源；
2. 以当前页面为上下文执行这个资源；
3. 把资源发布到 `css/main.css`。

注意第二个参数传的是 `$` 而不是 `.`：进入 `with` 之后 `.` 已经被重新绑定，用 `$` 才能把模板顶层的上下文（页面模板中即当前页面）传给模板执行环节。

执行后的结果大致为：

```text
body {
  background-color: #fefefe;
  color: #222;
}
```

## 上下文与数据来源

`CONTEXT` 决定模板里能取到哪些数据，示例传入的是当前页面，因此模板中可以直接使用 `site`、`page` 等模板对象，也可以访问页面参数。若模板只依赖站点级配置，同样可以传入站点对象；只要保证模板中引用的字段在上下文中存在即可。

## 缓存与 --gc

Hugo Pipes 以整条管道链为缓存单位，`resources.ExecuteAsTemplate` 另外以目标路径作为缓存键。因此同一个目标路径在一次构建中只会执行一次：如果同一个目标路径被用于内容依赖页面上下文的模板，不同页面之间会复用同一份结果，需要为不同上下文使用不同的目标路径。

`hugo build --gc` 可在构建后清理未使用的缓存文件，详见[命令](/commands/)。生成的文件位于发布目录中，陈旧文件的清理与其他构建产物一致。

## 常见坑

- 目标路径的扩展名决定发布后的文件类型，示例发布为 `css/main.css`，浏览器据此把它当作样式表处理。
- 模板资源本身位于 `assets` 目录，不会自动发布，必须通过引用或显式调用发布方法才会出现在 `public` 中。
- 模板里的语法错误会直接导致构建失败，请按 Go 模板的要求书写动作与变量。
- 与所有管道一样，先执行模板、再做压缩与指纹，才能让最终文件与指纹、完整性值保持一致，参见[资源压缩](/hugo-pipes/minification/)与[资源指纹](/hugo-pipes/fingerprint/)。

## 相关页面

- [Hugo Pipes 简介](/hugo-pipes/)
- [从字符串创建资源](/hugo-pipes/resource-from-string/)
- [配置](/configuration/)
