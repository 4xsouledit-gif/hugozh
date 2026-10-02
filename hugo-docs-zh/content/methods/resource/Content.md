+++
title = "Content"
linkTitle = "Content"
description = "返回给定资源的内容。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/resource/content/"

[params.functions_and_methods]
signatures = ["RESOURCE.Content"]
returnType = "any"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

资源不只是「一个 URL」：`assets/` 里的 CSS、JS、文本、图片，乃至页面包里写成 `.md` 的片段，内容本身经常要**嵌进当前页面**，而不是让浏览器再发一次请求。`Content` 就是「把资源当字符串读出来」的入口——读出原始字节，交给 `len`、`base64Encode`、`safeCSS`、`safeJS` 之类的函数继续处理。

[资源类型][]为 `page` 时，`Resource` 对象上的 `Content` 方法返回 `template.HTML`，否则返回 `string`。

## 什么时候用，什么时候别用

**该用**：

- 把关键 CSS / JS **内联**进 HTML，减少一次阻塞请求；
- 把很小的图片转成 **data URI**（`base64Encode`）嵌进页面；
- 统计文本资源的**字节数**（`{{ .Content | len }}`，不是字符数）；
- 读取页面包里 `_xxx.md` 这类**页面资源**的正文，拼进当前页（此时返回 `template.HTML`，会按 HTML 处理）。

**别用**：

- 只是想让浏览器单独请求该资源 → 用 [`RelPermalink`](/methods/resource/relpermalink/) 或 [`Permalink`](/methods/resource/permalink/)；
- 资源是图片且需要缩放/裁剪/转格式 → 用 [`Resize`](/methods/resource/resize/)、[`Process`](/methods/resource/process/) 等；`Content` 拿到的永远是**原图字节**；
- 想把 YAML/JSON/TOML 资源解析成数据结构 → 用 [`transform.Unmarshal`](/functions/transform/unmarshal/)（可以先把 `resources.Get` 的结果交给它）；
- 想在模板里拼字符串 → 直接用 `printf`，没必要借资源绕一圈。

## 用法

上游示例假设 `assets/quotations/kipling.txt` 的内容是：

```text {file="assets/quotations/kipling.txt"}
He travels the fastest who travels alone.
```

要取得内容：

```go-html-template
{{ with resources.Get "quotations/kipling.txt" }}
  {{ .Content }} → He travels the fastest who travels alone.
{{ end }}
```

要取得以字节为单位的大小：

```go-html-template
{{ with resources.Get "quotations/kipling.txt" }}
  {{ .Content | len }} → 42
{{ end }}
```

要创建内联图像：

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  <img src="data:{{ .MediaType.Type }};base64,{{ .Content | base64Encode }}">
{{ end }}
```

要创建内联 CSS：

```go-html-template
{{ with resources.Get "css/style.css" }}
  <style>{{ .Content | safeCSS }}</style>
{{ end }}
```

要创建内联 JavaScript：

```go-html-template
{{ with resources.Get "js/script.js" }}
  <script>{{ .Content | safeJS }}</script>
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。`assets/css/style.css` 内容为 `body { color: #222; }` 加一个换行；`assets/js/script.js` 内容为 `console.log('hello');` 加一个换行；`assets/quotations/kipling.txt` 共 42 字节（含结尾换行）。把下面这段放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "css/style.css" }}
<style>{{ .Content | safeCSS }}</style>
{{ end }}
{{ with resources.Get "js/script.js" }}
<script>{{ .Content | safeJS }}</script>
{{ end }}
{{ with resources.Get "quotations/kipling.txt" }}
<p>字节数：{{ .Content | len }}</p>
{{ end }}
```

Hugo 渲染为（资源自带的结尾换行会原样输出，模板换行产生的空行此处省略）：

```html
<style>body { color: #222; }
</style>
<script>console.log('hello');
</script>
<p>字节数：42</p>
```

**你应当看到什么**：`<script>` 里的引号**没有**被转义成 `&#39;`，因为 `safeJS` 告诉 Hugo「这段内容已经是安全的 JS」；不写 `safeJS` 时引号会被转义，内联脚本就会坏掉。同理，内联 CSS 必须经过 `safeCSS`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 文本资源（`text/plain`） | `string`，原样字节 | 否 |
| 图像资源 | `string`，二进制内容（可 `base64Encode`） | 否 |
| CSS / JS 资源 | `string` | 否 |
| 页面资源（[资源类型][] 为 `page`） | `template.HTML` | 否 |
| 空文件 | 空字符串，`len` 为 `0` | 否 |
| `resources.Get` 找不到文件（资源为 `nil`） | —— | 是：`nil pointer evaluating resource.Resource.Content` |
| 远程资源 | 同全局资源；但需要联网，本站未实测 | —— |

> [!NOTE]
> `.Content | len` 得到的是**字节数**，不是字符数。中文文本一个字通常占 3 字节（UTF-8），所以 42 个字符与 42 字节完全是两回事；要数字符请用 `strings.CountRunes`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 内联的 JS 在浏览器里报语法错误 | 没经 `safeJS`，引号被转义成 `&#39;` | `{{ .Content | safeJS }}` |
| 没报错但结果不对 | 内联 CSS 多了 `&quot;` 之类实体 | 没经 `safeCSS` | `{{ .Content | safeCSS }}` |
| 没报错但结果不对 | 页面包里 `_xxx.md` 的内容被当成纯文本 | 那是 `template.HTML`，直接 `{{ .Content }}` 即可；不要再用 `markdownify` | 去掉多余的 `markdownify` |
| 报错看不懂 | `nil pointer evaluating resource.Resource.Content` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住，或纠正路径大小写 |
| 报错看不懂 | `error calling GetRemote: …` | 远程资源需要网络，且受 `security.http` 白名单限制 | 用 `try` 包住并读 `.Err` |

更多排查入口见[故障排查](/troubleshooting/)。

[资源类型]: /methods/resource/resourcetype/
