+++
title = "Name"
linkTitle = "Name"
description = "返回短代码文件名，不含文件扩展名。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/shortcode/name/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Name"]
returnType = "string"
+++

## 这一页解决什么问题

`Name` 返回当前短代码**模板文件名**（不含扩展名）。它本身不改变渲染结果，唯一用途是**报错时让读者知道是哪个短代码出了问题**——尤其在主题或组件库里，短代码由别人编写，光看「缺少参数」四个字根本不知道该去哪里改。

它几乎总是和 [`Position`](/methods/shortcode/position/) 一起出现：一个给出「谁」，一个给出「在哪一行调用」。

## 什么时候用，什么时候别用

**该用**：

- 短代码有**必填参数**，缺失时用 `errorf` 报出短代码名与调用位置；
- 主题/组件库里给使用者提供可定位的错误信息；
- 调试时临时打印「当前短代码是谁」。

**别用**：

- 想在页面上显示内容 → `Name` 是文件名（如 `card`），不是展示文本；展示内容请用参数；
- 想区分**同一次调用的不同实例** → 用 [`Ordinal`](/methods/shortcode/ordinal/)（`Name` 在多次调用里是同一个值）；
- 想拿到调用时写的名字 → 没有这样的值：调用名与模板文件名必须一致，`Name` 返回的就是文件名。

## 用法

`Name` 方法在报告错误时很有用。例如，如果你的短代码需要一个「greeting」参数：

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

内容 `content/scname.md` 里调用它（不传参数）：

```md {file="content/scname.md"}
{{</* name-error */>}}
```

构建输出（实测，构建以非零码退出）：

```text
ERROR The "name-error" shortcode requires a 'greeting' argument. See "C:\Users\hencter\AppData\Local\Temp\hugo-methods-lab\content\scname.md:5:1"
```

**你应当看到什么**：消息里三部分都来自模板自身的数据——

1. `"name-error"` 是 `%q` 格式化后的 `.Name`，也就是**模板文件名**（`layouts/_shortcodes/name-error.html` 去扩展名）。把模板改名为 `myshortcode.html`，这里就会是 `"myshortcode"`；
2. `C:\...\content\scname.md` 是 `.Position` 给出的**调用所在的内容文件**；
3. `:5:1` 是行号与列号。

这样使用者一眼就知道去哪个内容文件、改哪一行。

短代码放在子目录时，`Name` 会带上目录名。实测 `layouts/_shortcodes/sub/named-demo.html` 中输出 `.Name` 得到：

```text
sub/named-demo
```

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 常规短代码 | 模板文件名不含扩展名，实测 `name-error`、`myshortcode` | 否 |
| 子目录里的短代码 | 带目录前缀，实测 `sub/named-demo` | 否 |
| 同一短代码被多次调用 | 每次都是同一个 `Name`（不区分实例） | 否 |
| 用于 `errorf` 且构建失败 | 消息出现在日志里，构建退出码非 0 | 是（构建失败） |
| 短代码没有名字（不可能发生） | —— | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建失败 | 日志里只有 `errorf` 的消息，不知道去哪改 | 只报了缺参数，没有报短代码名 | 照本页写法带上 `.Name` 与 `.Position` |
| 没报错但结果不对 | 想用 `Name` 在页面上输出标题 | `Name` 是模板文件名 | 展示内容用参数（如 `.Get "title"`） |
| 没报错但结果不对 | 以为 `Name` 能区分多次调用 | 多次调用的 `Name` 相同 | 用 `.Ordinal` 生成唯一 ID |

更多排查入口见[故障排查](/troubleshooting/)。
