+++
title = "永久链接配置"
linkTitle = "永久链接配置"
description = "用 pattern 与目标匹配器自定义页面 URL 的生成规则。"
date = 2026-10-01
weight = 220
source = "https://gohugo.io/configuration/permalinks/"
+++

## 这一页解决什么问题

`permalinks` 用模式字符串决定页面的 URL 长什么样，例如 `/:year/:month/:slug/`。不加配置时，URL 直接照内容目录结构生成；这一页处理的是「目录结构 ≠ 你想要的 URL」的情况。

**改这里等于改站点的 URL 空间**：旧链接会失效、站点地图会变、外部反链会 404。规模较大的站点要配合别名（alias）与平台重定向一起改。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| 映射形式 | 按顶级区段统一改 URL（例如 `articles` 全部走 `/blog/…`） | 区段名写错 → 模式不匹配任何页面，URL 保持原样，且**不报错** |
| 数组形式 + `target` | 只对部分页面（按路径、类型、环境、多语言）套用模式 | 上游明确「采用第一个匹配成功的模式」；把兜底模式写在数组前面，后面的精确规则就永远轮不到 |
| `target.sites.matrix` | 多语言 / 多版本站点各用不同的 URL | 语言名写错 → 该语言落到兜底模式，链接结构与其他语言不一致 |
| 前置元数据 `url` | 单个页面需要固定地址 | `url` 会覆盖任何与之匹配的永久链接模式（上游原话）；排查「这页为什么不守规则」时先看它 |

## 概述

`permalinks` 配置用于为页面定义自定义 URL 模式。Hugo 支持两种书写形式：

| 形式 | 结构 | 适用场景 |
| --- | --- | --- |
| 映射形式（map） | 按页面类型（page kind）分组的键值对 | 按顶级[区段](/content-management/sections/)统一指定模式 |
| 数组形式（array） | 由若干条 `pattern` 条目组成的数组 | 需要用页面匹配器精确定位页面子集 |

> [!NOTE]
> 前置元数据中的 `url` 字段会覆盖任何与之匹配的永久链接模式。

## 映射形式

以页面类型（page kind）为键，为每个顶级区段定义 URL 模式。例如为 `articles` 区段配置模式：

```toml
[permalinks.page]
articles = '/blog/:year/:month/:slug/'

[permalinks.section]
articles = '/blog/'
```

可用的页面类型键如下：

| 键名 | 作用范围 |
| --- | --- |
| `page` | 普通内容页。 |
| `section` | 区段页。 |
| `term` | 分类法术语页。 |
| `taxonomy` | 分类法列表页。 |

每个键之下再以区段名为键，值是模式字符串。

按语言配置时，把 `permalinks` 区段嵌在语言键之下：

```toml
[languages]
  [languages.de]
    label = 'Deutsch'
    locale = 'de-DE'
    weight = 1
    [languages.de.permalinks]
      [languages.de.permalinks.page]
        articles = '/artikel/:year/:month/:slug/'
      [languages.de.permalinks.section]
        articles = '/artikel/'
  [languages.en]
    label = 'English'
    locale = 'en-US'
    weight = 2
    [languages.en.permalinks]
      [languages.en.permalinks.page]
        articles = '/blog/:year/:month/:slug/'
      [languages.en.permalinks.section]
        articles = '/blog/'
```

## 数组形式

> [!NOTE]
> 数组形式自 v0.161.0 起可用。

定义一个永久链接条目数组，把不同的 URL 模式应用到不同的页面子集。每个条目必须有 `pattern` 键，Hugo 采用第一个匹配成功的模式。

可选的 `target` 键接受一个页面匹配器；省略 `target` 时，该模式应用于所有页面。

| 键名 | 类型 | 是否必填 | 含义 |
| --- | --- | --- | --- |
| `pattern` | `string` | 是 | URL 模式，可包含下方 token 表中的标记。 |
| `target` | `map` | 否 | 页面匹配器，用于限定该条目作用的页面范围。 |

页面匹配器支持以下关键字：

| 关键字 | 类型 | 含义 |
| --- | --- | --- |
| `environment` | `string` | 匹配构建环境的 glob 模式，例如 `{staging,production}`。 |
| `kind` | `string` | 匹配页面类型的 glob 模式，例如 `{taxonomy,term}`。 |
| `path` | `string` | 匹配页面逻辑路径的 glob 模式，例如 `{/books,/books/**}`。 |
| `sites` | `map` | 站点矩阵，匹配语言、版本、角色等任意内容维度组合。 |

