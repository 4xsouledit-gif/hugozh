+++
title = "菜单"
linkTitle = "菜单"
description = "在配置或前置元数据中定义菜单项，并在模板中遍历与高亮；含配置位置、构建验证方法与最常配错的地方。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/content-management/menus/"

[params.teach]
difficulty = "入门"
time = "20–30 分钟"
prereq = [
  "会写前置元数据（front matter），知道项目配置 `hugo.toml` 在哪。",
  "读过[前置元数据](/content-management/front-matter/)，能看懂 `go-html-template` 里的 `range` 与 `with`。",
]
outcomes = [
  "用「自动生成 / 前置元数据 / 项目配置」三种方式中的任一种建出一个菜单；",
  "说清 `pageRef` 与 `url` 的区别，并知道哪个能让 `IsMenuCurrent` 高亮生效；",
  "在模板里遍历 `site.Menus.<菜单名>`，渲染出带子项的导航；",
  "用产物 HTML 验证菜单项、顺序与高亮是否符合预期。",
]
next = ["/templates/menu/", "/configuration/menus/", "/content-management/multilingual/"]

+++

## 这一页解决什么问题

菜单（menu）由一组菜单项（menu entry）组成，每一项最终渲染为一个链接。为站点建立菜单需要三步：定义菜单项、为每种语言本地化菜单项、在模板中渲染。站点可以有多个菜单，既可以平铺也可以嵌套，例如页头放一个主菜单，页脚再放一个独立菜单。

定义菜单项有三种方式：自动生成、写在前置元数据（front matter）中、写在项目配置中。三种方式可以混用，但整站统一使用一种方式会让菜单更容易理解和维护。

配错菜单的典型表现有两种，本页都会给验证方法：

- **菜单里根本没有这一项**——多半是定义写错了位置（写进了 `[params]`、写成了单数 `menu` 之外的自造键），或者菜单名不一致（定义在 `main`、模板读 `site.Menus.footer`）；
- **菜单项在、但点击或高亮不对**——多半是用 `url` 写了站内地址。**站内跳转要用 `pageRef`**，它才会带上页面对象，`IsMenuCurrent`、`HasMenuCurrent` 才能判断当前页。

**验证菜单的最小方法**：任意布局里加一行调试输出，然后看产物 HTML。

```go-html-template
{{ range site.Menus.main }}{{ .Name }} → {{ .URL }} → {{ with .Page }}{{ .Title }}{{ else }}nil{{ end }}{{ end }}
```

**你应当看到什么**（**实测：Hugo 0.167**）：

- 用 `pageRef = '/posts/a'` 定义的条目，`.URL` 是 `/posts/a/`（**自动补上结尾斜杠**），`.Page` 是那个页面对象；
- 用 `url = 'https://gohugo.io/'` 定义的条目，`.URL` 是原样字符串，`.Page` 是 `nil`；
- 在前置元数据里用 `[menus.main]` 把首页加进菜单，条目的 `.URL` 是 `/`，`.Page` 是首页；
- 只有 `.Page` 不为 `nil` 的条目，在你的页面正好是它指向的页面时 `IsMenuCurrent` 才会返回真。

