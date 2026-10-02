+++
title = "从模板创建资源"
linkTitle = "从模板创建资源"
description = "用 resources.ExecuteAsTemplate 把模板资源按给定上下文执行后发布。含上下文选择、缓存键陷阱与完整示例。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/hugo-pipes/resource-from-template/"

[params.teach]
difficulty = "参考"
time = "15–25 分钟"
prereq = [
  "会写几个基本的 Go 模板动作（`{{ }}`、`with`、`$`），知道 `.` 在 `with` 里会被重新绑定",
  "读过[简介](/hugo-pipes/introduction/)，知道资源要经 `Publish` / `Permalink` / `RelPermalink` 才会被发布",
]
outcomes = [
  "把一份存放在 `assets/` 里的模板（例如 CSS）用站点配置渲染成最终文件并发布",
  "解释第二个参数为什么常写成 `$` 而不是 `.`，以及上下文写错时会出现什么现象",
  "判断什么时候该用 `ExecuteAsTemplate`、什么时候 `resources.FromString` 就够了",
]
next = ["/hugo-pipes/resource-from-string/", "/hugo-pipes/transpile-sass-to-css/", "/functions/resources/executeastemplate/"]

+++

## 这一页解决什么问题

[Sass 变量](/hugo-pipes/transpile-sass-to-css/)能在编译期注入配置值，但那需要整条 Sass 工具链。如果只是想把**少量配置值**填进一份文本文件（CSS 里的颜色、JSON 里的站点名、XML 里的域名），用 Go 模板直接渲染更轻。

`resources.ExecuteAsTemplate` 就是这条路径：**把 `assets/` 里的一份文件当作 Go 模板执行**，用你给的上下文渲染出内容，再作为资源发布。

## 方法签名与用途

`resources.ExecuteAsTemplate` 把一个资源当作 Go 模板来解析和执行，并返回执行结果对应的资源，缓存键是目标路径：

```text
resources.ExecuteAsTemplate TARGETPATH CONTEXT RESOURCE
```

三个参数依次是目标路径、执行上下文与资源本身；目标路径同时决定发布后的位置与文件名。当调用结果的 `Publish`、`Permalink` 或 `RelPermalink` 方法时，Hugo 会把资源发布到目标路径。

### 返回值与边界

| 情形 | 会怎样 |
| --- | --- |
| 正常 | 返回渲染后的资源，可以继续 `minify` / `fingerprint` 或直接发布 |
| 模板里引用了上下文中不存在的字段 | 渲染出 `<no value>` 之类文本（不会让构建失败），产物因此在浏览器里表现为「值不对」 |
| 模板语法写错（少一个 `end`、拼错函数名） | **直接构建失败**，报错会指出模板位置 |
| `CONTEXT` 传成了 `nil` | 渲染时取不到任何数据，结果大多为空或 `<no value>` |
| 同一个目标路径配不同上下文 | 缓存键相同 → 第二次调用直接复用第一次的结果，**不同页面拿到同一份内容** |
| 资源是 `nil` | 该步失败；先 `with` 判断资源存在 |

## 准备模板资源

假设你想让一份 CSS 使用项目配置中的颜色值。先把模板放进 `assets` 目录：

```go-html-template
body {
  background-color: {{ site.Params.style.bg_color }};
  color: {{ site.Params.style.text_color }};
}
```

对应的项目配置如下：

```toml
[params.style]
bg_color = '#fefefe'
text_color = '#222'
```

## 在模板中执行

在 `baseof.html` 之类的模板里写：

```go-html-template
{{ with resources.Get "css/template.css" }}
  {{ with resources.ExecuteAsTemplate "css/main.css" $ . }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

这个例子做了三件事：

1. 把模板文件取回为资源；
2. 以当前页面为上下文执行这个资源；
3. 把资源发布到 `css/main.css`。

注意第二个参数传的是 `$` 而不是 `.`：进入 `with` 之后 `.` 已经被重新绑定，用 `$` 才能把模板顶层的上下文（页面模板中即当前页面）传给模板执行环节。

执行后的结果大致为：

```text
body {
  background-color: #fefefe;
  color: #222;
}
```

**为什么 `.` 在这里会出错**：`with` 把 `.` 改成了「当前资源对象」，而资源对象上没有 `site`、`Params` 这些页面级数据。传 `.` 不报错，只是渲染出一堆空值——这正是本节最容易踩的坑。

## 上下文与数据来源

`CONTEXT` 决定模板里能取到哪些数据，示例传入的是当前页面，因此模板中可以直接使用 `site`、`page` 等模板对象，也可以访问页面参数。若模板只依赖站点级配置，同样可以传入站点对象；只要保证模板中引用的字段在上下文中存在即可。

**怎么选上下文**

| 模板里需要什么 | 传什么 |
| --- | --- |
| 当前页面的标题、参数、资源 | `$`（页面模板顶层的上下文） |
| 只用到站点级数据（`site.Params`、`site.BaseURL` 等） | 传页面上下文即可，`site` 从任何上下文都能访问 |
| 需要自定义的一组数据 | 传一个 `dict`，例如 `(dict "color" "blue")`，模板里用 `.color` 取 |

## 完整可运行示例

这个示例把「配置里的颜色」渲染进一份 CSS 并发布出去。

**① 建项目并进入目录**：

```bash
hugo new project template-resource-demo
cd template-resource-demo
```

**② 在项目配置 `hugo.toml` 末尾加上颜色**：

```toml
[params.style]
bg_color = '#fefefe'
text_color = '#222'
```

**③ 新建模板资源** `assets/css/template.css`：

```go-html-template {file="assets/css/template.css"}
body {
  background-color: {{ site.Params.style.bg_color }};
  color: {{ site.Params.style.text_color }};
}
```

**④ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ with resources.Get "css/template.css" }}
  {{ with resources.ExecuteAsTemplate "css/main.css" $ . }}
    <!doctype html>
    <html lang="zh-cn">
      <head>
        <meta charset="utf-8">
        <title>ExecuteAsTemplate 演示</title>
        <link rel="stylesheet" href="{{ .RelPermalink }}">
      </head>
      <body>
        <h1>颜色来自项目配置</h1>
      </body>
    </html>
  {{ end }}
{{ end }}
```