例如，分别为 `articles` 区段页与其叶子页面应用语言相关的 URL 模式：

```toml
[[permalinks]]
  pattern = '/artikel/'
  [permalinks.target]
    path = '{/articles}'
    [permalinks.target.sites]
      [permalinks.target.sites.matrix]
        languages = ['de']

[[permalinks]]
  pattern = '/artikel/:year/:month/:slug/'
  [permalinks.target]
    path = '{/articles/**}'
    [permalinks.target.sites]
      [permalinks.target.sites.matrix]
        languages = ['de']

[[permalinks]]
  pattern = '/blog/'
  [permalinks.target]
    path = '{/articles}'
    [permalinks.target.sites]
      [permalinks.target.sites.matrix]
        languages = ['en']

[[permalinks]]
  pattern = '/blog/:year/:month/:slug/'
  [permalinks.target]
    path = '{/articles/**}'
    [permalinks.target.sites]
      [permalinks.target.sites.matrix]
        languages = ['en']
```

若要为非此前所有条目都未匹配到的页面提供兜底，把不带 `target` 键的模式放在数组末尾：

```toml
[[permalinks]]
pattern = '/:section/:slug/'
```

## 可用 token

在模式字符串中可使用下列 token。

| token | 含义 |
| --- | --- |
| `:year` | 前置元数据 `date` 字段中的 4 位年份。 |
| `:month` | 前置元数据 `date` 字段中的 2 位月份。 |
| `:monthname` | 前置元数据 `date` 字段中的月份名称。 |
| `:day` | 前置元数据 `date` 字段中的 2 位日期。 |
| `:weekday` | 前置元数据 `date` 字段中的 1 位星期序号（星期日为 `0`）。 |
| `:weekdayname` | 前置元数据 `date` 字段中的星期名称。 |
| `:yearday` | 前置元数据 `date` 字段中的年内第几天，1 至 3 位。 |
| `:section` | 内容所属区段。 |
| `:sectionslug` | 内容所属区段的 slug 化名称（自 v0.149.0 起可用）。 |
| `:sections` | 内容的区段层级，支持切片语法，如 `:sections[1:]`、`:sections[:last]`、`:sections[last]`、`:sections[1:2]`。 |
| `:sectionslugs` | 区段层级的 slug 化名称，同样支持切片语法（自 v0.149.0 起可用）。 |
| `:title` | 前置元数据 `title`，否则为自动标题。 |
| `:slug` | 前置元数据 `slug`，否则为 `title`，否则为自动标题。 |
| `:filename` | 已废弃（v0.144.0），请改用 `:contentbasename`。 |
| `:slugorfilename` | 已废弃（v0.144.0），请改用 `:slugorcontentbasename`。 |
| `:contentbasename` | 内容基础名（自 v0.144.0 起可用）。 |
| `:slugorcontentbasename` | 前置元数据 `slug`，否则为内容基础名（自 v0.144.0 起可用）。 |

其中 slug 化名称取自前置元数据 `slug`，否则取自 `title`，否则取自动标题。切片访问不会抛出越界错误，因此无需精确计算下标。

时间相关的值也可以使用 Go [time 包][] 中定义的时间布局组件，例如：

```toml
permalinks:
  posts: /:06/:1/:2/:title/
```

[time 包]: https://pkg.go.dev/time#pkg-constants

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了 `permalinks`，页面 URL 没变 | 区段名或页面类型键写错，模式没匹配上；Hugo **不报错** | 先用最小范围验证（只配一个区段），确认生效后再扩展 |
| 只有部分页面用了新模式 | 数组形式的 `target` 没覆盖到它们，或被更靠前的条目拦下 | 检查条目顺序：Hugo 取第一个匹配成功的模式，兜底条目必须放在最后 |
| 某页怎么都不按规则走 | 该页前置元数据里写了 `url`，它的优先级最高 | 删掉该页的 `url`，或就用 `url` 明确写死 |
| 旧链接全部 404 | 模式改动改变了既有地址 | 为受影响的页面加 `aliases`（见 [URL 管理](/content-management/urls/)），并在部署平台上配置重定向 |
| 提示 token 已废弃，或结果为空 | `:filename`、`:slugorfilename` 自 v0.144.0 起已废弃 | 改用 `:contentbasename` 与 `:slugorcontentbasename` |

更多排查入口见[故障排查](/troubleshooting/)。
