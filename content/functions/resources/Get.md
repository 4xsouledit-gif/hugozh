+++
title = "resources.Get"
linkTitle = "Get"
description = "返回给定路径上的全局资源；找不到时返回 nil。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/resources/get/"

[params.functions_and_methods]
signatures = ["resources.Get PATH"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

模板里要用 `assets/` 下的某个文件：一张图、一份 CSS、一个 JSON 数据文件。`resources.Get` 是最直接的取法——给出**相对于 `assets/` 的路径**，拿回资源对象，然后就能访问 `.RelPermalink`、`.Content`、`.Width`，或把它送进加工管道（`minify`、`fingerprint`、`.Process`）。

它也是 `assets/` 与 `static/` 的分界线：走 `resources.Get` 的文件能被读取和加工；放在 `static/` 的文件只是原样拷贝。

## 什么时候用，什么时候别用

**该用**：

- 已知确切路径，想读取内容或加工资源；
- 需要资源的元信息：`.MediaType`、`.Width`、`.Height`、`.Name`；
- 要接管道：`{{ resources.Get "css/main.css" | minify | fingerprint }}`。

**别用**：

- 路径不确定、要按模式找 → 用 [`resources.GetMatch`](/functions/resources/getmatch/)（取第一个）或 [`resources.Match`](/functions/resources/match/)（取全部）；
- 取的是**页面包里**的文件 → 用页面对象的 [`.Resources.Get`](/methods/page/resources/)；
- 取的是远程文件 → 用 [`resources.GetRemote`](/functions/resources/getremote/)；
- 文件不需要任何加工，只要求发布出去 → 直接放 `static/` 更简单。

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

> [!NOTE]
> 该函数作用于全局资源。全局资源是位于 `assets` 目录内，或位于任何挂载到 `assets` 目录的目录内的文件。
>
> 对于页面资源，请使用 `Page` 对象上的 [`Resources.Get`][] 方法。

## 完整示例：命中与未命中两条路径

```go-html-template {file="layouts/_partials/logo.html"}
{{ with resources.Get "images/a.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ else }}
  <p>没有找到 images/a.jpg</p>
{{ end }}
```

```go-html-template {file="layouts/_partials/logo-missing.html"}
{{ with resources.Get "images/nothere.jpg" }}
  <img src="{{ .RelPermalink }}" alt="">
{{ else }}
  <p>没有找到 images/nothere.jpg</p>
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<img src="/images/a.jpg" width="40" height="20" alt="">
<p>没有找到 images/nothere.jpg</p>
```

**你应当看到什么**：命中的路径给出完整的 `<img>`，未命中的路径落到 `else`。**关键点**：`resources.Get` 对不存在的路径**不报错**，而是返回 `nil`——所以必须用 `with`（或 `reflect.IsResource`）兜住，否则后面取 `.RelPermalink` 会得到空值，甚至触发「不支持的方法」类错误。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows；`assets/images/a.jpg` 存在（40×20）。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"images/a.jpg"`（存在） | 资源对象；`.RelPermalink` 为 `/images/a.jpg`，`.Width` 40、`.Height` 20 | 否 |
| `"images/nothere.jpg"`（不存在） | `nil`，`with` 判假 | 否 |
| 数字（如 `42`） | 实测不报错，按路径查找后返回 `nil`（渲染为空） | 否 |
| 路径写法变体（`"./images/a.jpg"`、`"/images/a.jpg"`、`"images\a.jpg"`） | 都能取到同一个资源，路径会被规范化 | 否 |
| 非图片资源（如 `"data/a.json"`）取 `.Width` | —— | 是：`error calling Width: resource "/data/a.json" of media type "application/json" does not support this method: use reflect.IsImageResource, reflect.IsImageResourceProcessable, or reflect.IsImageResourceWithMeta to check if the resource supports this method before calling it` |
| 返回类型 | `resource.Resource`，或 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上哪里都没有这个图片 | `Get` 返回 `nil`，`with` 静默跳过 | 检查路径是否相对 `assets/`；临时加 `else` 分支打印提示 |
| 没报错但结果不对 | 改了 `assets/` 里的文件，页面没变 | 命中了 Hugo 的资源缓存 | 用 `hugo --ignoreCache` 重跑确认 |
| 报错看不懂 | `does not support this method: use reflect.IsImageResource…` | 对非图片资源（JSON、CSS）取 `.Width`／`.Height` | 先用 `reflect.IsImageResource` 守卫（实测该报错就是提示这一步） |
| 没报错但结果不对 | 页面资源取不到 | 用了 `resources.Get` 而不是 `.Resources.Get` | 页面包内的文件用页面的 `Resources` 方法 |
| 报错看不懂 | `wrong number of args for Get: want 1 got 2` | 参数里带了多余的东西（例如忘了括号） | 只传一个字符串路径 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Resources.Get`]: /methods/page/resources/#get
