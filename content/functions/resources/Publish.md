+++
title = "resources.Publish"
linkTitle = "Publish"
description = "发布给定资源后返回该资源。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/resources/publish/"

[params.functions_and_methods]
signatures = ["resources.Publish RESOURCE"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

Hugo 只会把「被引用到的」资源写进发布目录：你访问 `.RelPermalink` 时它才发布。但有些资源在页面里**没有可见的引用**——例如 `js/main.js` 由前端脚本按路径加载、`sw.js` 由 Service Worker 注册、字体文件由 CSS 引用。这些文件必须显式发布。

`resources.Publish` 就是「把这个资源写进 [`publishDir`][]，同时把它返回」，因此可以直接嵌在管道中间，不打断后续的 `.RelPermalink`。

## 什么时候用，什么时候别用

**该用**：

- 资源在页面里没有直接引用，但必须发布（Service Worker、字体、预加载清单）；
- 想在管道中间顺手发布：`{{ resources.Get "main.js" | js.Build | resources.Publish }}`；
- 想一次调用既发布又继续用返回值。

**别用**：

- 资源已经通过 `.RelPermalink`／`.Permalink` 被引用 → 它已经会被发布，再加一次是重复；
- 想只输出路径而不发布 → 那是 `.RelPermalink` 的行为（它也会发布，但语义上以「取地址」为目的）；
- 文件其实是**静态**资源、不需要加工 → 放 `static/` 目录。

**（0.166.0 新增）**

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`resources.Publish` 函数把给定资源写入 [`publishDir`][] 并返回该资源，因此很适合用在模板管道中。

```go-html-template
{{ resources.Get "main.js" | js.Build | resources.Publish }}
```

这等价于：

```go-html-template
{{ (resources.Get "main.js" | js.Build).Publish }}
```

非管道形式的写法参见 [`Publish`][] 方法。

## 完整示例：发布一个没有被引用的脚本

```go-html-template {file="layouts/_partials/publish-demo.html"}
{{ $script := resources.Get "js/main.js" | resources.Publish }}
<p>{{ $script.RelPermalink }}</p>
```

Hugo 0.167.0 实测渲染为：

```html
<p>/js/main.js</p>
```

构建后 `public/js/main.js` 实测存在，内容与 `assets/js/main.js` 一致。

**你应当看到什么**：管道里的 `resources.Publish` 既写了文件，又把资源对象交给下一个环节，所以 `$script.RelPermalink` 仍然可用。**这与方法形式不同**——实测 `{{ .Publish.RelPermalink }}` 会失败，因为 `.Publish` 方法不返回资源。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `resources.Get "js/main.js" \| resources.Publish` 后取 `.RelPermalink` | `/js/main.js`；`public/js/main.js` 被写出 | 否 |
| 方法形式 `{{ .Publish }}` | 输出为空；实测 `printf "%T" .Publish` 得到 `<nil>`（方法不返回资源对象） | 否 |
| 方法形式再链式取路径：`{{ .Publish.RelPermalink }}` | —— | 是：`nil pointer evaluating error.RelPermalink` |
| 对 `nil` 资源调用（如 `resources.Get "nope.txt" \| resources.Publish`） | —— | 是：`error calling Publish: <nil> can not be published` |
| 返回类型 | `resource.Resource`（可继续接 `.RelPermalink`、`.Content` 等） | 否 |

> [!NOTE]
> 上游写「这等价于 `{{ (…).Publish }}`」，指的是**发布效果**等价；从模板能否继续链式取值看，两者并不等价（实测见上表）。管道里请用函数形式。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `nil pointer evaluating error.RelPermalink` | 对 `.Publish` 方法的结果继续取字段 | 改成 `{{ with resources.Get "x.js" \| resources.Publish }}{{ .RelPermalink }}{{ end }}` |
| 报错看不懂 | `<nil> can not be published` | 上游 `resources.Get` 没命中，管道里传了 `nil` | 先 `with` 兜住，或核对资源路径 |
| 没报错但结果不对 | `public/` 里没有这个文件 | 资源确实没被发布（既没有 `.RelPermalink` 也没有 `Publish`） | 在模板里显式加一次 `resources.Publish` |
| 没报错但结果不对 | 同名文件被覆盖 | 多个资源发布到相同目标路径 | 用不同目录或加 `fingerprint` 区分文件名 |

更多排查入口见[故障排查](/troubleshooting/)。

[`Publish`]: /methods/resource/publish/
[`publishDir`]: /configuration/all/
