+++
title = "PostCSS"
linkTitle = "PostCSS"
description = "用 css.PostCSS 配合 PostCSS 插件处理 CSS 资源。含 Node.js 依赖安装、配置文件查找规则、环境变量与常见报错。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/hugo-pipes/postcss/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "本机已安装 Node.js 与 npm（`node --version`、`npm --version` 都有输出）",
  "项目根目录已存在，且你会在这个目录下执行 npm 命令",
  "读过[简介](/hugo-pipes/introduction/)，理解「取资源 → 进管道 → 发布」这条链路",
]
outcomes = [
  "在项目里装好 `postcss-cli` 与插件，并写出能被 Hugo 找到的 `postcss.config.mjs`",
  "用 `css.PostCSS` 跑通自动加厂商前缀，并分别验证开发与生产环境的不同输出",
  "在构建失败时，按 Node 环境、依赖安装、配置文件、插件本身这个顺序定位原因",
]
next = ["/hugo-pipes/js/", "/hugo-pipes/minification/", "/functions/css/postcss/"]

+++

## 这一页解决什么问题

很多 CSS 需求不是「编译」而是「后处理」：给属性补上厂商前缀、把 `@import` 内联进来、按目标浏览器降级新语法。这类工作由 PostCSS 的插件完成，插件生态按需组合。

Hugo 自己不实现 PostCSS，而是**在你项目根目录里运行 `postcss` 这个命令**，把 CSS 交给它处理。因此这一节真正的依赖是 Node.js 与项目内安装的依赖，而不是 Hugo 版本。

## 适用前提

用 `css.PostCSS` 函数配合 PostCSS 及其任意插件来转换 CSS。PostCSS 运行在 Node.js 之上，因此本机需要安装 Node.js；此外，处理过程会在项目根目录执行 `postcss` 命令，该命令必须已经在项目里安装好。

**为什么强调「在项目里安装好」**：Hugo 是在**项目里**执行 `postcss` 的，依赖必须随项目一起安装与记录。只做 `npm install -g postcss` 而不写进项目的 `package.json`，换台机器或换 CI 环境就会失败——所以下面的安装命令都带 `--save-dev`，把依赖固定在项目里。

## 安装依赖

在项目根目录安装所需的 Node 包。例如安装 PostCSS 本身、它的命令行接口，以及自动为 CSS 添加厂商前缀的插件：

```bash
npm install --save-dev postcss postcss-cli autoprefixer
```

这些依赖写在项目根目录的 `package.json` 中，构建前需要先安装它们。

**几点实际影响**

- `node_modules/` 通常**不进版本库**（体积大、平台相关）。克隆项目或 CI 构建的第一步永远是 `npm install`（或 `npm ci`）；
- Windows / macOS / Linux 的命令一致，区别只在 `npm` 是否已经在 `PATH` 里；
- 国内网络下若 `npm install` 卡住，可换镜像源：`npm config set registry https://registry.npmmirror.com`。

### 你应当看到什么

执行上面的 `npm install` 之后：

- 终端最后几行出现 `added N packages`，且**没有** `npm ERR!`；
- 项目根目录多了 `node_modules/`、`package.json`、`package-lock.json`（若原本没有 `package.json`，先执行 `npm init -y` 生成）；
- `node_modules/.bin/` 下能看到 `postcss`（Windows 上是 `postcss.cmd`）——Hugo 要执行的就是它。

## 配置文件

在项目根目录创建 PostCSS 配置文件。若配置文件不放在项目根目录，而放在自定义子目录里，可用 `config` 选项指定该目录的路径。

Hugo 会向 PostCSS 进程暴露若干环境变量，其中包括当前的 Hugo 环境名，因此配置文件可以据此区分开发与生产：

```js
import autoprefixer from 'autoprefixer';

const isDev = process.env.HUGO_ENVIRONMENT === 'development';

export default {
  plugins: [
    !isDev ? autoprefixer : null
  ],
  map: isDev ? { inline: true } : false
};
```

上例中，运行 `hugo server` 时不加厂商前缀，但启用内联 source map；生产构建时则添加前缀并关闭 source map。

> [!NOTE]
> 使用 ESM 写法（`import` / `export default`）时，配置文件要用 `.mjs` 扩展名，或让 `package.json` 里的 `"type"` 为 `"module"`。写成 `postcss.config.js` 却用了 `import`，Node.js 会直接抛语法错误——这是本项目最常见的一类「装好了却跑不起来」。

## 取得资源与管道

把 CSS 文件放进 `assets/css` 目录，然后取出资源并送入管道：

```go-html-template
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict "inlineImports" true }}
  {{ with . | css.PostCSS $opts }}
    {{ with . | minify | fingerprint }}
      <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
    {{ end }}
  {{ end }}
{{ end }}
```

