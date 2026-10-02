+++
title = "资源压缩"
linkTitle = "资源压缩"
description = "用 resources.Minify 压缩 CSS、JS、JSON、HTML、SVG 与 XML 资源。含支持的类型边界、完整示例与常见报错。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/hugo-pipes/minification/"

[params.teach]
difficulty = "参考"
time = "10–15 分钟"
prereq = [
  "读过[简介](/hugo-pipes/introduction/)，知道资源要经 `.RelPermalink` 一类方法才会被发布",
  "清楚管道顺序应为「转换 → 压缩 → 指纹」",
]
outcomes = [
  "对支持的文本类型资源做压缩，并确认产物里注释与空白确实被去掉",
  "说清 `resources.Minify` 与命令行 `hugo --minify` 的区别",
  "在压缩后表现异常时，知道先检查源文件是否依赖注释或空白",
]
next = ["/hugo-pipes/fingerprint/", "/hugo-pipes/bundling/", "/functions/resources/minify/"]

+++

## 这一页解决什么问题

源文件里的注释、缩进与换行对人有用，对浏览器没用。压缩把这些字节去掉，让文件更小、加载更快，代价是产物不再适合阅读——所以调试时不要直接盯压缩后的文件，要看 source map 或原始文件。

`resources.Minify` 只处理**文本类型**：它不认识图片，也不做语法级别的优化（那是 `js.Build` 与 PostCSS 插件的事）。

## 方法签名与用途

`resources.Minify` 返回给定资源的最小化版本，参数就是资源对象：

```text
resources.Minify RESOURCE
```

它还有一个别名 `minify`，这也是管道写法中最常用的形式。两者完全等价：

```go-html-template
{{ $css := resources.Get "css/main.css" }}
{{ $style := $css | minify }}
```

返回值类型同样是 `resource.Resource`。可以压缩的资源类型为 CSS、JS、JSON、HTML、SVG 与 XML，其他类型不在支持范围内。

### 返回值与边界

| 情形 | 会怎样 |
| --- | --- |
| 支持的文本类型 | 返回压缩后的新资源，可继续 `fingerprint` 或发布 |
| 图片、字体等二进制资源 | 不在支持范围内；需要处理图片请用[图像处理](/content-management/image-processing/)的缩放、裁剪等方法 |
| 上游是 `nil`（`resources.Get` 没取到） | 这一步失败，做法是先 `with` 判断资源存在 |
| 资源内容为空 | 得到一份空资源，发布出去是个 0 字节文件——通常说明取错了文件 |
| 已经是压缩产物 | 可以再压一次，但没有收益，只让管道更长 |

## 链式调用示例

最小化通常紧跟在构建或拼接之后、指纹之前：

```go-html-template
{{ $main := resources.Get "css/main.scss" | css.Sass }}
{{ $style := $main | minify | fingerprint }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}" integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous">
```

由字符串生成的资源也可以压缩，适合把少量样式直接内联到页面里：

```go-html-template
{{ $content := printf "body{color:%s}" site.Params.color }}
{{ $r := resources.FromString "css/inline.css" $content | minify }}
<link rel="stylesheet" href="{{ $r.RelPermalink }}">
```

## 发布时机

和其他 Hugo Pipes 的产物一样，压缩结果在你调用 `Publish`、`Permalink` 或 `RelPermalink` 时才会发布到 `public` 目录；不想生成文件而要把结果直接写进页面时，使用 `.Content`。

## 完整可运行示例

这个示例强调一件事：**压缩去掉的到底是什么**。

**① 建项目并进入目录**：

```bash
hugo new project minify-demo
cd minify-demo
```

**② 新建一份带注释和缩进的样式** `assets/css/main.css`：

```css
/* 站点主样式：下面的注释与缩进都应当消失在产物里 */
body {
  color: #222;
  font-size: 18px;
}
```

