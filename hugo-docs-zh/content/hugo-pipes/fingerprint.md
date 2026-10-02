+++
title = "资源指纹"
linkTitle = "资源指纹"
description = "用 resources.Fingerprint 为资源内容生成哈希文件名与 SRI 完整性值。含哈希与 integrity 的关系、完整示例与常见报错。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/hugo-pipes/fingerprint/"

[params.teach]
difficulty = "参考"
time = "15–20 分钟"
prereq = [
  "读过[简介](/hugo-pipes/introduction/)，知道资源要经 `.Permalink` / `.RelPermalink` 才会被发布",
  "对浏览器缓存有基本概念：同一个 URL 会被缓存，改了内容却沿用旧 URL 就会拿到旧文件",
]
outcomes = [
  "给 CSS / JS 加上哈希文件名与 `integrity` 属性，让「内容变、文件名就变」自动成立",
  "通过对比两次构建的文件名，验证指纹确实随内容变化",
  "在浏览器报 SRI 校验失败时，知道先检查管道顺序与文件是否被中间环节改写",
]
next = ["/hugo-pipes/bundling/", "/hugo-pipes/minification/", "/host-and-deploy/"]

+++

## 这一页解决什么问题

浏览器会缓存 CSS 与 JS。如果你发布的新版本文件名不变，用户可能长时间看到旧样式。指纹解决两件事：

1. **缓存失效自动化**：文件名里带上内容哈希，内容一变文件名就变，浏览器自然会重新下载；内容不变则文件名不变，可以放心设置很长的缓存时间。
2. **子资源完整性（SRI）**：`integrity` 属性让浏览器校验拿到的文件是否与预期内容一致，被篡改或被中间环节改写时会拒绝加载。

## 方法签名与用途

`resources.Fingerprint` 对资源内容做密码学哈希，返回带哈希值的资源对象，用于缓存失效与子资源完整性校验：

```text
resources.Fingerprint [ALGORITHM] RESOURCE
```

它也有别名 `fingerprint`。哈希算法可以是 `md5`、`sha256`（默认）、`sha384` 或 `sha512`。虽然最常见的用途是 CSS 与 JavaScript，但任何类型的资源都可以做指纹。

### 返回值与边界

| 情形 | 会怎样 |
| --- | --- |
| 正常 | 返回新资源：`RelPermalink` / `Permalink` 里含哈希，`.Data.Integrity` 含 SRI 值 |
| 上游是 `nil` | 该步失败；先 `with` 判断资源存在 |
| 没做过指纹的资源 | **没有** `.Data.Integrity` 这项数据，模板里取它会报「无法取值」 |
| 算法写成不认识的值 | 该步失败，报错会指出算法名 |
| 内容为空 | 哈希照样生成，但发布出去是个 0 字节文件——这时该回头找资源路径的问题 |

## 链式调用示例

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{ with . | fingerprint "sha256" }}
    <script src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
  {{ end }}
{{ end }}
```

嵌套两层 `with` 的做法很常见：外层确认资源存在，内层把资源交给指纹环节，同时把 `.` 绑定到指纹后的资源对象，因此后面可以直接取 `RelPermalink` 与 `Data.Integrity`。

Hugo 渲染出的结果大致如下：

```html
<script src="/js/main.62e...df1.js" integrity="sha256-Yuh...rfE=" crossorigin="anonymous"></script>
```

## 哈希带来的两项变化

对资源内容做哈希之后：

1. `Permalink` 与 `RelPermalink` 返回的路径中包含哈希值，文件名因此发生变化。
2. 资源的 `.Data.Integrity` 返回一个子资源完整性（SRI）值，由哈希算法名、一个连字符以及 base64 编码后的哈希和组成。

## SRI 与指纹的关系

文件名中的哈希与 `integrity` 属性中的哈希来自同一次计算，但用途不同：文件名哈希让浏览器把改版后的资源当作新文件重新下载，`integrity` 则让浏览器在加载脚本或样式时校验内容是否被篡改。示例里同时给出的 `crossorigin` 属性是使用 SRI 时常见的配套写法。

正因为两者同源，管道顺序必须“先压缩、后指纹”。如果先指纹再压缩，`integrity` 记录的会是压缩前内容的哈希，而实际发布出去的是压缩后的文件，浏览器校验失败就会拒绝加载。

> [!WARNING]
> 页面上的 `integrity` 值必须与实际提供的那个文件**逐字节一致**。任何在传输路径上改动内容的环节——把文件重新压缩、注入页脚、改写换行——都会让校验失败，页面表现为「样式/脚本没加载，控制台报 SRI 错误」。

## 完整可运行示例

这个示例验证「内容变 → 文件名变」这条核心承诺。

**① 建项目并进入目录**：

```bash
hugo new project fingerprint-demo
cd fingerprint-demo
```

**② 新建样式** `assets/css/main.css`：

```css
body {
  color: #222;
}
```

**③ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ with resources.Get "css/main.css" }}
  {{ with . | minify | fingerprint "sha256" }}
    <!doctype html>
    <html lang="zh-cn">
      <head>
        <meta charset="utf-8">
        <title>Fingerprint 演示</title>
        <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
      </head>
      <body>
        <h1>资源已加指纹</h1>
      </body>
    </html>
  {{ end }}
{{ end }}
```

