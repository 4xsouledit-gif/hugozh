+++
title = "reflect.IsResource"
linkTitle = "IsResource"
description = "报告给定值是否为资源（Resource）对象。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/reflect/isresource/"

[params.functions_and_methods]
signatures = ["reflect.IsResource INPUT"]
returnType = "bool"
+++

## 这一页解决什么问题

Hugo 里「资源（Resource）」是一个很宽的概念：`assets/` 下的文件、页面包里的文件、`resources.GetRemote` 抓来的远程文件，都是资源。它们有 `.RelPermalink`、`.Content`、`.MediaType`，图片资源还有 `.Width`、`.Process`、`.Meta`。

当模板里的值来自 `resources.Get`、`index`、`where` 或自定义数据时，你需要在调用这些方法之前确认「它真的是资源」，否则就会踩到「字段不存在」或「这个方法不支持」的错误。`reflect.IsResource` 就是这道守卫。

## 什么时候用，什么时候别用

**该用**：

- 调用 `.MediaType`、`.Content`、`.Width`、`.Process`、`.Meta` 之前做守卫（实测：对不支持的资源调用 `.Meta` 会直接让构建失败）；
- 处理 `resources.Get`／`.Resources.Get` 的结果——**找不到时返回 `nil`**，`with` 与 `reflect.IsResource` 都能拦住；
- 区分「资源」与「字符串／映射」这类普通值。

**别用**：

- 想区分**页面**与资源文件 → 不行：实测页面对象（甚至 `site.GetPage` 未命中时的占位页面）**也**满足 `reflect.IsResource`。要判断页面请用 [reflect.IsPage](/functions/reflect/ispage/)；
- 想判断是不是图片 → 用 [reflect.IsImageResource](/functions/reflect/isimageresource/) 及其两个兄弟；
- 只是想判空 → `with` 更直接。

**（0.154.0 新增）**

项目结构如下：

```tree
project/
├── assets/
│   ├── a.json
│   ├── b.avif
│   └── c.jpg
└── content/
    └── example/
        ├── index.md
        ├── d.json
        ├── e.avif
        └── f.jpg
```

下例给出 `reflect.IsResource` 函数返回的值：

```go-html-template {file="layouts/page.html"}
{{ with resources.Get "a.json" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with resources.Get "b.avif" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with resources.Get "c.jpg" }}
  {{ reflect.IsResource . }} → true
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ with .Resources.Get "d.json" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with .Resources.Get "e.avif" }}
  {{ reflect.IsResource . }} → true
{{ end }}

{{ with .Resources.Get "f.jpg" }}
  {{ reflect.IsResource . }} → true
{{ end }}
```

```go-html-template {file="layouts/page.html"}
{{ with site.GetPage "/example" }}
  {{ reflect.IsResource . }} → true
{{ end }}
```

上面三组结论在 Hugo 0.167.0 上逐条实测一致（用 `assets/data/a.json`、页面包里的 `d.json` 与 `site.GetPage "/example"` 复现，全部为 `true`）。

## 完整示例：区分「取到了资源」与「什么都没取到」

```go-html-template {file="layouts/_partials/resource-list.html"}
{{ range slice "data/a.json" "images/a.jpg" "nope.txt" }}
  {{ with resources.Get . }}
    {{ if reflect.IsResource . }}<p>{{ .Name }} → {{ .RelPermalink }}</p>{{ end }}
  {{ else }}
    <p>{{ . }} → nil</p>
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>/data/a.json → /data/a.json</p>
<p>/images/a.jpg → /images/a.jpg</p>
<p>nope.txt → nil</p>
```

**你应当看到什么**：前两个路径取到了资源，打印出 `.Name` 与 `.RelPermalink`；不存在的路径由 `with` 直接落到 `else`。这里 `with` 已经承担了判空，`reflect.IsResource` 负责的是「即使取到了值，也确认它确实是资源」——对 `assets` 里的文件这一步总是真，但对来自 `index`、`.Params` 的值就不是了。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `resources.Get "data/a.json"`（全局资源存在） | `true` | 否 |
| `.Resources.Get "d.json"`（页面资源存在） | `true` | 否 |
| `resources.Get "nope.txt"`（不存在，返回 `nil`） | `false`（`with` 会直接跳过） | 否 |
| `site.GetPage "/example"`（真实页面） | `true`——**页面也是资源** | 否 |
| `site.GetPage "/not-there"`（占位页面） | `true`（实测） | 否 |
| 字符串、`dict`、`nil` 字面量 | `false`（实测） | 否 |
| 返回类型 | `bool` | 否 |

> [!NOTE]
> 「页面也算资源」是这个函数最容易误用的地方。如果你的分支逻辑是「是资源就按图片处理」，页面对象会走进这个分支。正确写法是先排除页面（`if not (reflect.IsPage $v)`），或直接改用 `reflect.IsImageResource`。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 「不是图片的页面」被当成资源处理 | 页面对象满足 `reflect.IsResource`（实测） | 先 `reflect.IsPage` 排除页面，或用 `reflect.IsImageResource` |
| 报错看不懂 | `resource "…" of media type "image/x-icon" does not support this method` | 对该格式不支持的方法（如 ICO 的 `.Meta`）直接调用 | 调用前用 `reflect.IsImageResourceWithMeta` 等函数检查 |
| 没报错但结果不对 | `resources.Get` 之后直接用 `.Width`，页面报空 | 路径写错，`Get` 返回 `nil`，`with` 外继续取值得到空 | 用 `with` 包住，或先 `reflect.IsResource` |
| 报错看不懂 | `wrong number of args for IsResource: want 1 got 2` | 内层函数调用没加括号 | 写 `{{ reflect.IsResource (resources.Get "a.json") }}` |

更多排查入口见[故障排查](/troubleshooting/)。
