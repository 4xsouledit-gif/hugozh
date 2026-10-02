+++
title = "资源打包"
linkTitle = "资源打包"
description = "用 resources.Concat 把多个同类型资源拼接为一份资源并发布。含顺序控制、完整示例、返回值边界与常见报错。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/hugo-pipes/bundling/"

[params.teach]
difficulty = "参考"
time = "15–20 分钟"
prereq = [
  "读过[简介](/hugo-pipes/introduction/)，知道 `assets/` 里的文件要先 `resources.Get` 取成资源",
  "能写出 `slice`、管道与 `with` 这几个最基本的 Go 模板写法",
]
outcomes = [
  "把多个同类型资源按确定的顺序拼成一份，并说明目标路径同时也是缓存键与发布路径",
  "判断什么时候值得拼接、什么时候反而应该让浏览器分别缓存各文件",
  "在拼接结果缺失或顺序不对时，按「资源是否为 nil → 顺序是否正确 → 缓存是否干扰」排查",
]
next = ["/hugo-pipes/minification/", "/hugo-pipes/fingerprint/", "/functions/resources/concat/"]

+++

## 这一页解决什么问题

把十几份 CSS 或 JS 分别用 `<link>` / `<script>` 引入，意味着十几个请求，也意味着**依赖顺序要靠人肉保证**。`resources.Concat` 把这些文件按你给的顺序拼成一份资源，再交给压缩与指纹环节。

它只做一件事：**文本层面的连接**。不做语法分析、不补分号、不去重，这些都由后续环节或你自己的书写规范负责。

## 方法签名与用途

`resources.Concat` 把一个资源切片拼接为一份资源，并以目标路径作为缓存键。签名如下：

```text
resources.Concat TARGETPATH [RESOURCE...]
```

返回值类型是 `resource.Resource`，因此拼接结果可以继续接入 Hugo Pipes 的其他环节。切片中的每个资源必须具有相同的媒体类型；媒体类型不同的资源不能拼接在一起。

### 返回值与边界

| 情形 | 会怎样 |
| --- | --- |
| 正常拼接 | 返回一个新的 `resource.Resource`，可以继续 `minify` / `fingerprint` |
| 切片里混入不同媒体类型（CSS 与 JS） | 不产生可用的样式表或脚本，浏览器会在解析时报错 |
| 切片里某项是 `nil`（对应的 `resources.Get` 没取到） | 这一步会失败，**不会**被静默跳过；用 `with` 先确认每个资源都存在 |
| 只拼接一份资源 | 结果可用，但没有意义：等于给同一份内容换了个名字 |
| 目标路径为空 | 没有可用的发布路径，不要这样写 |

## 基本用法

先用 `resources.Get` 从 `assets` 目录取回资源，再用 `slice` 组成切片传给 `resources.Concat`：

```go-html-template
{{ $plugins := resources.Get "js/plugins.js" }}
{{ $global := resources.Get "js/global.js" }}
{{ $js := slice $plugins $global | resources.Concat "js/bundle.js" }}
```

拼接后的内容顺序与切片中资源的顺序一致，所以要根据依赖关系安排 `slice` 的参数次序，例如先放第三方库，再放站点自身的脚本。

**为什么顺序是硬要求**：拼接是纯文本连接。若 `plugins.js` 里定义了一个 jQuery 插件、而 `global.js` 一开头就调用它，顺序颠倒就会在浏览器控制台报 `undefined is not a function`——**构建阶段不会有任何提示**。

## 与压缩、指纹组合

拼接结果仍是资源对象，可以接着做压缩与指纹：

```go-html-template
{{ $reset := resources.Get "css/reset.css" }}
{{ $main := resources.Get "css/main.css" }}
{{ $css := slice $reset $main | resources.Concat "css/bundle.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" crossorigin="anonymous">
```

压缩与指纹的含义分别见[资源压缩](/hugo-pipes/minification/)与[资源指纹](/hugo-pipes/fingerprint/)，本节只讨论拼接环节。

## 发布时机

拼接结果不会自动写入 `public` 目录。只有调用它的 `Publish`、`Permalink` 或 `RelPermalink` 方法时，Hugo 才会把资源发布到目标路径。因此模板中至少要引用一次结果，例如把 `RelPermalink` 放进 `link` 或 `script` 标签。若想直接把内容内联进页面，可以改用 `.Content`。

## 完整可运行示例

这个示例把两份 CSS 拼成一份，并验证「顺序确实按你写的来」。

**① 建项目并进入目录**：

```bash
hugo new project concat-demo
cd concat-demo
```

**② 新建第一份样式** `assets/css/reset.css`：

```css
body {
  margin: 0;
}
```

**③ 新建第二份样式** `assets/css/main.css`：

```css
body {
  background-color: #fefefe;
  color: #222;
}
```

