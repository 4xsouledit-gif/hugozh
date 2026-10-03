+++
title = "path.Join"
linkTitle = "Join"
description = "把给定的路径元素拼接为单个路径，返回与之等价的最短路径名；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/path/join/"

[params.functions_and_methods]
signatures = ["path.Join ELEMENT..."]
returnType = "string"
+++

## 这一页解决什么问题

把几段拼成一条路径：`path.Join "images" $year "photo.webp"`。看起来用 `printf "%s/%s"` 也能做，但手写拼接要自己处理斜杠重复、空段、`.` 与 `..`；`path.Join` 一次搞定，而且它内部做了 [`path.Clean`](/functions/path/clean/)，结果一定是规范形式（实测 `path.Join "a\\b" "c"` 在 Windows 上得到 `a/b/c`）。

## 什么时候用，什么时候别用

**该用**：

- 路径段里有变量，段数不固定；
- 段尾可能带或不带 `/`（`"images/"` 与 `"images"` 都行，实测结果一致）；
- 需要顺带处理 `..`、`.`、空段。

**别用**：

- 想拼的是 **URL 且要带域名/子路径** → 拼完再过 [`urls.RelURL`](/functions/urls/relurl/) 或 [`urls.AbsURL`](/functions/urls/absurl/)；`Join` 不认识 `baseURL`；
- 想校验路径是否合法（`..` 越界等）→ 本函数会把 `..` 直接消解掉，并不报错；
- 想把**切片**的所有元素拼起来 → 用 [`collections.Delimit`](/functions/collections/delimit/)（内部即 `strings.Join` 的用法），`path.Join` 接收的是逐个参数；
- 想输出 URL 查询串 → 用 [`urls.PathEscape`](/functions/urls/pathescape/)，`Join` 不做百分号编码。

## 上游给出的结果

详见 Go 的 [`path.Join`][] 与 [`path.Clean`][] 文档。

```go-html-template
{{ path.Join "partial" "news.html" }} → partial/news.html
{{ path.Join "partial/" "news.html" }} → partial/news.html
{{ path.Join "foo/bar" "baz" }} → foo/bar/baz
{{ path.Join "foo" "bar" "baz" }} → foo/bar/baz
{{ path.Join "foo" "" "baz" }} → foo/baz
{{ path.Join "foo" "." "baz" }} → foo/baz
{{ path.Join "foo" ".." "baz" }} → baz
{{ path.Join "/.." "foo" ".." "baz" }} → baz
```

> [!NOTE]
> **实测：最后一行与上游示例不一致。** 在 Hugo 0.167.0 上 `path.Join "/.." "foo" ".." "baz"` 返回 `/baz`（带前导斜杠），不是上游写的 `baz`。原因是首段 `/..` 规范化后只剩根斜杠，后面的 `..` 无法再向上越出根目录。本页示例中凡涉及该行为处以实测为准。

## 完整示例：拼接图片路径

```go-html-template {file="layouts/_partials/join.html"}
{{ $p := "images" }}
<p>{{ path.Join $p "2024" "photo.webp" }}</p>
<p>{{ path.Join "images/" "photo.webp" }}</p>
<p>{{ path.Join "/.." "foo" ".." "baz" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>images/2024/photo.webp</p>
<p>images/photo.webp</p>
<p>/baz</p>
```

**你应当看到什么**：第一、二行说明结尾斜杠不会被拼成双斜杠；第三行就是上面 NOTE 里那条与上游不一致的结果——**如果你按上游示例预期 `baz`，在 0.167 上会拿到 `/baz`**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `path.Join "partial" "news.html"` / `"partial/" "news.html"` | `partial/news.html`（两者相同） | 否 |
| `path.Join "foo" "" "baz"` | `foo/baz`（空段被忽略） | 否 |
| `path.Join "foo" "." "baz"` | `foo/baz` | 否 |
| `path.Join "foo" ".." "baz"` | `baz` | 否 |
| `path.Join "/.." "foo" ".." "baz"` | `/baz`（**与上游示例 `baz` 不一致**） | 否 |
| `path.Join "a\\b" "c"`（Windows 反斜杠） | `a/b/c` | 否 |
| `path.Join "only"`（单个元素） | `only` | 否 |
| `path.Join`（零个元素） | `""`（空字符串，上游未说明） | 否 |
| `path.Join 1 2`（数字） | `1/2` | 否 |
| `path.Join "a" nil` | `a`（nil 段被忽略） | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 拼接 `..` 时结果带上/去掉了前导斜杠，与文档不符 | 上游示例在 0.167 上不成立（实测返回 `/baz`） | 以实测为准；需要确定的前导斜杠语义就自己补/删 |
| 没报错但结果不对 | 拼出来的地址打不开 | 结果是不带域名与站点子路径的纯路径 | 再过 [`urls.RelURL`](/functions/urls/relurl/) |
| 没报错但结果不对 | 想用 `..` 做安全检查，结果 `..` 消失了 | `Join` 内部做 `Clean`，直接消解 `..` | 安全校验要单独做，不要依赖拼接结果 |
| 报错看不懂 | 结果里出现 `%!s(...)` 之类 | 传了非字符串且格式不符 | 传字符串，或用 [`cast.ToString`](/functions/cast/tostring/) 先转换 |

更多排查入口见[故障排查](/troubleshooting/)。

[`path.Clean`]: https://pkg.go.dev/path#Clean
[`path.Join`]: https://pkg.go.dev/path#Join