**为什么外层要套两层 `with`**：第一层接住 `resources.Get`（找不到时返回 `nil`），第二层接住 `css.PostCSS` 的结果。任一层为空，整段安静跳过而不是构建崩溃。

## 配置选项

使用配置文件时，可用下列选项：

- `config`：存放 PostCSS 配置文件的目录路径。默认情况下，Hugo 会在项目根目录以及各个模块中按 `postcss.config.js`、`postcss.config.mjs`、`postcss.config.cjs` 的顺序查找；只有当配置文件位于自定义子目录时才需要使用该选项。
- `inlineImports`：是否内联 `@import` 语句，默认 `false`。内联是递归的，但同一个文件只导入一次；Hugo 按模块挂载解析相对导入，并尊重主题覆盖。注意 Hugo 内部的导入例程并不严格遵循 CSS 规范，`@import` 可以写在文件任意位置，但外部 URL 导入与带媒体查询的导入会在内联时被忽略。
- `skipInlineImportsNotFound`：是否在存在无法解析的导入语句时仍然继续构建，并保留原有导入声明，默认 `false`。

不借助配置文件、直接在选项映射中配置 PostCSS 时，可用 `noMap`（是否关闭默认的内联 source map，默认 `false`）、`parser`、`stringifier`、`syntax`，以及 `use`（以空格分隔的插件列表）：

```go-html-template
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict "noMap" true "use" "autoprefixer postcss-color-alpha" }}
  {{ with . | css.PostCSS $opts }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

**什么时候用 `use` 而不是配置文件**：插件少、参数简单时，`use` 更省事；一旦要按环境切换插件、或插件需要自己的配置文件（如 `browserslist`、`tailwind.config.js`），就用配置文件。两者同时存在时行为容易让人困惑，选一种并保持一致。

## 环境变量

Hugo 会向 PostCSS 进程传入下列环境变量：`PWD` 是项目工作目录的绝对路径；`HUGO_ENVIRONMENT` 是当前 Hugo 环境，由 `--environment` 命令行标志设置，`hugo build` 默认是 `production`，`hugo server` 默认是 `development`；`HUGO_PUBLISHDIR` 是发布目录的绝对路径，通常是 `public`，即便使用 `--renderToMemory` 渲染到内存，该值仍指向磁盘上的目录。

此外，Hugo 会把项目根目录下的 `babel.config.js`、`postcss.config.js`、`tailwind.config.js` 等配置文件（含 `.mjs` 与 `.cjs` 变体）自动挂载到 `assets/_jsconfig`，并为每个文件生成一个以 `HUGO_FILE_` 开头、把文件名转为大写并把点替换为下划线的环境变量。在 JavaScript 中即可这样引用：

```js
let tailwindConfig = process.env.HUGO_FILE_TAILWIND_CONFIG_JS || './tailwind.config.js';
```

**这解决什么问题**：插件常常需要「读到同一份配置文件」。把路径通过环境变量传给插件，就不必在多个地方硬编码路径，也不必假设当前工作目录。

## 完整可运行示例

这个示例用 `user-select` 演示自动加厂商前缀：这个属性在 Safari 上仍需要 `-webkit-` 前缀，因此**有没有前缀一眼就能看出来**。

**① 建项目并进入目录**：

```bash
hugo new project postcss-demo
cd postcss-demo
npm init -y
npm install --save-dev postcss postcss-cli autoprefixer
```

**② 新建 `postcss.config.mjs`**（与上面「配置文件」一节的示例相同）：

```js {file="postcss.config.mjs"}
import autoprefixer from 'autoprefixer';

const isDev = process.env.HUGO_ENVIRONMENT === 'development';

export default {
  plugins: [
    !isDev ? autoprefixer : null
  ],
  map: isDev ? { inline: true } : false
};
```

**③ 新建样式表** `assets/css/main.css`：

```css
.card {
  user-select: none;
  display: flex;
  gap: 1rem;
}
```

**④ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ with resources.Get "css/main.css" }}
  {{ with . | css.PostCSS }}
    {{ with . | minify | fingerprint }}
      <!doctype html>
      <html lang="zh-cn">
        <head>
          <meta charset="utf-8">
          <title>PostCSS 演示</title>
          <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
        </head>
        <body>
          <div class="card">样式由 PostCSS 处理</div>
        </body>
      </html>
    {{ end }}
  {{ end }}
{{ end }}
```

**⑤ 先看开发环境**：

```bash
hugo server
```

**⑥ 再看生产环境**（`Ctrl + C` 停掉服务器后执行）：

```bash
hugo
```

### 你应当看到什么

