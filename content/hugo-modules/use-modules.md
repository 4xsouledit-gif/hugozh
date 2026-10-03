+++
title = "使用模块"
linkTitle = "使用模块"
description = "模块的初始化、导入、更新、缓存、vendor 与本地开发分步做：每步给出验证标准，并汇总常见报错与成因。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/hugo-modules/use-modules/"

[params.teach]
difficulty = "进阶"
time = "30–45 分钟（含动手）"
prereq = [
  "站点能正常构建：`hugo --renderToMemory` 退出码为 0。",
  "终端里能执行 `git`；要下载**远端**模块还需要 `go` 1.18 或更高版本并已加入 `PATH`（实测：v0.167.0 的 `hugo mod init` 会调用 `go` 命令）。",
]
outcomes = [
  "用 `hugo mod init` 初始化项目，用 `[[module.imports]]` 引入模块，并用产物确认同名文件由谁生效；",
  "把更新、整理、缓存、vendor 四条日常命令用在对的场景；",
  "用 `replace`、`replacements` 或工作区在本地开发模块，并让改动触发重建；",
  "遇到 `go` 找不到、模块拉取超时、改了 `_vendor` 不生效等问题时知道下一步查哪里。",
]
next = ["/hugo-modules/theme-components/", "/hugo-modules/nodejs-dependencies/", "/configuration/module/", "/commands/hugo-mod/"]
+++

## 这一页解决什么问题

这一页把模块从「概念」推进到「日常操作」：**怎么把项目变成模块、怎么引入别人写好的模块、怎么更新与清理、怎么在本地改一个还没发布的模块**。关键步骤后面都给出验证方法，你可以自己判断到底生效了没有。

`hugo mod` 各子命令的参数见[命令参考](/commands/hugo-mod/)；`[module]` 里每个配置键的类型、默认值与取值见[模块配置](/configuration/module/)。

