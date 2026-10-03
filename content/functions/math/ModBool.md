+++
title = "math.ModBool"
linkTitle = "math.ModBool"
description = "报告两个整数的模是否等于 0。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/functions/math/modbool/"

[params.functions_and_methods]
signatures = ["math.ModBool VALUE1 VALUE2"]
returnType = "bool"
aliases = ["modBool"]
+++

## 这一页解决什么问题

「第 n 行是不是偶数行」「这个数字能不能被 3 整除」——这类判断只需要真假，不需要余数本身。`modBool` 把「取模 + 判断为 0」合成一步，读起来也比 `eq (mod $i 2) 0` 更直白。

```go-html-template
{{ modBool 15 3 }} → true
```

## 什么时候用，什么时候别用

**该用**：

- 交替样式（斑马纹）、按固定周期分组；
- 判断整除关系。

**别用**：

- 需要余数本身做下标 → 用 [`math.Mod`](/functions/math/mod/)；
- 想判断奇偶但更看重可读性 → 两种写法等价，`modBool $i 2` 已经足够清楚；
- 操作数是浮点数 → 该函数只接受整数（与 [`math.Mod`](/functions/math/mod/) 相同）。

## 完整示例：给列表加斑马纹

```go-html-template {file="layouts/_partials/zebra.html"}
{{ range $i, $p := slice "a" "b" "c" }}<li class="{{ if modBool $i 2 }}even{{ else }}odd{{ end }}">{{ $p }}</li>
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<li class="even">a</li>
<li class="odd">b</li>
<li class="even">c</li>
```

**你应当看到什么**：`range` 的索引 `$i` **从 0 开始**，所以第一项是 `even`。如果你希望「第一行是 odd」，把两个类名对调，或者判断 `modBool (add $i 1) 2`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `15 3` | `true` | 否 |
| `15 4` | `false` | 否 |
| `$i = 0`、除数 `2` | `true`（0 能被 2 整除） | 否 |
| 非整数 | —— | 是：与 [`math.Mod`](/functions/math/mod/) 相同的「需要整数」类错误 |
| 除数为 0 | —— | 是：除零错误（同 [`math.Mod`](/functions/math/mod/)） |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 第一条的样式和预期相反 | `range` 索引从 0 开始 | 对调类名，或用 `modBool (add $i 1) 2` |
| 报错看不懂 | 报错提到需要整数 | 传入了浮点数或字符串 | 用 [`cast.ToInt`](/functions/cast/toint/) 转换 |
| 没报错但结果不对 | 周期分组错位 | 除数是集合长度时，写法写反了 | 确认是 `modBool $i (len $groups)` |

更多排查入口见[故障排查](/troubleshooting/)。
