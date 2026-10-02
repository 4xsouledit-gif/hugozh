+++
title = "主题组件"
linkTitle = "主题组件"
description = "把主题拆成多个组件组合成一套主题：优先级与两套合并算法，附可运行的覆盖实验和逐项对照结果。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/hugo-modules/theme-components/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟（含动手）"
prereq = [
  "站点能正常构建：`hugo --renderToMemory` 退出码为 0。",
  "大概知道 Hugo 从哪里取模板（项目 `layouts/` 优先于主题），读过[使用模块](/hugo-modules/use-modules/)里关于导入顺序的部分。",
]
outcomes = [
  "用 `theme = [...]` 把多个主题组件组合成一套主题，并说出 Hugo 的查找顺序；",
  "判断某个模板文件、某一条译文或某个数据键最终由哪个主题提供；",
  "说出主题组件允许配置哪些内容（`params`、`menu`、`outputformats`、`mediatypes`）；",
  "用项目自身或靠前的组件做覆盖，而不是直接改主题目录里的文件。",
]
next = ["/hugo-modules/nodejs-dependencies/", "/hugo-modules/use-modules/", "/configuration/module/"]
+++

## 这一页解决什么问题

一套主题通常由几部分组成：基础版式、针对本项目的定制、一组共享短代码。这一页解决的是**这几部分怎么叠起来，叠错时文件会从哪里冒出来**。Hugo 的做法是把主题写成一个组件列表，优先级从左到右；而覆盖规则按文件类型分成两套——`layouts` / `static` / `archetypes` 是整份替换，`i18n` / `data` 是按内部键合并。

只要你要改主题、换主题，或者想把主题拆成可复用的几块，这张优先级规则就必须先看懂。

## 把主题组合起来

一个项目可以把主题配置为任意多个主题组件（theme component）的组合：

```toml
theme = ["my-shortcodes", "base-theme", "hyde"]
```

这种组合还可以嵌套：主题组件本身也能在自己的 `hugo.toml` 中引入其他主题组件，这就是主题继承（theme inheritance）。

上面的定义在 `hugo.toml` 中创建了一个由 3 个主题组件构成的主题，优先级从左到右排列。查找任意文件、数据条目等内容时，Hugo 会先看项目本身，然后是 `my-shortcodes`、`base-theme`，最后才是 `hyde`。

## 覆盖顺序

Hugo 会根据文件类型使用两套不同的合并算法：

| 文件类型 | 合并方式 | 优先级规则 |
| --- | --- | --- |
| `i18n` 与 `data` 文件 | 按文件内部的翻译 ID 与数据键深度合并 | 键相同时以最靠左的值为准 |
| `static`、`layouts`（模板）与 `archetypes` 文件 | 按文件层级合并 | 最靠左的那份文件被选用 |

也就是说，内容与数据的合并发生在键的粒度上，同一份翻译表或数据文件里的不同条目可以来自不同模块；而静态文件与模板的合并发生在整个文件的粒度上，只能「整份替换」，不能把两个模板拼在一起。

## 名称与配置

`theme` 定义中使用的名称必须与站点 `/themes` 目录下的某个子目录同名，例如 `/your-site/themes/my-shortcodes`。

还需要注意，作为主题一部分的组件可以有自己的配置文件（例如 `hugo.toml`）。目前主题组件能够配置的内容有一些限制：

- `params`（全局与各语言）
- `menu`（全局与各语言）
- `outputformats` 与 `mediatypes`

这里同样适用前述规则：ID 相同时，最靠左的参数、菜单等取值会胜出。上述命名空间支持中还留有一些隐藏且处于实验阶段的用法，官方会继续改进；同时官方也鼓励主题作者自行建立命名空间，以免名称冲突。

## 动手跑一遍：三个组件，谁覆盖谁

用一个不联网的最小项目把优先级看一遍。项目结构（`themes/` 下三个目录就是三个主题组件）：

```tree
my-site/
├── hugo.toml
├── content/
│   ├── _index.md
│   └── p.md
└── themes/
    ├── my-shortcodes/
    │   ├── i18n/en.toml
    │   └── layouts/
    │       ├── _default/single.html
    │       └── _shortcodes/image.html
    ├── base-theme/
    │   ├── hugo.toml                 # 内部再嵌套 theme = ["hyde"]
    │   ├── i18n/en.toml
    │   └── layouts/_default/single.html
    └── hyde/
        ├── i18n/en.toml
        └── layouts/_default/single.html
```

`my-site/hugo.toml`：

```toml
baseURL = "https://example.org/"
title = "组件试跑"
theme = ["my-shortcodes", "base-theme"]
```

`themes/base-theme/hugo.toml` 里再嵌一层——这就是主题继承：

```toml
theme = ["hyde"]
```

三个主题都提供 `layouts/_default/single.html`，里面除了自己的名字，还打印两条译文——这样既能看到选中了哪个组件，也能看到译文来自哪里：

```go-html-template {file="themes/my-shortcodes/layouts/_default/single.html"}
SINGLE from my-shortcodes | {{ i18n "hello" }} | {{ i18n "bye" }}
```

```go-html-template {file="themes/base-theme/layouts/_default/single.html"}
SINGLE from base-theme | {{ i18n "hello" }} | {{ i18n "bye" }}
```

