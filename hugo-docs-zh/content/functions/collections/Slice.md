+++
title = "collections.Slice"
linkTitle = "slice"
description = "根据给定的值创建一个切片。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/collections/slice/"

[params.functions_and_methods]
signatures = ["collections.Slice [VALUE...]"]
returnType = "[]any"
aliases = ["slice"]
+++

## 这一页解决什么问题

模板里要**手工造一个列表**时用 `slice`：把若干值打包成切片，交给 `range`、`delimit`、`first`、`where` 处理。它是模板里唯一一个不需要任何内容文件就能构造列表的函数，因此在给 partial 传固定选项、写调试示例、累积结果时最常用。

不带参数调用 `slice`（也就是 `slice`）会得到**空切片**，这是循环外初始化累积变量的标准写法。

## 什么时候用，什么时候别用

**该用**：

- 构造固定的选项列表（语言切换、导航项、测试数据）；
- 给 `range` 一个可迭代对象；
- 需要一个空列表作为起点：`{{ $s := slice }}`，之后在循环里 `$s = $s | append $x`。

**别用**：

- 想造映射（键值对）→ 用 [`collections.Dictionary`](/functions/collections/dictionary/)；
- 想造数字序列（1..10）→ 用 [`collections.Seq`](/functions/collections/seq/)；
- 想把字符串拆成列表 → 用 [`strings.Split`](/functions/strings/split/)；
- 想追加、去重、排序 → 用 [`collections.Append`](/functions/collections/append/)、[`collections.Uniq`](/functions/collections/uniq/)、[`collections.Sort`](/functions/collections/sort/)。

## 用法

```go-html-template
{{ $s := slice "a" "b" "c" }}
{{ $s }} → [a b c]
```

要创建空切片：

```go-html-template
{{ $s := slice }}
```

## 完整示例：造一个列表并逐项输出

```go-html-template {file="layouts/_partials/pager.html"}
{{ $s := slice "上一页" "目录" "下一页" }}
<ul>
  {{ range $s }}<li>{{ . }}</li>{{ end }}
</ul>
<p>长度：{{ len $s }}</p>
<p>混合类型：{{ slice 1 "a" true }}</p>
<p>嵌套：{{ slice (slice "a") (dict "k" 1) }}</p>
<p>空切片：{{ slice }}，长度 {{ len (slice) }}</p>
```

Hugo 渲染为（`range` 循环本身会留下空行，这里省略）：

```html
<ul>
  <li>上一页</li>
  <li>目录</li>
  <li>下一页</li>
</ul>
<p>长度：3</p>
<p>混合类型：[1 a true]</p>
<p>嵌套：[[a] map[k:1]]</p>
<p>空切片：[]，长度 0</p>
```

**你应当看到什么**：元素类型可以不同；元素本身也可以是切片或映射；`slice` 不带参数得到空切片，`len` 为 0。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 无参数（`slice`） | 空切片，`len` 为 0 | 否 |
| 元素类型混合 | 允许，返回 `[]any` | 否 |
| 元素是切片或映射 | 允许，成为嵌套元素（实测 `[[a] map[k:1]]`） | 否 |
| 元素是 `nil` | 允许，`nil` 作为一个元素（输出 `[<nil>]`） | 否 |
| 元素类型一致（如全是 `int`） | 返回具体类型，实测 `printf "%T"` 得 `[]int` | 否 |
| 返回类型 | 签名写作 `[]any`；元素同型时实测是 `[]int` 这类具体切片 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 以为 `slice "abc"` 会拆成三个元素 | 它只是「含一个元素 `abc` 的列表」 | 要拆分用 [`strings.Split`](/functions/strings/split/) |
| 没报错但结果不对 | 循环里累积结果始终只有最后一项 | 每轮都用 `slice` 重新造了空切片 | 循环外先 `$s := slice`，循环内 `$s = $s \| append $x` |
| 没报错但结果不对 | 直接把切片塞进 HTML，显示成 `[a b c]` | 切片不是字符串，输出的是它的 `%v` 表示 | 要显示文本先过 [`collections.Delimit`](/functions/collections/delimit/) |
| 报错看不懂 | `can't iterate over …` | 把非切片值交给了 `range` | 用 `slice` 包一层，或检查变量来源 |

更多排查入口见[故障排查](/troubleshooting/)。
