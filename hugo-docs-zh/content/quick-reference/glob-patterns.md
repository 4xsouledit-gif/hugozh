+++
title = "Glob 模式"
linkTitle = "Glob 模式"
description = "Glob 模式的通配符、匹配规则与在 Hugo 中的用法。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/quick-reference/glob-patterns/"
+++

## 什么是 Glob 模式

Glob 模式（glob pattern）是用一组通配符来匹配多个值的写法。它把多个目标压缩成一个简短的表达式，因此适合对成组的数据或配置做批量处理，例如一次匹配某个目录下的全部图片，或一次匹配若干种文件扩展名。

下表列出 Hugo 支持的 glob 语法与匹配行为。每一行给出一种匹配类型、所用模式、用于测试的字符串，以及在测试字符串上求值得到的布尔结果。

| 匹配类型 | Glob 模式 | 测试字符串 | 是否匹配 |
| :--- | :--- | :--- | :--- |
| 简单通配 | `images/*.jpg` | `images/a.jpg` | true |
| 字面量匹配 | `images/a\*.jpg` | `images/a*.jpg` | true |
| 单层通配 | `images/*/a.jpg` | `images/foo/a.jpg` | true |
| 单层通配 | `images/*/a.jpg` | `images/foo/bar/a.jpg` | false |
| 多层通配 | `images/**/a.jpg` | `images/foo/bar/a.jpg` | true |
| 多层通配 | `images/**/a.jpg` | `images/a.jpg` | false |
| 单个字符 | `image.???` | `image.jpg` | true |
| 单个字符 | `image.???` | `image.avif` | false |
| 定界符排除 | `?at` | `f/at` | false |
| 字符列表 | `images/a.[jp]pg` | `images/a.jpg` | true |
| 取反列表 | `images/a.[!p]pg` | `images/a.jpg` | true |
| 字符范围 | `images/a-[a-c].jpg` | `images/a-b.jpg` | true |
| 字符范围 | `images/a-[a-c].jpg` | `images/a-z.jpg` | false |
| 取反范围 | `images/a-[!a-c].jpg` | `images/a-z.jpg` | true |
| 模式备选 | `images/*.{jpg,png}` | `images/logo.png` | true |
| 不匹配 | `images/*.{jpg,png}` | `images/logo.webp` | false |

## 匹配规则

匹配逻辑遵循以下规则。

- 标准通配符（`*`）匹配任意字符，但不匹配定界符。
- 超级通配符（`**`）匹配包括定界符在内的任意字符；但当它位于两个定界符之间时，至少需要一个中间字符，也就是说它不匹配零层目录。
- 单个字符（`?`）恰好匹配一个字符，且不匹配定界符。
- 取反（`!`）用在方括号内部时，匹配除列表或范围中指定的字符之外的任意字符。
- 字符范围（`[a-z]`）匹配指定范围内的任意单个字符。

## 定界符

定界符是斜杠（`/`）；只有在匹配语义化版本（semantic version）字符串时，定界符才是点号（`.`）。

## 转义

模式中的反斜杠用来取消下一个字符的特殊含义。上表里 `images/a\*.jpg` 能匹配 `images/a*.jpg`，正是因为其中的 `*` 被转义成了字面量，不再充当通配符。因此当文件名本身含有 `*`、`?`、`[`、`]`、`{`、`}` 这类字符时，需要逐个转义后才能写成模式。

把模式写进配置文件时还要注意引号：TOML 的基本字符串（双引号）本身会把反斜杠当作转义字符，所以上游示例改用单引号的字面量字符串，例如 `files = ['! docs/*']`。

## 在 Hugo 中的用法

Glob 模式出现在多个函数与配置项中，匹配的对象各不相同。

**资源查找。** 函数 `resources.GetMatch` 与 `resources.Match` 用来查找全局资源，方法 `Resources.GetMatch` 与 `Resources.Match` 用来查找页面资源。这两组都使用不区分大小写的 glob 模式。

```go-html-template
{{ with resources.GetMatch "images/*.jpg" }}
  <img src="{{ .RelPermalink }}" alt="">
{{ end }}
```

```go-html-template
{{ with .Resources.GetMatch "cover.*" }}
  <img src="{{ .RelPermalink }}" alt="">
{{ end }}
```

**页面资源元数据。** 页面前置字段 `resources` 数组中的 `pattern` 是 glob 模式，按相对于页面包的文件路径匹配一个或多个页面资源，匹配同样不区分大小写；匹配到多个资源时，同一份元数据会应用到每一个资源。

**页面匹配器。** 级联的 `target`、构建选项 `_build` 以及分段（segments）的筛选条件都使用页面匹配器，其中的 `environment`、`kind`、`path` 都是 glob 模式，例如 `{staging,production}`、`{taxonomy,term}`、`{/books,/books/**}`。

**模块挂载。** `module.mounts` 的 `files` 接受一个 glob 切片（glob slice），用来指定包含或排除哪些文件。切片中的模式以 `!` 加一个空格开头时表示取反；一旦取反项命中，切片中其余模式就不再参与求值，因此取反适合做早期、粗粒度的排除。

```text
[module]
  [[module.mounts]]
    source = 'content'
    target = 'content'
    files = ['! docs/*']
```

**部署目标。** `deployment.targets` 的 `include` 与 `exclude` 都是 glob 模式：本地文件未通过这两项过滤时不会上传，远端文件未通过这两项过滤时不会被删除。

**HTTP 缓存。** `HTTPCache` 的 `includes`、`excludes`，以及轮询所用的 `includes`、`excludes`，都是 glob 模式切片。这些模式针对完整的远程 URL 匹配，并以 `/` 作为路径分隔符，例如 `**.json`。

**开发服务器。** `[[server.redirects]]` 的 `from` 是 glob 模式，`fromHeaders` 的值也用 glob 模式匹配请求头；若 `from` 与 `fromRe` 同时设置，请求的 URL 必须同时匹配两者。

**命令行。** 全局选项 `--ignoreVendorPaths` 用一个 glob 模式指定哪些模块路径忽略其中的 `_vendor`；[hugo mod clean](/commands/hugo-mod-clean/) 的 `--pattern` 用 glob 模式挑选要清理的模块路径。

```bash
hugo mod clean --pattern "**hugo*"
```

## 注意事项与差异

- **并非所有「模式」都是 glob。** 部署 matcher 的 `pattern` 与服务器重定向的 `fromRe` 都是正则表达式，不能套用上面的通配符表。
- **大小写。** 资源查找与页面资源元数据的 `pattern` 采用不区分大小写的匹配；上游文档未对其它位置作此说明，不要默认它们也不区分大小写。
- **`**` 不匹配零层目录。** `images/**/a.jpg` 匹配 `images/foo/bar/a.jpg`，但不匹配 `images/a.jpg`。
- **定界符有例外。** 只有匹配语义化版本字符串时，定界符才是点号（`.`），其余场合都是斜杠（`/`）。

某个位置支持何种模式、匹配范围又是什么，最终以该处的说明为准，例如[配置 Hugo](/configuration/)、[Hugo 模块](/hugo-modules/)与[内容管理](/content-management/)中的对应页面。
