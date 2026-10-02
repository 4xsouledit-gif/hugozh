+++
title = "resources.Concat"
linkTitle = "Concat"
description = "返回拼接后的资源切片。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/resources/concat/"

[params.functions_and_methods]
signatures = ["resources.Concat TARGETPATH [RESOURCE...]"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

站点有多个 CSS／JS 小文件（插件、全局脚本、页脚脚本），浏览器要为每一个发一次请求。把它们合成一个文件，请求数就降下来了——这是最基础的性能优化之一。

`resources.Concat` 接收一个资源切片，按目标路径把它们拼成一个资源并缓存结果（目标路径就是缓存键）。它常与 [`resources.Minify`](/functions/resources/minify/) 和 [`resources.Fingerprint`](/functions/resources/fingerprint/) 组成「打包 + 压缩 + 指纹」三连。

## 什么时候用，什么时候别用

**该用**：

- 多个**同类型**资源要合并发布（多 CSS、多 JS）；
- 想按条件拼装：开发环境分开、生产环境合并。

**别用**：

- 类型不同 → 实测会报错：`resources in Concat must be of the same Media Type, got "text/css" and "text/javascript"`；
- 想合并**页面资源**与全局资源之外的东西（如远程资源）→ 理论上都行（上游说该函数可用于全局、页面与远程资源），但混用不同来源时更易踩缓存键的坑；
- 现代 HTTP/2 环境下请求数不再是主要瓶颈 → 若已经在用 HTTP/2 且文件不大，合并的收益有限，别为它牺牲按需加载。

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`resources.Concat` 函数返回拼接后的资源切片，并以目标路径作为缓存键缓存结果。每个资源必须具有相同的媒体类型。

调用资源的 [`Publish`][]、[`Permalink`][] 或 [`RelPermalink`][] 方法时，Hugo 会把该资源发布到目标路径。

```go-html-template
{{ $plugins := resources.Get "js/plugins.js" }}
{{ $global := resources.Get "js/global.js" }}
{{ $js := slice $plugins $global | resources.Concat "js/bundle.js" }}
```

## 完整示例：把两个 JS 文件合并成一个

`assets/js/plugins.js` 与 `assets/js/global.js` 各有一个函数：

```go-html-template {file="layouts/_partials/bundle.html"}
{{ $plugins := resources.Get "js/plugins.js" }}
{{ $global := resources.Get "js/global.js" }}
{{ with slice $plugins $global | resources.Concat "js/bundle.js" }}
  <p>{{ .RelPermalink }}（{{ len .Content }} 字节）</p>
  <pre>{{ .Content }}</pre>
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>/js/bundle.js（104 字节）</p>
<pre>// plugins.js
function pluginOne() {
  return 1;
}

;
// global.js
function globalOne() {
  return 2;
}
</pre>
```

**你应当看到什么**：两个文件被拼进同一个资源，产物路径正是你给的 `TARGETPATH`（`/js/bundle.js`）。注意拼接处 Hugo 会补一个换行与一个 `;`——这是为「上一个文件没有以分号结尾」兜底，避免两个 IIFE 粘在一起变成语法错误。**这也意味着你给的目标扩展名必须与实际类型一致**，否则浏览器会按错误的 MIME 解析。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 两个 `.js` 资源拼接 | 返回单个资源；`.RelPermalink` = `/js/bundle.js`，实测长度 104 字节 | 否 |
| 两个资源之间 | 自动插入换行与 `;`（实测内容见上） | 否 |
| 不同媒体类型（`.js` + `.css`） | —— | 是：`error calling Concat: resources in Concat must be of the same Media Type, got "text/css" and "text/javascript"` |
| 空切片 | 上游未说明；用 `with` 兜住即可 | 视写法 |
| 调用结果的 `.RelPermalink`／`.Publish` | 会把合并结果发布到 `TARGETPATH` | 否 |
| 返回类型 | `resource.Resource` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `resources in Concat must be of the same Media Type` | 把 CSS 与 JS 放进同一个切片 | 分别 concat 成两个文件；或在切片里只放同类型资源 |
| 没报错但结果不对 | 浏览器把合并文件当纯文本，控制台报 MIME 错误 | `TARGETPATH` 的扩展名与实际类型不一致 | 让扩展名匹配内容（JS 用 `.js`、CSS 用 `.css`） |
| 没报错但结果不对 | 合并后某个脚本报 `SyntaxError` | 源文件依赖被单独加载（如 `import`／`export`），合并后语义变了 | 用 `js.Build` 打包 ES 模块，而不是简单 concat |
| 没报错但结果不对 | 合并结果被复用成了旧内容 | 目标路径是缓存键，内容变了但路径没变 | 接上 `fingerprint`，或改变量内容后清理缓存 |
| 没报错但结果不对 | 页面里 `$plugins` 为空导致拼出空文件 | `resources.Get` 未命中返回 `nil` | 对每个来源先用 `with` 检查，或用 `resources.Match` 保证有内容 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Permalink`]: /methods/resource/permalink/
[`Publish`]: /methods/resource/publish/
[`RelPermalink`]: /methods/resource/relpermalink/
