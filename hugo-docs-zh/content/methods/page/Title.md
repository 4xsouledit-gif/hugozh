+++
title = "Title"
linkTitle = "Title"
description = "返回给定页面的标题。"
date = 2026-10-02
weight = 830
source = "https://gohugo.io/methods/page/title/"

[params.functions_and_methods]
signatures = ["PAGE.Title"]
returnType = "string"
+++

对于由文件支撑的页面，`Title` 方法返回前置元数据中定义的 `title` 字段：

```toml
title = 'About us'
```

```go-html-template
{{ .Title }} → About us
```

当页面不是由文件支撑时，`Title` 方法返回的值取决于页面的[类型](g)。

页面类型|页面不是由文件支撑时的页面标题
:--|:--
home|站点标题
section|section 名称（首字母大写并复数化）
taxonomy|分类法名称（首字母大写）
term|术语名称（首字母大写）

你可以在项目配置中禁用自动首字母大写与复数化：

```toml
capitalizeListTitles = false
pluralizeListTitles = false
```

你可以在项目配置中把首字母大写风格改为 `ap`、`chicago`、`go`、`firstupper` 或 `none` 之一。例如：

```toml
titleCaseStyle = "firstupper"
```

详见[说明][]。

[details]: /configuration/all/#title-case-style