> [!NOTE]
> 本站（Hugo 中文文档）页头菜单是在 `hugo.toml` 里用 `url = "/getting-started/"` 这类写法定义的，因此这些条目的 `.Page` 是 `nil`。如果你要在本站模板里加「当前栏目高亮」，需要把对应的 `url` 改成 `pageRef`（见[在项目配置中定义](#在项目配置中定义)）。

## 自动生成

在项目配置中开启 section 页面菜单，Hugo 就会为站点的每个一级 section（内容区块）自动生成一个菜单项：

```toml
sectionPagesMenu = 'main'
```

生成的菜单结构在模板中通过 `site.Menus.main` 访问。

**你应当看到什么**：站点里有 `content/posts/`、`content/docs/` 两个一级 section，开启后上面那行调试输出会依次打印它们对应的条目，`.URL` 分别是 `/posts/`、`/docs/`。**一级 section 才有条目**——子目录（嵌套 section）不会自动进这个菜单。完整的模板用法见[菜单模板](/templates/menu/)。

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

**你应当看到什么**：把上面这段写进 `content/products/software.md`，同级还要有一个 `name = '产品'`（或 `identifier = '产品'`）的菜单项，它才会成为子项——`parent` 指向不存在的父项时，该条目会**掉到菜单根层级**，构建不会报错。验证方法还是那行调试输出，或看产物 HTML 里 `<ul>` 的嵌套层数。

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

> [!IMPORTANT]
> `pageRef` 与 `url` 不是两种等价写法。`pageRef` 指向**页面**，Hugo 会解析出它的永久链接（并补上结尾斜杠），同时把页面对象交给菜单项；`url` 是**原样输出的字符串**，Hugo 不做校验，也不关联任何页面。所以：站内页面一律用 `pageRef`；只有站外地址（`https://…`）或确实不存在的路径才用 `url`。写错的 `pageRef` 会让菜单项指向空链接，而写错的 `url` 会安静地生成一个 404 链接。

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

`parent` 的值要和父项的 `identifier` 一致；父项没写 `identifier` 时，用它的 `name`。**父项与子项的 `weight` 是各自层级内排序的**：上例中「硬件」「软件」在「产品」内部从 1、2 排序，不会因为权重小而跑到「产品」前面。

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

**你应当看到什么**（**实测：Hugo 0.167**）：在 `/posts/a/` 上渲染上面的模板，配置里 `pageRef = '/posts/a'` 的那个条目会带上 `class="active"`，而用 `url` 定义的外链条目不会；`.Children` 只在有子项时输出内层 `<ul>`，没有子项时那一整块被 `with` 跳过、不留空标签。菜单项的**顺序由 `weight` 升序决定**，权重相同时按名称排序——想让顺序稳定可预期，就给每一项都写上不重复的 `weight`。

## 本地化

多语言站点中，菜单项通常需要按语言分别定义，或者用翻译表本地化 `name`，具体做法见 [多语言](/content-management/multilingual/)。

## 什么时候用哪种定义方式

| 情形 | 该用 | 理由 |
| --- | --- | --- |
| 菜单项就是各个一级栏目，且栏目经常增减 | 自动生成（`sectionPagesMenu`） | 章节结构变了菜单自动跟着变，不用手工维护 |
| 菜单项与页面一一对应，页面作者顺手维护 | 前置元数据 `menus = 'main'` | 菜单随页面走，删页面就删条目，不会留下死链 |
| 页头/页脚导航，需要集中调整顺序 | 项目配置 `[[menus.main]]` | 一处改动全站生效，适合固定导航 |
| **别用**：把站内页面写成 `url = '/posts/'` | —— | 丢掉页面关联，`IsMenuCurrent`/`HasMenuCurrent` 永远为假；应改用 `pageRef` |
| **别用**：三种方式同时维护同一批条目 | —— | 条目会合并进同一个 `site.Menus.main`，重复项与顺序难以预期；文档建议整站统一一种方式 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 导航栏里没有这一项 | 菜单名不一致（定义在 `main`，模板读 `site.Menus.footer`）；或把配置写进了 `[params]` 之类的表里 | 核对 `[[menus.<名字>]]` 的名字与模板里 `site.Menus.<名字>` 完全一致；用本页的调试输出确认数据源 |
| 没报错但结果不对 | 菜单项都在，但当前栏目不高亮 | 用 `url` 写了站内地址，条目没有页面对象 | 把站内条目改成 `pageRef = '/逻辑路径'`，并确认 `IsMenuCurrent` 传的是 `.Menu` 与 `.` 两个参数 |
| 没报错但结果不对 | 子项跑到了第一层 | `parent` 值与父项的 `identifier`（或 `name`）不一致 | 父项显式写 `identifier`，子项的 `parent` 与之逐字对应 |
| 没报错但结果不对 | 菜单顺序和预期不一致 | 有条目没写 `weight`（默认 0，会排到最前面）；或权重重复 | 给每个条目写上唯一且递增的 `weight`；子项权重只在同级内比较 |
| 没报错但结果不对 | 点击菜单项跳到 404 | `url` 写错了路径，或站内路径大小写与实际不符 | 站内条目改用 `pageRef`（Hugo 会解析真实链接）；外链才用 `url` |
| 没报错但结果不对 | 改了页面标题，菜单文字没变 | 前置元数据菜单的显示文字默认取页面 `title`/`linkTitle`，而 `menus` 里的 `name` 会覆盖它 | 要么改页面的 `title`/`linkTitle`，要么在 `[menus.main]` 里显式写 `name` |

更多排查入口见[故障排查](/troubleshooting/)。

## 延伸阅读

- [菜单模板](/templates/menu/)
- [配置菜单](/configuration/menus/)
- [多语言](/content-management/multilingual/)
- [前置元数据](/content-management/front-matter/)
- [目录结构](/getting-started/directory-structure/)
- [配置](/configuration/)
