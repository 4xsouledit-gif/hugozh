+++
title = "Param"
linkTitle = "Param"
description = "返回给定 key 对应的站点参数。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/methods/site/param/"

[params.functions_and_methods]
signatures = ["SITE.Param KEY"]
returnType = "any"
+++

## 这一页解决什么问题

`Param` 用**一个字符串**去查站点参数。相比直接写 `.Site.Params.foo`，它多解决三件事：

1. key 可以来自变量（循环、partial 参数、数据文件），不必写死在模板里；
2. key 不是合法[标识符](g)时也能取（例如 `copyright-year` 含连字符）；
3. 可以用点号访问**嵌套**参数：`.Site.Param "author.name"`。

它返回的值类型取决于配置里写的是什么（`any`），所以取不到时**不报错，只得到空值**。

## 什么时候用，什么时候别用

**该用**：

- key 是动态的：`{{ range $key := slice "subtitle" "tagline" }}{{ $.Site.Param $key }}{{ end }}`；
- key 含连字符或点号等不能直接用链式语法的情况；
- 想用一个统一的调用点去读「站点参数 + 页面参数」——页面上的 `Param` 方法语义相同（见 [methods/page](/methods/page/)）。

**别用**：

- key 固定且是合法标识符 → 直接写 `.Site.Params.subtitle`，少一层间接，拼错时也更容易发现；
- 读页面自己的参数 → 用页面的 `.Params` / `.Param`；
- 期待「取不到就报错」→ 实测返回 `nil`（打印为空），拼错 key 的模板会静默失去内容。

## 用法

`Site` 对象上的 `Param` 方法是一个便捷方法，用于返回项目配置中某个用户自定义参数的值。

```toml
[params]
display_toc = true
```

```go-html-template
{{ .Site.Param "display_toc" }} → true
```

上面的写法等价于下面任意一种：

```go-html-template
{{ .Site.Params.display_toc }}
{{ index .Site.Params "display_toc" }}
```

## 完整示例（实测）

配置：

```toml
[params]
display_toc = true
copyright-year = '2023'

[params.author]
  email = 'jsmith@example.org'
  name = 'John Smith'
```

模板：

```go-html-template {file="layouts/_partials/meta.html"}
<p>display_toc：{{ .Site.Param "display_toc" }}</p>
<p>嵌套值：{{ .Site.Param "author.name" }}</p>
<p>带连字符的 key：{{ .Site.Param "copyright-year" }}</p>
<p>写错的 key：[{{ .Site.Param "display_tocs" }}]</p>
```

Hugo 渲染为：

```html
<p>display_toc：true</p>
<p>嵌套值：John Smith</p>
<p>带连字符的 key：2023</p>
<p>写错的 key：[]</p>
```

**你应当看到什么**：点号可以一路取到嵌套映射（`author.name`），带连字符的 key 也能直接传字符串；而**拼错的 key 不报错**，只是渲染成空——把结果放进方括号或配合 `with` / `default` 使用，能让这类错误显形。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，配置如上，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 布尔参数（`display_toc`） | `true`（`bool`） | 否 |
| 字符串参数（`copyright-year`） | `'2023'`（`string`） | 否 |
| 嵌套 key（`"author.name"`） | `John Smith`，点号可用 | 否 |
| 取整个嵌套映射（`"author"`） | `map[email:jsmith@example.org name:John Smith]` | 否 |
| 不存在的 key | `nil`（打印为空，`with` 判为假） | 否 |
| 返回值类型 | `any`（实际类型随配置而定） | 否 |
| 传入非字符串 key（如 `1`） | `nil`（打印为空），不报错 | 否 |
