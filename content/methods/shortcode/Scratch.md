+++
title = "Scratch"
linkTitle = "Scratch"
description = "返回一个持久化的数据结构，用于存储和操作带 key 的值，作用域为当前短代码。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/shortcode/scratch/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Scratch"]
returnType = "maps.Scratch"
+++

**（0.139.0 起弃用）**

请改用 [`SHORTCODE.Store`](/methods/shortcode/store/) 方法。

这是一次软弃用。该方法会在将来的某个版本中移除，但移除日期尚未确定。尽管你继续使用该方法时 Hugo 不会发出警告，但你应该尽快开始使用 `SHORTCODE.Store`。

从 v0.139.0 开始，`SHORTCODE.Scratch` 方法已成为 `SHORTCODE.Store` 的别名。

## 这一页解决什么问题

短代码模板里需要**临时存一个值**：先算出来、等一会儿再用；或者在一个循环里累加。用模板变量通常就够了，但当值要在模板的多个位置之间传递、或写法上用变量不方便时，`Scratch` 提供了「带 key 的小仓库」。

本页保留的原因是老项目里仍会看到 `.Scratch`。它的现代写法就是 [`Store`](/methods/shortcode/store/)：**同一个对象、同一套 `Set`/`Get`/`Add` 等方法**，只是名字更短。

## 什么时候用，什么时候别用

- **新代码：用 [`Store`](/methods/shortcode/store/)。** 0.139.0 起 `Scratch` 只是 `Store` 的别名，两者行为一致（软弃用期间使用 `.Scratch` 不会打印警告，但随时可能被移除）。
- **维护老项目：** 见到 `.Scratch` 可以原样保留，也可以顺手换成 `.Store`，不需要改其他写法。
- **其实很多场景不需要它**：上游提醒，自从 Hugo 提供 [`newScratch`](/functions/collections/newscratch/) 函数、以及可以在初始化后给模板变量重新赋值以来，短代码里的 `Store`/`Scratch` 已基本不是必需品。能用 `{{ $x = … }}` 表达的，优先用变量。
- **别指望它跨调用共享**：作用域是**当前这一次短代码调用**——同一短代码在同一页被调用两次，第二次读不到第一次写的值（见 [`Store`](/methods/shortcode/store/) 的实测）。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

```go-html-template {file="layouts/_shortcodes/scratch-demo.html"}
{{ .Scratch.Set "n" 42 }}<p>Scratch：{{ .Scratch.Get "n" }}</p>
```

```md {file="content/about.md"}
{{</* scratch-demo */>}}
```

Hugo 渲染为（实测，构建期间**没有**弃用警告）：

```html
<p>Scratch：42</p>
```

**你应当看到什么**：写入与读取发生在同一次调用里，输出 `42`。构建日志里不会出现关于 `Scratch` 的警告——这是「软弃用」的含义；但升级 Hugo 时不要指望它永远存在。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 同一次调用内 `Set` 后 `Get` | 取回写入的值（实测 `42`） | 否 |
| 读取从未写入的 key | 空值，`with` 判为假 | 否 |
| 构建日志 | 软弃用期间不打印警告（实测无 WARN） | 否 |
| 跨两次同短代码调用共享 | 不共享（作用域是单次调用；见 [`Store`](/methods/shortcode/store/)） | 否 |
| 返回值类型 | `maps.Scratch` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 升级后报错 | 新版本里 `.Scratch` 消失 | 软弃用最终会变成移除（`Err` 方法就是先例） | 现在就把 `.Scratch` 换成 `.Store` |
| 没报错但结果不对 | 第二次调用读不到第一次写的值 | 作用域是单次调用，不是整个页面 | 需要跨调用传递就在调用方显式传参 |
| 没报错但结果不对 | 明明只写了一次，却读出奇怪的值 | key 与写入时不一致（`Set`/`Get` 的 key 必须逐字符相同） | 统一 key 的写法 |
| 过度设计 | 模板里到处 `Set`/`Get` | 用普通模板变量更直观 | 优先 `{{ $x := … }}` / `{{ $x = … }}` |

更多排查入口见[故障排查](/troubleshooting/)。
