+++
title = "path.Clean"
linkTitle = "Clean"
description = "返回与给定路径等价的最短路径名；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/path/clean/"

[params.functions_and_methods]
signatures = ["path.Clean PATH"]
returnType = "string"
+++

## 这一页解决什么问题

路径是拼出来的，拼出来就容易出现 `/a//b/`、`/a/./b/`、`/a/../b/` 这类冗余写法。浏览器大多能容忍，但**比较字符串时不能**：`eq $a $b` 会把 `/a//b/` 和 `/a/b` 判成不同。`path.Clean` 把路径规范成最短等价形式，让比较和输出都稳定。

它只做字符串层面的规范化，不检查文件是否存在，也不会把相对路径变成绝对路径。

## 什么时候用，什么时候别用

**该用**：

- 拼接后统一格式，再输出到 `href`/`src`；
- 比较两个路径是否等价；
- 手工处理 `..`（例如从前缀路径里退一级）。

**别用**：

- 想把相对路径解析成基于 `baseURL` 的地址 → 用 [`urls.RelURL`](/functions/urls/relurl/)；`Clean` 不认 `baseURL`；
- 想得到完整 URL → 用 [`urls.AbsURL`](/functions/urls/absurl/)；
- 想拼接多段路径 → 用 [`path.Join`](/functions/path/join/)（它内部已经做了 `Clean` 的工作）；
- 想处理 URL 的查询串、百分号编码 → `Clean` 不理解这些，用 [`urls`](/functions/urls/) 系列或 [`urls.PathEscape`](/functions/urls/pathescape/)；
- 处理**文件系统**路径且需要操作系统语义 → 用的是 [`os`](/functions/os/) 系列（`os.DirEntry` 等）；本函数始终按斜杠处理，实测 Windows 反斜杠也会被换成 `/`。

## 上游给出的结果

详见 Go 的 [`path.Clean`][] 文档。

```go-html-template
{{ path.Clean "foo/bar" }} → foo/bar
{{ path.Clean "/foo/bar" }} → /foo/bar
{{ path.Clean "/foo/bar/" }} → /foo/bar
{{ path.Clean "/foo//bar/" }} → /foo/bar
{{ path.Clean "/foo/./bar/" }} → /foo/bar
{{ path.Clean "/foo/../bar/" }} → /bar
{{ path.Clean "/../foo/../bar/" }} → /bar
{{ path.Clean "" }} → .
```

## 完整示例：规范化拼接出来的路径

```go-html-template {file="layouts/_partials/clean.html"}
{{ $p := "/images//2024/../photo.webp" }}
<p>{{ path.Clean $p }}</p>
<p>{{ path.Clean "/a/b/" }}</p>
<p>{{ path.Clean "" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>/images/photo.webp</p>
<p>/a/b</p>
<p>.</p>
```

**你应当看到什么**：第一行同时消掉了重复斜杠与 `..`；第三行说明空输入返回 `.`（与 [`path.Base`](/functions/path/base/) 的空输入行为一致）。**注意**：`Clean` 会**保留结尾以外**的语义，但不会补 `baseURL`——要把结果当作站内地址用，还得过一层 [`urls.RelURL`](/functions/urls/relurl/)。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"foo/bar"`、`"/foo/bar/"` | `foo/bar`、`/foo/bar` | 否 |
| `"/foo//bar/"` | `/foo/bar`（合并重复斜杠） | 否 |
| `"/foo/./bar/"` | `/foo/bar`（去掉 `.`） | 否 |
| `"/foo/../bar/"`、`"/../foo/../bar/"` | `/bar`、`/bar` | 否 |
| `"."` | `"."` | 否 |
| `""` | `"."` | 否 |
| `nil` | `"."` | 否 |
| `"a\\b"`（Windows 反斜杠） | `a/b`（分隔符先被换成 `/`） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 空字符串路径在页面上渲染成一个 `.` | 空输入返回 `"."` | 先判断非空再 `Clean` |
| 没报错但结果不对 | `Clean` 之后地址还是打不开 | `Clean` 只做字符串规范化，不拼 `baseURL`，也不做百分号编码 | 再套一层 [`urls.RelURL`](/functions/urls/relurl/)，编码用 [`urls.PathEscape`](/functions/urls/pathescape/) |
| 没报错但结果不对 | 两个本该相同的路径比较不相等 | 比较之前没有统一规范化 | 两边都先 `Clean` 再比 |
| 没报错但结果不对 | Windows 路径里的 `\` 出现在输出里 | 直接输出了原字符串，没有过 `path` 系列函数 | 用 `path.Clean` / [`path.Join`](/functions/path/join/) 统一成 `/` |

更多排查入口见[故障排查](/troubleshooting/)。

[`path.Clean`]: https://pkg.go.dev/path#Clean
