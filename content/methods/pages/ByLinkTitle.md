+++
title = "ByLinkTitle"
linkTitle = "ByLinkTitle"
description = "返回给定页面集合按链接标题升序排序后的结果；未定义链接标题时回退到标题。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/methods/pages/bylinktitle/"

[params.functions_and_methods]
signatures = ["PAGES.ByLinkTitle"]
returnType = "page.Pages"
+++

## 这一页解决什么问题

把页面集合按**链接标题升序**重排——排的是 [`LinkTitle`](/methods/page/linktitle/)（侧栏、菜单、列表里显示的那个短标题），不是 [`Title`](/methods/page/title/)。

两者的差别在中文站点里很常见：`title = "Hugo 模块系统详解"`、`linkTitle = "模块"`。排序用后者，读者看到的也是后者，列表才会符合直觉。

**页面没写 `linkTitle` 时，Hugo 回退到 `title`**（这是上游说明的行为）。

## 什么时候用，什么时候别用

**该用**：

- 生成按名称排列的索引页、术语列表、文档目录；
- 希望排序键与显示文本一致时。

**别用**：

- 想按**完整标题**排序 → 用 [`ByTitle`](/methods/pages/bytitle/)；
- 想按日期/权重 → 用 [`ByDate`](/methods/pages/bydate/) / [`ByWeight`](/methods/pages/byweight/)；
- 排序结果要给 `Prev`/`Next` 用但你又直接用了 `.Pages` → 先明确用哪个集合排序（见 [`Next`](/methods/pages/next/) 的说明）。

## 用法

```go-html-template
{{ range .Pages.ByLinkTitle }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

要改为降序排列：

```go-html-template
{{ range .Pages.ByLinkTitle.Reverse }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}
```

## 完整示例：LinkTitle 与 Title 的差别

示例沿用本章首页的[示例站点结构](/methods/pages/)：

| 页面 | `Title` | `LinkTitle` |
| --- | --- | --- |
| `post-1.md` | Alpha Post | `alpha` |
| `post-2.md` | Bravo Post | `bravo` |
| `post-3.md` | Charlie Post | `charlie` |
| `post-4.md` | Delta Post | `delta` |

```go-html-template {file="layouts/_default/list.html"}
按 LinkTitle：{{ range .Pages.ByLinkTitle }}{{ .LinkTitle }} {{ end }}
按 Title：{{ range .Pages.ByTitle }}{{ .Title }} {{ end }}
```

Hugo 渲染为：

```html
按 LinkTitle：alpha bravo charlie delta 
按 Title：Alpha Post Bravo Post Charlie Post Delta Post 
```

**你应当看到什么**：两个方法都用升序，但排序键不同——`ByLinkTitle` 排的是小写短名，`ByTitle` 排的是完整标题。在示例数据里两者顺序恰好相同，若你的 `linkTitle` 与 `title` 首字母不同（例如 `title = "Zebra"`、`linkTitle = "别名"`），两者顺序就会分叉。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'en-US'`、`timeZone = 'UTC'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 四页都有 `linkTitle` | 按 `linkTitle` 升序 | 否 |
| 页面没有 `linkTitle` | 回退到 `title` 参与排序（上游说明） | 否 |
| 两个 `linkTitle` 相同 | 顺序由内部实现决定，**上游未说明** | 否 |
| `linkTitle` 含中文 | 按 Unicode 码位排序，中文不会按拼音排 | 否 |
| 空集合 | 空集合：`range` 无输出，`len` 为 0 | 否 |
| 返回类型 | `page.Pages` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 列表顺序「不是按显示的名字」排的 | 页面没写 `linkTitle`，回退到了 `title` | 补 `linkTitle`，或改用 `ByTitle` 明示 |
| 没报错但结果不对 | 中文标题没有按拼音排序 | 排序按 Unicode 码位，不是拼音 | 需要拼音序就手工指定 `weight`，用 [`ByWeight`](/methods/pages/byweight/) |
| 没报错但结果不对 | 排序键大小写导致顺序怪 | `LinkTitle` 原样比较，大小写影响顺序 | 统一 `linkTitle` 写法，或自行 `strings.ToLower` 后自定义排序 |
| 报错看不懂 | `can't evaluate field ByLinkTitle in type ...` | 对象不是页面集合 | 先取集合（`.Pages`、`.RegularPages`） |

更多排查入口见[故障排查](/troubleshooting/)。
