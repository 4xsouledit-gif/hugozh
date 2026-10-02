+++
title = "资源函数"
linkTitle = "resources"
description = "用这些函数处理资源。"
date = 2026-10-02
weight = 240
source = "https://gohugo.io/functions/resources/"
+++

## 这一页解决什么问题

Hugo 把「可加工的文件」统一叫做**资源（Resource）**，来源有三类：

- **全局资源**：`assets/` 目录（或挂载到它的目录）里的文件；
- **页面资源**：页面包（leaf bundle，含 `index.md` 的目录）里的文件；
- **远程资源**：`resources.GetRemote` 抓回来的文件。

资源与 `static/` 里的文件最大的区别是：**资源可以被读取内容、被加工**（压缩、加指纹、拼接、当模板执行、图片缩放），而 `static/` 只是原样拷贝。本章这组函数就是「取资源」与「造资源」的工具箱。

## 什么时候用，什么时候别用

| 你想做的事 | 用哪个函数 |
| --- | --- |
| 按路径取一个资源 | [`resources.Get`](/functions/resources/get/) |
| 按 glob 取第一个匹配的资源 | [`resources.GetMatch`](/functions/resources/getmatch/) |
| 按 glob 取全部匹配的资源 | [`resources.Match`](/functions/resources/match/) |
| 按媒体类型大类取资源（`image`、`text`…） | [`resources.ByType`](/functions/resources/bytype/) |
| 从字符串造一个资源（如 `security.txt`、内联 CSS） | [`resources.FromString`](/functions/resources/fromstring/) |
| 把资源当 Go 模板执行（CSS 里插站点参数） | [`resources.ExecuteAsTemplate`](/functions/resources/executeastemplate/) |
| 压缩 CSS/JS/JSON/HTML/SVG/XML | [`resources.Minify`](/functions/resources/minify/) |
| 给资源加内容哈希指纹（缓存失效） | [`resources.Fingerprint`](/functions/resources/fingerprint/) |
| 把多个同类型资源拼成一个 | [`resources.Concat`](/functions/resources/concat/) |
| 复制/改名资源 | [`resources.Copy`](/functions/resources/copy/) |
| 把资源写进发布目录 | [`resources.Publish`](/functions/resources/publish/) |
| 从 URL 取远端文件 | [`resources.GetRemote`](/functions/resources/getremote/) |
| 构建之后再处理资源（已弃用） | [`resources.PostProcess`](/functions/resources/postprocess/) |

**什么时候别用**：

- 文件只需要**原样发布**、不做任何加工 → 放进 `static/`，不必经过资源管道；
- 只是想给图片加样式 → 用 `assets/` + 图片处理方法，或直接用 `static/` 的固定路径；
- 想解析 JSON/YAML/CSV 的内容 → 先取到资源，再交给 [`transform.Unmarshal`](/functions/transform/unmarshal/)；`resources.*` 系列不解析内容。

## 完整示例：取资源 → 压缩 → 加指纹 → 输出

```go-html-template {file="layouts/_partials/head.html"}
{{ with resources.Get "css/main.css" }}
  {{ with . | minify | fingerprint "sha256" }}
    <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}">
  {{ end }}
{{ end }}
```

`assets/css/main.css` 的内容是：

```css
/* teach demo stylesheet */
body {
  margin: 0;
  color: #222;
}
```

Hugo 0.167.0 实测渲染为（哈希取决于文件内容，你的站点会不同）：

```html
<link rel="stylesheet" href="/css/main.min.adf1c26ee231057476e47c3f836f8e9bb1d485d2596b98bd625b88113304bc85.css" integrity="sha256-rfHCbuIxBXR25Hw/g2&#43;Om7HUhdJZa5i9YluIETMEvIU=">
```

**你应当看到什么**：文件名里多了 `.min.` 与一串 64 位哈希（sha256 的十六进制），`integrity` 则是 `算法名-` 加 base64。注意 `integrity` 里的 `+` 被输出成 `&#43;`——HTML 属性会做实体转义，浏览器解码后是同一个 base64 值，SRI 校验不受影响。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。细则见各函数页，这里是最常踩的几条：

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `resources.Get`／`GetMatch`／`Match` 找不到 | 返回 `nil`／空集合（`with`、`if` 判假） | 否 |
| `resources.Concat` 传入不同媒体类型 | 返回失败 | 是：`resources in Concat must be of the same Media Type, …` |
| `resources.Minify` 用在不支持的类型上 | 调用时不一定报错，**读取内容时**失败：`minifier does not exist for mimetype` | 是 |
| `resources.Fingerprint` 算法拼错 | 读取 `.RelPermalink` 时失败：`unsupported hash algorithm: "sha1", use either md5, sha256, sha384 or sha512` | 是 |
| 资源未被引用也没有显式发布 | 文件不会出现在 `public/` | 否 |
| `.Publish` **方法**的结果 | 实测为 `<nil>`，不能链式取 `.RelPermalink` | 是（链式时） |
| `resources.Publish` **函数**传入 `nil` | —— | 是：`<nil> can not be published` |

## 读完本章你应该能够

- 区分全局资源、页面资源、远程资源，并选对获取方式
- 用 `minify` + `fingerprint` 搭出一条缓存安全的静态资源管道
- 知道 `resources.Get` 找不到时返回 `nil`，并用 `with` 兜住
- 说清 `resources.Publish` 与资源的 `.RelPermalink`／`.Permalink` 在「何时写文件」上的关系

## 阅读顺序

1. [resources.Get](/functions/resources/get/)、[resources.GetMatch](/functions/resources/getmatch/)、[resources.Match](/functions/resources/match/)、[resources.ByType](/functions/resources/bytype/) —— 先把资源取出来；
2. [resources.Minify](/functions/resources/minify/)、[resources.Fingerprint](/functions/resources/fingerprint/)、[resources.Concat](/functions/resources/concat/) —— 加工与打包；
3. [resources.FromString](/functions/resources/fromstring/)、[resources.ExecuteAsTemplate](/functions/resources/executeastemplate/)、[resources.Copy](/functions/resources/copy/) —— 造资源；
4. [resources.Publish](/functions/resources/publish/)、[resources.PostProcess](/functions/resources/postprocess/) —— 发布时机；
5. [resources.GetRemote](/functions/resources/getremote/) —— 远端资源（需要联网，注意安全与缓存）。

更多排查入口见[故障排查](/troubleshooting/)。
