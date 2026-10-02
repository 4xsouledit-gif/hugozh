+++
title = "os.Stat"
linkTitle = "Stat"
description = "返回描述文件或目录的 FileInfo 结构。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/os/stat/"

[params.functions_and_methods]
signatures = ["os.Stat PATH"]
returnType = "os.FileInfo"
+++

## 这一页解决什么问题

需要文件或目录的**元信息**而不是内容：它是文件还是目录、多大、什么时候改的。典型场景是「列出下载目录并显示每个文件的大小」，或者「确认这个路径是文件而不是目录之后再读取」。`os.Stat` 返回 Go 的 `FileInfo` 结构。

## 什么时候用，什么时候别用

**该用**：

- 需要 `.IsDir` 区分文件与目录（[`os.FileExists`](/functions/os/fileexists/) 对两者都返回 `true`）；
- 需要 `.Size`（字节数）或 `.ModTime`（修改时间）。

**别用**：

- 只判断存在与否 → 用 [`os.FileExists`](/functions/os/fileexists/)；
- 想读内容 → 用 [`os.ReadFile`](/functions/os/readfile/)；
- 想列出目录条目 → 用 [`os.ReadDir`](/functions/os/readdir/)（它对每个条目也提供 `FileInfo`）；
- 想取**页面**的日期或大小 → 用页面自己的 `.Date`、`.Lastmod`，与文件系统无关。

## 用法

`os.Stat` 函数先尝试相对于项目目录的根解析路径。如果找不到匹配的文件或目录，它会尝试相对于 [`contentDir`][] 解析路径。路径开头的分隔符（`/`）是可选的。

```go-html-template
{{ $f := os.Stat "README.md" }}
{{ $f.IsDir }}    → false (bool)
{{ $f.ModTime }}  → 2021-11-25 10:06:49.315429236 -0800 PST (time.Time)
{{ $f.Name }}     → README.md (string)
{{ $f.Size }}     → 241 (int64)

{{ $d := os.Stat "content" }}
{{ $d.IsDir }}    → true (bool)
```

`FileInfo` 结构的详细信息见 [Go 文档][Go documentation]。

[Go documentation]: https://pkg.go.dev/io/fs#FileInfo
[`contentDir`]: /configuration/all/#contentdir

## 完整示例（实测）

项目根下有内容为 `This is **bold** text.` 的 `README.md`（22 字节），并有 `content/` 目录。

```go-html-template {file="layouts/_partials/file-meta.html"}
{{ $f := os.Stat "README.md" }}
[{{ $f.Name }}]|[{{ $f.IsDir }}]|[{{ $f.Size }}]|[{{ printf "%T" $f.ModTime }}]
{{ $d := os.Stat "content" }}
[{{ $d.Name }}]|[{{ $d.IsDir }}]
```

Hugo 0.167.0 实测输出：

```text
[README.md]|[false]|[22]|[time.Time]
[content]|[true]
```

**你应当看到什么**：`Size` 是**字节数**（那行文本加上结尾换行共 22 字节）；`ModTime` 的类型是 `time.Time`，可以直接交给 [`time.Format`](/functions/time/format/)；目录的 `IsDir` 为 `true`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 文件存在（实测 `"README.md"`） | `Name`=`README.md`，`IsDir`=`false`，`Size`=`22`，`ModTime` 类型为 `time.Time` | 否 |
| 目录存在（实测 `"content"`） | `Name`=`content`，`IsDir`=`true` | 否 |
| 路径不存在（实测 `os.Stat "nope"`） | 输出为空（没有可用的 `FileInfo`） | **否**——不报错，直接取字段会在后续报错 |
| 带前导斜杠 | 可选，与不带斜杠等价（上游说明） | 否 |
| 返回类型 | `os.FileInfo` 结构（不是字符串） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 判断「存在」通过了，但后面取字段报错 | `os.Stat` 对不存在的路径返回空值且**不报错**（实测） | 先用 [`os.FileExists`](/functions/os/fileexists/) 确认，或把结果放进 `with` 判断 |
| 没报错但结果不对 | 把目录当成文件读取 | 只判断了「存在」，没看 `.IsDir` | 用 `.IsDir` 区分（实测目录为 `true`） |
| 没报错但结果不对 | 大小与预期不符 | `.Size` 是**字节**数，中文一个字符占 3 字节 | 要字数用 [`strings.RuneCount`](/functions/strings/runecount/) |

更多排查入口见[故障排查](/troubleshooting/)。
