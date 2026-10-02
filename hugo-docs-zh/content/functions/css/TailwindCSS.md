+++
title = "css.TailwindCSS"
linkTitle = "TailwindCSS"
description = "返回用 Tailwind CSS CLI 处理给定资源后生成的资源。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/css/tailwindcss/"

[params.functions_and_methods]
signatures = ["css.TailwindCSS [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
+++

用 `css.TailwindCSS` 函数处理 Tailwind CSS 文件。这个函数借助 Tailwind CSS CLI 完成以下工作：

1. 扫描模板中使用的 Tailwind CSS 工具类。
1. 把这些工具类编译为标准 CSS。
1. 生成优化后的 CSS 输出文件。

> [!NOTE]
> 这个函数要配合 Tailwind CSS v4.0 及更高版本使用；它们需要相对[现代的浏览器][modern browser]才能正确渲染。

## 这一页解决什么问题

Tailwind CSS v4 的工作方式是「模板里写工具类，CLI 扫描模板、只把用到的类编译成 CSS」。`css.TailwindCSS` 把这条 CLI 集成进 Hugo 的构建管道：调用你安装的 Tailwind CLI 处理入口 CSS，返回生成的资源。因为它要**扫描模板里实际出现的类名**，所以比 [`css.Build`](/functions/css/build/) / [`css.Sass`](/functions/css/sass/) 多两项准备：开启 `build.buildStats`，并把生成的 `hugo_stats.json` 挂载给 Tailwind。

## 什么时候用，什么时候别用

**该用**：

- 项目用 Tailwind CSS **v4.0 及以上**（上游限定；本站实测 v4.3.3）；
- 需要精确控制扫描范围（`.gitignore`、`@source` 指令）。

**别用**：

- 用 Tailwind v3 或依赖旧 `tailwind.config.js` 的流程 → 上游只支持 v4+，本站未实测 v3；
- 处理的是普通 CSS → 用 [`css.Build`](/functions/css/build/)；
- 不想引入 npm 工具链 → 用 [`css.Build`](/functions/css/build/) 或 [`css.Sass`](/functions/css/sass/)。

> [!NOTE]
> **实测**：这个函数要求把 `tailwindcss` 加入 `security.exec.allow`（默认白名单里没有它），否则构建报 `access denied: "tailwindcss" is not whitelisted in policy "security.exec.allow"`。下面的「准备」第 2 步已经包含该配置。另外，自 v0.161.0 起不再支持 Tailwind 独立二进制，必须通过 npm 安装 CLI。

## 准备

第 1 步
: 安装 Tailwind CSS v4.0 或更高版本：

  ```sh {copy=true}
  npm install --save-dev tailwindcss @tailwindcss/cli @tailwindcss/typography
  ```

  <!-- TODO
  Remove the admonition below somewhere after v0.176.0, 15 minor releases
  after deprecation.
  -->

  > [!NOTE]
  > 自 v0.161.0 起，Hugo 不再支持 Tailwind 的[独立二进制文件][standalone binary]。现在必须像上面那样通过 `npm` 安装 Tailwind CSS CLI。

第 2 步
: 在项目配置中加入：

  ```toml
  [build]
    [build.buildStats]
      enable = true
    [[build.cachebusters]]
      source = 'assets/notwatching/hugo_stats\.json'
      target = 'css'
    [[build.cachebusters]]
      source = '(postcss|tailwind)\.config\.js'
      target = 'css'
  [module]
    [[module.mounts]]
      source = 'assets'
      target = 'assets'
    [[module.mounts]]
      disableWatch = true
      source = 'hugo_stats.json'
      target = 'assets/notwatching/hugo_stats.json'
  [security.exec]
    allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^tailwindcss$']
  ```

第 3 步
: 创建一个 CSS 入口文件：

  ```css {file="assets/css/main.css" copy=true}
  @import "tailwindcss";
  @plugin "@tailwindcss/typography";
  @source "hugo_stats.json";
  ```

  Tailwind CSS 会遵循 `.gitignore` 文件。也就是说，如果 `hugo_stats.json` 出现在 `.gitignore` 中，Tailwind CSS 会忽略它。要让 Tailwind CSS 能用到 `hugo_stats.json`，就必须像上例那样显式地把它声明为来源。

第 4 步
: 创建一个 _partial_ 模板，用 Tailwind CSS CLI 处理 CSS：

  ```go-html-template {file="layouts/_partials/css.html" copy=true}
  {{ with resources.Get "css/main.css" }}
    {{ $opts := dict "minify" (not hugo.IsDevelopment) }}
    {{ with . | css.TailwindCSS $opts }}
      {{ if hugo.IsDevelopment }}
        <link rel="stylesheet" href="{{ .RelPermalink }}">
      {{ else }}
        {{ with . | fingerprint }}
          <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
        {{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
  ```

第 5 步
: 从 _base_ 模板调用这个 _partial_ 模板，并把模板执行推迟到所有站点与输出格式都渲染完成之后：

  ```go-html-template {file="layouts/baseof.html" copy=true}
  <head>
    {{ with (templates.Defer (dict "key" "global")) }}
      {{ partial "css.html" . }}
    {{ end }}
  </head>
  ```

## 选项

`css.TailwindCSS` 函数接受一个选项映射。

`disableInlineImports`
: **（0.147.4 新增）**
: (`bool`) 是否禁用 `@import` 语句的内联。内联是递归进行的，但目前每个文件只内联一次，无法在不同作用域（根、媒体查询等）中导入同一个文件。注意这个导入例程并不关心 CSS 规范，因此 `@import` 语句可以出现在文件中任意位置。默认是 `false`。

`importContext`
: **（0.165.0 新增）**
: (`resource.ResourceGetter`) 解析 `@import` 语句时使用的[资源获取器](g)。Hugo 先按语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。当 [`disableInlineImports`](#disableinlineimports) 为 `true` 时该选项无效。

`minify`
: (`bool`) 是否优化并压缩输出。默认是 `false`。

`optimize`
: (`bool`) 是否在不压缩的前提下优化输出。默认是 `false`。

`skipInlineImportsNotFound`
: (`bool`) 是否存在无法解析的导入语句时仍允许构建继续，并保留原有的导入声明。需要特别注意的是，内联导入器不处理基于 URL 的导入或带媒体查询的导入，因此即使禁用了这个选项，它们也会原样保留。默认是 `false`。

## 注入 CSS 变量

[`css.Build`][] 函数有一个 [`vars`][] 选项，可用于把 CSS 变量注入样式表。当需要根据站点配置或其他数据动态设置值时，这特别有用。要在 Tailwind CSS 中做到这一点，可以在把结果交给 `css.TailwindCSS` 之前，先用 `css.Build` 做一步预处理。写法如下：

```go-html-template
{{ with resources.Get "css/styles.css" }}
  {{ $cssOpts := dict
    "vars" (dict "favourite-color" "#7f93c9")
    "externals" (slice "tailwindcss")
  }}
  {{ $tailwindOpts := dict "disableInlineImports" true }}
  {{ with . | css.Build $cssOpts | css.TailwindCSS $tailwindOpts }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

关于上例的几点说明：

- 在 `css.Build` 的选项里把 `tailwindcss` 标为外部依赖，可以避免它在这一步被处理，从而留到下一步由 Tailwind CSS CLI 正确处理。
- Tailwind CSS 这一步把 `disableInlineImports` 设为 `true`，因为导入已由 `css.Build` 处理。

## 完整示例：从模板扫描出用到的工具类

按上面「准备」的步骤装好 Tailwind CSS v4 CLI、写好项目配置，再准备入口文件与模板：

```css {file="assets/css/main.css"}
@import "tailwindcss";
@source "hugo_stats.json";
```

```go-html-template {file="layouts/index.html"}
<div class="text-red-500 font-bold">x</div>
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict "minify" (not hugo.IsDevelopment) }}
  {{ with . | css.TailwindCSS $opts }}{{ .RelPermalink }}{{ end }}
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows，Tailwind CSS v4.3.3，删除 `public/` 与 `hugo_stats.json` 后单次构建）实测：

