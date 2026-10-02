+++
title = "HasChildren"
linkTitle = "HasChildren"
description = "报告给定菜单条目是否有子菜单条目。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/menu-entry/haschildren/"

[params.functions_and_methods]
signatures = ["MENUENTRY.HasChildren"]
returnType = "bool"
+++

## 这一页解决什么问题

渲染嵌套菜单时，最外层的模板要回答一个是非题：「这个条目下面还有没有东西？」有，才输出内层 `<ul>`；没有，就只输出一个 `<a>`。如果答错，页面里会多出一堆空的 `<ul></ul>`，或者该展开的层级展不开。

`HasChildren` 就是这个问题的方法化形式：返回 `true` 或 `false`，专门用来包住内层结构。

## 什么时候用，什么时候别用

**该用**：

- 决定要不要输出内层 `<ul>` / 要不要给父项加 `has-children` 之类 class；
- 与 [`Children`](/methods/menu-entry/children/) 成对使用：先 `if .HasChildren`，再 `range .Children`。

**别用**：

- 想真正遍历子项 → 用 [`Children`](/methods/menu-entry/children/)；`HasChildren` 只回答是非题；
- 想判断「这个条目指向的页面有没有下级页面」→ `HasChildren` 只看**菜单条目**的层级，与 `pageRef` 指向页面的 section 结构无关；要看页面层级请用页面自己的方法；
- 想判断条目数是否大于 N → 用 `len` + 比较（`{{ if gt (len .Children) 1 }}`）。

实测中 `HasChildren` 与 `len .Children > 0` 完全等价，用哪个都能跑；写 `HasChildren` 更能表达意图。

## 用法

渲染嵌套菜单时请使用 `HasChildren` 方法。

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

## 完整示例：一眼看出谁有子项

把同一个模板用在两组菜单上对比——有层级的 `main`（`Products` 带两个子项）和平铺的 `flat`：

```toml
[[menus.flat]]
name = 'Services'
pageRef = '/services'
weight = 10

[[menus.flat]]
name = 'About'
pageRef = '/about'
weight = 20
```

```go-html-template
分层菜单：{{ range site.Menus.main }}{{ .Name }}={{ .HasChildren }},{{ end }}
平铺菜单：{{ range site.Menus.flat }}{{ .Name }}={{ .HasChildren }},{{ end }}
```

实测输出：

```text
分层菜单：Products=true,
平铺菜单：Services=false,About=false,
```

**你应当看到什么**：只有 `Products` 是 `true`——因为另外两个条目带了 `parent = 'Products'`，Hugo 把它们挂到 `Products` 下面，顶层循环里只剩一个父条目。平铺菜单每个条目都是 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 条目有子项 | `true` | 否 |
| 条目没有子项 | `false`（实测平铺菜单的三个条目全为 `false`） | 否 |
| 子条目自己再取 `.HasChildren` | 视它的下一层而定（实测三级菜单的 `Mid` 为 `true`，没有下一层的为 `false`） | 否 |
| 与 `len .Children` 对照 | 实测 `HasChildren` ≡ `len .Children > 0` | 否 |
| 返回类型 | `bool`（永远不是 `nil`，可以直接放进 `if`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 父项明明有子项，`HasChildren` 却是 `false` | 子项的 `parent` 没匹配上父条目的 `identifier`/`name`，层级根本没建立 | 核对 `parent` 拼写与大小写 |
| 没报错但结果不对 | 输出里出现空的 `<ul></ul>` | 没判断就无条件输出内层 | 用 `{{ if .HasChildren }}` 包住内层 `<ul>` |
| 没报错但结果不对 | 层级展不开，或展开的层级不对 | 把 `HasChildren` 当成了「页面有没有子页面」 | 它只看菜单层级；页面层级用页面自己的方法 |

更多排查入口见[故障排查](/troubleshooting/)。
