+++
title = "encoding.Base64Decode"
linkTitle = "Base64Decode"
description = "返回给定内容的 base64 解码结果。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/encoding/base64decode/"

[params.functions_and_methods]
signatures = ["encoding.Base64Decode INPUT"]
returnType = "string"
aliases = ["base64Decode"]
+++

## 这一页解决什么问题

对方给出的数据是 base64（API 返回的 `content` 字段、`data:` URI 的后半段、配置文件里存的凭证），模板要把原文取出来。`base64Decode` 就是 [`encoding.Base64Encode`](/functions/encoding/base64encode/) 的逆操作。

它按 **UTF-8** 把解出的字节转成字符串，所以解中文没有问题（实测 `5Lit5paH` → `中文`）。

## 什么时候用，什么时候别用

**该用**：

- 解码 API 响应、数据文件里 base64 字段，交给 [`markdownify`](/functions/transform/markdownify/) 或直接输出；
- 处理 `data:…;base64,…` URI 的内容部分（`;base64,` 之后那一段）。

**别用**：

- 解出来的内容是**二进制**（图片、压缩包）→ 本函数返回 `string`，二进制会得到损坏的文本；图片走 [`resources`](/functions/resources/) 或 `resources.GetRemote` 的字节处理；
- 输入是 URL 安全 base64（含 `-`、`_`）→ **实测会报错**（`illegal base64 data at input byte 0`）；先替换字符表再解码；
- 输入缺少 `=` 补齐 → **实测报错**（`illegal base64 data at input byte 4`），需要自己补齐；
- 想校验数据完整性/防篡改 → base64 只编码，不校验；用 [`crypto`](/functions/crypto/) 的 HMAC 系列。

## 上游给出的结果

```go-html-template
{{ "SHVnbw==" | base64Decode }} → Hugo
```

用 `base64Decode` 函数可以解码 API 的响应。例如，调用 GitHub API 得到的响应中，包含仓库 README 文件的 base64 编码表示：

```text
https://api.github.com/repos/gohugoio/hugo/readme
```

要取回并渲染其中的内容：

```go-html-template
{{ $url := "https://api.github.com/repos/gohugoio/hugo/readme" }}
{{ with try (resources.GetRemote $url) }}
  {{ with .Err }}
    {{ errorf "%s" . }}
  {{ else with .Value }}
    {{ with . | transform.Unmarshal }}
      {{ .content | base64Decode | markdownify }}
    {{ end }}
  {{ else }}
    {{ errorf "Unable to get remote resource %q" $url }}
  {{ end }}
{{ end }}
```

> [!NOTE]
> 上面这段需要联网访问 GitHub API（还可能触发限流），本站**未实测**，也不为它给出输出。它在上游文档中同样没有给出渲染结果。

## 完整示例：解码 base64 文本

```go-html-template {file="layouts/_partials/b64d.html"}
{{ $s := "SHVnbw==" }}
<p>{{ $s | base64Decode }}</p>
<p>{{ "5Lit5paH" | base64Decode }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>Hugo</p>
<p>中文</p>
```

**你应当看到什么**：两行都还原成原文；第二行说明 UTF-8 中文可以正常解回，不需要额外指定字符集。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"SHVnbw=="` | `Hugo` | 否 |
| `"5Lit5paH"` | `中文`（UTF-8） | 否 |
| `""` | `""` | 否 |
| `"SHVnbw"`（缺少补齐的 `=`） | —— | 是：`error calling base64Decode: illegal base64 data at input byte 4` |
| `"!!!"`（非法字符） | —— | 是：`error calling base64Decode: illegal base64 data at input byte 0` |
| `"_w"`（URL 安全字母表） | —— | 是：`error calling base64Decode: illegal base64 data at input byte 0` |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `illegal base64 data at input byte 4` | 输入缺少结尾的 `=` 补齐，或长度不对 | 按 base64 规则补 `=`（长度模 4 决定补几个） |
| 报错看不懂 | `illegal base64 data at input byte 0` | 输入含 URL 安全字符 `-`/`_` 或换行、空格 | 先替换回 `+`/`/`，并去掉空白字符 |
| 没报错但结果不对 | 结果看起来是乱码 | 原文是二进制，不是文本 | 二进制不要用本函数，改用资源对象 |
| 没报错但结果不对 | 解出来是 Markdown 但页面显示成一行 | Markdown 没有渲染 | 接 [`markdownify`](/functions/transform/markdownify/) |

更多排查入口见[故障排查](/troubleshooting/)。
