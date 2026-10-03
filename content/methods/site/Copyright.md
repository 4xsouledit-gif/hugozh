+++
title = "Copyright"
linkTitle = "Copyright"
description = "返回项目配置中定义的版权声明。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/methods/site/copyright/"

[params.functions_and_methods]
signatures = ["SITE.Copyright"]
returnType = "string"
+++

## 这一页解决什么问题

`Copyright` 把配置里 `copyright` 的值原样交给模板，用于页脚、RSS 与 JSON 输出里那一行版权声明。它的价值在于**一处配置、多处复用**：改年份只改配置文件。

注意「原样」二字：它不做任何替换，也不会自动带上当前年份。配置里写什么，页面就显示什么。

## 什么时候用，什么时候别用

**该用**：

- 页脚 / feed / `llms.txt` 一类输出中的固定版权行；
- 希望版权文案由站点配置统一管理，避免模板里散落硬编码。

**别用**：

- 需要「当前年份」自动更新 → 配置里的字符串不会变；要动态年份就在模板里用 `now.Year` 自己拼，例如 `© {{ now.Year }} ABC Widgets, Inc.`；
- 需要按页面或按语言给出不同版权 → 这是**站点级**配置，页面级请用页面参数（[methods/page/params](/methods/page/params/)）。

## 用法

项目配置：

```toml
copyright = '© 2023 ABC Widgets, Inc.'
```

模板：

```go-html-template
{{ .Site.Copyright }} → © 2023 ABC Widgets, Inc.
```

## 完整示例（实测）

配置：

```toml
copyright = '© 2023 ABC Widgets, Inc.'
```

页脚模板（`layouts/_partials/footer.html`，经典布局下为 `layouts/partials/footer.html`）：

```go-html-template {file="layouts/_partials/footer.html"}
<footer>
  <p>{{ .Site.Copyright }}</p>
</footer>
```

Hugo 渲染为：

```html
<footer>
  <p>© 2023 ABC Widgets, Inc.</p>
</footer>
```

**你应当看到什么**：与配置文件里的字符串逐字相同（包括 `©` 号）。把它改成 `© 2024 ABC Widgets, Inc.`，页面立刻跟着变——不需要动任何模板。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 配置了 `copyright` | 原样返回该字符串 | 否 |
| 未配置 `copyright` | 空字符串（`{{ with }}` 判为假，`{{ if }}` 也判为假） | 否 |
| 字符串里含 `©` 等非 ASCII 字符 | 原样返回 | 否 |
| 返回值类型 | `string` | 否 |