**④ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ $reset := resources.Get "css/reset.css" }}
{{ $main := resources.Get "css/main.css" }}
{{ with slice $reset $main | resources.Concat "css/bundle.css" | minify | fingerprint }}
  <!doctype html>
  <html lang="zh-cn">
    <head>
      <meta charset="utf-8">
      <title>Concat 演示</title>
      <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
    </head>
    <body>
      <h1>两份样式已拼成一份</h1>
    </body>
  </html>
{{ end }}
```

**⑤ 构建并查看**：

```bash
hugo
```

### 你应当看到什么

- `public/css/` 下只出现**一个** `bundle.<哈希>.css`，而**没有** `reset.css` 或 `main.css`——拼接结果才是被引用的那个资源；
- 打开该文件，`body{margin:0}` 出现在 `body{background-color:#fefefe;...}` **之前**。顺序与 `slice` 参数一致，这就是顺序控制的验证；
- 页面源代码里 `<link>` 的 `href` 带哈希，且 `integrity` 属性存在；
- 把 `slice` 的两个参数对调后重新 `hugo`，文件内容顺序随之颠倒，**哈希值也随之变化**——哈希变了说明发布出去的确实是一份新文件。

用 `hugo server` 预览时，还可以在开发者工具的 Network 面板确认：整页只加载了一个 CSS 请求。

## 缓存与 --gc

Hugo Pipes 以整条管道链为缓存单位：同一条链在一次站点构建中只执行一次，其余调用直接读取缓存；`resources.Concat` 另外用目标路径作为缓存键。所以同一个目标路径的拼接结果会被复用，适合在多个模板中引用同一份打包资源。

构建时可以用 `hugo build --gc` 在构建完成后清理未使用的缓存文件，减小缓存目录体积。目标目录中的陈旧文件属于另一类问题，需要通过清理发布目录的参数处理，详见[命令](/commands/)与[基本用法](/getting-started/basic-usage/)。

## 什么时候用 / 什么时候别用

**该用的时候**

- 一批文件**必须按固定顺序**加载（第三方库在前、站点代码在后），你希望这个顺序只写一次、写在模板里；
- 文件数量多，希望减少请求数；
- 需要把拼接结果再压缩、加指纹后作为**单文件**交付。

**别用的时候**

- **媒体类型不同**：CSS 与 JS 不能拼在一起，按类型分别打包；
- 文件本来就少（两三份），且它们各自更新频率不同：分开命名反而能让浏览器只重新下载改动过的那一份；
- 只想把内容内联到页面里：`resources.FromString` 或 `.Content` 更直接；
- 希望**自动处理依赖顺序**：`resources.Concat` 不懂模块依赖，那类需求交给 [js.Build](/hugo-pipes/js/)（它按 `import` 图排序打包）。

> [!NOTE]
> 「把文件都拼起来省请求」这条经验来自 HTTP/1.1 时代。HTTP/2 与 HTTP/3 支持多路复用后，小文件的额外开销明显下降；是否拼接，建议以自己的实测数据为准，而不是照搬旧经验。

## 常见坑

**① 命令找不到（命令类）**

- `hugo: command not found`：Hugo 没装或没进 `PATH`，先看[安装 Hugo](/installation/)；
- 命令本身没有外部依赖，因此拼接这一环不会出现「缺某个可执行文件」的报错；**如果报错里有别的工具名，问题多半在管道前后**（例如 `css.Sass` 或 `postcss` 那一段）。

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| `public/` 里没有打包结果 | 结果没被 `.Permalink` / `.RelPermalink` / `.Publish` 引用 | 模板里是否输出了 `<link>` 或 `<script>` |
| 页面样式只生效了一部分 | `slice` 里某个 `resources.Get` 返回了 `nil`，或顺序颠倒 | 分别检查每个路径是否相对 `assets/` |
| 改了一个源文件，整体没变 | 目标路径缓存键未失效，或构建缓存未失效 | 先确认管道输入变了，再 `hugo --ignoreCache` 重建 |
| 拼接处语法错误（如 `}body{`） | 某个源文件末尾缺少换行或分号，纯文本连接后与下一份粘连 | 打开产物看接缝处，给源文件补上换行 |
| 引用了 `bundle.css` 却 404 | 页面里写的是 `RelPermalink` 之前的裸路径，或目标路径写错 | 以页面源代码中的实际 `href` 为准 |

**③ 报错看不懂（报错类）**

- 报错说某个变量「无法取值」（`can't evaluate field`）：说明上游有函数返回了 `nil`，往回找哪个 `resources.Get` 没取到；
- 报错里出现 `expected resource.Resource` 一类类型不符：`slice` 里混进了字符串或 `nil`，确认每一项都是资源对象；
- 样式/脚本在**浏览器控制台**报错、构建却成功：拼接与压缩都不会做语法检查，问题在源文件内容；
- 报错指向的文件与你改的无关：渲染期问题常这样出现，见[故障排查](/troubleshooting/)。

排查顺序：**每份资源是否取到 → 顺序是否与依赖一致 → 源文件接缝处是否有换行 → 缓存是否干扰**。

## 相关页面

- [resources.Concat](/functions/resources/concat/)
- [资源压缩](/hugo-pipes/minification/)
- [资源指纹](/hugo-pipes/fingerprint/)
- [简介](/hugo-pipes/introduction/)
- [故障排查](/troubleshooting/)
