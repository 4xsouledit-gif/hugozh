+++
title = "strings.HasPrefix"
linkTitle = "HasPrefix"
description = "报告给定字符串是否以指定前缀开头。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/strings/hasprefix/"

[params.functions_and_methods]
signatures = ["strings.HasPrefix STRING PREFIX"]
returnType = "bool"
aliases = ["hasPrefix"]
+++

## 这一页解决什么问题

拿到一个路径或标识符后，要按「开头」分流：这个 `RelPermalink` 是不是 `/docs/` 下的页面、这个文件名是不是以 `draft-` 开头、这个版本号是不是 `v2`。`strings.HasPrefix` 返回 `true` / `false`，比 [`strings.Contains`](/functions/strings/contains/) 语义更准——`/blog/docs/` 里也含 `/docs/`，但它不是 `/docs/` 下的页面。

## 什么时候用，什么时候别用

**该用**：

- 按目录前缀给页面分组、加样式；
- 判断字符串是否以某个固定标记开头。

**别用**：

- 判断「里面有没有」→ 用 [`strings.Contains`](/functions/strings/contains/)；
- 判断结尾 → 用 [`strings.HasSuffix`](/functions/strings/hassuffix/)；
- 目的是**删掉**开头的前缀 → 用 [`strings.TrimPrefix`](/functions/strings/trimprefix/)（它一次调用就返回去掉前缀的字符串）；
- 前缀是模式（例如「以若干数字开头」）→ 用 [`strings.FindRE`](/functions/strings/findre/)。

## 用法

```go-html-template
{{ hasPrefix "Hugo" "Hu" }} → true
```

## 完整示例（实测）

```go-html-template {file="layouts/_partials/nav.html"}
{{ $p := "/docs/guide/" }}
{{ hasPrefix $p "/docs/" }}|{{ hasPrefix $p "/blog/" }}
```

Hugo 0.167.0 实测输出：

```text
true|false
```

**你应当看到什么**：路径以 `/docs/` 开头所以第一项为 `true`；第二项问的是 `/blog/`，为 `false`。检查区分大小写，且必须从第一个字符开始完全一致。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hasPrefix "Hugo" "Hu" }}` | `true` | 否 |
| `{{ hasPrefix "Hugo" "hu" }}` | `false`（区分大小写） | 否 |
| `{{ hasPrefix "" "" }}` | `true`（空前缀匹配任何字符串） | 否 |
| 前缀比字符串长 | `false`，不会报错 | 否 |
| 返回类型 | `bool`，永远不会是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `/blog/docs/x` 也被当成 `/docs/` 下的页面 | 本函数只看开头；含 `/docs/` 不等于以 `/docs/` 开头（`Contains` 才会命中） | 确认需求是「开头」还是「包含」，再选函数 |
| 没报错但结果不对 | 大小写不同导致判断失败 | 检查区分大小写（实测 `"Hugo"` 不以 `"hu"` 开头） | 先 `lower` 两边再判断 |
| 没报错但结果不对 | 想让前缀「消失」却只是得到 `true` | 本函数只回答是否，不修改字符串 | 要拿到去掉前缀的结果用 [`strings.TrimPrefix`](/functions/strings/trimprefix/) |

更多排查入口见[故障排查](/troubleshooting/)。
