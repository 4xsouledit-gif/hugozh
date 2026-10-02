+++
title = "encoding.Base64Encode"
linkTitle = "Base64Encode"
description = "返回给定内容的 base64 编码结果。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/encoding/base64encode/"

[params.functions_and_methods]
signatures = ["encoding.Base64Encode INPUT"]
returnType = "string"
aliases = ["base64Encode"]
+++

## 这一页解决什么问题

要把一段文本放进「只能放 ASCII」的位置：JSON 字符串、URL 查询参数、`data:` URI、HTTP 头。base64 把这些字节变成只含 `A–Z a–z 0–9 + / =` 的字符串，传输过程中不会被转义或截断。

`base64Encode` 与 `encoding.Base64Encode` 是同一个函数：前者是别名，日常模板里两种写法都能用。

## 什么时候用，什么时候别用

**该用**：

- 把参数打包后放进 URL 或 JSON，避免特殊字符被解释；
- 生成 `data:image/png;base64,…` 之类的内联内容；
- 对接要求 base64 字段的第三方 API。

**别用**：

- 想**保密**数据 → base64 是编码不是加密，任何人都能解回来；要签名/校验用 [`crypto`](/functions/crypto/) 系列；
- 想缩小体积 → 实测 base64 会把 3 字节变成 4 个字符，体积增大约 1/3；
- 想把**图片**内联进页面 → 优先用 Hugo 的 [`resources`](/functions/resources/) 做图片处理，手工 base64 既不能压缩也不能生成 `srcset`；
- 需要 URL 安全变体（`-`、`_` 代替 `+`、`/`）→ 本函数用的是**标准** base64 字母表；放进 URL 时先用 [`urls.PathEscape`](/functions/urls/pathescape/) 或自己做字符替换；
- 输入是切片、映射 → `base64Encode` 只接受字符串，会直接报错（见边界表）。

## 上游给出的结果

```go-html-template
{{ "Hugo" | base64Encode }} → SHVnbw==
```

## 完整示例：编码文本与数字

```go-html-template {file="layouts/_partials/b64.html"}
{{ $s := "Hugo" }}
<p>{{ $s | base64Encode }}</p>
<p>{{ "中文" | base64Encode }}</p>
<p>{{ 42 | base64Encode }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>SHVnbw==</p>
<p>5Lit5paH</p>
<p>NDI=</p>
```

**你应当看到什么**：第二行说明中文按 **UTF-8 字节**编码（`中文` → `5Lit5paH`），解码端必须同样按 UTF-8 理解；第三行说明数字会先被当作字符串（`42` → `NDI=`，也就是 `"42"` 的编码）。末尾的 `=` 是补齐位，别自己删掉。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"Hugo"` | `SHVnbw==` | 否 |
| `"中文"` | `5Lit5paH`（按 UTF-8 字节编码） | 否 |
| `""` | `""`（空字符串） | 否 |
| 数字 `42` | `NDI=`（相当于 `"42"`） | 否 |
| 切片、映射（如 `dict "a" 1`） | —— | 是：`error calling Base64Encode: unable to cast map[string]interface {}{"a":1} of type map[string]interface {} to string` |
| 返回类型 | `string`，标准 base64 字母表（含 `+`、`/`、结尾 `=`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 解码端拿到乱码 | 编码与解码的字符集不一致（中文按 UTF-8） | 解码端按 UTF-8 处理；本站 [`encoding.Base64Decode`](/functions/encoding/base64decode/) 就是 UTF-8 |
| 没报错但结果不对 | 把结果直接放进 URL，出现 `+` 被当成空格 | 标准 base64 字母表包含 `+`、`/` | 先用 [`urls.PathEscape`](/functions/urls/pathescape/) 编码，或改用 URL 安全变体 |
| 没报错但结果不对 | 页面变大 | base64 有约 1/3 体积膨胀 | 图片、长文本不要内联，改走 [`resources`](/functions/resources/) |
| 报错看不懂 | `unable to cast ... to string` | 传了映射或切片 | 先 [`encoding.Jsonify`](/functions/encoding/jsonify/) 或 [`cast.ToString`](/functions/cast/tostring/) 转换 |

更多排查入口见[故障排查](/troubleshooting/)。
