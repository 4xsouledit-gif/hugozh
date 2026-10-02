+++
title = "resources.PostProcess"
linkTitle = "PostProcess"
description = "返回在构建之后才处理的资源。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/resources/postprocess/"

[params.functions_and_methods]
signatures = ["resources.PostProcess RESOURCE"]
returnType = "postpub.PostPublishedResource"
+++

## 这一页解决什么问题

少数资源必须等**整个站点构建完之后**才能加工：例如要扫描全部产物 HTML 才知道该保留哪些 CSS 规则（purge/unused CSS），或要基于最终页面清单生成图片。`resources.PostProcess` 把资源标记为「构建后再处理」，返回一个「已发布资源」句柄，在模板里照常取 `.RelPermalink`。

> [!WARNING]
> 这个函数**已经弃用**：上游标注为 0.164.0 起弃用，请改用 [`templates.Defer`](/functions/templates/defer/)。实测运行时会打印弃用警告：
>
> ```text
> WARN  deprecated: resources.PostProcess was deprecated in Hugo v0.164.0 and will be removed in a future release. Use templates.Defer instead. See https://gohugo.io/functions/templates/defer/
> ```
>
> **（0.164.0 起弃用）**

## 什么时候用，什么时候别用

**该用**：

- 维护老主题／老站点时，代码里已经出现了它，你需要看懂它做什么（本页的价值主要在这里）；
- 确实需要「构建之后」这个时机，且暂时不打算迁移。

**别用**：

- 新写的模板 → 用 [`templates.Defer`](/functions/templates/defer/)；
- 只是想发布资源 → 用 [`resources.Publish`](/functions/resources/publish/)；
- 只是想加指纹／压缩 → 用 [`resources.Fingerprint`](/functions/resources/fingerprint/)、[`resources.Minify`](/functions/resources/minify/)，它们不需要推迟到构建之后。

请改用 [`templates.Defer`](/functions/templates/defer/)。

## 完整示例：把资源标记为构建后处理

```go-html-template {file="layouts/_partials/postprocess-demo.html"}
{{ with resources.Get "css/main.css" }}
  {{ with resources.PostProcess . }}
    <p>{{ .RelPermalink }}|{{ printf "%T" . }}</p>
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>/css/main.css|*postpub.PostPublishResource</p>
```

同时构建日志里出现上文那条 `WARN deprecated: resources.PostProcess …`。

**你应当看到什么**：`.RelPermalink` 照常给出路径，可以正常输出 `<link>`；控制台会出现一条弃用警告。**只要看到这条警告，就说明该把这段代码迁到 `templates.Defer`。**

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `resources.PostProcess` 包裹一个资源 | 返回可用的已发布资源句柄，`.RelPermalink` = `/css/main.css` | 否 |
| 实测具体类型 | `*postpub.PostPublishResource`（上游 `returnType` 写作 `postpub.PostPublishedResource`——类型名与实测不同，这里按上游原文保留） | 否 |
| 运行时输出 | 每次构建打印一条 `WARN deprecated: … Use templates.Defer instead.` | 否（是警告） |
| 传入 `nil` 资源 | 上游未说明；请先用 `with` 兜住，避免把 `nil` 传进去 | 视写法 |
| 返回类型 | `postpub.PostPublishedResource`（上游声明） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | 构建日志出现 `WARN deprecated: resources.PostProcess` | 用了已弃用的函数 | 迁移到 [`templates.Defer`](/functions/templates/defer/) |
| 没报错但结果不对 | 资源内容不是「构建后」的版本 | 写成管道中段后，后续操作用的是旧内容 | 把该资源放到管道最后一步，或按新写法用 `templates.Defer` |
| 报错看不懂 | `can't evaluate …` 之类错误指向资源方法 | 对返回句柄调用了非资源方法 | 只使用资源接口上的方法与字段（`.RelPermalink`、`.Publish` 等） |

更多排查入口见[故障排查](/troubleshooting/)。
