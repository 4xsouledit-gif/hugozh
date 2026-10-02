+++
title = "简介"
linkTitle = "简介"
description = "模块解决什么问题、能提供哪七类组件，以及「统一文件系统」的含义，附一个不需要联网就能跑通的挂载示例。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/hugo-modules/introduction/"

[params.teach]
difficulty = "进阶"
time = "15–20 分钟"
prereq = [
  "站点能正常构建：`hugo --renderToMemory` 退出码为 0。",
  "知道 `content/`、`layouts/`、`static/`、`data/` 各自放什么（见[目录结构](/getting-started/directory-structure/)）。",
]
outcomes = [
  "说清模块能提供的七类组件，并解释「统一文件系统」把项目、主题、外部目录放在一起查找意味着什么；",
  "把项目外的目录挂进 `content`、`layouts`、`static`、`data`，并用产物与 `hugo config` 验证挂载确实生效；",
  "解释为什么挂载是**覆盖式**的，以及怎样避免项目自身的文件被静默挤掉。",
]
next = ["/hugo-modules/use-modules/", "/configuration/module/", "/hugo-modules/theme-components/"]
+++

## 这一页解决什么问题

这一页回答「模块到底解决什么问题」：**让复用的单位从「一个主题目录」变成「一个可以提供任意组件的模块」，并且把项目、主题、外部目录合成同一棵查找树**。读完你就能判断一件具体的事该不该用模块，也能看懂别人项目里那段 `[module]` 配置在做什么。

模块的完整配置项见[模块配置](/configuration/module/)；怎么导入、更新、vendor 见[使用模块](/hugo-modules/use-modules/)。

## 模块是什么

Hugo 用模块（module）作为最基本的组织单位。一个模块既可以是一个完整的 Hugo 项目，也可以是更小的、可复用的片段，用来提供 Hugo 七类组件（component）中的一类或几类：

| 组件类型 | 目录 | 说明 |
| --- | --- | --- |
| 静态文件 | `static/` | 构建时原样复制的文件 |
| 内容 | `content/` | 页面、页面包与页面资源 |
| 布局 | `layouts/` | 模板与局部模板 |
| 数据 | `data/` | 数据文件，供模板读取 |
| 资源 | `assets/` | 交给资源管道处理后再发布的文件 |
| 国际化资源 | `i18n/` | 翻译表 |
| 原型 | `archetypes/` | 新建内容时使用的模板 |

也就是说，模块能共享的不只是主题外观，还包括内容、数据、翻译与内容骨架。

## 统一文件系统

模块可以按任意方式组合，并且可以把外部目录挂载进来，包括那些并非 Hugo 项目的目录。挂载之后，效果上就得到了一个统一的文件系统：Hugo 查找内容、模板、资源与数据时，看到的是同一棵目录树，而不必关心某个文件原本属于项目、主题还是别的仓库。

结合模块导入的优先级，这套机制让「复用」与「覆盖」变成同一件事：项目里放一份同路径的文件，就能覆盖来自模块的那一份。

## 动手跑一遍：把项目外的目录挂进统一文件系统

「统一文件系统」听起来抽象，挂一次就清楚了。下面这个例子只用本地目录，**不需要联网，也不需要 Git 与 Go**，把目录结构照抄到磁盘上就能跑通。

先摆好两个目录：`my-site/` 是项目，`shared/` 在项目之外，本身**不是** Hugo 项目。

```tree
parent/
├── my-site/
│   ├── hugo.toml
│   └── content/
│       ├── _index.md
│       └── local.md
└── shared/
    ├── content/
    │   └── guide/
    │       ├── _index.md
    │       └── a.md
    ├── layouts/
    │   ├── index.html
    │   ├── _default/
    │   │   ├── list.html
    │   │   └── single.html
    │   └── _shortcodes/
    │       └── hello.html
    ├── static/
    │   └── css/
    │       └── ext.css
    └── data/
        └── colors.toml
```

`my-site/hugo.toml` 里把两边都挂上：

