+++
title = "Children"
linkTitle = "Children"
description = "返回给定菜单条目下的子菜单条目集合（如果有）。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/menu-entry/children/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Children"]
returnType = "navigation.Menu"
+++

## 这一页解决什么问题

菜单的层级关系不是靠配置里的嵌套括号表达的，而是靠条目的 `parent` 属性「指向」上一级。所以要把层级渲染成嵌套列表，必须从**父条目**出发去取它的下一级——这就是 `Children`：返回该条目名下的子条目集合。

返回值类型是 `navigation.Menu`，与 `site.Menus.main` 是同一个类型，所以 [`ByWeight`](/methods/menu/byweight/)、[`ByName`](/methods/menu/byname/)、[`Reverse`](/methods/menu/reverse/)、[`Limit`](/methods/menu/limit/) 都能继续链在 `.Children` 后面。

## 什么时候用，什么时候别用

**该用**：

- 渲染下拉菜单、页脚分栏、多级导航——凡是「父项下面还有一层」的场合；
- 对子条目单独排序：`.Children.ByWeight`、`.Children.ByName`。

**别用**：

- 只想判断「要不要输出外层 `<ul>`」→ 用 [`HasChildren`](/methods/menu-entry/haschildren/)，语义更直接（实测 `HasChildren` 等价于 `len .Children > 0`）；
- 想取父条目本身 → `.Children` 里的条目可以用 [`.Parent`](/methods/menu-entry/parent/) 拿到父条目的名字，但它给的是字符串，不是对象；要对象就得回到菜单里找；
- 想一次渲染任意深度 → `Children` 只给**直接子项**一层；三级菜单要在子项上继续取 `.Children`（见下文实测），或者自己写递归局部模板。

## 用法

渲染嵌套菜单时请使用 `Children` 方法。

项目配置如下：

```toml
[[menus.main]]
name = 'Products'
pageRef = '/product'
weight = 10

[[menus.main]]
name = 'Product 1'
pageRef = '/products/product-1'
parent = 'Products'
weight = 1

[[menus.main]]
name = 'Product 2'
pageRef = '/products/product-2'
parent = 'Products'
weight = 2
```

模板如下：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li>
      <a href="{{ .URL }}">{{ .Name }}</a>
      {{ if .HasChildren }}
        <ul>
          {{ range .Children }}
            <li><a href="{{ .URL }}">{{ .Name }}</a></li>
          {{ end }}
        </ul>
      {{ end }}
    </li>
  {{ end }}
</ul>
```

Hugo 渲染出如下 HTML（实测，`range` 留下的空行已省略）：

```html
<ul>
  <li>
    <a href="/product/">Products</a>
    <ul>
      <li><a href="/products/product-1/">Product 1</a></li>
      <li><a href="/products/product-2/">Product 2</a></li>
    </ul>
  </li>
</ul>
```

> [!NOTE]
> 父条目的地址是 `/product/`，因为实测里 `pageRef = '/product'` 解析到的是 `content/product.md`；换成指向 section 首页的 `pageRef`，这里就会变成 section 的地址。

## 完整示例：子条目默认已按 weight 排好

子条目的顺序不需要你在模板里处理：`Children` 返回的是按 `weight` 升序（`0` 排最后）的集合。把配置里的书写顺序打乱来验证：

```toml
[[menus.main]]
name = 'Root'
pageRef = '/product'
weight = 10

[[menus.main]]
name = 'Child C'
pageRef = '/products/product-1'
parent = 'Root'
weight = 30

[[menus.main]]
name = 'Child A'
pageRef = '/products/product-2'
parent = 'Root'
weight = 10

[[menus.main]]
name = 'Child B'
pageRef = '/about'
parent = 'Root'
weight = 20
```

```go-html-template
{{ range site.Menus.main }}{{ range .Children }}{{ .Name }}({{ .Weight }}),{{ end }}{{ end }}
```

实测输出：

```text
Child A(10),Child B(20),Child C(30),
```

再验证「`Children` 只有一层」——三级菜单里，顶层的 `range` 只会看到 `Top`：

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
{{ range site.Menus.deep }}[{{ .Name }} kids={{ len .Children }}|{{ range .Children }}{{ .Name }}(kids={{ len .Children }},parent={{ .Parent }}),{{ end }}]{{ end }}
```

实测输出：

```text
[Top kids=1|Mid(kids=1,parent=Top),]
```

**你应当看到什么**：只有 `Top` 出现在顶层循环里；它的 `.Children` 是 `Mid`，而 `Mid` 自己还有一个 `Leaf`。要渲染第三层，得在 `Mid` 上继续 `{{ range .Children }}`。**子条目不会同时出现在顶层循环里**。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 条目有子项 | 子条目集合，默认按 `weight` 升序（实测配置顺序 30/10/20 → 输出 `Child A(10), Child B(20), Child C(30)`） | 否 |
| 条目没有子项 | 空集合：`len` 为 `0`，`range` 不进入循环 | 否 |
| 子条目自己再取 `.Children` | 该子条目的下一层（实测 `Mid` → `Leaf`） | 否 |
| 子条目取 `.Parent` | 父条目的名字（实测 `Mid` → `Top`） | 否 |
| 在 `.Children` 后链 `ByWeight` / `Limit` | 可用，返回 `navigation.Menu` | 否 |
| 返回类型 | `navigation.Menu` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 子条目一个都没渲染出来 | `parent` 属性写错：它按父条目的 `identifier`（未定义时用 `name`）匹配，大小写敏感 | 核对 `parent` 的值与父条目的 `identifier`/`name` 完全一致 |
| 没报错但结果不对 | 三级菜单只出来两级 | `Children` 只给直接子项 | 在子条目上继续取 `.Children`，或写递归局部模板 |
| 没报错但结果不对 | 菜单里冒出一个自己没写过的条目 | `parent` 拼错：实测 Hugo 会为找不到的父名补一个空父条目，把子项挂在它下面 | 核对 `parent` 与父条目的 `identifier`/`name` 完全一致 |
| 没报错但结果不对 | 外层 `<ul>` 空着也不消失 | 没用 [`HasChildren`](/methods/menu-entry/haschildren/) 包住内层 | 用 `{{ if .HasChildren }}` 包住内层 `<ul>` |

更多排查入口见[故障排查](/troubleshooting/)。
