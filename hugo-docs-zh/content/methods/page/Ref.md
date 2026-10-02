+++
title = "Ref"
linkTitle = "Ref"
description = "返回具有给定路径、语言和输出格式的页面的绝对 URL。"
date = 2026-10-02
weight = 630
source = "https://gohugo.io/methods/page/ref/"

[params.functions_and_methods]
signatures = ["PAGE.Ref OPTIONS"]
returnType = "string"
+++

## 这一页解决什么问题

在模板里手写链接（`<a href="/posts/post-1/">`）有两个隐患：页面路径一改（改文件名、加 slug、换语言）链接就 404，而且 Hugo 不会提醒你。`.Ref` 用**逻辑路径**解析页面并返回其**绝对 URL**，构建时就校验目标是否存在——链接坏了会直接报错，而不是上线后才发现。

它和 [`.RelRef`](/methods/page/relref/) 是同一个东西的两种口味：`.Ref` 给绝对 URL（`https://example.org/...`），`.RelRef` 给相对 URL（`/.../`）。站内链接用 `.RelRef`，跨系统输出用 `.Ref`。

## 什么时候用，什么时候别用

**该用**：

- 需要绝对 URL，且目标是站内页面：RSS、JSON 输出、`og:url`、跨语言链接；
- 想「链接坏了在构建时就报错」——这是它比手写路径最大的优势。

**别用**：

- 站内 `<a href>` → 用 [`.RelRef`](/methods/page/relref/)（绝对 URL 在本地预览与子路径部署时反而麻烦）；
- 手上已经有目标页面的 `Page` 对象 → 直接用那个对象的 `.Permalink` / `.RelPermalink`；
- 链接到**资源文件**（图片、CSS）→ 用资源对象的 `.Permalink`，`.Ref` 只解析页面。

## 用法

`Ref` 方法只接受一个参数：一个选项映射。

### 选项

`path`
: （`string`）目标页面的路径。不带前导斜杠（`/`）的路径会先相对于当前页面解析，再相对于站点的其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选。

### 示例

以下示例展示的是英文版站点上某个页面的渲染输出：

```go-html-template
{{ $opts := dict "path" "/books/book-1" }}
{{ .Ref $opts }} → https://example.org/en/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" }}
{{ .Ref $opts }} → https://example.org/de/books/book-1/

{{ $opts := dict "path" "/books/book-1" "lang" "de" "outputFormat" "json" }}
{{ .Ref $opts }} → https://example.org/de/books/book-1/index.json
```

### 错误处理

默认情况下，如果 Hugo 无法解析该路径，它会抛出错误并导致构建失败。你可以在项目配置中把它改为警告，并指定无法解析路径时要返回的 URL。

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

## 完整示例：三种 path 写法

测试站是多语言站点（`en` 默认、`zh` 第二语言），模板放在内容页 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ .Ref (dict "path" "/posts/post-2") }}      {{/* 绝对逻辑路径 */}}
{{ .Ref (dict "path" "post-1") }}             {{/* 相对当前页所在目录 */}}
{{ .Ref (dict "path" "/posts/post-1" "lang" "zh") }}  {{/* 指定语言 */}}
```

在 `/posts/post-2/`（英文）上实测（Hugo 0.167.0）：

```html
https://example.org/posts/post-2/
https://example.org/posts/first-post/
https://example.org/zh/posts/post-1/
```

**你应当看到什么**：

- 第一行是绝对逻辑路径，原样解析；
- 第二行 `post-1` **没有**前导斜杠，先按「当前页面所在目录」解析，命中 `/posts/post-1`；又因为该页设了 `slug = "first-post"`，**URL 用 slug**（`/posts/first-post/`）——逻辑路径与 URL 的差别在这里同时体现；
- 第三行 `lang = "zh"` 指向中文版，URL 带 `/zh/` 前缀（中文页上同样写法会得到 `https://example.org/zh/...`）。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `path` 指向存在的页面 | 该页面的绝对 URL（实测） | 否 |
| `path` 不带前导斜杠 | 先相对当前页面解析，再相对站点解析（实测 `post-1` → `/posts/first-post/`） | 否 |
| `lang` 指向另一语言 | 返回该语言版本的 URL（实测 `/zh/posts/post-1/`） | 否 |
| `path` 指向不存在的页面 | —— | 是：`ERROR [en] REF_NOT_FOUND: Ref "/nope" from page "/posts/plain-demo": page not found`，构建退出码 1 |
| 配置 `refLinksErrorLevel = 'warning'` | 降级为警告，返回 `refLinksNotFoundURL`（上游说明） | 否 |
| 只接受一个参数 | 传多个参数会报「参数数量」错误；正确写法是 `dict` | 是 |
| 返回类型 | `string`（绝对 URL） | 否 |

> [!WARNING]
> `.Ref` 传入不存在的路径会**让整个构建失败**（不是只坏一个链接）。这也意味着：内容里引用的页面被删掉时，构建会立刻拦住你——这是特性，不是 bug。

更多排查入口见[故障排查](/troubleshooting/)。