**④ 第一次构建**：

```bash
hugo
```

**⑤ 改一个字节，再构建**：把 `#222` 改成 `#333`，然后重新执行 `hugo`。

### 你应当看到什么

- 第一次构建后，`public/css/` 里出现 `main.<哈希A>.css`；页面源代码里 `<link>` 的 `href` 与之一致，`integrity="sha256-…"` 存在；
- 修改颜色并第二次构建后，文件名变成 `main.<哈希B>.css`，**哈希 B ≠ 哈希 A**：内容一变，URL 就变，浏览器缓存自动失效；
- 第二次构建后，`public/css/` 里同时存在新旧两个文件。**旧文件不会自动消失**（Hugo 只是不引用它了），要清理发布目录中的陈旧文件，用：

  ```bash
  hugo --cleanDestinationDir
  ```

  该参数会删除发布目录中本次构建没有产生的文件（`hugo --help` 中的描述是 “remove stale files from destination”）；
- 浏览器开发者工具的 Network 面板里，改版后的请求是全新的 URL，状态码为 `200` 而不是 `304`。

## 缓存与 --gc

资源内容一变，哈希随之变化，文件名也就变了：旧文件名的资源不会自动从发布目录里消失。清理发布目录中的陈旧文件需要用清理目标目录的参数，而 `hugo build --gc` 负责在构建后清理未使用的缓存文件，两者职责不同，详见[命令](/commands/)。

- `hugo --cleanDestinationDir`：**发布目录**里的陈旧文件（对外可见的那一份）；
- `hugo --gc`：Hugo 的**构建缓存**文件（在 `resources/_gen` 一类目录里，不对外发布）。

## 什么时候用 / 什么时候别用

**该用的时候**

- 交付给浏览器的 CSS、JS、图片等静态资源，希望长期缓存又不担心更新不及时；
- 需要 SRI 校验（安全要求较高的站点）；
- 资源链接由模板生成，可以放心随哈希变化。

**别用的时候**

- 资源路径被**别处硬编码**，而那个地方不会跟着变——例如 CSS 里写死的 `url(/images/logo.png)`。Hugo 不会因为图片加了指纹就去改写 CSS 里的路径，两边要各自处理：要么这份资源不加指纹，要么让引用它的那份资源也走管道；
- HTML 页面本身：页面 URL 应当稳定可分享，不适合带内容哈希；
- 只在本地调试、不打算配置缓存策略时：指纹会增加心智负担，先跑通再优化。

## 常见坑

**① 命令找不到（命令类）**

- `hugo: command not found`：见[安装 Hugo](/installation/)；
- `--cleanDestinationDir` 报「未知参数」：说明 Hugo 版本过老，先用 `hugo version` 与 `hugo --help` 核对该版本支持哪些参数。**不要在不确定时改用删除目录的命令**——误删发布目录的代价比多留几个旧文件大得多。

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| 文件名里的哈希一直不变 | 源文件内容真的没变，或构建缓存未失效 | 改一个可见的值再构建；必要时 `hugo --ignoreCache` |
| `public/` 里堆了很多旧哈希文件 | 指纹按设计不会删除旧文件 | 用 `hugo --cleanDestinationDir` 或自行清理 |
| 页面没有样式，控制台报 SRI 错误 | 指纹放在了压缩之前，`integrity` 对应的是压缩前内容 | 把顺序改成 `| minify | fingerprint` |
| 模板报「无法取值 `.Data.Integrity`」 | 这份资源没做过指纹 | 在链上补 `| fingerprint`，或用 `with` 判断后再取 |
| 引用的图片 404 | 图片被指纹后路径变了，而引用它的地方（如 CSS、行内样式）还是旧路径 | 让引用方也走管道，或对该资源不加指纹 |

**③ 报错看不懂（报错类）**

浏览器控制台里最常见的两条：

- `Failed to find a valid digest in the 'integrity' attribute for resource …`：`integrity` 与实际文件不匹配。按顺序查：管道是否「先压缩后指纹」→ 发布目录里的文件是否被人为改过 → 是否有 CDN/代理在传输中改写内容；
- `Refused to execute script … because it violates the following Content Security Policy directive`：这是 CSP 而不是 SRI，但同样表现为「资源不加载」，检查响应头里的 CSP 配置。

Hugo 构建期的报错则通常是：算法名不合法、上游返回 `nil` 导致「无法取值」。若报错指向的文件与你改的无关，见[故障排查](/troubleshooting/)。

排查顺序：**资源是否取到 → 管道顺序是否为「压缩后指纹」→ 发布目录里的文件与 `integrity` 是否一致 → 是否有中间环节改写内容**。

## 相关页面

- [resources.Fingerprint](/functions/resources/fingerprint/)
- [资源压缩](/hugo-pipes/minification/)
- [资源打包](/hugo-pipes/bundling/)
- [部署](/host-and-deploy/)
- [故障排查](/troubleshooting/)
