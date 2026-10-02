+++
title = "Params"
linkTitle = "Params"
description = "返回前置元数据中定义的资源参数映射。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/methods/resource/params/"

[params.functions_and_methods]
signatures = ["RESOURCE.Params"]
returnType = "map"
+++

`Params` 方法用于[page resource](g)（页面资源），不适用于[global resource](g)（全局资源）或[remote resource](g)（远程资源）。

## 这一页解决什么问题

`Params` 让**资源自己带着数据**：`alt` 文本、版权、拍摄者、用途标签，都写在页面包的前置元数据里，模板只负责取出来。这样图片的说明文字与图片放在一起（同一个包），既不用散落到别处，也不会出现「改了图忘了改说明」。

它回答的问题是：**这张图在前置元数据里被附加了哪些自定义信息？**

取用方式有两种：`.Params.alt`（点号）或 `index .Params "alt"`（键名含特殊字符时更稳）。

## 什么时候用，什么时候别用

**该用**：

- 从页面包的前置元数据 `[resources.params]` 里读自定义字段（`alt`、`caption`、`credit` 等）；
- 遍历页面资源时按参数过滤或分组；
- 给 `alt`/`loading` 之类可访问性属性提供内容。

**别用**：

- 资源是 `assets/` 里的全局资源或远程资源 → 实测 `.Params` 是**空映射**（写法不报错，但什么也读不到）。全局资源的信息请放在 `data/`、站点参数或页面前置元数据里；
- 想读**文件自身**的元数据（Exif/GPS）→ 用 [`Meta`](/methods/resource/meta/)；
- 想读 HTTP 响应信息 → 用 [`Data`](/methods/resource/data/)；
- 想要**页面**的参数 → 那是 `.Params`（页面对象上的），与资源无关，别混用。

## 用法

有如下内容结构：

```tree
content/
├── posts/
│   ├── cats/
│   │   ├── images/
│   │   │   └── a.jpg
│   │   └── index.md
│   └── _index.md
└── _index.md
```

以及如下前置元数据：

```toml
title = 'Cats'
[[resources]]
  src = 'images/a.jpg'
  title = 'Felix the cat'
  [resources.params]
    alt = 'Photograph of black cat'
    temperament = 'vicious'
```

以及这个模板：

```go-html-template
{{ with .Resources.Get "images/a.jpg" }}
  <figure>
    <img alt="{{ .Params.alt }}" src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}">
    <figcaption>{{ .Title }} is {{ .Params.temperament }}</figcaption>
  </figure>
{{ end }}
```

Hugo 渲染为：

```html
<figure>
  <img alt="Photograph of black cat" src="/posts/post-1/images/a.jpg" width="600" height="400">
  <figcaption>Felix the cat is vicious</figcaption>
</figure>
```

更多信息请参见[页面资源][]一节。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。页面包 `content/bundle/` 中，`a.jpg` 在前置元数据的 `[[resources]]` 条目里声明了 `[resources.params]`，`b.jpg` 只是放在包里、没有声明。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with .Resources.Get "a.jpg" }}
  <p>alt={{ .Params.alt }} temperament={{ .Params.temperament }}</p>
{{ end }}
{{ with .Resources.Get "b.jpg" }}
  <p>b.jpg Params 为空：{{ not .Params }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>alt=Photograph temperament=vicious</p>
<p>b.jpg Params 为空：true</p>
```

**你应当看到什么**：参数**只来自前置元数据里的 `[resources.params]`**——`a.jpg` 写了就有，`b.jpg` 没写就是空映射（`not .Params` 为 `true`）。文件放在包里并不会自动带上参数。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面图片资源，声明了 `[resources.params]` | 该映射，实测 `map[alt:Photograph temperament:vicious]` | 否 |
| 页面图片资源，未声明 | 空映射（实测 `not .Params` 为 `true`） | 否 |
| 页面资源且类型为 `page`（包里的 `.md`） | 该片段**页面**的参数，实测 `map[draft:false iscjklanguage:false title:Objectives]` | 否 |
| 全局资源（`resources.Get`） | 空映射 | 否 |
| 读取不存在的键（`.Params.nope`） | 空值，`with` 判为假 | 否 |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Params` |

> [!NOTE]
> 「空映射」与「参数里某个键没写」是两回事：前者是资源没声明参数，后者是映射里没有这个键。两种情况下 `.Params.nope` 都只是空值，读它不会报错。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `alt` 输出为空 | 资源在前置元数据里没有 `[resources.params]` 条目 | 按上游示例补 `[[resources]]` + `src` + `[resources.params]` |
| 没报错但结果不对 | 全局资源的 `.Params` 永远读不到 | `Params` 只对页面资源有意义 | 把数据放在 `data/`、站点参数，或用页面前置元数据 |
| 没报错但结果不对 | 图片说明与图片不匹配 | 参数写在页面顶层，而不是 `[resources.params]` 下 | 参数必须嵌套在 `[resources.params]` 里 |
| 报错看不懂 | TOML 报结构错误 | `[resources.params]` 与 `[[resources]]` 的缩进/层级写错 | 对照上游示例：`[[resources]]` 是数组表，`[resources.params]` 是它的子表 |

更多排查入口见[故障排查](/troubleshooting/)。

[页面资源]: /content-management/page-resources/
