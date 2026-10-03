+++
title = "resources.Match"
linkTitle = "Match"
description = "返回路径匹配给定 glob 模式的全局资源集合；一个都没有时返回 nil。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/resources/match/"

[params.functions_and_methods]
signatures = ["resources.Match PATTERN"]
returnType = "resource.Resources"
+++

## 这一页解决什么问题

你要的是**一批**资源：把 `assets/` 下所有图片列成图片墙、给每个数据文件生成一份表格、把某个目录下的资源全部纳入处理管道。`resources.Match` 用 glob 模式一次取回**全部**匹配项，返回的是一个可以 `range`、`len`、`where`、`sort` 的集合。

它与 [`resources.GetMatch`](/functions/resources/getmatch/) 的唯一区别就是「取全部」还是「取第一个」。

## 什么时候用，什么时候别用

**该用**：

- 处理整个目录的资源（图片墙、资源清单、批量加指纹）；
- 需要先统计数量（`len`）或过滤（`where`）再处理；
- 想遍历子目录（用 `**`）。

**别用**：

- 只要一个资源 → 用 [`resources.GetMatch`](/functions/resources/getmatch/)（且更明确）或 [`resources.Get`](/functions/resources/get/)；
- 按媒体类型大类取 → 用 [`resources.ByType`](/functions/resources/bytype/)；
- 取页面包里的资源 → 用页面对象的 [`.Resources.Match`](/methods/page/resources/#match)。

```go-html-template
{{ range resources.Match "images/*.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.Match`][] 方法。

Hugo 用大小写不敏感的 glob 模式判断是否匹配。语法规则与示例见 [glob 模式速查表][]。

## 完整示例：统计并遍历匹配结果

```go-html-template {file="layouts/_partials/asset-gallery.html"}
{{ len (resources.Match "images/*") }} 个匹配
{{ range resources.Match "data/*" }}<li>{{ .Name }}</li>{{ end }}
```

`assets/images/` 下有 10 个文件，`assets/data/` 下有 1 个 `a.json`。Hugo 0.167.0 实测渲染为：

```html
10 个匹配
<li>/data/a.json</li>
```

**你应当看到什么**：`len` 与 `range` 都能直接用；`.Name` 对全局资源是**带前导斜杠的路径**（实测 `/data/a.json`）。模式匹配不到任何文件时，返回空集合：`len` 为 0，在 `if` 里判为假，`range` 一次都不执行——不会报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`assets/` 下 10 个图片、1 个 JSON、5 个文本资源。

| 模式 | 结果 | 是否报错 |
| --- | --- | --- |
| `"images/*"` | 10 个资源 | 否 |
| `"images/*.jpg"` | 1 个资源（`a.jpg`，`f.jpg` 在页面包里不属于全局资源） | 否 |
| `"images/**"` | 10 个资源（`**` 覆盖该层全部） | 否 |
| `"images/*.JPG"` | 与 `"images/*.jpg"` 相同——大小写不敏感 | 否 |
| `"images/*.xyz"`（无匹配） | 空集合：`len` 为 0，`if` 判假 | 否 |
| 返回类型 | `resource.Resources` | 否 |

> [!NOTE]
> 上游把无匹配时的返回值描述为 `nil`；实测表现为**空集合**（`len` 为 0、`with`／`if` 判假、`range` 不执行），对模板写法而言两者等价。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 图片墙顺序每次都不同 | 集合顺序不是文件名序（上游未说明规则） | 用 `sort` 显式排序，例如 `sort (resources.Match "images/*") "Name"` |
| 没报错但结果不对 | 少了页面包里的图 | `resources.Match` 只看全局资源 | 再合并一次 `.Resources.Match` 的结果 |
| 报错看不懂 | `does not support this method: use reflect.IsImageResource…` | 匹配结果里混有非图片（如 `.svg`），却取了 `.Width` | 用 `where` 按 `.MediaType.Type` 过滤，或加 `reflect.IsImageResource` 守卫 |
| 没报错但结果不对 | `"images/**/*.jpg"` 一个都没匹配到 | `**` 在该模式下没有覆盖「本层文件」（实测返回空） | 用 `"images/*.jpg"`，或先 `"images/**"` 再用 `where` 过滤扩展名 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Resources.Match`]: /methods/page/resources/#match
[glob 模式速查表]: /quick-reference/glob-patterns/