> **注意**：要与模块打交道，必须安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 与 [Go](https://go.dev/doc/install) 1.18 或更高版本。

## 模块概览

模块（module）是 Hugo 的基本组织单位，使用时需要了解几条规则：

- 模块可以按任意组合与顺序导入。
- 模块导入是递归的：导入模块 A 可能连带触发对模块 B 的导入，依此类推。
- 模块可以提供配置文件与目录，但要遵守[合并配置设置](/configuration/introduction/#合并配置设置)相关的约束。
- 外部目录——包括来自非 Hugo 项目的目录——可以挂载进来，从而形成统一的文件系统。

## 导入模块

要导入模块，先要把项目本身初始化为模块。例如：

```bash
hugo mod init github.com/user/project
```

这条命令会在项目根目录生成一个 [`go.mod`](https://go.dev/ref/mod#go-mod-file) 文件。

**你应当看到什么**：命令结束后退出码为 0，项目根目录多出一个 `go.mod` 文件。

> **实测（v0.167.0，Windows amd64，未安装 Go）**：`go` 不在 `PATH` 时，这条命令会直接失败：
>
> ```text
> ERROR failed to init modules: binary with name "go" not found in PATH
> ```
>
> 退出码为 1，`go.mod` 不会被创建。Hugo 的模块功能是**调用 `go` 命令**实现的，Hugo 本身不带 Go 工具链，所以「只装 Hugo」在需要模块命令时会卡在第一步。装好 Go 后要**重开终端**，`PATH` 才会生效。作为对照：只使用 `themes/` 目录里的本地模块时，构建与 `hugo mod npm pack` 都不需要 `go`（实测）。

> **注意**：模块名只是一个唯一标识，并不是托管要求。写成 `github.com/user/project` 是常见惯例，但并不意味着你必须使用 Git 或把代码托管到 GitHub。如果你不打算让别人把你的项目当作模块导入，用什么名字都可以；例如初始化时可以简单地写成 `my-project`。

随后在项目配置中声明一个或多个导入。下面这个示例导入了三个模块，每个模块都提供了自定义短代码：

```toml
[module]
  [[module.imports]]
    path = 'shortcodes-a'
  [[module.imports]]
    path = 'shortcodes-b'
  [[module.imports]]
    path = 'github.com/user/shortcodes-c'
```

导入的优先级自上而下。例如 `shortcodes-a`、`shortcodes-b` 与 `shortcodes-c` 都定义了 `image` 短代码时，生效的是 `shortcodes-a` 中的那一个。

> **注意**：如果多个模块含有路径相同的数据文件或翻译表，数据会按自上而下的优先级深度合并。

构建项目时，Hugo 会依次完成三件事：

1. 下载模块。
2. 把它们缓存起来以备后用。
3. 在项目根目录生成 `go.sum` 文件（格式见 [`go.sum`](https://go.dev/ref/mod#go-sum-files)）。

### 动手跑一遍：不联网也能验证导入优先级

下载远端模块要联网、要 Go，但**验证「谁覆盖谁」不需要**：把模块直接放进 `themes/` 目录，用目录名当模块路径即可。这正是「几个短代码库都提供同名短代码」时最常见的场景。

```tree
my-site/
├── hugo.toml
├── content/
│   └── _index.md
├── layouts/
│   └── index.html
└── themes/
    ├── shortcodes-a/
    │   └── layouts/_shortcodes/image.html
    └── shortcodes-b/
        ├── data/extra.toml
        └── layouts/_shortcodes/
            ├── image.html
            └── only-b.html
```

`hugo.toml`：

```toml
baseURL = "https://example.org/"
title = "导入试跑"

[module]
  [[module.imports]]
    path = 'shortcodes-a'
  [[module.imports]]
    path = 'shortcodes-b'
```

两个主题各写一份 `image.html`：`shortcodes-a` 里写 `<p>image from shortcodes-a</p>`，`shortcodes-b` 里写 `<p>image from shortcodes-b</p>`。`content/_index.md` 的正文调用这两个短代码（本页按站内规范转义展示，真实内容文件里去掉 `/* */`）：

```markdown
{{</* image */>}}

{{</* only-b */>}}
```

构建并检查产物（写到 `out/`，不动 `public/`）：

```bash
hugo --ignoreCache --destination out
```

**你应当看到什么**（实测：v0.167.0，Windows amd64，单语言站点）：

| 检查项 | 期望结果 |
| --- | --- |
| 命令退出码 | `0` |
| `out/index.html` | 出现 `<p>image from shortcodes-a</p>`——同名短代码由**先导入**的模块胜出 |
| `out/index.html` | 出现 `<p>only-b</p>`——`shortcodes-b` 独有的短代码照常可用 |
| 项目根目录 | **没有**生成 `go.mod`（实测）：只导入 `themes/` 下的本地目录时，不需要下载任何东西，也就用不到 Go |
| 模板里读 `hugo.Data.extra.who` | 取到 `shortcodes-b/data/extra.toml` 的值（实测）：模块提供的 `data` 文件可以直接读取，无需额外配置 |

`hugo mod graph` 可以列出当前登记了哪些模块依赖，用来确认 `[[module.imports]]` 有没有写进去：

```bash
hugo mod graph
```

**你应当看到什么**（实测：同一个项目，v0.167.0）：逐行打印 `project shortcodes-a`、`project shortcodes-b`；`themes/` 下的本地模块没有版本号。反过来，如果项目里**一条依赖都没有**（例如 `[[module.imports]]` 漏写或写错缩进），这条命令什么也不打印、退出码仍为 0——「没输出」本身就是线索。

## 更新与整理

导入模块后，Hugo 会在项目根目录留下 `go.mod` 与 `go.sum`，用来记录版本与校验和信息。清空模块缓存后重新构建，Hugo 会按 `go.mod` 中的记录重新下载原本导入的那个版本，从而保证构建一致；需要换版本时再显式更新。

把某个模块更新到最新版本：

```bash
hugo mod get -u github.com/user/shortcodes-c
```

更新到指定版本：

```bash
hugo mod get -u github.com/user/shortcodes-c@v0.42.0
```

把所有模块更新到最新版本，或递归更新全部模块：

```bash
hugo mod get -u
hugo mod get -u ./...
```

要从 `go.mod` 与 `go.sum` 中移除不再使用的条目：

```bash
hugo mod tidy
```

## 缓存与 vendor

Hugo 会缓存模块，避免每次构建都重复下载。默认情况下，这些文件存放在 [`cacheDir`](/configuration/all/#缓存目录) 下的 `modules` 目录中。清理当前项目的模块缓存，或清理所有项目的模块缓存：

```bash
hugo mod clean
hugo mod clean --all
```

缓存位置与回收策略见[文件缓存](/configuration/caches/)。**你应当看到什么**：命令只输出日志、退出码为 0（实测 `hugo mod clean`）；`hugo mod clean` 清理当前项目的模块缓存，`hugo mod clean --all` 清理所有项目的模块缓存，之后下次构建需要重新下载。

`hugo mod vendor` 会把导入的模块复制到项目内的 `_vendor` 目录，供后续构建使用，同时也便于在本地查看模块的各个组件：

```bash
hugo mod vendor
```

使用该命令时需要注意：

- `hugo mod vendor` 可以在模块树的任意层级运行。
- `themes` 目录中的模块不会被 vendor。
- `--ignoreVendorPaths` 选项可以按 Glob 模式，把匹配的已 vendor 模块从特定命令中排除。

**你应当看到什么**：退出码为 0，项目根目录出现 `_vendor/` 目录；再执行一次 `hugo` 构建，退出码仍为 0、站点内容不变。**实测（v0.167.0）**：如果所有导入都来自 `themes/` 目录，`hugo mod vendor` 仍然退出 0，但生成的 `_vendor/` 是一个**空目录**（没有 `modules.txt`）——因为 `themes` 目录中的模块不参与 vendor，这属于预期行为，不是失败。

> **重要**：不要直接修改 `_vendor` 目录里的文件。正确的做法是在项目根目录下创建相对路径相同的对应文件来覆盖它们。要移除已 vendor 的模块，删除 `_vendor` 目录即可。

## 本地开发

做本地模块开发时，可以在 `go.mod` 里用 `replace` 指令指向本地目录：

```text
replace github.com/user/module => /home/user/projects/module
```

在 `hugo server` 运行期间做这样的改动，会触发配置重新加载，并把该本地目录加入监视列表。另一种做法是在项目配置中设置 [`replacements`](/configuration/module/#顶层设置) 参数来声明替换关系。

**怎么验证生效**：保持 `hugo server` 运行，改一下本地模块里的模板，浏览器应当刷新出新内容；若没有反应，先确认 `hugo server` 还在运行，再确认改的正是被 `replace` 指向的那个目录（而不是 `_vendor/` 或缓存里的副本）。

工作区（workspace）能进一步简化「站点 + 模块」的本地开发。创建一个 `.work` 文件来定义工作区，再通过配置项 [`workspace`](/configuration/module/#顶层设置) 或环境变量 `HUGO_MODULE_WORKSPACE` 启用它。`.work` 文件的例子：

```text
go 1.27

use .
use ../my-hugo-module
```

用 `use` 指令列出各个模块路径，其中也包括主项目（`.`）。启用工作区后启动服务器：

```bash
HUGO_MODULE_WORKSPACE=hugo.work hugo server --ignoreVendorPaths "**"
```

这里的 `--ignoreVendorPaths` 用于忽略已 vendor 的依赖（如果存在），这样才能让工作区内本地修改的热重载生效。

要在目标模块目录中生成依赖图，包括 vendor 情况、模块替换与已停用模块的信息，可以执行 `hugo mod graph`。例如：

```bash
hugo mod graph
```

输出会逐行列出模块之间的依赖关系，被停用的依赖会以 `DISABLED` 开头。官方文档给出的例子：

```sh
$ hugo mod graph

github.com/bep/my-modular-site github.com/bep/hugotestmods/mymounts@v1.2.0
github.com/bep/my-modular-site github.com/bep/hugotestmods/mypartials@v1.0.7
github.com/bep/hugotestmods/mypartials@v1.0.7 github.com/bep/hugotestmods/myassets@v1.0.4
github.com/bep/hugotestmods/mypartials@v1.0.7 github.com/bep/hugotestmods/myv2@v1.0.0
DISABLED github.com/bep/my-modular-site github.com/spf13/hyde@v0.0.0-20190427180251-e36f5799b396
github.com/bep/my-modular-site github.com/bep/hugo-fresh@v1.0.1
github.com/bep/my-modular-site in-themesdir
```

**你应当看到什么**：每行是「使用方 依赖项」；带 `@vX.Y.Z` 的是有版本记录的远端依赖，`DISABLED` 前缀表示该依赖已被禁用，像 `in-themesdir` 这样没有版本号的条目来自 `themes/` 目录中的模块。**实测（v0.167.0）**：当 `[[module.imports]]` 写的是 `themes/` 下的本地目录名时，这一行打印为 `project <目录名>`（例如 `project shortcodes-a`），同样没有版本号——这是本页内嵌离线示例中用到的验证方法。

## 私有模块

如果模块位于私有仓库，需要让 Go 工具链知道哪些模块路径不该经过公共代理、也不该做校验和检查。这由 Go 自身的环境变量控制，其中 `GOPRIVATE` 是最常用的一个，可以按逗号分隔的模式列出私有路径：

```bash
export GOPRIVATE=github.com/your-org/*
```

除了 `GOPRIVATE`，还可以按需设置 `GONOPROXY`、`GONOSUMDB`、`GONOSUMCHECK` 等变量，或者直接设置 `GOFLAGS`、`GOPROXY` 来调整模块下载方式。这些变量属于 Go 模块工具链的配置，Hugo 只是复用同一套机制：只要 `go` 能取到该模块，`hugo mod get` 与模块下载就能正常工作。

> [!TIP]
> 国内网络环境下从 GitHub 拉取模块常常很慢或超时。可以给 Go 工具链配置代理镜像，例如把 `GOPROXY` 设为 `https://goproxy.cn,direct`（按需换成你信任的镜像），再执行 `hugo mod get`。这类环境变量只在当前终端会话有效，写入 shell 配置文件才会长期生效；Windows PowerShell 里对应 `$env:GOPROXY = "https://goproxy.cn,direct"`。

## 模块挂载

导入的模块会自动把自己的组件目录挂载到 Hugo 的统一文件系统中。除此之外，你也可以手动把任意目录——同样包括来自非 Hugo 项目的目录——挂载到对应的组件目录上，配置方式见[模块配置的挂载](/configuration/module/#挂载)。

挂载最容易踩的坑是**覆盖性**：在项目配置里为某个组件定义挂载，会移除该组件的默认挂载。完整例子与验证方法见[简介](/hugo-modules/introduction/)的「动手跑一遍」，写挂载前建议先读一遍。

**你应当看到什么**：`hugo config` 打印的生效配置里能看到你写的每一段 `[[module.mounts]]`（以及 Hugo 为其它组件补上的默认挂载，例如 `data`、`i18n`、`assets`），产物里能看到被挂载目录中的页面与静态文件。如果产物里少了项目自身的内容或静态文件，先回去检查这个组件的默认挂载有没有写回来。

## 其他模块配置

除了 `imports` 与 `mounts`，`[module]` 区段中还有一组与依赖获取相关的参数，可以在项目配置中按需设置（各项的类型、默认值与取值见[模块配置的顶层设置](/configuration/module/#顶层设置)）：

- `hugoVersion`：声明项目要求的 Hugo 版本范围，供模块与项目之间核对。
- `proxy`：指定获取模块时使用的代理。
- `noVendor`：用于把某些模块路径排除在 vendor 之外。
- `replacements`：声明模块路径的替换关系，便于本地开发。
- `workspace`：指定要启用的工作区文件。

这些参数的具体取值与默认行为，以配置参考中模块部分的说明为准。本章只说明它们各自的用途，实际使用时请对照项目所安装的 Hugo 版本确认。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `ERROR failed to init modules: binary with name "go" not found in PATH`，`go.mod` 没生成 | Hugo 的模块命令是调用 `go` 完成的，而 Go 没装或不在 `PATH` | 安装 Go 1.18 或更高版本并加入 `PATH`，然后**重开终端**；只使用 `themes/` 下的本地模块时不需要 Go |
| `hugo mod init` 报模块路径不合法 | 模块名写法不被接受 | 用 `github.com/user/project` 这类常见写法，或直接用简单名字 `my-project`——模块名只是唯一标识，不要求真的托管在 GitHub |
| 远端模块拉取超时、卡住 | 网络无法直连，或私有仓库没配好 | 按上文「私有模块」设置 `GOPRIVATE`、`GOPROXY`；国内网络可换用镜像代理 |
| 改了 `[[module.imports]]` 却没有生效 | 缩进或位置写错，被归进了别的表 | 用 `hugo config` 看生效配置，用 `hugo mod graph` 看依赖是否登记 |
| 手改了 `_vendor/` 里的文件，下次构建又变回去 | `_vendor` 是生成物，会被覆盖 | 在项目根目录建**相对路径相同**的文件来覆盖；要移除已 vendor 的模块就删掉整个 `_vendor/` 目录 |
| `hugo mod vendor` 生成了空的 `_vendor/`，没有任何报错 | `themes/` 目录中的模块不参与 vendor（实测，v0.167.0） | 属预期行为；确实需要 vendor 就把该模块改成远端导入 |
| `hugo mod get -u` 跑完没有输出、版本也没变 | 项目里没有可更新的远端依赖时，它是空操作（实测：只有本地 `themes/` 模块的项目，退出码 0、无输出） | 先用 `hugo mod graph` 确认有远端依赖；本地模块的修改直接改目录即可 |
| 构建日志出现 `npm dependencies are out of sync` | 模块的 Node 依赖变了，自动生成的包还没更新 | 执行 `hugo mod npm pack`，见 [Node.js 依赖](/hugo-modules/nodejs-dependencies/) |
| 报错看不懂，措辞不像 Hugo | 模块错误大多来自 Go 工具链 | 见[故障排查](/troubleshooting/)；求助时附上 `hugo env` 的完整输出与报错全文 |

## 相关页面

- [简介](/hugo-modules/introduction/)：模块的基本概念。
- [主题组件](/hugo-modules/theme-components/)：多个主题组合时的优先级规则。
- [Node.js 依赖](/hugo-modules/nodejs-dependencies/)：模块中的前端依赖如何合并。
- [模块相关命令](/commands/)：`hugo mod` 及其各子命令。
- [配置 Hugo](/configuration/)：项目配置文件的位置与写法。
