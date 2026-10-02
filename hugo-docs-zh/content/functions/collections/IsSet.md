+++
title = "collections.IsSet"
linkTitle = "isset"
description = "报告给定的映射或切片中是否存在指定的 key 或索引。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/collections/isset/"

[params.functions_and_methods]
signatures = ["collections.IsSet MAP|SLICE KEY|INDEX"]
returnType = "bool"
aliases = ["isset"]
+++

## 这一页解决什么问题

`isset` 回答的是「这个 key/下标**存在吗**」，返回布尔值。它最重要的场景是**值本身为假**时的存在性判断：`showHeroImage = false` 时，`if` 和 `with` 都判为假，只有 `isset` 能把「显式设为 false」和「根本没设置」区分开——上游正文讲的正是这一点。

与之配套的 `index` 有一个反直觉行为：**取不到值时它不报错，只返回空**（实测），所以「参数拼错了却静默输出空白」这类问题，正需要 `isset` 来防。

## 什么时候用，什么时候别用

**该用**：

- 判断站点参数/页面参数**有没有被设置**，尤其是布尔参数与可选字段；
- 在可选字段上做兜底：`{{ if isset .Params "subtitle" }}`。

**别用**：

- 只想取值 → 用 `index` 或字段访问；
- 想判断「某个值在不在列表里」→ 用 [`collections.In`](/functions/collections/in/)；
- 想校验**切片下标合法性** → 实测语义并不完整：越界返回 `false`，但负数下标返回 `true`（见文末），不能当边界检查用。

## 用法

例如，考虑下面这份项目配置：

```toml
[params]
showHeroImage = false
```

如果 `showHeroImage` 的值是 `true`，我们可以用 `if` 或 `with` 检测到它存在：

```go-html-template
{{ if site.Params.showHeroImage }}
  {{ site.Params.showHeroImage }} → true
{{ end }}

{{ with site.Params.showHeroImage }}
  {{ . }} → true
{{ end }}
```

然而，如果 `showHeroImage` 的值是 `false`，就无法用 `if` 或 `with` 检测其是否存在。这种情况下必须使用 `isset` 函数：

```go-html-template
{{ if isset site.Params "showheroimage" }}
  <p>The showHeroImage parameter is set to {{ site.Params.showHeroImage }}.<p>
{{ end }}
```

> [!NOTE]
> 使用 `isset` 函数时，必须以小写形式引用 key。参见上面的示例。

## 完整示例：存在性判断的各种情况

```go-html-template {file="layouts/_partials/flags.html"}
{{ $m := dict "k" "v" }}
<p>存在的键：{{ isset $m "k" }}</p>
<p>不存在的键：{{ isset $m "x" }}</p>
<p>切片下标 1：{{ isset (slice "a" "b") 1 }}</p>
<p>切片越界 5：{{ isset (slice "a") 5 }}</p>
<p>切片负下标 -1：{{ isset (slice "a") -1 }}</p>
<p>nil 映射：{{ isset nil "k" }}</p>
```

Hugo 渲染为：

```html
<p>存在的键：true</p>
<p>不存在的键：false</p>
<p>切片下标 1：true</p>
<p>切片越界 5：false</p>
<p>切片负下标 -1：true</p>
<p>nil 映射：false</p>
```

**你应当看到什么**：键存在为 `true`、不存在为 `false`；切片下标在范围内为 `true`、越界为 `false`；**负数下标意外地返回 `true`**（所以别把它当下标合法性校验）；传 `nil` 不报错，返回 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 键存在（值可以是 `false`、`0`、空字符串） | `true` | 否 |
| 键不存在 | `false` | 否 |
| 切片下标在范围内 | `true` | 否 |
| 切片下标越界（`isset (slice "a") 5`） | `false` | 否 |
| 切片下标为负（`isset (slice "a") -1`） | `true`（实测，语义不完整，不要用于校验） | 否 |
| 输入是 `nil` | `false` | 否 |
| key 大小写（`dict`） | 必须与数据源完全一致：实测 `isset (dict "showHeroImage" false) "showHeroImage"` 得 `true`，而传全小写 `"showheroimage"` 得 `false` | 否 |
| 输入是字符串（`isset "abc" 1`） | `false`，不报错 | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 布尔参数设成 `false`，页面却像「没配置」 | `if`/`with` 无法区分「false」与「未设置」 | 用 `isset` 判断存在性（上游正文的核心场景） |
| 没报错但结果不对 | `isset` 对某个参数总是 `false` | key 大小写或写法与数据源不一致：上游要求以**小写**引用 `site.Params` 的 key；实测对 `dict` 构造的映射则要求**完全一致** | 用与数据源一致的写法，并逐字核对键名 |
| 没报错但结果不对 | 用 `isset` 校验下标却「通过了」 | 负数下标实测返回 `true` | 下标合法性自己判 `ge`/`lt`，别用 `isset` |
| 报错看不懂 | —— | 本函数在实测的几种输入下都不报错 | 若构建失败，问题多半在别处（如 `range` 的输入类型） |

更多排查入口见[故障排查](/troubleshooting/)。
