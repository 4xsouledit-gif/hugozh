+++
title = "Err"
linkTitle = "Err"
description = "远程资源的 HTTP 请求失败时返回错误消息，否则返回 nil。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/resource/err/"

[params.functions_and_methods]
signatures = ["RESOURCE.Err"]
returnType = "resource.resourceError"
+++

**（0.141.0 起弃用）** 请改用 [`try`](/functions/go-template/try/) 语句。

## 这一页解决什么问题

历史上的 `Err` 方法回答一个问题：**刚才那次 `resources.GetRemote` 到底失败了没有？** 上游的描述是「远程资源的 HTTP 请求失败时返回错误消息，否则返回 nil」，也就是说要写成 `{{ with $r.Err }}` 来处理失败。

现在这个问题由 [`try`](/functions/go-template/try/) 接管，`Err` 方法已经**从 Hugo 中移除**：它不再“返回 nil”，而是**调用即让构建失败**（实测 Hugo 0.167.0，见下文）。

## 什么时候用，什么时候别用

- **在 0.141.0 及以后：永远别用。** 模板里出现 `.Err` 会让整站构建失败，报错消息明确指向 `try`。
- **维护 0.140 及更早的老项目时**才会看到它；升级 Hugo 时把它连同 `with $r.Err` 的分支一起换成 `try`。
- 想在模板里表达「要么成功、要么给我错误消息」，用 `try`：`{{ with try (resources.GetRemote $url) }}` 之后分别看 `.Err` 和 `.Value`。注意这里的 `.Err` 是 `try` 返回对象的字段，**不是** Resource 的方法。

## 完整示例（实测）

`try` 的形状是「包住一个调用，成功读 `.Value`，失败读 `.Err`」。下面用本地资源演示失败路径（不联网也能跑）：对文本资源调用 `.Height` 会失败。

测量条件：Hugo 0.167.0 extended，Windows，最小站点；`assets/quotations/kipling.txt` 是文本文件。放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with resources.Get "quotations/kipling.txt" }}
  {{ with try .Height }}
    {{ with .Err }}<p>取高度失败：{{ . }}</p>{{ else }}<p>高度：{{ .Value }}</p>{{ end }}
  {{ end }}
{{ end }}
```

Hugo 渲染为（实测）：

```html
<p>取高度失败：error calling Height: resource "/quotations/kipling.txt" of media type "text/plain" does not support this method: use reflect.IsImageResource, reflect.IsImageResourceProcessable, or reflect.IsImageResourceWithMeta to check if the resource supports this method before calling it</p>
```

> [!NOTE]
> 实测输出里这段消息前面还有 `template: <模板文件>:<行>:<列>: executing "<模板名>" at <.Height>: ` 前缀，随模板位置变化；上面只保留了消息主体。

同样的形状换成远程资源，就是 `Err` 当年想解决的问题：

```go-html-template
{{ $url := "https://example.org/images/a.jpg" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ warnf "抓取 %s 失败：%s" $url . }}
  {{ else with .Value }}
    <img src="{{ .RelPermalink }}" alt="">
  {{ end }}
{{ end }}
```

**如果你在 0.141.0 及以后的版本里仍然写 `.Err`**，构建会以这条消息失败（实测 Hugo 0.167.0，只保留消息主体）：

```text
execute of template failed: … at <.Err>: can't evaluate field Err in type resource.Resource: Resource.Err was removed in Hugo v0.141.0 and replaced with a new try keyword, see https://gohugo.io/functions/go-template/try/
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| Hugo 0.167.0 上调用 `RESOURCE.Err` | 构建失败，消息指名 `try`（见上） | 是 |
| Hugo 0.140.0 及更早：HTTP 请求失败 | 返回错误消息（上游描述） | 否 |
| Hugo 0.140.0 及更早：请求成功 | 返回 `nil`（上游描述） | 否 |
| `try` 包住的调用失败 | `try` 对象的 `.Err` 有值，`.Value` 为空 | 否（被接住） |
| `try` 包住的调用成功 | `.Err` 为空，`.Value` 是结果 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `Resource.Err was removed in Hugo v0.141.0 …` | 照着老教程写了 `.Err` | 改用 `try`，成功读 `.Value`、失败读 `.Err` |
| 没报错但结果不对 | 用 `try` 后一直走成功分支，拿不到错误 | 只包住了内层调用，或没有检查 `.Err` | 确认 `try` 直接包住会失败的那个调用，并显式判断 `.Err` |
| 报错看不懂 | `wrong number of args for try: want 1 got 2` | `try` 只接受**一个**调用，`try A B` 会被解析成两个参数 | 用括号：`try (dict "a" 1)`、`try (.Process "300x")` |

更多排查入口见[故障排查](/troubleshooting/)。
