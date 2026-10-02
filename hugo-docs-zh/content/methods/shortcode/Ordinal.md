+++
title = "Ordinal"
linkTitle = "Ordinal"
description = "返回短代码相对于其父级的从零开始的序号。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/shortcode/ordinal/"

[params.functions_and_methods]
signatures = ["SHORTCODE.Ordinal"]
returnType = "int"
+++

`Ordinal` 方法返回短代码相对于其父级的从零开始的序号。如果父级就是页面本身，该序号表示这个短代码在页面内容中的位置。

> [!NOTE]
> 无论调用的是哪种具体的短代码类型，Hugo 都会在每次短代码调用时递增序号。也就是说，序号值是在给定页面内的所有短代码之间按顺序累计的。

## 这一页解决什么问题

同一个短代码在一页里被调用多次时，它会渲染出**多份结构相同、但应该互相区分**的 HTML——例如多个 `<img>` 需要不同的 `id`、多个折叠面板需要不同的锚点、多个标签页需要不同的 `aria-controls`。`Ordinal` 就是那份「当前是第几次调用」的编号，用它拼出唯一标识。

页面上的**第一个**短代码（任意类型）序号是 `0`，之后每调用一次加一。所以它同时也是「这个短代码在页面里的位置」。

## 什么时候用，什么时候别用

**该用**：

- 生成**唯一 ID**：`{{ printf "img-%03d" .Ordinal }}`；
- 生成成对的 `id`/`aria-controls`/`for` 之类需要前后对应的属性；
- 统计「本页第几个某类元素」用于排序或样式。

**别用**：

- 想表达内容的**语义顺序** → `Ordinal` 只是调用顺序；用你自己的参数（如 `weight`）更可靠；
- 想区分「哪个短代码」→ 用 [`Name`](/methods/shortcode/name/)；
- 想在**嵌套**里拿全局编号 → 子短代码的 `Ordinal` 是相对父级的，要全局位置只能自己传参。

## 用法

这个方法的一个用途是：当同一个短代码在同一个页面中被调用两次或更多次时，为元素指定唯一的 ID。例如：

```md {file="content/about.md"}
{{</* img src="images/a.jpg" */>}}

{{</* img src="images/b.jpg" */>}}
```

这个短代码先做错误检查，然后渲染一个带唯一 `id` 属性的 HTML `img` 元素：

```go-html-template {file="layouts/_shortcodes/img.html"}
{{ $src := "" }}
{{ with .Get "src" }}
  {{ $src = . }}
  {{ with resources.Get $src }}
    {{ $id := printf "img-%03d" $.Ordinal }}
    <img id="{{ $id }}" src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ else }}
    {{ errorf "The %q shortcode was unable to find %s. See %s" $.Name $src $.Position }}
  {{ end }}
{{ else }}
  {{ errorf "The %q shortcode requires a 'src' argument. See %s" .Name .Position }}
{{ end }}
```

Hugo 把页面渲染为：

```html
<img id="img-000" src="/images/a.jpg" width="600" height="400" alt="">
<img id="img-001" src="/images/b.jpg" width="600" height="400" alt="">
```

> [!NOTE]
> 在上面的_短代码_模板中，[`with`][] 语句用于创建条件块。请记住，`with` 语句会把上下文（点号）绑定到它的表达式上。在 `with` 块内部，调用短代码方法时要加上 `$` 前缀，才能访问传入模板的顶层上下文。

## 完整示例（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点，同一页面。先看**顶层调用如何累计**——下面这一页在 `ord` 之前已经用过 6 次其他短代码，所以序号从 `6` 开始：

```go-html-template {file="layouts/_shortcodes/ord.html"}
<p>ord 序号：{{ .Ordinal }}</p>
```

```md {file="content/scdoc.md"}
{{</* ord */>}}
{{</* ord */>}}
{{</* outer */>}}
A {{</* inner */>}} B {{</* inner */>}}
{{</* /outer */>}}
{{</* inner */>}}
```

Hugo 渲染为（实测）：

```html
<p>ord 序号：6</p>
<p>ord 序号：7</p>
<p>outer 序号：8，父级为空：true</p>
<p>A <p>inner 序号：0，父级：outer</p>
B <p>inner 序号：1，父级：outer</p></p>
<p>inner 序号：9，父级：（无，父级是页面）</p>
```

**你应当看到什么**——两个容易误解的地方：

1. **序号是整页累计的，跟短代码类型无关**：`ord`、`outer` 是完全不同的短代码，仍共用同一个计数器（6 → 7 → 8）。同一页面里第一个短代码是 `0`（在另一个页面上实测：三个 `myshortcode` 依次得到 `0`、`1`、`2`）；
2. **嵌套的子短代码重新从 0 开始**：父级 `outer` 是 8，但它内部的两个 `inner` 是 `0` 和 `1`——子级是**相对父级**编号的，而且不占用父级计数器（父级之后的下一个顶层 `inner` 拿到的是 9，而不是 11）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 页面上第一个短代码 | `0` | 否 |
| 同页后续顶层调用 | 每调用一次 +1，**跨短代码类型累计**（实测 6、7、8、然后 9） | 否 |
| 嵌套在父短代码内的子短代码 | 相对父级从 `0` 开始（实测 0、1），不消耗父级计数器 | 否 |
| 父级为页面本身时 | 表示该短代码在页面内容中的位置（上游说明，与实测一致） | 否 |
| 短代码在循环/条件里被跳过 | 只有**实际调用**的才计数 | 否 |
| 短代码在不同页面 | 每个页面各自计数 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 以为第一个 ID 是 `img-001`，结果是 `img-000` | `Ordinal` 从 `0` 开始 | 用 `printf "img-%03d"` 之类补零；要人类可读编号就自己加 1 |
| 没报错但结果不对 | 嵌套时 ID 撞车 | 子短代码的 `Ordinal` 相对父级，两个父级下都会出现 `0` | 拼上父级信息：`printf "%s-%d" .Parent.Name .Ordinal`，或由父级传参 |
| 没报错但结果不对 | 页面里加了别的短代码后 ID 变了 | 序号是整页累计的 | 把 ID 与其他短代码解耦（用内容参数或哈希），不要依赖绝对数字 |
| 没报错但结果不对 | 序号的起点不是 0 | 该页前面还有其他短代码 | 这是预期行为；需要「本类第几个」就自己计数 |

更多排查入口见[故障排查](/troubleshooting/)。

[`with`]: /functions/go-template/with/
