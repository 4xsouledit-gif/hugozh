+++
title = "strings.Title"
linkTitle = "Title"
description = "返回给定字符串，并转换为标题式大小写。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/strings/title/"

[params.functions_and_methods]
signatures = ["strings.Title STRING"]
returnType = "string"
aliases = ["title"]
+++

```go-html-template
{{ title "table of contents (TOC)" }} → Table of Contents (TOC)
```

默认情况下，Hugo 遵循 [Associated Press Stylebook][] 发布的大小写规则。如果你更希望采用以下某种方式，请修改[项目配置][]：

- 遵循 [Chicago Manual of Style][] 发布的大小写规则
- 每个单词的首字母都大写
- 只把第一个单词的首字母大写
- 关闭 `title` 函数的效果

如果主题使用了 `title` 函数，而你更愿意按需手动处理大小写，最后一种选项会很有用。

[Associated Press Stylebook]: https://www.apstylebook.com/
[Chicago Manual of Style]: https://www.chicagomanualofstyle.org/home.html
[project configuration]: /configuration/all/#title-case-style
