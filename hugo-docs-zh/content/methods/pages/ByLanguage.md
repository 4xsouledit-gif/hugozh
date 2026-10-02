+++
title = "ByLanguage"
linkTitle = "ByLanguage"
description = "返回给定页面集合按语言排序后的结果。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/pages/bylanguage/"

[params.functions_and_methods]
signatures = ["PAGES.ByLanguage"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把集合按**语言**再按日期排序，用于「把所有语言的页面汇总到一起」的列表（语言切换器、全站最新内容、跨语言归档）。

上游明确说明：**这个方法几乎用不到**。原因有二，都值得先记住：

1. 已经包含多种语言的集合——例如 [`Rotate`](/methods/page/rotate/)、[`Translations`](/methods/page/translations/)、[`AllTranslations`](/methods/page/alltranslations/) 返回的那些——**本来就已经按语言权重排好**；
2. 单语言站点上调用它不会报错，但排序会退化成「日期降序」（实测），结果常常不是你想要的。

## 什么时候用，什么时候别用

**该用**：

- 一个**混合了多种语言**的集合（例如按上游示例那样遍历 `hugo.Sites` 汇总），需要确定性的语言顺序；
- 想自己验证 `Translations` 一类方法的排序口径。

**别用**：

- 单语言站点 → 用 [`ByDate`](/methods/pages/bydate/) 或 [`ByWeight`](/methods/pages/byweight/) 表达真实意图；
- 只想要「按语言分组」展示 → 用 [`GroupBy`](/methods/pages/groupby/) 配 `Language.Lang`，更好读；
- 页面级的多语言导航 → 直接用 [`Translations`](/methods/page/translations/) / [`AllTranslations`](/methods/page/alltranslations/)。

## 用法

按语言排序时，Hugo 使用以下优先级对页面集合排序：

1. 语言权重（升序）
1. 日期（降序）
1. LinkTitle（升序）

这个方法几乎用不到。已经包含多种语言的页面集合，例如 `Page` 对象上的 [`Rotate`][]、[`Translations`][] 或 [`AllTranslations`][] 方法返回的集合，本身就按语言权重排好序了。

下面这个刻意构造的例子先把所有站点的页面汇总起来，再按语言排序：

```go-html-template
{{ $p := slice }}
{{ range hugo.Sites }}
  {{ range .Pages }}
    {{ $p = $p | append . }}
  {{ end }}
{{ end }}

{{ range $p.ByLanguage }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range $p.ByLanguage.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

[`AllTranslations`]: /methods/page/alltranslations/
[`Rotate`]: /methods/page/rotate/
[`Translations`]: /methods/page/translations/

## 完整示例：三语言站点上的效果

站点配置（`hugo.toml`）三个语言权重依次为 1、2、3：

```toml
[languages]
  [languages.en]
    weight = 1
  [languages.fr]
    weight = 2
  [languages.de]
    weight = 3
```

每个语言两页，`date` 各不相同：`en` 为 2024-01-01 (`en-two`) 与 2023-01-01 (`en-one`)；`fr` 为 2025-01-01 (`fr-two`) 与 2022-01-01 (`fr-one`)；`de` 为 2021-01-01 (`de-one`) 与 2020-01-01 (`de-two`)。

```go-html-template {file="layouts/index.html"}
{{ $p := slice }}
{{ range hugo.Sites }}
  {{ range .RegularPages }}
    {{ $p = $p | append . }}
  {{ end }}
{{ end }}
{{ range $p.ByLanguage }}{{ .Language.Lang }}:{{ .LinkTitle }} {{ end }}
```

Hugo 渲染为：

```html
en:en-two en:en-one fr:fr-two fr:fr-one de:de-one de:de-two 
```

**你应当看到什么**：先按语言权重升序分成 `en`（权重 1）、`fr`（2）、`de`（3）三段；每段内部按**日期降序**（`en-two` 2024 在 `en-one` 2023 之前，`fr-two` 2025 在 `fr-one` 2022 之前，`de-one` 2021 在 `de-two` 2020 之前）。注意 `.Reverse` 是**整体反转**：语言变成权重降序，每段内部的日期也随之变成升序。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；多语言站点 `locale` 未设置，`timeZone = 'UTC'`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 三语言集合（权重 1/2/3） | `en:en-two en:en-one fr:fr-two fr:fr-one de:de-one de:de-two` | 否 |
| 单语言站点（四页同语言） | 退化为**日期降序**：`delta bravo alpha charlie` | 否 |
| 单语言站点 + `.Reverse` | `charlie alpha bravo delta`（整体反转，于是变成日期升序） | 否 |
| 空集合 | 空集合：`range` 无输出 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 单语言站点上列表变成「最新在前」 | 语言权重全都相同，于是退化到第二优先级「日期降序」 | 单语言站点别用它；用 `ByDate` / `ByWeight` |
| 没报错但结果不对 | `.Reverse` 后期望「只反转语言顺序」，结果段内顺序也反了 | `Reverse` 反转的是整个集合 | 需要自定义顺序时，先 `GroupBy` 再逐组排序 |
| 没报错但结果不对 | 用 `.Pages` 汇总多语言时少了页面 | `.Pages` 是当前站点/当前语言的集合 | 按上游示例改用 `hugo.Sites` 遍历后再排序 |
| 报错看不懂 | `can't evaluate field ByLanguage in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`、`.Translations`） |