| 检查点 | 开发环境（`hugo server`） | 生产环境（`hugo`） |
| --- | --- | --- |
| 页面样式 | `.card` 是弹性布局、有间距 | 同左 |
| `public/css/main.<哈希>.css` | 预览是内存渲染，看磁盘请执行一次 `hugo --renderToMemory=false` 或直接看 `hugo server` 输出 | 文件存在 |
| 厂商前缀 `-webkit-user-select` | **不出现**（配置里 `isDev` 时禁用了 autoprefixer） | **出现** |
| source map | 文件末尾有内联的 `sourceMappingURL` 注释 | 没有 |

第三行是本节最有价值的断言：**同一个源文件、同一条管道，因为 `HUGO_ENVIRONMENT` 不同而得到不同产物**。如果两边的产物一模一样，说明配置文件没被 Hugo 找到，或 `import autoprefixer` 本身就抛错了。

## 什么时候用 / 什么时候别用

**该用的时候**

- 需要插件生态：`autoprefixer`、`postcss-preset-env`、`cssnano`、`postcss-import` 等；
- 需要按环境切换处理方式（开发不压缩、生产压缩并加前缀）；
- 已经有一套 PostCSS 配置，希望直接搬进 Hugo，而不是重写。

**别用的时候**

- 只需要压缩和加指纹：`resources.Minify` + `resources.Fingerprint` 就够，不必引入 Node.js 这层依赖；
- 只用 Sass 的变量与嵌套：走 [css.Sass](/hugo-pipes/transpile-sass-to-css/)；
- **用 Tailwind CSS v4 及以上**：请用专门的 [css.TailwindCSS](/functions/css/tailwindcss/) 函数（自 v0.161.0 起 Hugo 不再支持 Tailwind 的独立二进制，必须通过 npm 安装 `@tailwindcss/cli`）；
- 项目根本不想装 Node.js：那就接受「不做后处理」，用 `resources.Minify` 与 `resources.Fingerprint` 覆盖大部分收益。**这一层依赖是本节所有「命令找不到」类问题的根源**。

## 常见坑

**① 命令找不到（命令类）**

| 报错/现象 | 原因 | 处理 |
| --- | --- | --- |
| `hugo: command not found` | Hugo 没装或没进 `PATH` | [安装 Hugo](/installation/) |
| 构建报 `executable file not found` 且提到 `postcss` | 项目里没装 `postcss-cli`，或不在项目根目录执行 | 在**项目根目录**执行 `npm install --save-dev postcss postcss-cli` |
| `node: command not found` | Node.js 没装或没进 `PATH` | 安装 Node.js 后重开终端 |
| 本机明明装过，换 CI 就报同样错 | `node_modules` 没提交，CI 也没跑 `npm install` | 在构建流程里加 `npm ci` 或 `npm install` |

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| 生产构建里没有厂商前缀 | 配置文件没被找到，或插件列表写错 | 确认文件名为 `postcss.config.js` / `.mjs` / `.cjs` 之一，且位于**项目根目录** |
| `@import` 没有内联，页面样式不全 | 没有开启 `inlineImports`（默认 `false`） | 传 `{{ $opts := dict "inlineImports" true }}` |
| 开发与生产产物完全一样 | 配置文件里的 `process.env.HUGO_ENVIRONMENT` 判断没生效（例如写成了 `NODE_ENV`） | 在配置文件里临时 `console.log(process.env.HUGO_ENVIRONMENT)`，看终端输出 |
| 改了源文件，样式没变 | 管道链缓存未失效 | `hugo --ignoreCache` 重建 |

**③ 报错看不懂（报错类）**

- 报错里出现 `SyntaxError: Cannot use import statement outside a module`：用 `.mjs` 扩展名，或在 `package.json` 里设 `"type": "module"`；
- 报错里出现 `PostCSS plugin ... requires PostCSS 8` 一类字样：插件的版本与 `postcss` 大版本不匹配，统一升级插件；
- 报错以 `exit status 1` 结尾，且中间夹着一段插件自己的输出：**真正的原因在那段输出里**。要单独复现，在项目根目录手动执行一次 `npx postcss assets/css/main.css` ——它会把插件的原始报错直接打到终端；
- 报错指向的文件与你改的无关：渲染期问题（短代码、编码、配置）也会这样冒出来，见[故障排查](/troubleshooting/)。

排查顺序：**Node 在不在 `PATH` → 依赖装没装 → 配置文件找没找到 → 插件本身报什么**。

## 相关页面

- [css.PostCSS](/functions/css/postcss/)（完整的准备步骤与选项参考）
- [css.TailwindCSS](/functions/css/tailwindcss/)
- [把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)
- [资源压缩](/hugo-pipes/minification/) / [资源指纹](/hugo-pipes/fingerprint/)
- [故障排查](/troubleshooting/)
