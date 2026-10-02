+++
title = "Publish"
linkTitle = "Publish"
description = "发布给定资源。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/methods/resource/publish/"

[params.functions_and_methods]
signatures = ["RESOURCE.Publish"]
returnType = "nil"
+++

> [!NOTE]
> 该方法可用于全局资源、页面资源或远程资源。

## 这一页解决什么问题

`Resource` 对象上的 `Publish` 方法把给定资源写入 [`publishDir`][]。

有些文件**必须出现在发布目录里，但页面不会链接它们**：`/.well-known/security.txt`、`robots.txt`、各种 `.well-known/` 校验文件、由数据动态生成的清单。这类「只需要落地、不需要 URL」的资源，用 `Publish` 最合适——它只发布，不返回任何值（`returnType` 就是 `nil`）。

## 什么时候用，什么时候别用

**该用**：

- 资源**不需要在页面里被引用**，但必须存在于 `public/`（`.well-known/`、校验文件）；
- 你已经拿到 `RelPermalink`，但更想让「我只是要发布它」这个意图写在模板里；
- 在管道末端明确表达副作用。

**别用**：

- 需要 URL 去渲染 `<img>`/`<a>` → 用 [`RelPermalink`](/methods/resource/relpermalink/) 或 [`Permalink`](/methods/resource/permalink/)；它们**也会发布**资源，无需再调一次 `Publish`；
- 想「按需发布任意文件」（不是模板里造出来的资源）→ 把文件放进 `static/` 目录更直接；
- 要在管道里发布 → 用 [`resources.Publish`](/functions/resources/publish/) 函数（`Publish` 是方法，管道里的写法不顺手）。

上游给出的对照很直观——需要发布但不关心返回值时，写：

```go-html-template
{{ $resource.Publish }}
```

而不是：

```go-html-template
{{ $noop := $resource.Permalink }}
```

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点，`hugo.toml` 里 `[params] email = 'security@example.org'`。下例用 [`resources.FromString`][] 从字符串创建资源，然后发布它：

```go-html-template {file="layouts/baseof.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
{{ end }}
```

构建后 `public/.well-known/security.txt` 真实存在，内容为：

```text
Contact: mailto:security@example.org
```

如果想让模板里也能看到路径，可以顺手输出 `RelPermalink`（这本身也会发布该资源）：

```go-html-template
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
  <p>已发布：{{ .RelPermalink }}</p>
{{ end }}
```

实测渲染为：

```html
<p>已发布：/.well-known/security.txt</p>
```

**你应当看到什么**：`{{ .Publish }}` 在输出里**什么都不打印**（返回值是 `nil`/空），发布发生在渲染过程中；判断有没有生效，要去 `public/` 目录里找文件，而不是看 HTML。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `resources.FromString` 造出的资源 | 文件被写入 `public/.well-known/security.txt`，`.Publish` 返回空 | 否 |
| 图像处理后的资源 | 同样发布到 `public/`（实测 `Resize "100x"` 的结果被写入 `public/images/`） | 否 |
| 仅为取值而调用 `Permalink`/`RelPermalink` | 资源同样会被发布（副作用） | 否 |
| `{{ .Publish }}` 直接输出 | 输出为空字符串，不显示任何内容 | 否 |
| `resources.Get` 找不到文件（`nil`） | —— | 是：`nil pointer evaluating resource.Resource.Publish` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面里看不到任何变化，以为没生效 | `Publish` 不返回内容，只在渲染时写文件 | 去 `public/` 里确认文件；或在同一 `with` 里输出 `.RelPermalink` |
| 没报错但结果不对 | 用 `{{ .Publish }}` 又套了 `{{ with }}`，结果没进分支 | 返回值是空值，`with` 判为假 | 直接写 `{{ .Publish }}`，不要用它的返回值做条件 |
| 没报错但结果不对 | 同一资源被发布到意料之外的路径 | `resources.FromString` 的第一个参数就是发布路径 | 用想落地的相对路径（如 `.well-known/security.txt`） |
| 报错看不懂 | `nil pointer evaluating resource.Resource.Publish` | `resources.Get` 没找到文件 | 用 `{{ with resources.Get "…" }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。

[`publishDir`]: /configuration/all/#publishdir
[`resources.FromString`]: /functions/resources/fromstring/
[`resources.Publish`]: /functions/resources/publish/
