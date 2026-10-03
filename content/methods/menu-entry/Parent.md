+++
title = "Parent"
linkTitle = "Parent"
description = "返回给定菜单条目的 `parent` 属性。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/methods/menu-entry/parent/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Parent"]
returnType = "string"
+++

## 这一页解决什么问题

菜单的层级关系写在子条目上：`parent = 'Products'` 表示「我挂在 Products 下面」。`Parent` 方法把这条关系反向读出来——给定一个条目，告诉你它的父条目是谁。

**读懂本页的诀窍**：`Parent` 返回的是**字符串**（父条目的 `identifier`，没写 `identifier` 时是 `name`），**不是父条目对象**。所以它适合做判断、打印、拼 class；想遍历父条目的其他属性，得回到菜单里自己找。

## 什么时候用，什么时候别用

**该用**：

- 给子条目加标记：`data-parent="{{ .Parent }}"`、`class="child-of-{{ .Parent | urlize }}"`；
- 调试嵌套菜单：打印 `.Parent` 确认层级是「谁挂在谁下面」；
- 生成面包屑文本时区分父子层级。

**别用**：

- 想遍历子条目 → 用 [`Children`](/methods/menu-entry/children/)；
- 想判断条目有没有子项 → 用 [`HasChildren`](/methods/menu-entry/haschildren/)（`Parent` 说的是「我的上级」，不是「我的下级」）；
- 想拿到父条目对象（例如父条目的 `URL`）→ `Parent` 给不了，需要在菜单里按名字查找，或直接在渲染父条目时顺手渲染子条目。

## 用法

菜单定义如下：

```toml
[[menus.nested]]
name = 'Products'
pageRef = '/product'
weight = 10

[[menus.nested]]
name = 'Product 1'
pageRef = '/products/product-1'
parent = 'Products'
weight = 1

[[menus.nested]]
name = 'Product 2'
pageRef = '/products/product-2'
parent = 'Products'
weight = 2
```

下面的模板渲染嵌套菜单，在每个子条目旁列出其 `parent` 属性：

```go-html-template
<ul>
  {{ range .Site.Menus.nested }}
    <li>
      <a href="{{ .URL }}">{{ .Name }}</a>
      {{ if .HasChildren }}
        <ul>
          {{ range .Children }}
            <li><a href="{{ .URL }}">{{ .Name }}</a> ({{ .Parent }})</li>
          {{ end }}
        </ul>
      {{ end }}
    </li>
  {{ end }}
</ul>
```

Hugo 渲染结果为（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li>
    <a href="/product/">Products</a>
    <ul>
      <li><a href="/products/product-1/">Product 1</a> (Products)</li>
      <li><a href="/products/product-2/">Product 2</a> (Products)</li>
    </ul>
  </li>
</ul>
```

## 完整示例：顶层条目与子条目的 Parent 对照

```go-html-template
{{ range site.Menus.nested }}[{{ .Name }} Parent={{ printf "%q" .Parent }} HasChildren={{ .HasChildren }}]{{ end }}
```

实测输出：

```text
[Products Parent="" HasChildren=true]
```

**你应当看到什么**：顶层只有 `Products`，它的 `.Parent` 是**空字符串**——挂了 `parent` 的子条目**不会**出现在顶层循环里。要看到子条目的 `.Parent`，得进 `.Children`：

```go-html-template
{{ range site.Menus.nested }}{{ range .Children }}[{{ .Name }} Parent={{ printf "%q" .Parent }}]{{ end }}{{ end }}
```

实测输出：

```text
[Product 1 Parent="Products"] [Product 2 Parent="Products"]
```

三层菜单同样一层层往上报自己的上级——`Top` 在顶层（空）、`Mid` 在 `Top.Children` 里（`"Top"`）、`Leaf` 在 `Mid.Children` 里（`"Mid"`）：

```toml
[[menus.deep]]
name = 'Top'
pageRef = '/product'
weight = 10

[[menus.deep]]
name = 'Mid'
pageRef = '/about'
parent = 'Top'
weight = 10

[[menus.deep]]
name = 'Leaf'
pageRef = '/contact'
parent = 'Mid'
weight = 10
```

```go-html-template
{{ range site.Menus.deep }}{{ range .Children }}{{ range .Children }}[{{ .Name }} Parent={{ printf "%q" .Parent }}]{{ end }}{{ end }}{{ end }}
```

实测输出：

```text
[Leaf Parent="Mid"]
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 顶层条目（没有 `parent`） | 空字符串 `""` | 否 |
| 子条目 | 配置里 `parent` 的值（实测 `"Products"`、`"Top"`、`"Mid"`） | 否 |
| `parent` 写在配置里但匹配不到任何父条目 | 仍返回该字符串；Hugo 会**补一个同名的空父条目**（实测 `parent = 'Ghost'` 时顶层多出 `Ghost`：`.Parent` 为 `""`、`HasChildren` 为 `true`），原子条目成为它的子项 | 否 |
| 返回类型 | `string`（不是菜单条目对象，也没有 `.URL` 之类的属性） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `{{ .Parent.URL }}` 报错 | `Parent` 是字符串，不是条目对象 | 只把它当文本用；要父条目的属性就自己到菜单里找 |
| 没报错但结果不对 | 菜单里冒出一个自己没写过的空条目 | `parent` 拼错：实测 Hugo 会为找不到的父名补一个空父条目，把子项挂在它下面 | 核对 `parent` 与父条目的 `identifier`/`name` 完全一致 |
| 没报错但结果不对 | 顶层条目的 `Parent` 期望是页面标题 | 没写 `parent` 就是空字符串 | 需要父级名字时用 `{{ with .Parent }}` 判断后再输出 |

更多排查入口见[故障排查](/troubleshooting/)。
