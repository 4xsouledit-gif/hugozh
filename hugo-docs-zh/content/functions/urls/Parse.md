+++
title = "urls.Parse"
linkTitle = "Parse"
description = "解析给定 URL，返回一个 URL 结构体。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/urls/parse/"

[params.functions_and_methods]
signatures = ["urls.Parse URL"]
returnType = "url.URL"
+++

## 这一页解决什么问题

拿到一条地址后要**分别**取出它的部分：域名是谁、路径是什么、查询参数有几个、锚点是什么。模板里靠字符串切分很脆弱，`urls.Parse` 把地址解析成 Go 的 `url.URL` 结构体，之后就能按字段名取值或调用 `Query.Get`。

典型场景：判断链接是不是外链（比较主机名）、给外部图片加参数、从带查询串的地址里取出某个参数。

## 什么时候用，什么时候别用

**该用**：

- 需要按结构访问地址的各个部分（主机、路径、查询、片段）；
- 需要解析查询参数（`Query.Get`、`Query.Has`）。

**别用**：

- 只是想拼出地址 → 用 [`urls.AbsURL`](/functions/urls/absurl/)、[`urls.RelURL`](/functions/urls/relurl/)、[`urls.JoinPath`](/functions/urls/joinpath/)；
- 只想判断是不是以 `http` 开头 → 用 [`strings.HasPrefix`](/functions/strings/hasprefix/) 更快；
- 想生成可以放进 `<a href>` 的字符串 → 解析结果需要取 `.String`；只是规范化地址则未必值得解析。

## 用法

`urls.Parse` 函数把 URL 解析为一个 [URL 结构体][URL structure]。URL 可以是相对形式（一条路径，没有主机名），也可以是绝对形式（以[方案][scheme]开头）。解析无效 URL 时 Hugo 会抛出错误。

```go-html-template
{{ $url := "https://example.org:123/foo?a=6&b=7#bar" }}
{{ $u := urls.Parse $url }}

{{ $u.String }} → https://example.org:123/foo?a=6&b=7#bar
{{ $u.IsAbs }} → true
{{ $u.Scheme }} → https
{{ $u.Host }} → example.org:123
{{ $u.Hostname }} → example.org
{{ $u.RequestURI }} → /foo?a=6&b=7
{{ $u.Path }} → /foo
{{ $u.RawQuery }} → a=6&b=7
{{ $u.Query }} → map[a:[6] b:[7]]
{{ $u.Query.a }} → [6]
{{ $u.Query.Get "a" }} → 6
{{ $u.Query.Has "b" }} → true
{{ $u.Fragment }} → bar
```

[URL structure]: https://godoc.org/net/url#URL
[scheme]: https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml#uri-schemes-1

## 完整示例（实测）

```go-html-template {file="layouts/_partials/link-parts.html"}
{{ $u := urls.Parse "https://example.org:123/foo?a=6&b=7#bar" }}
主机={{ $u.Hostname }}|路径={{ $u.Path }}|参数 a={{ $u.Query.Get "a" }}|有 b={{ $u.Query.Has "b" }}|锚点={{ $u.Fragment }}
```

Hugo 0.167.0 实测输出：

```text
主机=example.org|路径=/foo|参数 a=6|有 b=true|锚点=bar
```

**你应当看到什么**：`Hostname` 去掉了端口（`Host` 才是 `example.org:123`），`Query.Get "a"` 直接拿到字符串 `6`，`Query.Has "b"` 返回布尔值。要拿整条地址就用 `.String`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 绝对地址（实测上游示例那条） | 各字段如上游表格（`Host`=`example.org:123`，`Hostname`=`example.org`，`Query`=`map[a:[6] b:[7]]`） | 否 |
| 相对地址（实测 `"/foo?a=1#f"`） | `IsAbs`=`false`，`Scheme` 与 `Host` 都是空字符串，`Path`=`/foo`，`RawQuery`=`a=1`，`Fragment`=`f`，`String`=`/foo?a=1#f` | 否 |
| 非法地址（实测 `"http://[::1"`） | —— | **是，构建失败**：`error calling Parse: parse "http://[::1": missing ']' in host` |
| 非法地址（实测 `"://bad"`） | —— | **是，构建失败**：`error calling Parse: parse "://bad": missing protocol scheme` |
| 返回类型 | `url.URL` 结构体（不是字符串）；要字符串请取 `.String` | 否 |

> [!NOTE]
> 页面在网页里显示时，`&` 会按 HTML 规则转义成 `&amp;`。上面表格写的是**函数返回的原始值**。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `missing ']' in host` / `missing protocol scheme`，整站构建失败 | 传入的地址本身不合法；Hugo 直接让构建失败 | 先用 `with` 判断来源可信，或在数据源头修正地址 |
| 没报错但结果不对 | 拿到的域名带了端口 | 用的是 `Host` 而不是 `Hostname` | 只要主机名就用 `.Hostname`（实测它去掉 `:123`） |
| 没报错但结果不对 | `Query.Get` 取不到值 | 参数名大小写不符，或值在片段（`#`）之后 | 用 `Query.Has` 先确认；片段部分用 `.Fragment` |
| 没报错但结果不对 | 把结构体直接输出 | `url.URL` 是结构体，不是字符串 | 取 `.String` 或具体字段 |

更多排查入口见[故障排查](/troubleshooting/)。