```go-html-template {file="themes/hyde/layouts/_default/single.html"}
SINGLE from hyde | {{ i18n "hello" }} | {{ i18n "bye" }}
```

译文则**故意错开**：`my-shortcodes` 只定义 `hello`，`base-theme` 同时定义 `hello` 与 `bye`。

> [!NOTE]
> `i18n/` 下的文件名要与语言代码一致。下面按 Hugo 的默认语言写 `en.toml`；如果站点配置了 `defaultContentLanguage = "zh-cn"`，文件名要相应改成 `zh-cn.toml`，否则译文不会被加载。

```toml
# themes/my-shortcodes/i18n/en.toml
[hello]
other = "hello-from-my-shortcodes"
```

```toml
# themes/base-theme/i18n/en.toml
[hello]
other = "hello-from-base-theme"
[bye]
other = "bye-from-base-theme"
```

构建并检查（产物写到 `out/`，不动 `public/`）：

```bash
hugo --ignoreCache --destination out
```

> [!NOTE]
> 这个最小项目只写了单页模板，所以构建会打印两条 `found no layout file for "html" for kind "home" / "taxonomy"` 警告，退出码仍是 0。它们与本实验无关，看警告要看**哪一个 kind** 没有模板。

**你应当看到什么**（实测：v0.167.0，Windows amd64，单语言站点，`theme = ["my-shortcodes", "base-theme"]`，`base-theme` 内嵌 `hyde`）：

| 检查项 | 期望结果 | 说明了什么 |
| --- | --- | --- |
| `out/p/index.html` 的三段输出 | `SINGLE from my-shortcodes`、`hello-from-my-shortcodes`、`bye-from-base-theme` | 模板与 `hello` 都取到最靠左的组件；`bye` 只有 `base-theme` 定义 |
| 删掉 `themes/my-shortcodes/layouts/_default/single.html` 后重建 | 变成 `SINGLE from base-theme`、`hello-from-my-shortcodes`、`bye-from-base-theme` | 只换掉了模板，译文不受影响：`base-theme` 排在它嵌套的 `hyde` 之前，嵌套组件接在被嵌套者**之后** |
| 在项目里新建 `layouts/_default/single.html`，只写一行 `SINGLE from PROJECT` | 这三段输出全部被替换成项目那一份 | 项目自身永远排在最前面；这也是覆盖主题的**正确做法** |
| 在项目 `i18n/en.toml` 里只写 `[hello]` 一条 | `hello` 变成项目里的值，`bye` 仍来自 `base-theme` | `i18n` 是**按键合并**：项目只需给出要改的那条键，其余键照旧从组件里取 |

把这几条对照着跑一遍，就能建立一套可靠的判断：**先分文件类型（整份替换 / 按键合并），再看谁排在最左边（项目 → 各组件按声明顺序）。**

## 与模块机制的关系

主题组件的查找顺序并不是一套独立机制，而是模块导入优先级在主题上的体现：`theme` 中列出的组件相当于被依次导入，越靠前优先级越高，项目自身的文件则始终排在最前面。因此，覆盖主题中的某个模板，只需在项目里放置相对路径相同的文件；覆盖翻译表中某一条译文，也只需在项目里定义同一个翻译 ID。

关于模块的导入、更新与挂载，见[使用模块](/hugo-modules/use-modules/)；关于项目目录的职责划分，见[目录结构](/getting-started/directory-structure/)。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了主题里的模板，页面却没变化 | 实际生效的是排在更前面的那一份文件（项目里已有同路径文件，或前面的组件也提供了同名文件） | 从**最靠左**的那一份开始排查：`hugo config` 看 `theme` 顺序，项目 `layouts/` 里再找一遍同路径文件 |
| `theme` 写好了，站点却像没装主题 | 名称与 `themes/` 下的目录名不一致（大小写、连字符、多一层目录） | `theme` 里的每一项都必须对应 `themes/<名字>/`；核对拼写后重建 |
| 覆盖了模板，页脚/样式还是主题那份 | `layouts`、`static`、`archetypes` 是**整份文件替换**，不能只替换文件中的一段 | 把要改的完整文件复制到项目里再改；想叠加就把主题拆成更小的组件 |
| 只改了一条译文，其他译文反而丢了 | 误以为 `i18n` 也是整份替换，于是把整份文件挪进了项目 | `i18n`／`data` 按键合并：项目里只写要覆盖的键，其余键仍从组件读取 |
| 主题组件里设置的 `params` 不生效 | 主题组件只能配置 `params`、`menu`、`outputformats`、`mediatypes`，其余键被忽略 | 把配置放到项目自身的配置文件里 |
| 导航里多出几个陌生菜单项 | 主题脚手架的 `[menus]` 会随主题一起合并进站点 | 在主题的 `hugo.toml` 中删掉不需要的 `[menus]` 条目 |
| 报错 `found no layout file for "html" for kind "…"` | 该项目与所有组件里都没有匹配的模板 | 按[模板查找顺序](/templates/lookup-order/)补模板，并确认主题确实被 `theme` 引用 |
| 没有报错，但输出就是不对 | 覆盖类问题几乎都不报错 | 按[故障排查](/troubleshooting/)的「没有报错但结果不对」一节，先确认生效的是哪一份文件 |
