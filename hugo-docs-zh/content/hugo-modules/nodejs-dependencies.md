+++
title = "Node.js 依赖"
linkTitle = "Node.js 依赖"
description = "在模块中声明 Node.js 依赖并汇总到统一的 npm 工作区：可运行示例、版本优先级，以及过期警告的处理方法。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/hugo-modules/nodejs-dependencies/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "站点能正常构建：`hugo --renderToMemory` 退出码为 0。",
  "本机装了 Node.js 与 npm：`node -v`、`npm -v` 都能输出（`npm install` 需要）。",
  "项目或某个模块确实带有 `package.json`（例如用了 Tailwind CSS）。",
]
outcomes = [
  "在模块根目录用 `package.json` 声明该模块需要的 Node 依赖；",
  "用 `hugo mod npm pack` 把各模块依赖汇总到 `packages/hugoautogen/`，并在项目根目录只执行一次 `npm install`；",
  "判断同一个依赖在多处声明时最终采用哪个版本；",
  "看到 `npm dependencies are out of sync` 警告时知道该跑哪条命令。",
]
next = ["/hugo-modules/use-modules/", "/hugo-pipes/", "/commands/hugo-mod-npm-pack/"]
+++

## 这一页解决什么问题

模块需要 Node 包时（最典型的是 Tailwind CSS 的命令行工具），依赖该写进谁的 `package.json`？这一页解决的就是这件事：**每个模块在自己根目录声明依赖，Hugo 把它们汇总成项目里的一个 npm 工作区，项目层面只需要执行一次 `npm install`**。读完你能看懂 `packages/hugoautogen/` 是怎么来的，也能判断某个依赖为什么没被收进工作区。