```toml
baseURL = "https://example.org/"
title = "挂载试跑"

[[module.mounts]]
  source = "content"            # 项目自身的 content
  target = "content"
[[module.mounts]]
  source = "../shared/content"  # 项目之外的内容
  target = "content"
[[module.mounts]]
  source = "../shared/layouts"
  target = "layouts"
[[module.mounts]]
  source = "../shared/static"
  target = "static"
[[module.mounts]]
  source = "../shared/data"
  target = "data"
```

每一段都在说同一件事：**把 `source` 这个目录，接到统一文件系统的 `target` 位置上**。`target` 必须以组件目录开头（`archetypes`、`assets`、`content`、`data`、`i18n`、`layouts`、`static`）；挂载完成后 Hugo 只认 `target`，不再关心文件原本躺在哪个仓库、哪块磁盘上。

然后是几个文件的内容。三个模板都放在 `shared/layouts/` 里——它们本来就是「共享的版式」，正好用来验证模板也能挂载：

```go-html-template {file="shared/layouts/index.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  <h1>{{ .Title }}</h1>
  <ul>
    {{ range .Site.RegularPages }}
      <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
    {{ end }}
  </ul>
  <p>data: {{ hugo.Data.colors.primary }}</p>
</body>
</html>
```

```go-html-template {file="shared/layouts/_default/single.html"}
<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body><h1>{{ .Title }}</h1>{{ .Content }}</body></html>
```

```go-html-template {file="shared/layouts/_default/list.html"}
<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body><h1>{{ .Title }}</h1>{{ .Content }}
{{ range .Pages }}<a href="{{ .RelPermalink }}">{{ .Title }}</a>{{ end }}</body></html>
```

内容文件只有 `title`，够用即可：

```markdown {file="shared/content/guide/_index.md"}
---
title: Guide
---
```

`my-site/content/_index.md` 的 `title` 写「挂载试跑」，`my-site/content/local.md` 的 `title` 写「Local Page」，`shared/content/guide/a.md` 的 `title` 写「A Page」。`shared/data/colors.toml` 里写一行 `primary = "blue"`。

接着放那个短代码：`shared/layouts/_shortcodes/hello.html` 内容为 `<p>hello from mounted module</p>`，`shared/content/guide/a.md` 的正文里调用它——本页按站内规范把调用转义成 `{{</* hello */>}}` 来展示，真实内容文件里去掉 `/* */` 即可：

```markdown
---
title: A Page
---

{{</* hello */>}}
```

构建，并把产物写到项目下的 `out/`（不动 `public/`）：

```bash
hugo --ignoreCache --destination out
```

**你应当看到什么**（实测：v0.167.0，Windows amd64，单语言站点，`shared/` 与 `my-site/` 同级）：

| 检查项 | 期望结果 |
| --- | --- |
| 命令退出码 | `0` |
| `out/index.html` | 列表里同时有 `Local Page`（项目自己的内容）与 `A Page`（挂载进来的内容）——两棵目录树出现在同一个站点里 |
| `out/index.html` 底部 | 打印 `data: blue`，说明 `shared/data/colors.toml` 已被读到 |
| `out/guide/a/index.html` | 正文里是 `<p>hello from mounted module</p>`，不是短代码原文 |
| `out/css/ext.css` | 存在，说明 `static` 挂载生效 |
| 没有任何 `"found no layout file"` 警告 | 模板来自挂载的 `layouts`，说明它也生效了 |

还有一条更快的验证：`hugo config` 会把**生效的**挂载全部打印出来（包括 Hugo 自动补上的默认挂载）。挂载没写对时，先看这份输出，而不是猜：

```bash
hugo config | grep -A2 module.mounts
```

Windows PowerShell 里把 `grep` 换成 `Select-String`：

```powershell
hugo config | Select-String -Pattern 'module.mounts' -Context 0,2
```

