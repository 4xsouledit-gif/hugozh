+++
title = "Permalink"
linkTitle = "Permalink"
description = "返回给定资源的永久链接，并在返回过程中发布该资源。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/resource/permalink/"

[params.functions_and_methods]
signatures = ["RESOURCE.Permalink"]
returnType = "string"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

`Resource` 对象上的 `Permalink` 方法把资源写入发布目录（通常是 `public`），并返回其[permalink](g)（永久链接）——也就是**带域名和协议的绝对 URL**。

它解决的是「站外需要完整地址」的场景：RSS/Atom 里的 `<enclosure>`、`og:image`、JSON-LD、结构化数据、邮件模板、给别的站点引用的图片地址。这些地方只写 `/images/a.jpg` 是不合法的，必须是 `https://example.org/images/a.jpg`。

> [!NOTE]
> 这个方法有**副作用**：只要调用就会把资源发布到 `public/`，即使你只是想拼一个字符串。不想要返回值、只想发布时，用 [`Publish`](/methods/resource/publish/) 更清楚。

## 什么时候用，什么时候别用

**该用**：

- 需要**绝对 URL**：社交卡片、结构化数据、RSS/Atom、站点地图、邮件；
- 需要确认某个资源一定会被发布（例如 `resources.FromString` 造出来的文件）；
- 与 [`RelPermalink`](/methods/resource/relpermalink/) 对照调试：两者只差一个 `baseURL` 前缀。

**别用**：

- 站内 `<a href>` / `<img src>` → 用 [`RelPermalink`](/methods/resource/relpermalink/)；写绝对 URL 会让本地预览和更换域名都变麻烦；
- 只想要文件系统路径 → 没有对应方法；模板里能拿到的就是 URL（需要落地路径时，用 `publishDir` 与 `RelPermalink` 自己拼）；
- 资源是图片且要做处理 → 先 `Resize`/`Process`，再对**处理结果**调用 `Permalink`，否则发布的是原图。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点，`hugo.toml` 里 `baseURL = 'https://example.org/'`；`assets/images/original.jpg` 是全局资源，页面包 `content/bundle/` 里有 `a.jpg`。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <p>全局资源：{{ .Permalink }}</p>
{{ end }}
{{ with .Resources.Get "a.jpg" }}
  <p>页面资源：{{ .Permalink }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>全局资源：https://example.org/images/original.jpg</p>
<p>页面资源：https://example.org/bundle/a.jpg</p>
```

**你应当看到什么**：两行都是**完整 URL**（协议 + `baseURL` 的域名 + 路径）。构建完成后，`public/images/original.jpg` 与 `public/bundle/a.jpg` 都真实存在——发布是调用它的直接结果。

对处理后的资源调用时，URL 里会带上 `_hu_` 哈希段，例如：

```text
{{ with resources.Get "images/original.jpg" }}{{ with .Resize "300x" }}{{ .Permalink }}{{ end }}{{ end }}
→ https://example.org/images/original_hu_9212e116504f6856.jpg
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 全局资源 | 绝对 URL，实测 `https://example.org/images/original.jpg` | 否 |
| 页面资源 | 绝对 URL，实测 `https://example.org/bundle/a.jpg` | 否 |
| 处理后的资源 | 绝对 URL，含 `_hu_` 哈希段 | 否 |
| `baseURL` 以子路径结尾（如 `https://example.org/docs/`） | URL 会带上该子路径前缀 | 否 |
| `baseURL` 未设置或为相对值 | URL 的形态由 `baseURL` 决定；上游未说明各种取值的具体结果 | —— |
| 远程资源 | 需联网；本站未实测（受 `security.http` 白名单限制） | —— |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Permalink` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 本地预览时链接跳到 `https://example.org` | 用了 `Permalink`，它带 `baseURL` | 站内链接一律用 `RelPermalink` |
| 没报错但结果不对 | 换域名后分享卡片的图挂了 | 旧页面里的 URL 被静态生成时固化了 | 这是预期的：`Permalink` 就是构建时快照，重新构建即可 |
| 没报错但结果不对 | 想「只拿字符串」，`public/` 里却多出文件 | `Permalink` 的语义包含发布 | 接受该副作用；只发布不取值改用 [`Publish`](/methods/resource/publish/) |
| 报错看不懂 | `nil pointer evaluating resource.Resource.Permalink` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住，并检查路径大小写 |

更多排查入口见[故障排查](/troubleshooting/)。