**⑤ 构建并查看**：

```bash
hugo
```

### 你应当看到什么

- 页面背景是浅灰白（`#fefefe`）、文字是深灰（`#222`）——说明配置值真的被渲染进了 CSS；
- `public/css/main.css` **存在**，内容里的模板动作已经消失：

  ```css
  body {
    background-color: #fefefe;
    color: #222;
  }
  ```

- 页面源代码里 `<link href="/css/main.css">` 不带哈希（本示例没有接 `fingerprint`；接上之后会变成 `main.<哈希>.css`）；
- **对照实验**：把 `ExecuteAsTemplate` 的第二个参数由 `$` 改成 `.`，重新构建。构建**不会失败**，但产物里的颜色变成空值或 `<no value>`——这就是「上下文传错」的典型表现。

> [!NOTE]
> `assets/css/template.css` 本身**不会**出现在 `public/` 里：它是模板，不是最终产物。出现在发布目录里的是渲染后的 `css/main.css`。

## 缓存与 --gc

Hugo Pipes 以整条管道链为缓存单位，`resources.ExecuteAsTemplate` 另外以目标路径作为缓存键。因此同一个目标路径在一次构建中只会执行一次：如果同一个目标路径被用于内容依赖页面上下文的模板，不同页面之间会复用同一份结果，需要为不同上下文使用不同的目标路径。

`hugo build --gc` 可在构建后清理未使用的缓存文件，详见[命令](/commands/)。生成的文件位于发布目录中，陈旧文件的清理与其他构建产物一致。

**这条缓存规则的现实后果**：想给每个页面生成一份带该页标题的 CSS，就必须让目标路径带上区分度，例如：

```go-html-template
{{ $path := printf "css/%s.css" .File.TranslationBaseName }}
```

否则第二个页面会直接复用第一个页面的结果。

## 什么时候用 / 什么时候别用

**该用的时候**

- 少量配置值要填进文本资源（颜色、域名、站点名、版本号）；
- 模板文件希望**保留独立文件的形态**，便于编辑器高亮与版本管理；
- 需要在资源里使用完整的模板能力（`site`、`now`、自定义 `dict`）。

**别用的时候**

- 内容来自**字符串**而不是文件：用 [resources.FromString](/hugo-pipes/resource-from-string/) 更直接；
- 只有几个颜色值：CSS 自定义属性（`var(--color)`）往往更简单，改配置时也更容易排查；
- 需要**完整的 Sass 能力**（嵌套、`@use`、mixin）：用 [css.Sass](/hugo-pipes/transpile-sass-to-css/)；
- 内容**固定不变**：放进 `static/` 或 `assets/` 原样引用即可；
- 同一个目标路径要服务**多个不同上下文**：除非你按上文给路径加上区分度，否则会互相覆盖。

## 常见坑

**① 命令找不到（命令类）**

- `hugo: command not found`：见[安装 Hugo](/installation/)；
- 本函数不调用外部命令，因此「找不到可执行文件」一类报错来自上游管道（例如 `css.Sass` 需要 Dart Sass）。

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| 产物里出现 `<no value>` 或空字符串 | 上下文传错（写成 `.`），或配置里的键名与模板中不一致 | 把第二个参数改成 `$`；核对 `[params.style]` 的层级 |
| 产物里原样出现 `{{ ... }}` | 把它当成了普通资源，没有经过 `ExecuteAsTemplate` | 检查是否漏了这一步 |
| `public/` 里找不到生成的文件 | 结果没有被 `.RelPermalink` / `.Permalink` / `.Publish` 引用 | 看模板是否输出了 `<link>` 或调用了发布方法 |
| 所有页面拿到同一份内容 | 多个上下文共用了同一个目标路径 | 给目标路径加上页面维度 |
| 改了模板文件，产物没变 | 管道链缓存未失效 | `hugo --ignoreCache` 重建 |
| 浏览器按 MIME 类型处理错了 | 目标路径的扩展名不对（例如发布成 `.txt`） | 让目标路径沿用 `.css` / `.js` / `.json` 等正确扩展名 |

**③ 报错看不懂（报错类）**

- 报错里出现 `unexpected "}" in template` / `unexpected EOF` 一类：模板语法错误，报错位置指向模板文件，从那里读起；
- 报错里出现 `function "xxx" not defined`：模板里用了不存在的函数名（拼写错误，或函数在当前 Hugo 版本里没有）；
- 报错里出现 `can't evaluate field RelPermalink`：上游返回了 `nil`，补上 `with`；
- 构建成功但浏览器里样式不对：多半是上下文或键名问题（见上表），而不是模板执行失败；
- 报错指向的文件与你改的无关：渲染期问题常这样出现，见[故障排查](/troubleshooting/)。

排查顺序：**资源路径对不对 → 上下文（`$` 还是 `.`）→ 模板里的键名是否存在 → 目标路径与 MIME 类型 → 缓存是否干扰**。

## 相关页面

- [resources.ExecuteAsTemplate](/functions/resources/executeastemplate/)
- [从字符串创建资源](/hugo-pipes/resource-from-string/)
- [把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)
- [资源指纹](/hugo-pipes/fingerprint/)
- [故障排查](/troubleshooting/)
