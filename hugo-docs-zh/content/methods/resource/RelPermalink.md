+++
title = "RelPermalink"
linkTitle = "RelPermalink"
description = "返回给定资源的相对永久链接，并在返回过程中发布该资源。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/resource/relpermalink/"

[params.functions_and_methods]
signatures = ["RESOURCE.RelPermalink"]
returnType = "string"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

`Resource` 对象上的 `Permalink` 方法把资源写入发布目录（通常是 `public`），并返回其[relative permalink](g)（相对永久链接）——从站点根目录开始、**不含域名**的路径，例如 `/images/a.jpg`。

这是模板里出现频率最高的资源方法：所有站内的 `<img src>`、`<a href>`、CSS `url()`、`srcset` 都应该用它。相对路径让站点在本地预览、子路径部署、换域名时都不用改模板。

> [!NOTE]
> 与 [`Permalink`](/methods/resource/permalink/) 一样，调用它就会**发布资源**到 `public/`，即使你只是想拼一个字符串。

## 什么时候用，什么时候别用

**该用**：

- 站内引用资源：`<img src>`、`<a href>`、`<video poster>`、CSS/JS 的 `url()` 与 `src`；
- 生成 `srcset`：多个尺寸各取各自处理结果的 `RelPermalink`；
- 给浏览器缓存打 key：处理后的 URL 自带 `_hu_` 哈希段，换规格就会换 URL。

**别用**：

- 需要**绝对 URL**（RSS、社交卡片、结构化数据、邮件）→ 用 [`Permalink`](/methods/resource/permalink/)；
- 需要文件系统路径 → 模板里拿不到，只能拿 URL；
- 想让资源**不被发布**、只做中间产物 → 别调用 `RelPermalink`/`Permalink`/`Publish`，把处理链留在变量里即可。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点，`baseURL = 'https://example.org/'`；`assets/images/original.jpg` 是 600×400 的全局资源，页面包 `content/bundle/` 里有 `a.jpg`。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <p>原图：{{ .RelPermalink }}</p>
  {{ with .Resize "300x" }}
    <p>缩放后：{{ .RelPermalink }}（{{ .Width }}×{{ .Height }}）</p>
  {{ end }}
{{ end }}
{{ with .Resources.Get "a.jpg" }}
  <p>页面资源：{{ .RelPermalink }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>原图：/images/original.jpg</p>
<p>缩放后：/images/original_hu_9212e116504f6856.jpg（300×200）</p>
<p>页面资源：/bundle/a.jpg</p>
```

**你应当看到什么**：

- 未处理的资源，URL 就是原路径；
- 处理后的资源，URL 里插入了 `_hu_<哈希>` 段——**同一个源文件、同一个规格，哈希稳定不变**，所以适合长期做缓存键；
- 页面资源的 URL 跟随页面包的位置（`/bundle/a.jpg`），而不是页面 URL 的别名；
- 构建后 `public/` 下这三个文件都真实存在。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 全局资源 | 站点根相对路径，实测 `/images/original.jpg` | 否 |
| 处理后的资源 | 含 `_hu_` 哈希段，实测 `/images/original_hu_9212e116504f6856.jpg` | 否 |
| 页面资源 | 跟随页面包路径，实测 `/bundle/a.jpg` | 否 |
| `baseURL` 带子路径（如 `https://example.org/docs/`） | 上游未说明相对链接是否会带上该子路径；本站未实测 | —— |
| 远程资源 | 需联网；本站未实测（受 `security.http` 白名单限制） | —— |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.RelPermalink` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 复制到线上后图片 404 | 手写了 `/images/a.jpg` 而文件其实经过处理，真名带 `_hu_` 哈希 | 一律用 `.RelPermalink` 输出，不要拼路径 |
| 没报错但结果不对 | 换了个 `Resize` 尺寸，浏览器还用旧缓存 | 规格变了、URL 也变了，这是预期行为；但如果只改了源文件内容，Hugo 也会生成新哈希 | 确认构建后 HTML 里是新 URL |
| 没报错但结果不对 | 页面里出现重复的多份大图 | 对同一规格反复处理会命中同一缓存，不会重复发布；重复的是你写了多个不同规格 | 把处理结果存进变量复用 |
| 报错看不懂 | `nil pointer evaluating resource.Resource.RelPermalink` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住，并检查路径大小写 |

更多排查入口见[故障排查](/troubleshooting/)。
