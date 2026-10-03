+++
title = "resources.Fingerprint"
linkTitle = "Fingerprint"
description = "返回带指纹的资源，它由给定资源的内容做密码学哈希得到。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/resources/fingerprint/"

[params.functions_and_methods]
signatures = ["resources.Fingerprint [ALGORITHM] RESOURCE"]
returnType = "resource.Resource"
aliases = ["fingerprint"]
+++

## 这一页解决什么问题

浏览器会缓存 `/css/main.css`。你改了样式并重新部署，访问者仍然看到旧样式——因为 URL 没变。经典解法是**给文件名加上内容哈希指纹**：内容一变，URL 就变，浏览器自然会重新下载；内容不变则缓存继续命中。

`fingerprint` 做的正是这件事：返回一个带哈希的新资源，并额外提供 [Subresource Integrity][]（SRI）值，可以用在 `<script integrity>`／`<link integrity>` 上。

## 什么时候用，什么时候别用

**该用**：

- 发布 CSS／JS／图片等静态资源，想要「长期缓存 + 内容变更即失效」；
- 需要 SRI 校验（`integrity` 属性）来保证 CDN 上的文件没被篡改。

**别用**：

- 资源路径本身已经带版本号，且不需要 SRI → 指纹只是多一层；
- 想压缩体积 → 用 [`resources.Minify`](/functions/resources/minify/)，指纹不改变内容大小；
- 资源是**每次构建都会变**的（例如内嵌了 `now`）→ 指纹每次都变，缓存永远不命中，需要重新考虑设计。

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{ with . | fingerprint "sha256" }}
    <script src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
  {{ end }}
{{ end }}
```

Hugo 渲染出的结果大致如下：

```html
<script src="/js/main.62e...df1.js" integrity="sha256-Yuh...rfE=" crossorigin="anonymous"></script>
```

尽管 `resources.Fingerprint` 函数最常用于 CSS 与 JavaScript 资源，但任何类型的资源都可以使用它。

哈希算法可以是 `md5`、`sha256`（默认）、`sha384` 或 `sha512` 之一。

对资源内容做密码学哈希之后：

1. `Permalink` 与 `RelPermalink` 方法返回的值包含哈希和
1. 资源的 `.Data.Integrity` 方法返回一个[子资源完整性][]（SRI）值，由哈希算法名、一个连字符以及 base64 编码的哈希和组成

## 完整示例：给 main.js 加指纹并输出 SRI

`assets/js/main.js` 的内容是：

```js
// main.js
console.log("teach demo");
```

```go-html-template {file="layouts/_partials/scripts.html"}
{{ with resources.Get "js/main.js" }}
  {{ with . | fingerprint "sha256" }}
    <script src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为（哈希值只取决于文件内容，你可以自己复算）：

```html
<script src="/js/main.ca9597f39abff59dd57ded60b89d69f6dbf79665b5a8a1f584169a08f4bafe8c.js" integrity="sha256-ypWX85q/9Z3Vfe1guJ1p9tv3lmW1qKH1hBaaCPS6/ow=" crossorigin="anonymous"></script>
```

**你应当看到什么**：

- 文件名里插入了 **64 位十六进制**的 sha256 值（上游示例把它缩写成 `62e...df1` 只为排版，实际是完整哈希）；
- `integrity` 是 `sha256-` 加 base64；两者都是同一份内容的哈希，只是编码不同；
- 改一个字节，这两个值都会变——这正是缓存失效的依据。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`assets/js/main.js` 为上面那段两行注释 + 一行 `console.log`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `fingerprint "sha256"` | `.RelPermalink` = `/js/main.ca9597…afe8c.js`；`.Data.Integrity` = `sha256-ypWX85q/9Z3Vfe1guJ1p9tv3lmW1qKH1hBaaCPS6/ow=` | 否 |
| 不写算法 `\| fingerprint` | 与 `sha256` 相同（默认算法） | 否 |
| `fingerprint "md5"` | `.Data.Integrity` = `md5-vyk3cwmF1jgd437Zt/S0nA==` | 否 |
| 算法拼错（如 `"sha1"`） | 调用本身不报错；**读取 `.RelPermalink`／`.Content` 时**失败 | 是：`FINGERPRINT: failed to transform "/js/main.js" (text/javascript): unsupported hash algorithm: "sha1", use either md5, sha256, sha384 or sha512` |
| 对**未指纹**的资源取 `.Data.Integrity` | 空值（实测 `{{ .Data.Integrity }}` 输出为空） | 否 |
| 哈希值出现在 `integrity` 属性里 | base64 中的 `+` 会被 HTML 实体化为 `&#43;`（浏览器解码后相同），不影响 SRI | 否 |
| 返回类型 | `resource.Resource` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 改了文件，产物文件名没变 | 改的不是被指纹的那个路径，或命中了构建缓存 | 确认路径；用 `hugo --ignoreCache` 复核 |
| 报错看不懂 | `unsupported hash algorithm: "sha1"` | 用了不在列表里的算法（SRI 规范也只支持 sha256/384/512） | 改用 `md5`、`sha256`、`sha384`、`sha512` 之一；SRI 场景用 sha256 及以上 |
| 没报错但结果不对 | 页面报 SRI 校验失败 | `integrity` 与 `src` 指的不是同一份内容（例如指纹后再 minify） | 先 `minify` 再 `fingerprint`，且两者用同一个变量 |
| 没报错但结果不对 | 复制出来的 integrity 值多出 `&#43;` | HTML 属性实体化，浏览器正常解码 | 若要把值写进配置或比对，记得先解码实体 |
| 没报错但结果不对 | 每个构建的哈希都不同 | 资源内容里含 `now` 之类动态值 | 让被指纹的文件内容保持确定 |

更多排查入口见[故障排查](/troubleshooting/)。

[Subresource Integrity]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
[子资源完整性]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
