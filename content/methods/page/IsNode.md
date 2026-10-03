+++
title = "IsNode"
linkTitle = "IsNode"
description = "报告给定页面是否为一个分支包。"
date = 2026-10-02
weight = 330
source = "https://gohugo.io/methods/page/isnode/"

[params.functions_and_methods]
signatures = ["PAGE.IsNode"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsNode` 是历史上的「这个页面是不是列表型页面（首页 / section / 分类法 / 术语）」判断。它**已经弃用**，本页只用于读懂老主题与老模板：见到 `.IsNode` 就应替换掉。

## 什么时候用，什么时候别用

**该用**：

- 几乎没有新场景。维护老主题时，先确认它想表达什么语义，再替换：
  - 「是分支页面」→ [`IsBranch`](/methods/page/isbranch/)
  - 「不是普通内容页」→ `not .IsPage`

**别用**：

- 新写的模板一律不要用 `IsNode`：实测本版本会在构建日志里输出弃用警告，配合 `--panicOnWarning` 会**直接让构建失败**。

## 用法

**（0.163.0 起弃用）** 请改用 [`IsBranch`](/methods/page/isbranch/) 方法。

## 完整示例：用 IsBranch 替换 IsNode

老模板（会触发弃用警告）：

```go-html-template {file="layouts/_default/list.html"}
{{ if .IsNode }}
  {{ range .Pages }}<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>{{ end }}
{{ end }}
```

替换为：

```go-html-template {file="layouts/_default/list.html"}
{{ if .IsBranch }}
  {{ range .Pages }}<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>{{ end }}
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，两种写法的输出相同（`/docs/guide/` 上都会列出该 section 的子页面），但只有第一种会打印弃用警告：

```text
WARN  deprecated: .Page.IsNode was deprecated in Hugo v0.163.0 and will be removed in a future release. Use .Page.IsBranch or not .Page.IsPage instead.
```

**你应当看到什么**：构建退出码都是 0，但警告会混在日志里；如果 CI 用了 `--panicOnWarning`，带 `IsNode` 的构建会失败。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；同一站点内对照 `IsBranch`。

| 页面 | `IsNode`（实测） | 对应 `IsBranch` |
| --- | --- | --- |
| 首页 | `true` | `true` |
| section 页 | `true` | `true` |
| 普通内容页 / 叶子包页面 | `false` | `false` |
| 术语页 | `true` | `true` |
| 返回类型 | `bool` | `bool` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| CI 构建失败 | `--panicOnWarning` 下构建中断，日志里有 `deprecated` | 模板使用了已弃用的 `IsNode` | 改成 `IsBranch` 或 `not .IsPage` |
| 没报错但结果不对 | 老主题把叶子包也当成分支 | 老写法用 `IsNode` 的语义不够精确 | 需要区分包类型时用 [`BundleType`](/methods/page/bundletype/) |
| 升级后行为变化 | 与旧版本输出不一致 | 弃用期内的行为差异 | 按上游迁移建议统一改用 `IsBranch` |

更多排查入口见[故障排查](/troubleshooting/)。