- 生产环境（`minify` 为 `true`）：退出码 0，`.RelPermalink` 为 `/css/main.css`，产物 4625 字节，其中 `@layer utilities` 一节为：

```css
@layer utilities{.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.text-red-500{color:var(--color-red-500)}}
```

- 开发环境（`hugo --environment development`，`minify` 为 `false`）：产物 5183 字节，同一节展开为：

```css
@layer utilities {
  .font-bold {
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
  }
  .text-red-500 {
    color: var(--color-red-500);
  }
}
```

**你应当看到什么**：模板里**只出现了一次**的 `text-red-500` 和 `font-bold` 都出现在产物的 `utilities` 层里——这就是「扫描模板、按需生成」的效果。文件头是 `/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */`，版本号随你安装的 CLI 变化（实测）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；Tailwind CSS v4.3.3 通过 npm 装在项目根；项目配置按上文「准备」第 2 步（含 `build.buildStats`、`hugo_stats.json` 挂载与 `security.exec.allow`）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正常处理 | 资源；`.RelPermalink` 为 `/css/main.css`；`minify` 为真时单行压缩，为假时逐行展开 | 否 |
| 未安装 Tailwind CLI | —— | 是：`TAILWINDCSS: failed to transform …`（Hugo 找不到 `tailwindcss` 可执行文件） |
| 未把 `tailwindcss` 加入 `security.exec.allow` | —— | 是：`access denied: "tailwindcss" is not whitelisted in policy "security.exec.allow"` |
| 模板里的类没有进产物 | 说明 `@source "hugo_stats.json"` 缺失，或 `hugo_stats.json` 被 `.gitignore` 忽略 | 否（不报错，只是少样式） |
| `minify` 与 `optimize` | 上游说明二者可分别开启；本站只实测了 `minify` 的两种取值 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `access denied: "tailwindcss" is not whitelisted in policy "security.exec.allow"` | 默认白名单不含 `tailwindcss`（**实测**） | 在项目配置加 `[security.exec] allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^tailwindcss$']` |
| 报错看不懂 | 提示找不到 `tailwindcss` | CLI 没装，或没装在项目根 | `npm install --save-dev tailwindcss @tailwindcss/cli` |
| 没报错但结果不对 | 产物里只有基础样式，没有你在模板里写的类 | 没开启 `build.buildStats`、没挂载 `hugo_stats.json`，或入口文件少了 `@source "hugo_stats.json";` | 按「准备」第 2、3 步补齐配置 |
| 没报错但结果不对 | 类名明明用了却没生成 | `hugo_stats.json` 被 `.gitignore` 忽略，Tailwind 不会读它 | 在入口文件显式 `@source "hugo_stats.json";` |
| 没报错但结果不对 | 产物不完整、少了一部分类 | 模板在渲染后才产出类名，扫描时还没出现 | 上游做法是用 `templates.Defer` 把处理推迟到所有站点渲染完成之后（见「准备」第 5 步） |

更多排查入口见[故障排查](/troubleshooting/)。

[modern browser]: https://tailwindcss.com/docs/compatibility#browser-support
[standalone binary]: https://github.com/tailwindlabs/tailwindcss/releases/latest
[`css.Build`]: /functions/css/build/
[`vars`]: /functions/css/build/#vars
