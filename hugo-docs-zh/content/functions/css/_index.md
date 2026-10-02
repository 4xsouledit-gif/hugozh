+++
title = "CSS 函数"
linkTitle = "css"
description = "用这些函数处理 CSS 与 Sass 文件。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/css/"
+++

## 本章导读

`css` 命名空间下有四条不同的 CSS 处理管道，容易选错。它们都接收 `assets/` 目录里的资源、返回一个资源（`resource.Resource`），区别在于**背后用的工具**和**适合的输入**：

- [`css.Build`](/functions/css/build/)：内嵌 esbuild，处理**纯 CSS**——递归内联 `@import`、按目标浏览器转换语法与补前缀、压缩、生成 source map；
- [`css.Sass`](/functions/css/sass/)：把 **Sass/SCSS** 编译成 CSS（extended 版内置 LibSass；安装 Dart Sass 后可用最新语法）；
- [`css.PostCSS`](/functions/css/postcss/)：交给项目里安装的 **PostCSS CLI 与插件**，需要 Node 工具链；
- [`css.TailwindCSS`](/functions/css/tailwindcss/)：调用 **Tailwind CSS v4 CLI**，扫描模板里用到的工具类再生成 CSS。

另外两个小函数是「值的类型标记」，只用于 `vars` 选项：[`css.Quoted`](/functions/css/quoted/) 让值注入时带引号，[`css.Unquoted`](/functions/css/unquoted/) 让值不带引号；[`css.ChromaStyles`](/functions/css/chromastyles/) 则生成语法高亮器需要的样式表。

## 读完本章你应该能够

- 按输入与工具链选对管道：纯 CSS 用 `css.Build`、Sass 用 `css.Sass`、插件生态用 `css.PostCSS`、Tailwind v4 用 `css.TailwindCSS`；
- 把处理结果接进 `<link>`，并在生产环境配合 `fingerprint`、`minify`；
- 用 `vars` 把站点配置注入样式表，并用 `css.Quoted` / `css.Unquoted` 控制引号；
- 判断一条报错是「工具没装」「安全白名单没放行」还是「输入类型不对」。

## 建议阅读顺序

1. 纯 CSS 管道：[`css.Build`](/functions/css/build/)；
2. Sass：[`css.Sass`](/functions/css/sass/) → 值标记 [`css.Quoted`](/functions/css/quoted/) / [`css.Unquoted`](/functions/css/unquoted/)；
3. 语法高亮样式表：[`css.ChromaStyles`](/functions/css/chromastyles/)；
4. 需要 Node 生态时：[`css.PostCSS`](/functions/css/postcss/) → [`css.TailwindCSS`](/functions/css/tailwindcss/)。
