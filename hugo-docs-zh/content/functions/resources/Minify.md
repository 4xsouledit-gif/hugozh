+++
title = "resources.Minify"
linkTitle = "Minify"
description = "返回给定资源压缩后的版本。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/functions/resources/minify/"

[params.functions_and_methods]
signatures = ["resources.Minify RESOURCE"]
returnType = "resource.Resource"
aliases = ["minify"]
+++

## 这一页解决什么问题

CSS 与 JS 文件里的注释、缩进、换行对浏览器没用，却占流量。Hugo Pipes 里的 `minify` 把资源内容压缩后返回一个新的资源对象：文件名会带上 `.min`，`.Content` 是压缩后的内容，`.RelPermalink` 指向压缩后的文件。

它是「发布前加工」链路里最常放在第一位的一步，通常后面接 [`resources.Fingerprint`](/functions/resources/fingerprint/)。

## 什么时候用，什么时候别用

**该用**：

- 要发布自己维护的 CSS／JS／JSON／HTML／SVG／XML，想减小体积；
- 已开启 `[minify]` 之外还想对**资源管道里的文件**单独压缩（站点级 minify 作用于最终 HTML，管道 minify 作用于资源）。

**别用**：

- 文件类型不在支持列表里 → 实测对 JPEG 调用 `minify` 后**读取内容时**会失败：`MINIFY: failed to transform "/images/a.jpg" (image/jpeg): minifier does not exist for mimetype`；
- 文件已经是压缩过的第三方产物（`.min.js`）→ 再压一遍收益很小，还会让上游 sourcemap 对不上；
- 想合并多个文件 → 先 [`resources.Concat`](/functions/resources/concat/) 再 minify。

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

```go-html-template
{{ $css := resources.Get "css/main.css" }}
{{ $style := $css | minify }}
```

任何 CSS、JS、JSON、HTML、SVG 或 XML 资源都可以用 resources.Minify 压缩，它以资源对象为参数。

## 完整示例：压缩首页样式表

`assets/css/main.css` 内容为：

```css
/* teach demo stylesheet */
body {
  margin: 0;
  color: #222;
}
```

```go-html-template {file="layouts/_partials/minify-demo.html"}
{{ with resources.Get "css/main.css" }}
  {{ $min := . | minify }}
  <p>原文件：{{ .RelPermalink }}</p>
  <p>压缩后：{{ $min.RelPermalink }}</p>
  <pre>{{ $min.Content }}</pre>
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>原文件：/css/main.css</p>
<p>压缩后：/css/main.min.css</p>
<pre>body{margin:0;color:#222}</pre>
```

**你应当看到什么**：注释、缩进、换行都被去掉，`.RelPermalink` 从 `/css/main.css` 变成 `/css/main.min.css`。压缩结果**没有**改变含义，但会去掉结尾换行——如果你的测试断言依赖原文格式，记得同步调整。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| CSS 资源 | 返回压缩后的资源，`.RelPermalink` 带 `.min`，`.Content` 为压缩内容 | 否 |
| `.Content` 的内容 | 实测 `body{margin:0;color:#222}`（无结尾换行） | 否 |
| 对 JPEG 调用 `minify` | 调用本身不报错；**读取 `.Content`／`.RelPermalink` 时**失败 | 是：`MINIFY: failed to transform "/images/a.jpg" (image/jpeg): minifier does not exist for mimetype` |
| 对空资源／不存在的资源 | `resources.Get` 返回 `nil`，管道会得到 `nil`（用 `with` 兜住） | 视写法 |
| 返回类型 | `resource.Resource`（可继续接 `fingerprint`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `minifier does not exist for mimetype` | 对不支持的类型（图片、字体等）做了 minify | 只对 CSS/JS/JSON/HTML/SVG/XML 使用；其它类型直接输出 |
| 没报错但结果不对 | 页面引用的还是未压缩文件 | 只 `minify` 了却没输出 `.RelPermalink` | 把管道结果赋给变量并输出其 `.RelPermalink`，或加 `resources.Publish` |
| 没报错但结果不对 | 压缩后 CSS 里出现语法错误 | 少数手写 CSS 依赖了「多余」的空格（如 `calc` 表达式、选择器间的注释） | 压缩前后对同一页面做视觉对比；必要时调整源文件写法 |
| 没报错但结果不对 | 构建产物里出现两个文件（`x.css` 与 `x.min.css`） | `.RelPermalink` 会发布资源，另有别处引用了原文件 | 统一只引用压缩后的路径 |

更多排查入口见[故障排查](/troubleshooting/)。
