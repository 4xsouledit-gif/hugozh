+++
title = "Name"
linkTitle = "Name"
description = "返回给定资源的名称，可以是在前置元数据中定义的名称，未定义时回退到其文件路径。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/resource/name/"

[params.functions_and_methods]
signatures = ["RESOURCE.Name"]
returnType = "string"
+++

`Resource` 对象上的 `Name` 方法返回的值取决于资源类型。

## 这一页解决什么问题

`Name` 是资源的**标识名**：它既可能是文件路径，也可能是你在前置元数据里起的一个别名。模板里常见的用法是拿它当 key 去查找、当列表项的显示文本、或当 `errorf` 里的定位信息。

关键点是——**同一张图，来源不同、有没有在前置元数据里声明，`Name` 就不同**。这一页就是把这三种返回规则讲清楚，避免出现「明明图在那里，`Name` 却对不上」的情况。

## 什么时候用，什么时候别用

**该用**：

- 需要**稳定标识**一个资源（查找、去重、拼缓存 key）；
- 页面资源在前置元数据里给了 `name`，想按别名而不是路径取用它（`.Resources.Get "别名"`）；
- 报错信息里要写出「哪个资源出问题了」。

**别用**：

- 想要**给用户看的标题** → 用 [`Title`](/methods/resource/title/)（页面资源可以用 `title` 参数，`Name` 不会跟着变）；
- 想要 URL → 用 [`RelPermalink`](/methods/resource/relpermalink/) / [`Permalink`](/methods/resource/permalink/)；
- 想要文件后缀或 MIME → 用 [`MediaType`](/methods/resource/mediatype/)；
- 想判断资源类别 → 用 [`ResourceType`](/methods/resource/resourcetype/)。

## 全局资源

对于[global resource](g)（全局资源），`Name` 方法返回资源的路径，相对于 `assets` 目录。

```tree
assets/
└── images/
    └── Sunrise in Bryce Canyon.jpg
```

```go-html-template
{{ with resources.Get "images/Sunrise in Bryce Canyon.jpg" }}
  {{ .Name }} → /images/Sunrise in Bryce Canyon.jpg
{{ end }}
```

## 页面资源

对于[page resource](g)（页面资源），如果在前置元数据的 `resources` 数组中创建了条目，`Name` 方法返回 `name` 参数的值。

```tree
content/
├── example/
│   ├── images/
│   │   └── a.jpg
│   └── index.md
└── _index.md
```

```toml
title = 'Example'
[[resources]]
src = 'images/a.jpg'
name = 'Sunrise in Bryce Canyon'
```

```go-html-template
{{ with .Resources.Get "images/a.jpg" }}
  {{ .Name }} → Sunrise in Bryce Canyon
{{ end }}
```

也可以改用 `name` 而不是路径来捕获该图像：

```go-html-template
{{ with .Resources.Get "Sunrise in Bryce Canyon" }}
  {{ .Name }} → Sunrise in Bryce Canyon
{{ end }}
```

如果没有在前置元数据的 `resources` 数组中创建条目，`Name` 方法返回文件路径，相对于页面包。

```tree
content/
├── example/
│   ├── images/
│   │   └── Sunrise in Bryce Canyon.jpg
│   └── index.md
└── _index.md
```

```go-html-template
{{ with .Resources.Get "images/Sunrise in Bryce Canyon.jpg" }}
  {{ .Name }} → images/Sunrise in Bryce Canyon.jpg
{{ end }}
```

## 远程资源

对于[remote resource](g)（远程资源），`Name` 方法返回带哈希值的文件名。

```go-html-template
{{ with resources.GetRemote "https://example.org/images/a.jpg" }}
  {{ .Name }} → /a_18432433023265451104.jpg
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。`assets/images/original.jpg` 是全局资源；页面包 `content/bundle/` 里有 `a.jpg`（在前置元数据的 `resources` 数组里声明了 `name`），另有未声明的 `b.jpg`。放进页面模板 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <p>全局：{{ .Name }}</p>
{{ end }}
{{ with .Resources.Get "a.jpg" }}
  <p>页面资源（已声明 name）：{{ .Name }}</p>
{{ end }}
{{ with .Resources.Get "b.jpg" }}
  <p>页面资源（未声明）：{{ .Name }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>全局：/images/original.jpg</p>
<p>页面资源（已声明 name）：Sunrise in Bryce Canyon</p>
<p>页面资源（未声明）：b.jpg</p>
```

**你应当看到什么**：三行分别是路径、别名、相对路径三种形态。这也意味着一个容易踩的后果——`Name` **不是**唯一的展示名，也不能假设它等于文件名。取用时用你当初声明/查找时用的那一个字符串。

还不止于此：**图像处理后的新资源，`Name` 仍是原资源的名字**。实测 `.Resize "100x"` 的结果 `.Name` 依然输出 `/images/original.jpg`，因为处理结果是新对象、但名字继承自源对象。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 全局资源 | 相对 `assets/` 的路径，实测为 `/images/original.jpg` | 否 |
| 页面资源，前置元数据里声明了 `name` | 就是 `name` 的值，实测为 `Sunrise in Bryce Canyon` | 否 |
| 页面资源，未声明 `name` | 相对页面包的路径，实测为 `b.jpg` | 否 |
| 处理后的资源（如 `Resize`/`Process` 结果） | 与源对象相同的 `Name`（实测仍为 `/images/original.jpg`） | 否 |
| 远程资源 | 带哈希的文件名（上游示例：`/a_18432433023265451104.jpg`）；本站未实测（需联网） | —— |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Name` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面显示的图片说明变成了路径 | 用 `Name` 当展示文本，而该资源没有声明 `name` | 展示用 [`Title`](/methods/resource/title/)，标识用 `Name` |
| 没报错但结果不对 | `.Resources.Get "别名"` 取不到资源 | 前置元数据的 `resources` 条目里没写 `name`，或拼写/大小写不一致 | 按 `src` 建条目并补上 `name`；或直接用路径取 |
| 没报错但结果不对 | 处理后资源的名字看起来「没更新」 | 处理结果继承源对象的名字 | 需要区分处理结果时，用 `RelPermalink`（它带着哈希） |
| 报错看不懂 | `nil pointer evaluating resource.Resource.Name` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住，并检查路径大小写 |

更多排查入口见[故障排查](/troubleshooting/)。
