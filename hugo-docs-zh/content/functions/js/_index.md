+++
title = "JavaScript 函数"
linkTitle = "js"
description = "用这些函数处理 JavaScript 与 TypeScript 文件。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/functions/js/"
+++

## 本章导读

`js` 命名空间下有三个函数，都接收 `assets/` 目录里的资源、返回一个资源（`resource.Resource`），区别在**用哪条工具链、解决什么问题**：

- [`js.Build`](/functions/js/build/)：内嵌 esbuild，**打包 + 转译（TS/JSX）+ 摇树 + 压缩**，支持 `@params` 注入模板数据。绝大多数场景用它。
- [`js.Babel`](/functions/js/babel/)：调用项目里安装的 **Babel CLI**，按 `babel.config` 的 preset/插件转译语法；需要 Node.js，且要把 `babel` 加入 `security.exec.allow`。
- [`js.Batch`](/functions/js/batch/)：注册「组 / 脚本 / 实例 / runner」后统一构建，支持**全局代码分割**，适合「同一组件多次出现、参数不同」的场景。

三者都不做内容的网络请求，产物最终都要由你在模板里输出 `<script src="{{ .RelPermalink }}">`。

## 读完本章你应该能够

- 按需求选对函数：单入口打包用 `js.Build`，Babel preset 链用 `js.Babel`，多实例 + 代码分割用 `js.Batch`；
- 用 `targetPath`、`minify`、`sourceMap`、`params`、`externals`、`defines` 等选项把产物调成需要的样子；
- 在生产环境配合 `fingerprint` 输出 SRI 与带指纹的文件名；
- 分辨三类报错：`type … not supported in Resource transformations`（输入不是资源）、`Could not resolve …`（导入路径错）、`access denied … not whitelisted`（外部可执行文件没进安全白名单）。

## 建议阅读顺序

1. 先读 [`js.Build`](/functions/js/build/)——理解「资源进、资源出」这个统一模型，以及 `@params` 注入；
2. 需要 Babel 时读 [`js.Babel`](/functions/js/babel/)——注意它需要 Node 与 `security.exec.allow`；
3. 有多实例/代码分割需求时读 [`js.Batch`](/functions/js/batch/)——从 Group → Script → Instance → Runner 的顺序理解它的 API。