**少写一段挂载会怎样**（实测，就在上面这个例子上）：删掉第一段 `source = "content"`、只留 `../shared/content`，`Local Page` 会从首页列表里消失，`/local/` 也不再发布，而构建**退出码仍然是 0**，日志里没有一句 `WARN` 或 `ERROR`——文件没了，却没有任何提示。规则见[模块配置](/configuration/module/#默认挂载)：**在项目配置中为某个组件定义挂载，会移除该组件的默认挂载**。想两边都要，就得像上面的配置那样把默认挂载显式写回去。

（补一条实测：如果被挂载的目录里也有一份 `content/_index.md`，那么同一路径由**排在前面的那段挂载**胜出——项目自身的挂载写在前面，首页就仍取项目的 `_index.md`。这套「谁在前谁赢」的规则与主题组件完全一致，见[主题组件](/hugo-modules/theme-components/)。）

自查口诀：**`[module.mounts]` 里只要出现了某个组件，就确认同一份配置里把项目自身的对应目录也挂了一次。**

## 示例项目

官方文档给出了两个可以直接参考的项目：

<https://github.com/bep/docuapi>
: 一个在测试该功能时迁移到 Hugo 模块的主题，很适合用来说明「非 Hugo 项目如何挂载进 Hugo 的目录结构」。

<https://github.com/bep/my-modular-site>
: 一个用于测试的简单站点。

第一个示例尤其值得留意：它原本不是 Hugo 项目，但通过挂载，把自身的文件纳入了 Hugo 的组件目录中。这正是模块机制区别于传统主题安装方式的地方——不必把文件复制或搬运到项目里，也不必要求来源项目遵循 Hugo 的目录约定。

## 与其他章节的关系

要从零开始把一个项目变成模块，需要先安装 Git 与 Go，再执行 `hugo mod init`，然后在配置中声明导入，见[使用模块](/hugo-modules/use-modules/)。主题现在也以模块的形式分发，多个主题可以组合成一套主题，其查找与覆盖顺序见[主题组件](/hugo-modules/theme-components/)。如果模块带有需要构建的前端依赖，见 [Node.js 依赖](/hugo-modules/nodejs-dependencies/)。

模块把组件的搜索范围从项目目录扩展到了远端仓库与任意本地目录，因此项目目录结构的含义也随之放大：项目里的同名文件始终拥有更高的优先级。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 定义挂载后，项目里的内容或静态文件凭空消失，构建退出码却是 0 | 挂载是覆盖式的：为某个组件定义挂载会移除该组件的默认挂载 | 把项目自身目录显式挂回（`source = "content"`、`target = "content"`），见上文例子与[模块配置](/configuration/module/#默认挂载) |
| 报错 `invalid module config for "project": mount target must be one of: [archetypes assets content data i18n layouts static]` | `target` 没有以组件目录开头（例如写成了 `templates`） | 把 `target` 改成 `content`、`layouts`、`static`、`data`、`assets`、`i18n`、`archetypes` 之一 |
| 挂载了外部目录，站点里却看不到它的文件，也**没有**任何报错 | `source` 指向的目录不存在（相对路径写错、大小写不符、少了一层）时，该段挂载被静默忽略 | 核对 `source` 路径；用 `hugo config` 看生效的挂载，或先 `Get-ChildItem` / `ls` 确认目录真实存在（实测：v0.167.0 对不存在的 `source` 不报错） |
| 挂载后短代码报 `template for shortcode "…" not found` | 短代码模板没放在挂载到 `layouts` 的目录下的 `_shortcodes/` 里 | 把文件放到 `<挂载源>/layouts/_shortcodes/<名字>.html`，文件名即短代码名 |
| 改了 `shared/` 里的文件，`hugo server` 不重建 | 该挂载设了 `disableWatch = true`，或路径不在监听范围内 | 去掉 `disableWatch`；必要时重启 `hugo server`，见[模块配置的挂载](/configuration/module/#挂载) |
| 报错看不懂 | 模块与挂载的错误经常指向 Hugo 内部路径，而不是你的文件 | 先跑 `hugo config` 核对生效的挂载，再按[故障排查](/troubleshooting/)分诊 |
