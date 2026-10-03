+++
title = "os.ReadDir"
linkTitle = "ReadDir"
description = "返回按文件名排序的 FileInfo 结构数组，每个目录条目对应一个元素。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/os/readdir/"

[params.functions_and_methods]
signatures = ["os.ReadDir PATH"]
returnType = "os.FileInfo"
aliases = ["readDir"]
+++

## 这一页解决什么问题

要**列出一个目录里有什么**：生成文件索引、列出 `static/downloads/` 下的可下载文件、遍历一组约定的数据文件。`os.ReadDir` 返回按文件名排序的条目列表，每个条目带 `.Name`、`.IsDir` 等字段，可以直接 `range`。

## 什么时候用，什么时候别用

**该用**：

- 目录内容由文件系统决定（新增文件无需改模板）；
- 需要区分条目是文件还是目录。

**别用**：

- 需要**递归**遍历子目录 → 本函数不递归（上游明确说明），要在模板里自己写递归局部模板；
- 只判断某个路径是否存在 → 用 [`os.FileExists`](/functions/os/fileexists/)；
- 读单个文件内容 → 用 [`os.ReadFile`](/functions/os/readfile/)；
- 列出**站点页面** → 用 `.Pages`、`.RegularPages` 等页面集合，不要用文件系统函数（它们看不到 Hugo 的页面模型）。

## 用法

`os.ReadDir` 函数相对于项目目录的根解析路径。路径开头的分隔符（`/`）是可选的。

目录结构如下：

```tree
content/
├── about.md
├── contact.md
└── news/
    ├── article-1.md
    └── article-2.md
```

以下模板代码：

```go-html-template
{{ range readDir "content" }}
  {{ .Name }} → {{ .IsDir }}
{{ end }}
```

输出：

```html
about.md → false
contact.md → false
news → true
```

注意，`os.ReadDir` 不会递归。

`FileInfo` 结构的详细信息见 [Go 文档][Go documentation]。

[Go documentation]: https://pkg.go.dev/io/fs#FileInfo

## 完整示例（实测）

在上面这份目录结构下：

```go-html-template {file="layouts/_partials/dir-index.html"}
[{{ range readDir "content" }}{{ .Name }}:{{ .IsDir }};{{ end }}]
[{{ range readDir "content/news" }}{{ .Name }};{{ end }}]
```

Hugo 0.167.0 实测输出：

```text
[about.md:false;contact.md:false;news:true;]
[article-1.md;article-2.md;]
```

**你应当看到什么**：条目按**文件名排序**（`about.md` → `contact.md` → `news`），`news` 的 `IsDir` 是 `true`；第二行显示子目录里的两个文件——但要注意这是**显式**再调一次 `readDir` 的结果，`readDir "content"` 自己不会列出 `article-1.md`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 目录存在（实测 `"content"`） | 按文件名**排序**的条目列表，目录条目的 `.IsDir` 为 `true` | 否 |
| 子目录内容 | 需要对该子目录**单独**调用一次，不会自动递归 | 否 |
| 路径不存在（实测 `readDir "nope"`） | 空结果，`range` 不进入循环 | **否**——不报错，容易被误当成「空目录」 |
| 带前导斜杠（`"/content"`） | 与不带斜杠等价（上游说明） | 否 |
| 返回类型 | 条目数组（签名写作 `os.FileInfo`）；每个元素可访问 `.Name`、`.IsDir` 等 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 列表总是空的，也不报错 | 路径写错，而本函数对不存在的目录返回空结果（实测 `"nope"` 不报错） | 先用 [`os.FileExists`](/functions/os/fileexists/) 确认目录存在 |
| 没报错但结果不对 | 子目录里的文件没出现 | 本函数**不递归** | 对子目录再调一次，或写递归局部模板 |
| 没报错但结果不对 | 顺序与文件系统里的显示顺序不同 | 结果是按文件名排序的 | 需要别的顺序就在模板里 `sort` |
| 报错看不懂 | 想列站点页面却用了文件系统函数 | `readDir` 看到的是磁盘文件，不是 Hugo 页面 | 页面用 `.Pages`、`.RegularPages` |

更多排查入口见[故障排查](/troubleshooting/)。