命令本身的参数见 [`hugo mod npm pack`](/commands/hugo-mod-npm-pack/)；npm 工作区的用法见 [npm 官方文档](https://docs.npmjs.com/cli/using-npm/workspaces)。

## 为什么需要合并

需要 Node 包（例如为了 Tailwind CSS）的模块，可以在模块根目录用一份标准的 `package.json` 声明这些依赖。Hugo 会把所有模块的依赖汇总到一个 npm 工作区（npm workspace）中，因此项目层面只需要执行一次 `npm install`。

## 声明依赖

每个模块都在自己根目录的 `package.json` 中，用标准的 `dependencies` 与 `devDependencies` 字段声明它所需的 Node 依赖。例如模块可以这样声明：

```json
{
  "devDependencies": {
    "tailwindcss": "4.1"
  }
}
```

Hugo 在较新版本中大幅改进了这套机制，但为了尽量保持向后兼容，旧的 `package.hugo.json` 仍保留在搜索路径中。在某些场景下，单独为 Hugo 保留一组 Node 依赖也可能有用。

声明时需要注意几点：

- 依赖写在模块根目录的 `package.json` 中，而不是项目根目录；项目自身的 `package.json` 只放项目直接使用的依赖。
- 需要区分运行时依赖与构建期依赖：只在构建时用到的工具（例如 CSS 框架的命令行工具）放在 `devDependencies` 中即可。
- 模块也可以顺带提供 `scripts`，供项目在执行 `npm run` 时调用；由于所有模块的依赖最终汇入同一个工作区，脚本中引用的包都能被解析到。

## 合并依赖

运行 `hugo mod npm pack` 会收集所有模块的 Node 依赖，并写入 `packages/hugoautogen/package.json`。Hugo 还会在项目根目录的 `package.json` 中加一个 `workspaces` 条目，指向这个自动生成的包。

生成后的项目结构：

```tree
project/
├── package.json                      # 项目自身的 package.json（已加上 workspaces 条目）
├── packages/
│   └── hugoautogen/
│       ├── package.json              # 自动生成，包含汇总后的模块依赖
│       └── hugo_packagemeta.json     # 元数据与校验和，用于判断是否过期
└── ...
```

> **注意**：在较早的 Hugo 版本中，依赖会被直接写进项目自身的 `package.json`。如果你曾用旧版本对项目执行过 `hugo mod npm pack`，现在正适合清理一下项目的 `package.json`：那里只应保留项目直接的 Node 依赖，所有来自被导入模块的依赖都会写入 `packages/hugoautogen/package.json`。

合并时，**从项目开始，最靠上的版本优先**。如果某个模块声明了 `tailwindcss@4.1`，而项目本身已有 `tailwindcss@4.0`，则以项目中的版本为准，模块的那条依赖会被排除在生成的工作区包之外。

## 动手跑一遍：把模块依赖汇总进工作区

用一个「项目 + 一个主题组件」的最小例子走一遍。汇总这一步不需要联网，只有最后 `npm install` 才需要。

```tree
my-site/
├── hugo.toml
├── package.json                  # 项目直接使用的依赖
└── themes/
    └── my-theme/
        ├── hugo.toml             # 让这个目录成为被 Hugo 认得的模块
        └── package.json          # 模块自己的 Node 依赖
```

`themes/my-theme/package.json`：

```json
{
  "devDependencies": {
    "tailwindcss": "4.1"
  }
}
```

`my-site/package.json` 里**故意**放一个同名但更早的版本，用来看清「谁赢」：

```json
{
  "devDependencies": {
    "tailwindcss": "4.0"
  }
}
```

执行汇总：

```bash
hugo mod npm pack
```

**你应当看到什么**（实测：v0.167.0，Windows amd64，单语言站点；无需 Go、无需联网）：

| 检查项 | 期望结果 |
| --- | --- |
| 命令退出码 | `0` |
| 项目根目录的 `package.json` | 自动加上 `"workspaces": ["packages/hugoautogen"]`；原先没有 `package.json` 时，Hugo 会新建一份只含这一项的文件 |
| `packages/hugoautogen/package.json` | 生成，`name` 为 `hugoautogen`、`private` 为 `true`；这一轮 `devDependencies` 是**空的** |
| `packages/hugoautogen/hugo_packagemeta.json` | 生成，记录 `sum` 与各依赖的来源，Hugo 用它判断自动生成的包是否过期 |

为什么这一轮是空的？因为**从项目开始、最靠上的版本优先**：项目已经有 `tailwindcss@4.0`，模块声明的 `4.1` 就被排除在自动生成的包之外，项目的 `4.0` 原地留在项目自己的 `package.json` 里。把项目那份 `tailwindcss` 删掉后再跑一次 `hugo mod npm pack`，`packages/hugoautogen/package.json` 的 `devDependencies` 里才会出现 `"tailwindcss": "4.1"`（实测）。

最后在项目根目录安装一次即可：

```bash
npm install
```

> [!TIP]
> 国内网络下 `npm install` 可能很慢或超时，可以临时指定镜像源：`npm install --registry=https://registry.npmmirror.com`。这样只影响这一次安装，不会改动全局 npm 配置。

## 过期检测

当 Hugo 发现正在使用的模块中有一个或多个的 npm 依赖配置发生了变化，会在控制台给出警告：

```text
WARN  npm dependencies are out of sync, please run "hugo mod npm pack" (you may also want to run "npm install" after that)
```

这可以避免在更新模块版本之后忘记重新运行 `hugo mod npm pack`。

**你应当看到什么**（实测：v0.167.0）：改掉 `themes/my-theme/package.json` 里的版本号后直接构建，日志里会出现上面这条 `WARN`；但它**只是一条警告，退出码仍然是 0**，页面照常渲染——不要指望构建失败来提醒你。重新执行一次 `hugo mod npm pack` 再构建，警告就消失了。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 构建日志出现 `npm dependencies are out of sync`，退出码却是 0 | 模块的 Node 依赖变了，`packages/hugoautogen/` 还是旧的 | 执行 `hugo mod npm pack`；若版本也变了，接着在项目根目录跑一次 `npm install` |
| 装完依赖，构建时还是找不到包 | 只在模块目录里装了，或没有在工作区根目录装 | 在**项目根目录**执行 `npm install`；确认项目 `package.json` 里有 `workspaces` 条目 |
| 模块声明的依赖没进 `packages/hugoautogen/package.json` | 项目自己也声明了同一个包，项目那条优先，模块那条被排除 | 属预期行为；想让模块的版本生效，先改或删项目里的那条声明，再重新 `hugo mod npm pack` |
| 模块的依赖一条都没被收集 | 模块根目录既没有 Hugo 配置文件（如 `hugo.toml`）也没有 `package.hugo.json`，而 `usePackageJSON` 处于默认的 `auto` | 在模块根目录放一份 Hugo 配置文件，或显式设置 `usePackageJSON`，见[模块配置的导入](/configuration/module/#导入) |
| 项目 `package.json` 里混着一堆来自模块的依赖 | Hugo 低于 v0.159.0 时会把依赖直接写进项目 `package.json` | 清理项目 `package.json`，只留项目直接使用的依赖；模块依赖交给 `packages/hugoautogen/` |
| `node`／`npm` 命令找不到 | 没装 Node.js，或装了但不在 `PATH` | 安装 Node.js（LTS）后**重开终端**，用 `node -v`、`npm -v` 确认 |
| 报错看不懂 | `npm install` 的报错来自 Node 工具链，与 Hugo 无关 | 先分清是 Hugo 构建失败还是 npm 安装失败，再按[故障排查](/troubleshooting/)分诊 |

## 相关页面

- [`hugo mod npm pack`](/commands/hugo-mod-npm-pack/)：合并各模块的 Node.js 依赖。
- [`hugo mod`](/commands/hugo-mod/)：模块相关子命令的父命令。
- [`hugo mod tidy`](/commands/hugo-mod-tidy/)：清理依赖文件中不再使用的条目。
- [配置 Hugo](/configuration/)：项目配置与资源管道的设置。

关于 npm 工作区本身的用法，见 [npm 官方文档](https://docs.npmjs.com/cli/using-npm/workspaces)；关于需要 Node 包的前端构建流程，见 [Hugo Pipes](/hugo-pipes/)。
