+++
title = "resources.GetMatch"
linkTitle = "GetMatch"
description = "返回路径匹配给定 glob 模式的第一个全局资源；找不到时返回 nil。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/resources/getmatch/"

[params.functions_and_methods]
signatures = ["resources.GetMatch PATTERN"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

有时你知道「有一张封面图」，但不确定它的扩展名是 `.jpg`、`.png` 还是 `.webp`：文件名可能是 `hero.jpg`，也可能是 `hero.webp`。`resources.GetMatch` 让你用 **glob 模式**代替精确路径，取回**第一个**匹配的资源——这正好适合「只想要一张图」的场景，例如页面封面、站点 logo。

## 什么时候用，什么时候别用

**该用**：

- 只知道文件名主干与目录，扩展名可能变化；
- 一个位置只应有一张图（封面、logo、头像），取第一个就够；
- 想写「有就用、没有就走兜底」的模板。

**别用**：

- 路径完全确定 → 用 [`resources.Get`](/functions/resources/get/) 更直接（还避免「多个文件同时匹配时取到哪个」的不确定性）；
- 需要**全部**匹配项 → 用 [`resources.Match`](/functions/resources/match/)；
- 取页面包里的文件 → 用页面对象的 [`.Resources.GetMatch`](/methods/page/resources/#getmatch)。

```go-html-template
{{ with resources.GetMatch "images/*.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.GetMatch`][] 方法。

Hugo 用大小写不敏感的 glob 模式判断是否匹配。语法规则与示例见 [glob 模式速查表][]。

## 完整示例：扩展名不确定的封面图

```go-html-template {file="layouts/_partials/cover.html"}
{{ with resources.GetMatch "images/*.JPG" }}{{ .Name }}{{ else }}未匹配到{{ end }}
{{ with resources.GetMatch "images/*.xyz" }}{{ .Name }}{{ else }}未匹配到{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
/images/a.jpg
未匹配到
```

**你应当看到什么**：第一行验证了**大小写不敏感**——`assets/images/a.jpg` 是小写扩展名，用 `*.JPG` 依然匹配到它；第二行验证了未匹配时返回 `nil`，`with` 落到 `else`。想覆盖整个目录时用 `images/**`（实测能匹配到 `images/` 下的资源）；模式必须写清目录层级，实测裸写 `"*.jpg"` 在 `assets/` 根层没有 jpg 时返回 `nil`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`assets/images/` 下有 10 个图片资源。

| 模式 | 结果 | 是否报错 |
| --- | --- | --- |
| `"images/*.jpg"` | `/images/a.jpg` | 否 |
| `"images/*.JPG"`（大写扩展名） | `/images/a.jpg`——大小写不敏感 | 否 |
| `"images/c.*"` | `/images/c.png` | 否 |
| `"images/*"`（多个匹配） | `/images/g.webp`——**不是**文件名第一个（上游未说明取哪个） | 否 |
| `"images/*.xyz"`（无匹配） | `nil`，`with` 判假 | 否 |
| 返回类型 | `resource.Resource`，或 `nil` | 否 |

> [!NOTE]
> 模式匹配到多个文件时返回哪一个，上游没有说明。实测 `"images/*"` 返回的既不是字母序第一个，也不是最后一个；因此**当目录里可能有多张同类图时，请改用确切的 `resources.Get` 路径**，不要依赖 `GetMatch` 的挑选结果。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上的封面图不是预期的哪一张 | 目录里有多张图都符合模式，取到了不确定的一个 | 改成确切路径的 `resources.Get`，或让模式更具体 |
| 没报错但结果不对 | 明明有图却匹配不到 | 模式没有覆盖到文件所在层级（实测 `"*.jpg"` 在 `assets/` 根层无 jpg 时为 `nil`，而 `"images/*.jpg"` 命中），或扩展名拼错 | 把目录写进去，用 `"images/*.jpg"`；需要整层时用 `"images/**"` |
| 报错看不懂 | `does not support this method: use reflect.IsImageResource…` | 匹配到的不是图片（例如 `images/*` 命中了 `.svg`），却取了 `.Width` | 用 `reflect.IsImageResource` 守卫，或把模式限定到具体扩展名 |
| 没报错但结果不对 | 取不到页面包里的图 | 用了 `resources.GetMatch` 而不是 `.Resources.GetMatch` | 页面资源用页面的 `Resources` 方法 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Resources.GetMatch`]: /methods/page/resources/#getmatch
[glob 模式速查表]: /quick-reference/glob-patterns/
