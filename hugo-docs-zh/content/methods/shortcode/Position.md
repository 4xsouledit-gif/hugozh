+++
title = "Position"
linkTitle = "Position"
description = "返回调用该短代码的文件名和位置。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/methods/shortcode/position/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Position"]
returnType = "text.Position"
+++

## 这一页解决什么问题

短代码报错时，光说「参数不对」没用——使用者需要知道**去哪个内容文件的哪一行改**。`Position` 给出的正是这个位置：调用该短代码的**内容文件路径 + 行号 + 列号**。

它与 [`Name`](/methods/shortcode/name/) 是一对：`Name` 说「哪个短代码坏了」，`Position` 说「坏在哪一行」。两者一起写进 [`errorf`](/functions/fmt/errorf/) 消息，主题使用者就不必翻源码找原因。

## 什么时候用，什么时候别用

**该用**：

- 短代码校验参数后报错，需要给使用者可定位的信息；
- 多个页面共用同一短代码，报错时必须指回具体页面；
- 调试短代码被调用的位置（临时打印）。

**别用**：

- 想在正常渲染里输出「这是第几行」之类的信息 → 计算位置有开销，上游明确建议**只在报错时用**；
- 想区分同一次调用的顺序 → 用 [`Ordinal`](/methods/shortcode/ordinal/)；
- 想拿到页面 URL → 用 [`Page`](/methods/shortcode/page/) 的 `.RelPermalink`。

`Position` 方法在报告错误时很有用。例如，如果你的短代码需要一个「greeting」参数：

```go-html-template {file="layouts/_shortcodes/myshortcode.html"}
{{ $greeting := "" }}
{{ with .Get "greeting" }}
  {{ $greeting = . }}
{{ else }}
  {{ errorf "The %q shortcode requires a 'greeting' argument. See %s" .Name .Position }}
{{ end }}
```

在没有「greeting」参数时，Hugo 会抛出错误消息并让构建失败：

```text
ERROR The "myshortcode" shortcode requires a 'greeting' argument. See "/home/user/project/content/about.md:11:1"
```

> [!NOTE]
> 计算位置信息的开销可能较大。请只在报告错误时使用它。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

模板 `layouts/_shortcodes/name-error.html`：

```go-html-template {file="layouts/_shortcodes/name-error.html"}
{{ $greeting := "" }}
{{ with .Get "greeting" }}
  {{ $greeting = . }}
{{ else }}
  {{ errorf "The %q shortcode requires a 'greeting' argument. See %s" .Name .Position }}
{{ end }}
```

内容 `content/scname.md`（第 5 行调用它，未传参数）：

```md {file="content/scname.md"}
{{</* name-error */>}}
```

构建输出（实测，构建以非零码退出）：

```text
ERROR The "name-error" shortcode requires a 'greeting' argument. See "C:\Users\hencter\AppData\Local\Temp\hugo-methods-lab\content\scname.md:5:1"
```

**你应当看到什么**：`See` 后面的字符串就是 `.Position`，格式是 `<内容文件的绝对路径>:<行>:<列>`。上面这条实测消息里，`:5:1` 正是调用所在的行列——使用者据此直接跳到该文件第 5 行。

单独打印它也能看清这个形状（实测一个位于 `content/scdoc.md` 第 66 行的调用）：

```text
{{ .Position }} → "C:\Users\hencter\AppData\Local\Temp\hugo-methods-lab\content\scdoc.md:66:1"
```

> [!TIP]
> 位置里的路径是**构建机器上的绝对路径**，因此会把本机目录结构暴露在错误消息里。公开的示例站点如果展示构建日志，记得先替换成相对路径——本站上面的实测输出就保留了原始绝对路径，以便读者看清格式。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 常规调用 | `text.Position`，字符串形态为 `"<绝对路径>:<行>:<列>"`（实测 `…\content\scdoc.md:66:1`） | 否 |
| 用于 `errorf` | 消息里带上该位置，构建失败、退出码非 0 | 是（构建失败） |
| 短代码来自主题/模块 | 路径指向实际被调用的内容文件 | 否 |
| 在循环/条件里调用多次 | 每次返回各自的位置 | 否 |
| 未在报错场景使用 | 可用，但上游提示计算开销较大 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 输出的位置带引号、看起来不像纯文本 | `Position` 的字符串形态自带引号 | 需要裸路径时用 `strings.Trim` 去掉引号，或接受它的显示效果 |
| 报错看不懂 | 错误消息里的路径是本机绝对路径 | 这就是 `Position` 的原始值 | 面向公开日志时替换或截断路径 |
| 性能 | 模板渲染变慢 | 在循环/大量调用中计算位置 | 只在错误分支里读 `.Position` |
| 构建失败 | `errorf` 让整站构建中止 | 这是 `errorf` 的语义 | 需要「只警告不中断」时用 [`warnf`](/functions/fmt/warnf/) |

更多排查入口见[故障排查](/troubleshooting/)。
