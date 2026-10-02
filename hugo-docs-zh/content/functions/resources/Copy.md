+++
title = "resources.Copy"
linkTitle = "Copy"
description = "返回给定资源在目标路径上的副本。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/resources/copy/"

[params.functions_and_methods]
signatures = ["resources.Copy TARGETPATH RESOURCE"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

`assets/` 里的文件名通常是给开发者看的：`a.jpg`、`hero-final-v2.png`。发布出去的地址却不该这么随意——它影响 SEO、社交分享与统计。`resources.Copy` 让你在**不复制磁盘文件**的前提下，给一个资源指定新的发布路径（还可以顺带改变发布目录结构）。

它也可以给**同一个资源**生成多个路径，例如让一张图同时以 `/og/cover.jpg` 和 `/img/cover.jpg` 发布。

## 什么时候用，什么时候别用

**该用**：

- 想让发布路径与源文件名解耦（`a.jpg` → `/img/new-image-name.jpg`）；
- 想把资源放到固定目录（如把社交分享图统一放到 `/og/`）；
- 想给资源改名后继续走管道（`Copy` 之后仍可用 `.RelPermalink`、`.Width`）。

**别用**：

- 想真的在磁盘上复制文件 → 用 `static/`，或直接在 `assets/` 里放第二个文件；
- 想按内容去重／改名并加指纹 → 用 [`resources.Fingerprint`](/functions/resources/fingerprint/)，它会自动生成唯一文件名；
- 只是想让地址变化 → 大多数情况下更好的做法是给路径加指纹或版本目录，而不是手工改名。

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  {{ with resources.Copy "img/new-image-name.jpg" . }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

`TARGETPATH` 相对于站点根目录。

> [!NOTE]
> 可以在全局资源、页面资源与远程资源上使用 `resources.Copy` 函数。

## 完整示例：把源文件名改成发布用的名字

```go-html-template {file="layouts/_partials/cover.html"}
{{ with resources.Get "images/a.jpg" }}
  {{ with resources.Copy "img/new-image-name.jpg" . }}
    <p>{{ .RelPermalink }} {{ .Width }}x{{ .Height }} {{ .MediaType.Type }}</p>
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>/img/new-image-name.jpg 40x20 image/jpeg</p>
```

**你应当看到什么**：原始资源是 `assets/images/a.jpg`，`.RelPermalink` 变成了 `/img/new-image-name.jpg`，而 `.Width`、`.Height`、`.MediaType` 这些元信息仍然来自原资源。访问 `.RelPermalink` 会把副本发布到该路径——`public/img/new-image-name.jpg` 实测存在。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；源资源为 `assets/images/a.jpg`（40×20）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 改文件名为 `img/new-image-name.jpg` | `.RelPermalink` = `/img/new-image-name.jpg`，`.Width` 40、`.Height` 20、`.MediaType.Type` = `image/jpeg` | 否 |
| 目标扩展名与源不同（`img/copy-as.txt`） | `.RelPermalink` = `/img/copy-as.txt`，但 `.MediaType.Type` **仍是 `image/jpeg`**（媒体类型跟源资源走） | 否 |
| 同一个目标路径复制两次 | 两次得到相同结果（按目标路径缓存） | 否 |
| 源资源不存在（`resources.Get` 返回 `nil`） | 外层 `with` 跳过，什么也不输出 | 否 |
| `TARGETPATH` 以 `/` 开头 | 上游未说明；`TARGETPATH` 按「相对站点根目录」理解，不要写前导斜杠 | 否 |
| 返回类型 | `resource.Resource` | 否 |

> [!NOTE]
> 「改扩展名不会改媒体类型」是实测结论，也与直觉不同。若你需要一个真正的 `.txt`／`.json` 资源，请用 [`resources.FromString`](/functions/resources/fromstring/) 生成，而不是 `Copy` 改名。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 复制出的文件扩展名变了，但服务器返回的 MIME 还是图片类型 | 媒体类型跟源资源走（实测） | 需要换类型的场景改用 `resources.FromString`；只是改路径则无所谓 |
| 没报错但结果不对 | 两个页面引用了两份同名副本 | 每处调用都 `Copy` 到不同路径，缓存键因此不同 | 统一在一个地方 `Copy`，把结果通过上下文传给局部模板 |
| 没报错但结果不对 | 产物里看不到副本 | 只调用了 `Copy` 但没有访问 `.RelPermalink`／`.Publish`／`.Permalink` | 加一次 `.Publish` 或输出 `.RelPermalink` |
| 报错看不懂 | `wrong number of args for Copy: want 2 got 1` | 参数顺序写反或漏参 | 顺序是 `TARGETPATH RESOURCE`：`{{ resources.Copy "img/x.jpg" $r }}` |

更多排查入口见[故障排查](/troubleshooting/)。
