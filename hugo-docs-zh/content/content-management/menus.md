+++
title = "菜单"
linkTitle = "菜单"
description = "在配置或前置元数据中定义菜单项，并在模板中遍历与高亮。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/content-management/menus/"
+++

## 菜单系统的三个环节

菜单（menu）由一组菜单项（menu entry）组成，每一项最终渲染为一个链接。为站点建立菜单需要三步：定义菜单项、为每种语言本地化菜单项、在模板中渲染。站点可以有多个菜单，既可以平铺也可以嵌套，例如页头放一个主菜单，页脚再放一个独立菜单。

定义菜单项有三种方式：自动生成、写在前置元数据（front matter）中、写在项目配置中。三种方式可以混用，但整站统一使用一种方式会让菜单更容易理解和维护。

## 自动生成

在项目配置中开启 section 页面菜单，Hugo 就会为站点的每个一级 section（内容区块）自动生成一个菜单项：

```toml
sectionPagesMenu = 'main'
```

生成的菜单结构在模板中通过 `site.Menus.main` 访问。

## 在前置元数据中定义

把页面加入 main 菜单：

```toml
title = '关于'
menus = 'main'
```

让页面同时出现在 main 与 footer 菜单中：

```toml
title = '联系'
menus = ['main', 'footer']
```

> [!NOTE]
> 上面例子中使用的配置键是 `menus`，单数形式 `menu` 是它的别名。

在前置元数据中定义菜单项时可以使用的属性：

| 属性 | 说明 |
| --- | --- |
| `identifier` | 菜单项标识。多个菜单项同名，或用翻译表本地化 `name` 时必须提供；必须以字母开头，后接字母、数字或下划线 |
| `name` | 渲染菜单项时显示的文字 |
| `params` | 自定义的菜单项参数映射 |
| `parent` | 父菜单项的 `identifier`；父项未定义 `identifier` 时改用其 `name`，嵌套菜单中的子项必须提供 |
| `post` | 渲染菜单项时追加在其后的 HTML |
| `pre` | 渲染菜单项时前置的 HTML |
| `title` | 渲染结果的 HTML `title` 属性 |
| `weight` | 非零整数，决定菜单项相对菜单根（子项则相对其父项）的位置，数值越小越靠前 |

一个用到部分属性的前置元数据示例如下：

```toml
title = '软件'
[menus.main]
  parent = '产品'
  weight = 20
  pre = '<i class="fa-solid fa-code"></i>'
  [menus.main.params]
    class = 'center'
```

## 在项目配置中定义

导航栏这类需要集中管理的菜单，直接写在项目配置里：

```toml
[[menus.main]]
  name = '首页'
  pageRef = '/'
  weight = 10

[[menus.main]]
  name = '产品'
  pageRef = '/products'
  weight = 20

[[menus.main]]
  name = '服务'
  pageRef = '/services'
  weight = 30
```

页脚菜单写法相同，把 `[[menus.main]]` 换成 `[[menus.footer]]`，再用 `site.Menus.footer` 访问。

菜单项通常至少包含 `name`、`weight`，以及 `pageRef` 或 `url` 之一：指向站内页面用 `pageRef`，指向站外地址用 `url`。`pageRef` 接受目标页面的逻辑路径：

| 页面种类 | `pageRef` |
| --- | --- |
| home | `/` |
| page | `/books/book-1` |
| section | `/books` |
| taxonomy | `/tags` |
| term | `/tags/foo` |

## 嵌套菜单

把子项的 `parent` 指向父项，就形成嵌套菜单：

```toml
[[menus.main]]
  name = '产品'
  pageRef = '/products'
  weight = 10

[[menus.main]]
  name = '硬件'
  pageRef = '/products/hardware'
  parent = '产品'
  weight = 1

[[menus.main]]
  name = '软件'
  pageRef = '/products/software'
  parent = '产品'
  weight = 2

[[menus.main]]
  name = 'Hugo'
  pre = '<i class="fa fa-heart"></i>'
  url = 'https://gohugo.io/'
  weight = 30
  [menus.main.params]
    rel = 'external'
```

## 在模板中渲染

菜单数据统一通过 `site.Menus.<菜单名>` 访问：

调用菜单方法时需要当前页面的上下文，因此先在模板开头保存页面对象：

```go-html-template
{{ $currentPage := . }}
<nav>
  <ul>
    {{ range site.Menus.main }}
      <li>
        <a href="{{ .URL }}"{{ if $currentPage.IsMenuCurrent .Menu . }} class="active"{{ end }}>
          {{ .Name }}
        </a>
        {{ with .Children }}
          <ul>
            {{ range . }}
              <li><a href="{{ .URL }}">{{ .Name }}</a></li>
            {{ end }}
          </ul>
        {{ end }}
      </li>
    {{ end }}
  </ul>
</nav>
```

每个菜单项提供 `.URL`、`.Name`、`.Identifier`、`.Page`、`.Params` 等属性，`.HasChildren` 与 `.Children` 用于渲染多级菜单。`IsMenuCurrent` 与 `HasMenuCurrent` 是 `Page` 对象上的方法，第一个参数是菜单项所属的 `Menu` 对象，也就是条目自身的 `.Menu`，第二个参数是菜单项本身，因此写成 `$currentPage.IsMenuCurrent .Menu .`：前者判断当前页面是否就是该菜单项，后者判断当前页面是否位于该菜单项的子层级中，常用于高亮当前栏目及其祖先项。使用这两个方法时，菜单项必须写在前置元数据中，或者在项目配置里为它指定 `pageRef`。

## 本地化

多语言站点中，菜单项通常需要按语言分别定义，或者用翻译表本地化 `name`，具体做法见 [多语言](/content-management/multilingual/)。

## 延伸阅读

- [多语言](/content-management/multilingual/)
- [前置元数据](/content-management/front-matter/)
- [目录结构](/getting-started/directory-structure/)
- [配置](/configuration/)