**③ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ with resources.Get "css/main.css" }}
  {{ with . | minify | fingerprint }}
    <!doctype html>
    <html lang="zh-cn">
      <head>
        <meta charset="utf-8">
        <title>Minify 演示</title>
        <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
      </head>
      <body>
        <h1>样式已压缩</h1>
      </body>
    </html>
  {{ end }}
{{ end }}
```

**④ 构建**：

```bash
hugo
```

### 你应当看到什么

- `public/css/` 下出现 `main.<哈希>.css`（没有设置 `targetPath` 时，沿用源文件名并加指纹）；
- 打开该文件，内容形如：

  ```css
  body{color:#222;font-size:18px}
  ```

  注释、缩进与换行都不见了——这就是压缩生效的直接证据；
- 页面仍然正确显示（颜色与字号来自变量，与压缩无关）；
- 注释掉 `| minify` 再构建一次，产物会恢复成多行格式，并且**文件名哈希随之变化**：说明压缩确实改变了文件内容。

> [!NOTE]
> 命令行 `hugo --minify` 压缩的是**渲染出的最终输出**（HTML、XML 等），与 `resources.Minify` 处理 `assets/` 里的资源不是同一件事，两者可以同时使用。

## 缓存与 --gc

Hugo Pipes 以整条管道链为缓存单位。同一条链在一次构建中只执行一次，之后都命中缓存，因此压缩虽然要消耗计算，但并不会随模板执行次数线性增长。链越长，首次执行的代价越高，这也是把构建、压缩、指纹放在同一条链里即可的原因。

`hugo build --gc` 会在构建完成后清理未使用的缓存文件。完整参数说明见[命令](/commands/)。

## 什么时候用 / 什么时候别用

**该用的时候**

- 交付给浏览器的 CSS / JS / JSON / SVG / XML 体积敏感；
- 已经用 `resources.Concat` 拼好一份资源，想在发布前压一次；
- 想要「压缩 + 指纹」这一经典组合。

**别用的时候**

- **图片、字体、PDF 等二进制资源**：压缩不是它们该走的环节，图片请用图像处理方法；
- 需要的是**语法级优化**（摇树、去掉死代码、转译新语法）：用 [js.Build](/hugo-pipes/js/)；
- 需要**对 CSS 做结构化处理**（嵌套、前缀）：用 [PostCSS](/hugo-pipes/postcss/)；
- 你正在调试：压缩后的文件难以阅读，调试时先把 `minify` 这一环去掉，或依赖 source map。

## 常见坑

**① 命令找不到（命令类）**

- `hugo: command not found`：先解决 Hugo 的安装与 `PATH`，见[安装 Hugo](/installation/)；
- 压缩本身不调用任何外部命令，因此这一步出现的「找不到」类报错几乎都来自管道**前面**的环节（`css.Sass` 需要 Dart Sass、`css.PostCSS` 需要 Node.js）。

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| `public/` 里没有产物 | 结果没有被 `.RelPermalink` / `.Permalink` / `.Publish` 引用 | 看模板是否输出了标签 |
| 压缩产物是 0 字节 | 取到了空文件，或 `resources.Get` 的路径错了 | 打开源文件确认内容，核对相对 `assets/` 的路径 |
| 页面样式/脚本行为变化 | 源文件依赖注释或空白（用注释当分隔、依赖自动分号插入） | 对比压缩前后的产物，给源文件补上显式分号 |
| 改了源文件，产物没变 | 管道链缓存未失效 | `hugo --ignoreCache` 重建 |
| 图片没有任何变化 | 图片不在支持的类型内 | 改用[图像处理](/content-management/image-processing/) |

**③ 报错看不懂（报错类）**

- 报错里出现 `can't evaluate field` 一类「无法取值」：上游返回了 `nil`，补上 `with`；
- 报错里出现 `minify` 字样并伴随 `expected` / `unexpected`：压缩器在对内容做语法解析时失败，**问题在源文件语法**，请先按浏览器或对应语言的规范修好源文件；
- 报错的文件与你改的无关：渲染期问题（短代码、编码、配置）也会这样出现，见[故障排查](/troubleshooting/)。

排查顺序：**资源是否取到 → 类型是否受支持 → 源文件语法是否合法 → 缓存是否干扰**。

## 相关页面

- [resources.Minify](/functions/resources/minify/)
- [资源打包](/hugo-pipes/bundling/)
- [资源指纹](/hugo-pipes/fingerprint/)
- [图像处理](/content-management/image-processing/)
- [故障排查](/troubleshooting/)
