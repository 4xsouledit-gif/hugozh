+++
title = "hugo.BuildDate"
linkTitle = "hugo.BuildDate"
description = "返回 Hugo 二进制的编译日期。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/hugo/builddate/"

[params.functions_and_methods]
signatures = ["hugo.BuildDate"]
returnType = "string"
+++

## 这一页解决什么问题

排查构建问题时，别人第一个要问的就是「你用的是哪个 Hugo」。版本号有时不够用：同一版本号下，官方发布的二进制与你自己编译的二进制，编译日期并不相同。`hugo.BuildDate` 返回当前 Hugo 二进制的编译时间，格式遵循 [RFC 3339][]，可以直接写进页脚、版本页或 issue 模板。

## 什么时候用，什么时候别用

**该用**：

- 页面或调试输出里要标明构建工具的编译时间；
- 收集环境信息时与 [`hugo.Version`](/functions/hugo/version/)、[`hugo.CommitHash`](/functions/hugo/commithash/) 一起打印。

**别用**：

- 想判断某个功能是否可用 → 用 [`hugo.Version`](/functions/hugo/version/)（还能配合 [`hugo.IsExtended`](/functions/hugo/isextended/)）；**编译日期与版本号没有对应关系**，用它做版本判断一定出错；
- 想显示「本站最后更新时间」 → 那是内容页的 `date`/`lastmod`，不是 Hugo 二进制的编译日期。

`hugo.BuildDate` 是**字段值，不是方法**：直接写 `hugo.BuildDate` 即可，不要写成 `hugo.BuildDate "参数"`（实测会构建失败，见文末边界表）。

上游给出的示意输出：

```go-html-template
{{ hugo.BuildDate }} → 2023-11-01T17:57:00Z
```

## 完整示例：把构建信息写进页脚

```go-html-template {file="layouts/_partials/build-info.html"}
<p>Hugo {{ hugo.Version }}，编译于 {{ hugo.BuildDate }}</p>
```

在本机（Hugo 0.167.0 extended，Windows）实测渲染为：

```html
<p>Hugo 0.167.0，编译于 2026-09-28T14:50:38Z</p>
```

**你应当看到什么**：一个 RFC 3339 时间戳，末尾是 `Z`（UTC）。换一台机器、换一个二进制，这个值就会不同——所以文档里的示例值不必与你的输出一致。

它也是可解析的时间字符串，实测可以与 [`time.AsTime`](/functions/time/astime/) 配合：

```go-html-template
{{ (time.AsTime hugo.BuildDate).Format "2006-01-02" }} → 2026-09-28
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点 `hugo --source <临时目录> --ignoreCache`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hugo.BuildDate }}` | `string`，形如 `2026-09-28T14:50:38Z` | 否 |
| 空值 / `nil` | 不适用：该值由二进制本身提供，恒有值 | 否 |
| 传入参数 `{{ hugo.BuildDate "x" }}` | —— | 是：`BuildDate has arguments but cannot be invoked as function`（说明它是字段而非方法） |
| 返回类型（`printf "%T"`） | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `BuildDate has arguments but cannot be invoked as function` | 把字段当方法调用，加了括号或参数 | 去掉参数，直接写 `{{ hugo.BuildDate }}` |
| 没报错但结果不对 | 用编译日期判断「我的 Hugo 够不够新」 | 编译日期与版本号无关，同一版本可以有不同的编译日期 | 判断版本用 [`hugo.Version`](/functions/hugo/version/) |
| 没报错但结果不对 | 页脚显示的日期不是内容的更新时间 | 把 Hugo 二进制的编译日期当成了站点/页面日期 | 站点日期请用页面上下文的 `date`、`lastmod` |

更多排查入口见[故障排查](/troubleshooting/)。

[RFC 3339]: https://datatracker.ietf.org/doc/html/rfc3339
