+++
title = "GroupByParam"
linkTitle = "GroupByParam"
description = "返回给定页面集合按指定参数升序分组后的结果。"
date = 2026-10-02
weight = 150
source = "https://gohugo.io/methods/pages/groupbyparam/"

[params.functions_and_methods]
signatures = ["PAGES.GroupByParam PARAM [SORT]"]
returnType = "page.PagesGroup"
+++

## 这一页解决什么问题

按**自定义前置元数据字段**分组：颜色、作者、难度、分区标签……凡是不是内置日期字段的分组都用它。

返回 `page.PagesGroup`：每组有 `.Key` 与 `.Pages`。`.Key` 的**类型跟随参数本身的类型**（实测：字符串参数得到 `string`，整数参数得到 `int`），所以比较或拼接时要留意类型。

> [!WARNING]
> 与 [`ByParam`](/methods/pages/byparam/) **不同**：没有写该参数的页面会被**直接丢掉**，不会出现在任何组里（实测）。分组前先把缺参数的页面补上默认值，否则它们会凭空消失。

## 什么时候用，什么时候别用

**该用**：

- 按自定义字段做分栏/归档（`color`、`category`、`difficulty`…），且**所有页面都写了这个字段**；
- 想按参数取值排序分组，而不是手写每一组。

**别用**：

- 有页面缺这个参数，又想保留它们 → 先用 [`collections.Where`](/functions/collections/where/) 过滤或补默认值，再分组；或改用 [`GroupBy`](/methods/pages/groupby/) + 自己判断；
- 按**日期参数**分组 → 用 [`GroupByParamDate`](/methods/pages/groupbyparamdate/)（时间点需要布局字符串才能变成组名）；
- 只想**排序** → 用 [`ByParam`](/methods/pages/byparam/)（它保留缺参数的页面）；
- 按内置字段分组 → 用 [`GroupBy`](/methods/pages/groupby/)。

## 用法

可选的排序顺序用 `asc` 指定升序，或用 `desc` 指定降序。

```go-html-template
{{ range .Pages.GroupByParam "color" }}
  <p>{{ .Key | title }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

要把各组改为降序排列：

```go-html-template
{{ range .Pages.GroupByParam "color" "desc" }}
  <p>{{ .Key | title }}</p>
  <ul>
    {{ range .Pages }}
      <li><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
    {{ end }}
  </ul>
{{ end }}
```

## 完整示例：缺参数的页面会被丢掉

示例沿用本章首页的[示例站点结构](/methods/pages/)：四页都有 `color`，但只有 `post-1`、`post-3` 有 `rank`。

```go-html-template {file="layouts/_default/list.html"}
按 color：{{ range .Pages.GroupByParam "color" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
按 color 降序：{{ range .Pages.GroupByParam "color" "desc" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
按 rank（两页没写）：{{ range .Pages.GroupByParam "rank" }}{{ .Key }}:{{ range .Pages }}{{ .LinkTitle }} {{ end }}|{{ end }}
按不存在的参数：{{ len (.Pages.GroupByParam "nope") }} 组
```

Hugo 渲染为：

```html
按 color：blue:bravo |green:delta |red:alpha charlie |
按 color 降序：red:alpha charlie |green:delta |blue:bravo |
按 rank（两页没写）：1:charlie |2:alpha |
按不存在的参数：0 组
```

**你应当看到什么**：`color` 三组升序（`blue` → `green` → `red`），降序反转；`rank` 只有 `1`、`2` 两组，**没写 `rank` 的 `bravo`、`delta` 完全不见了**；参数一个页面都没有时得到 `0` 组（不是空组，是没有组）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有该参数（`color`） | 3 组，默认升序 `blue`、`green`、`red` | 否 |
| 传 `"desc"` | 组顺序反转 | 否 |
| 部分页面缺该参数（`rank`） | 只得到有值的那几组，**缺参数的页面被丢弃**（实测 `1:charlie`、`2:alpha`） | 否 |
| 所有页面都缺该参数 | **0 组**（不是一组空键） | 否 |
| 参数值是映射（如 `author` 是表） | **0 组**（实测该集合上输出为空） | 否 |
| `.Key` 类型 | 跟随参数类型：字符串参数 → `string`；整数参数 → `int` | 否 |
| 参数取值相同 | 组内顺序由内部实现决定，**上游未说明** | 否 |
| 空集合 | 空分组切片；`range` 无输出 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 一部分页面在分组列表里消失了 | 这些页面没写该参数，`GroupByParam` 会丢掉它们 | 补默认值；或先 `where` 过滤再分组 |
| 没报错但结果不对 | 一个组都没有 | 所有页面都缺该参数，或参数值是映射 | 核对参数名与类型；用 `{{ debug.Dump (index .Pages 0).Params }}` 看键 |
| 没报错但结果不对 | 组名比较/拼接出错 | `.Key` 类型跟随参数（整数参数是 `int`，不是 `string`） | 需要字符串时先 `printf "%v"` 或 `string` 转换 |
| 报错看不懂 | `can't evaluate field GroupByParam in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`） |

更多排查入口见[故障排查](/troubleshooting/)。
