+++
title = "Node.js 依赖"
linkTitle = "Node.js 依赖"
description = "在模块中声明 Node.js 依赖，并合并到统一的 npm 工作区，避免重复安装。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/hugo-modules/nodejs-dependencies/"
+++

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

## 过期检测

当 Hugo 发现正在使用的模块中有一个或多个的 npm 依赖配置发生了变化，会在控制台给出警告：

```text
WARN  npm dependencies are out of sync, please run "hugo mod npm pack" (you may also want to run "npm install" after that)
```

这可以避免在更新模块版本之后忘记重新运行 `hugo mod npm pack`。

## 相关页面

- [`hugo mod npm pack`](/commands/hugo-mod-npm-pack/)：合并各模块的 Node.js 依赖。
- [`hugo mod`](/commands/hugo-mod/)：模块相关子命令的父命令。
- [`hugo mod tidy`](/commands/hugo-mod-tidy/)：清理依赖文件中不再使用的条目。
- [配置 Hugo](/configuration/)：项目配置与资源管道的设置。

关于 npm 工作区本身的用法，见 [npm 官方文档](https://docs.npmjs.com/cli/using-npm/workspaces)；关于需要 Node 包的前端构建流程，见 [Hugo Pipes](/hugo-pipes/)。
