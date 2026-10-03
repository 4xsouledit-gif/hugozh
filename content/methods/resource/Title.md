+++
title = "Title"
linkTitle = "Title"
description = "返回给定资源的标题，可以是在前置元数据中定义的标题，未定义时按资源类型回退到相对路径或带哈希值的文件名。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/resource/title/"

[params.functions_and_methods]
signatures = ["RESOURCE.Title"]
returnType = "string"
+++

`Resource` 对象上的 `Title` 方法返回的值取决于资源类型。

## 这一页解决什么问题

`Title` 想回答的是「这个资源**叫什么名字给人看**」：图库、附件列表、`alt` 文本、下载链接的可见文字都该用它，而不是把文件名硬塞给读者。

但要注意它是一条**回退链**：只有当你在前置元数据的 `resources` 条目里写了 `title`，它才是你定义的那句话；否则它退回文件路径——也就是说，**看起来像标题，其实还是路径**。读这一页的重点就是认出自己处在回退链的哪一级。

## 什么时候用，什么时候别用

**该用**：

- 展示给读者的资源名称（画廊标题、下载文件名、`<figcaption>`）；
- 与 [`Name`](/methods/resource/name/) 配对：`Name` 做机器标识，`Title` 给人看；
- 与 [`Params`](/methods/resource/params/) 一起用：`title` 是内置参数，其余自定义参数放在 `[resources.params]`。

**别用**：

- 需要**稳定的标识**（查找、去重、缓存键）→ 用 `Name`；
- 需要 URL → 用 [`RelPermalink`](/methods/resource/relpermalink/)；
- 需要**页面**标题 → 那是 `.Page.Title` / `.Title`（页面对象上的方法），与资源无关；
- 希望它一定是「人话」→ 没有声明 `title` 时它只是路径，别把它直接渲染成展示文本。

## 全局资源

对于[global resource](g)（全局资源），`Title` 方法返回资源的路径，相对于 `assets` 目录。

```tree
assets/
└── images/
    └── Sunrise in Bryce Canyon.jpg
```

```go-html-template
{{ with resources.Get "images/Sunrise in Bryce Canyon.jpg" }}
  {{ .Title }} → /images/Sunrise in Bryce Canyon.jpg
{{ end }}
```

## 页面资源

对于[page resource](g)（页面资源），如果在前置元数据的 `resources` 数组中创建了条目，`Title` 方法返回 `title` 参数的值。

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
title = 'A beautiful sunrise in Bryce Canyon'
```

```go-html-template
{{ with .Resources.Get "images/a.jpg" }}
  {{ .Title }} → A beautiful sunrise in Bryce Canyon
{{ end }}
```

如果没有在前置元数据的 `resources` 数组中创建条目，`Title` 方法返回文件路径，相对于页面包。

```tree
content/
├── example/
│   ├── images/
│   │   └── Sunrise in Bryce Canyon.jpg
│   └── index.md
└── _index.md
```

```go-html-template
{{ with .Resources.Get "Sunrise in Bryce Canyon.jpg" }}
  {{ .Title }} → images/Sunrise in Bryce Canyon.jpg
{{ end }}
```

## 远程资源

对于[remote resource](g)（远程资源），`Title` 方法返回带哈希值的文件名。

```go-html-template
{{ with resources.GetRemote "https://example.org/images/a.jpg" }}
  {{ .Title }} → /a_18432433023265451104.jpg
{{ end }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。页面包 `content/bundle/` 的 `a.jpg` 在前置元数据里声明了 `title`，`b.jpg` 没有声明。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "images/original.jpg" }}
  <p>全局：{{ .Title }}</p>
{{ end }}
{{ with .Resources.Get "a.jpg" }}
  <p>已声明 title：{{ .Title }}</p>
{{ end }}
{{ with .Resources.Get "b.jpg" }}
  <p>未声明 title：{{ .Title }}</p>
{{ end }}
```

Hugo 渲染为：

```html
<p>全局：/images/original.jpg</p>
<p>已声明 title：A beautiful sunrise in Bryce Canyon</p>
<p>未声明 title：b.jpg</p>
```

**你应当看到什么**：只有中间一行是「人写的标题」，另外两行其实都是路径。所以**不要假设 `Title` 一定可读**——如果界面需要好看的名称，就在 `[[resources]]` 里显式写 `title`。

另外，处理后的资源同样继承源对象的 `Title`：实测 `.Resize "100x"` 的结果 `.Title` 仍是 `/images/original.jpg`。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 全局资源 | 相对 `assets/` 的路径，实测 `/images/original.jpg`（**不是**人写的标题） | 否 |
| 页面资源，声明了 `title` | 即 `title` 的值，实测 `A beautiful sunrise in Bryce Canyon` | 否 |
| 页面资源，未声明 `title` | 相对页面包的路径，实测 `b.jpg` | 否 |
| 处理后的资源 | 与源对象相同的 `Title` | 否 |
| 远程资源 | 带哈希的文件名（上游示例）；本站未实测（需联网） | —— |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Title` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上显示 `/images/photo.jpg` 这样的文字 | 没有声明 `title`，`Title` 回退成路径 | 在 `[[resources]]` 条目里补 `title`，或改用自己准备的字段 |
| 没报错但结果不对 | 改了前置元数据的 `title`，模板里的取值没变 | 该资源不在本页面的 `resources` 数组里，或改的不是同一个包 | 确认包路径与 `src` 一致 |
| 没报错但结果不对 | 列表里两项标题重复 | 多个资源都回退到同一个路径 | 显式声明 `title` |
| 报错看不懂 | `nil pointer evaluating resource.Resource.Title` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。
