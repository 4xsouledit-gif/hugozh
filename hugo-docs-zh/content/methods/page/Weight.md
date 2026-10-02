+++
title = "Weight"
linkTitle = "Weight"
description = "返回给定页面前置元数据中定义的权重。"
date = 2026-10-02
weight = 880
source = "https://gohugo.io/methods/page/weight/"

[params.functions_and_methods]
signatures = ["PAGE.Weight"]
returnType = "int"
+++

## 这一页解决什么问题

页面在「按权重排序」的集合里的位置，由 front matter 的 `weight` 决定；`.Weight` 在模板里读出这个整数。它最常见的用途是**排查排序**：「为什么这一篇排在最后？」——先 `{{ range .Pages.ByWeight }}{{ .Weight }} {{ end }}` 看一眼就明白了。

要点：**没写 `weight` 时返回 `0`**（不是 `nil`），而 `0` 在按权重升序的集合里会被放到末尾（实测：taxonomy 页即为此类）。

## 什么时候用，什么时候别用

**该用**：

- 排查/验证集合排序；
- 想在列表里显示序号或分组（例如「第 2 章」）；
- 根据权重决定是否给页面加特殊样式。

**别用**：

- 想排序集合 → 直接用 `.Pages.ByWeight`、`.RegularPages.ByWeight`，不要手写比较；
- 想按日期排序 → 用 `.ByDate`、`.ByLastmod` 等；
- 想把值写到页面 → front matter 是唯一入口。

**排序相关的几个方法**：

| 需求 | 方法 |
| --- | --- |
| 按权重升序 | `.Pages.ByWeight` |
| 按标题 | `.Pages.ByTitle` |
| 按日期 | `.Pages.ByDate` |
| 读取单页权重 | `.Weight` |

## 用法

`Page` 对象上的 `Weight` 方法返回给定页面前置元数据中定义的[权重](g)。

```toml
title = 'How to make spicy tuna hand rolls'
weight = 42
```

页面权重控制页面在按权重排序的集合中的位置。请用非零整数分配权重。较轻的条目浮到顶部，较重的条目沉到底部。未设置权重或权重为零的元素会被放在集合末尾。

尽管在模板中很少用到，你仍可以这样访问该值：

```go-html-template
{{ .Weight }} → 42
```

## 完整示例：确认排序与缺省值

测试站的 `content/posts/` 下各页权重为 10/20/30/60/70/80/90/100/110/120。

模板（`layouts/_default/list.html`）：

```go-html-template {file="layouts/_default/list.html"}
{{ range .RegularPages.ByWeight }}
  <li>{{ .Weight }} — <a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></li>
{{ end }}
```

实测（Hugo 0.167.0）渲染 `/posts/` 的开头两行：

```html
<li>10 — <a href="/posts/post-1/">第一篇</a></li>
<li>20 — <a href="/posts/post-2/">第二篇</a></li>
```

其他页面实测：

| 渲染的页面 | `.Weight` | 说明 |
| --- | --- | --- |
| `/posts/post-2/` | `20` | front matter |
| `/posts/`（section） | `10` | `content/posts/_index.md` 的 `weight = 10` |
| `/docs/`（section） | `20` | `content/docs/_index.md` 的 `weight = 20` |
| `/tags/`（taxonomy） | `0` | **没有对应内容文件，未设置权重** |
| `/tags/alpha/`（term） | `0` | 同上 |

**你应当看到什么**：列表按 `10 → 20 → 30 → …` 升序，与 `.ByWeight` 一致；taxonomy/term 页拿到 `0`。这解释了为什么对没有 `_index.md` 的页面做权重排序时它们总在最后。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| front matter 写了 `weight` | 该整数（实测 `20`） | 否 |
| 没有内容文件（taxonomy/term 页） | `0`（实测） | 否 |
| 写了 `weight = 0` | `0`，在升序集合中排末尾（上游说明） | 否 |
| 负数权重 | 是合法的 `int`；会排在正数之前（上游未特别说明） | 否 |
| 返回类型 | `int`（可直接比较、参与算术） | 否 |
| 影响范围 | 只影响「按权重排序」的集合；不影响 `.Path`、URL | 否 |

更多排查入口见[故障排查](/troubleshooting/)。
