+++
title = "transform.CanHighlight"
linkTitle = "CanHighlight"
description = "报告给定语言是否支持语法高亮。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/transform/canhighlight/"

[params.functions_and_methods]
signatures = ["transform.CanHighlight LANGUAGE"]
returnType = "bool"
+++

## 这一页解决什么问题

代码块的语言名是作者随手写的（`go`、`go-html-template`、`text`，也可能是拼错的名字）。在把代码交给 [`transform.Highlight`](/functions/transform/highlight/) 或 [`transform.HighlightCodeBlock`](/functions/transform/highlightcodeblock/) 之前，先问一句「这个语言高亮器认识吗」——`transform.CanHighlight` 回答这个问题，让你能提前决定是正常高亮还是退回纯文本。

返回值只有 `true` / `false`，不会报错。

## 什么时候用，什么时候别用

**该用**：

- 与 `HighlightCodeBlock` 搭配：语言不认识时把选项改成 `type = "text"`，避免输出与预期不符（上游示例给出的正是这种用法）；
- 在自定义代码块渲染钩子里做分支，决定是否加 `highlight` 容器；
- 校验自定义短代码传入的语言参数。

**别用**：

- 想直接渲染代码 → 用 [`transform.Highlight`](/functions/transform/highlight/)；`CanHighlight` 只回答「认不认识」；
- 想配置哪些语言可用 → 这是 Hugo 内置词法分析器的事，函数不提供配置入口；
- 想校验语言是否**存在**于站点 → 它只查词法分析器，与站点结构无关。

## 上游给出的结果

```go-html-template
{{ transform.CanHighlight "go" }} → true
{{ transform.CanHighlight "klingon" }} → false
```

## 完整示例：按支持情况决定高亮方式

```go-html-template {file="layouts/_partials/hl-check.html"}
{{ $lang := "go" }}
<p>{{ transform.CanHighlight $lang }}</p>
<p>{{ transform.CanHighlight "klingon" }}</p>
<p>{{ transform.CanHighlight "GO" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>true</p>
<p>false</p>
<p>true</p>
```

**你应当看到什么**：第三行是 `true`——**语言名大小写不敏感**（实测 `"GO"` 与 `"go"` 一样）；拼错或臆造的语言名得到 `false`，随后可以像上游示例那样改用 `type = "text"`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"go"`、`"js"`、`"text"` | `true` | 否 |
| `"GO"`（大小写混合） | `true`（大小写不敏感） | 否 |
| `"klingon"`（不存在的语言） | `false` | 否 |
| `""`（空字符串） | `false` | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 自定义语言名总是 `false` | 语言名不在内置词法分析器清单里（拼错、或该语言未实现） | 用 [`hugo gen chromastyles`](/commands/hugo-gen-chromastyles/) 之外的官方语言清单核对；拿不准就退回 `text` |
| 没报错但结果不对 | 以为 `false` 会导致高亮报错 | `CanHighlight` 不改变任何东西，`Highlight` 遇到未知语言会退回纯文本（实测） | 想控制输出就按上游示例设置 `type = "text"` |
| 报错看不懂 | `wrong number of args` | 漏传语言参数 | 传一个字符串 |

更多排查入口见[故障排查](/troubleshooting/)。
