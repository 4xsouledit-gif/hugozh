+++
title = "菜单配置"
linkTitle = "菜单配置"
description = "在项目配置中集中定义各菜单的菜单项。"
date = 2026-10-01
weight = 140
source = "https://gohugo.io/configuration/menus/"

[params.teach]
difficulty = "入门"
time = "10–15 分钟"
prereq = [
  "站点能构建，并知道 `hugo.toml` 在项目根目录。",
  "模板里有渲染菜单的位置（主题头部模板），或你愿意先只验证配置。",
]
outcomes = [
  "在项目配置里定义 `main`、`footer` 等多个菜单；",
  "用 `pageRef` 指向站内页面、用 `url` 指向外部链接，并说清为什么站内优先用 `pageRef`；",
  "用 `parent` 搭出二级菜单，用 `weight` 控制次序；",
  "用 `hugo config` 确认菜单项真的被读到了。",
]
next = ["/content-management/menus/", "/configuration/", "/troubleshooting/"]
+++

## 这一页解决什么问题

菜单项可以自动生成、写在页面前置元数据里，也可以像这一页这样**集中写在项目配置中**。集中定义的好处是菜单结构一眼看全，不散落在各个内容文件里，适合结构固定的导航（首页、产品、服务、页脚链接）。

**你应当看到什么**：运行 `hugo config`，输出里能找到你写的 `[[menus.<名>]]` 条目；页面上菜单的顺序与 `weight` 一致（数值小的靠前）。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| 在项目配置中定义菜单 | 导航结构固定、条目不多，希望集中维护 | 菜单名（`main` / `footer`）与模板读取的 `.Site.Menus.<名>` 不一致 → 该菜单为空，**不报错** |
| `pageRef` | 指向站内页面 | 改用硬编码路径后，开启多语言或调整 URL 策略时链接不会自动跟着变 |
| `url` | 指向外部网站 | 把站内页面写成 `url` → 多语言站点的语言切换不会切到对应语言 |
| `identifier` / `parent` | 二级菜单，或两个菜单项同名 | 子项的 `parent` 与父项的 `identifier`（父项未定义时为其 `name`）对不上 → 子项落到菜单根部，**不报错** |
| `weight` | 控制菜单次序 | 数值**小者靠前**（不是越大越前）；权重重复时次序不稳定 |
| `pre` / `post` | 在菜单项前后插入图标等 HTML | 写入的 HTML 会被直接输出；内容不可信时慎用 |
| `params` | 菜单项需要自定义属性（如 `rel = 'external'`） | 模板不读就毫无效果；键名要与模板中的取值一致 |

定义菜单项有三种方式：自动生成、在页面前置元数据中定义，以及在项目配置中定义。本页介绍项目配置方式，菜单系统的整体说明见[内容管理中的菜单](/content-management/menus/)。

## 示例

在项目配置中为 `main` 菜单定义菜单项：

```toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10

[[menus.main]]
name = 'Products'
pageRef = '/products'
weight = 20

[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 30
```

这样会生成一个菜单结构，可以在 `Site` 对象上通过 `Menus` 方法访问：

```go-html-template
{{ range .Site.Menus.main }}
  ...
{{ end }}
```

再定义一个 `footer` 菜单：

```toml
[[menus.footer]]
name = 'Terms'
pageRef = '/terms'
weight = 10

[[menus.footer]]
name = 'Privacy'
pageRef = '/privacy'
weight = 20
```

访问方式完全相同：

```go-html-template
{{ range .Site.Menus.footer }}
  ...
{{ end }}
```

## 菜单项字段

菜单项通常至少需要三个属性：`name`、`weight`，以及 `pageRef` 或 `url` 二者之一。内部页面目标用 `pageRef`，外部目标用 `url`。

| 键名 | 类型 | 说明 |
| --- | --- | --- |
| `identifier` | `string` | 当两个及以上菜单项的 `name` 相同，或需要用翻译表本地化 `name` 时必填。必须以字母开头，后接字母、数字或下划线。 |
| `name` | `string` | 渲染菜单项时显示的文本。 |
| `params` | `map` | 用户自定义的菜单项属性。 |
| `parent` | `string` | 父菜单项的 `identifier`；若父项未定义 `identifier`，则填其 `name`。嵌套菜单中的子项必填。 |
| `post` | `string` | 渲染菜单项时追加在后面的 HTML。 |
| `pre` | `string` | 渲染菜单项时添加在前面的 HTML。 |
| `title` | `string` | 渲染出的菜单项的 HTML `title` 属性。 |
| `weight` | `int` | 非零整数，表示该菜单项相对菜单根（子项则相对其父项）的位置。数值小者靠前，数值大者靠后。 |
| `pageRef` | `string` | 目标页面的逻辑路径，取值见下表。 |
| `url` | `string` | 目标 URL，仅用于外部目标。 |

`pageRef` 的取值随页面种类而不同：

| 页面种类 | `pageRef` |
| --- | --- |
| home | `/` |
| page | `/books/book-1` |
| section | `/books` |
| taxonomy | `/tags` |
| term | `/tags/foo` |

## 嵌套菜单

下面的嵌套菜单展示了更多可用属性：

```toml
[[menus.main]]
name = 'Products'
pageRef = '/products'
weight = 10

[[menus.main]]
name = 'Hardware'
pageRef = '/products/hardware'
parent = 'Products'
weight = 1

[[menus.main]]
name = 'Software'
pageRef = '/products/software'
parent = 'Products'
weight = 2

[[menus.main]]
name = 'Services'
pageRef = '/services'
weight = 20

[[menus.main]]
name = 'Hugo'
pre = '<i class="fa fa-heart"></i>'
url = 'https://gohugo.io/'
weight = 30
[menus.main.params]
rel = 'external'
```

其中 `Hardware` 与 `Software` 通过 `parent = 'Products'` 成为子项，`Hugo` 使用 `pre` 插入图标、用 `url` 指向外部地址，并通过 `params` 自定义了一个 `rel` 属性，供菜单模板读取。用 `pageRef` 而不是硬编码路径的好处是：即使开启多语言或调整 URL 策略，链接仍会指向正确的页面。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 菜单完全不显示 | 配置里的菜单名与模板读取的 `.Site.Menus.<名>` 不一致；或模板只渲染自动生成的菜单 | 用 `hugo config` 确认菜单项存在，再核对模板里的键名 |
| 子菜单项跑到了顶层 | `parent` 与父项的 `identifier`（未定义时为 `name`）不一致 | 父项没写 `identifier` 时，`parent` 就填它的 `name`，两处写法保持一致 |
| 菜单顺序乱跳 | `weight` 重复或缺失（数值小者靠前） | 给每个条目分配唯一权重（10、20、30…） |
| 多语言站点里菜单只有一种语言 | 菜单写在项目级配置，而该语言另有 `[languages.<lang>.menus]` | 需要按语言区分就写到语言键下；要统一则只写项目级 |
| 外部链接在语言切换后仍指向同一地址 | 站内页面用了 `url` 而不是 `pageRef` | 站内目标改用 `pageRef`，外部目标保留 `url` |
| 报错看不懂 | 菜单配置基本不报错，症状是「少了条目或顺序不对」 | 见[故障排查](/troubleshooting/)与[菜单](/content-management/menus/) |

更多排查入口见[故障排查](/troubleshooting/)。
