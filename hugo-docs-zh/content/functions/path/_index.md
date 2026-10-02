+++
title = "路径函数"
linkTitle = "path"
description = "用这些函数处理文件路径。"
date = 2026-10-02
weight = 220
source = "https://gohugo.io/functions/path/"
+++

这一章的函数处理的是**路径字符串**，不碰文件系统：拆分、取扩展名、拼接、规范化。它们统一按斜杠（`/`）理解路径，实测 Windows 反斜杠也会被换算成 `/`，所以同一段模板在三个平台上的输出一致。

需要提醒的是：这些函数的空输入行为不算直观（`path.Base ""` 返回 `.`、`path.Dir "news.html"` 返回 `.`），每页的「返回值边界（实测）」都单列了这些特例。

## 读完本章你应该能够

- 在 `Base`、`BaseName`、`Ext`、`Dir`、`Split` 之间按需要选对函数，并说清哪些会保留扩展名、哪些不会；
- 知道 `path.Split` 的 `.Dir` 保留结尾斜杠、`.File` 是尾段，因此 `Dir + File` 能还原原路径；
- 用 `path.Join` 拼接路径并理解它会顺带做规范化（含 `..`、空段、重复斜杠）；
- 记住空输入与 `nil` 的返回值（多为 `"."` 或 `""`），避免页面上出现孤立的点；
- 知道路径函数不拼 `baseURL`，生成站内地址还要再过 `urls` 系列。

## 建议阅读顺序

1. **[path.Base](/functions/path/base/)** —— 取尾段，最常用。
2. **[path.BaseName](/functions/path/basename/)** —— 再去掉扩展名，注意 `.gitignore` 这类隐藏文件的特例。
3. **[path.Ext](/functions/path/ext/)** —— 只要扩展名（**带点**）。
4. **[path.Dir](/functions/path/dir/)** —— 目录部分，注意无目录时返回 `.`。
5. **[path.Split](/functions/path/split/)** —— 一次拿到目录与文件名，比 `Dir` + `Base` 更贴合原路径。
6. **[path.Join](/functions/path/join/)** / **[path.Clean](/functions/path/clean/)** —— 拼接与规范化，注意上游示例里有一行在 0.167 上不成立（本页实测已注明）。

> [!TIP]
> 处理页面自身的地址时，先看页面对象上有没有现成的属性（`.RelPermalink`、`.Section`、`.File`），比对永久链接做字符串切割更稳。
