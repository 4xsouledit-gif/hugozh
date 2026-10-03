+++
title = "resources.ExecuteAsTemplate"
linkTitle = "ExecuteAsTemplate"
description = "返回由 Go 模板创建的资源，它用给定上下文解析并执行。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/resources/executeastemplate/"

[params.functions_and_methods]
signatures = ["resources.ExecuteAsTemplate TARGETPATH CONTEXT RESOURCE"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

CSS 里想用站点配置的颜色，JS 里想注入统计 ID，`robots.txt` 里想写站点域名——这些文件本该由模板生成。但 `assets/` 里的文件默认被当作**纯文本**，里面的 `{{ … }}` 只会原样出现。

`resources.ExecuteAsTemplate` 把资源当 Go 模板**执行一次**：用你传入的上下文解析 `{{ … }}`，得到的新内容成为目标路径上的资源。

## 什么时候用，什么时候别用

**该用**：

- 让 `assets/` 下的 CSS／JS／文本文件引用站点参数、当前页面数据；
- 从配置生成 `robots.txt`、`.well-known/security.txt`、清单文件；
- 想让生成的文件继续进管道（`minify`、`fingerprint`）。

**别用**：

- 内容里没有模板动作 → 直接用 [`resources.Get`](/functions/resources/get/)，不必执行；
- 内容来自**用户输入** → 执行模板意味着输入会被当代码解析，存在注入风险，必须换成纯数据处理；
- 想解析 JSON/YAML/CSV 数据 → 用 [`transform.Unmarshal`](/functions/transform/unmarshal/)；
- 只是想在页面里插一段动态文本 → 直接在模板里写。

> [!NOTE]
> 该函数可用于全局资源、页面资源或远程资源。

`resources.ExecuteAsTemplate` 函数返回由 Go 模板创建的资源，它用给定上下文解析并执行，并以目标路径作为缓存键缓存结果。

调用资源的 [`Publish`][]、[`Permalink`][] 或 [`RelPermalink`][] 方法时，Hugo 会把该资源发布到目标路径。

假设你有一个 CSS 文件，希望用项目配置中的值填充它：

```go-html-template {file="assets/css/template.css"}
body {
  background-color: {{ site.Params.style.bg_color }};
  color: {{ site.Params.style.text_color }};
}
```

而项目配置中包含：

```toml
[params.style]
bg_color = '#fefefe'
text_color = '#222'
```

把下面的代码放进 baseof.html 模板：

```go-html-template
{{ with resources.Get "css/template.css" }}
  {{ with resources.ExecuteAsTemplate "css/main.css" $ . }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

上面的示例：

1. 把该模板捕获为资源
1. 以当前页面作为上下文，把该资源作为模板执行
1. 把该资源发布到 css/main.css

结果是：

```css {file="public/css/main.css"}
body {
  background-color: #fefefe;
  color: #222;
}
```

## 完整示例：用配置值生成样式表

```go-html-template {file="layouts/_partials/templated-css.html"}
{{ with resources.Get "css/template.css" }}
  {{ with resources.ExecuteAsTemplate "css/main.css" $ . }}
    <p>{{ .RelPermalink }}</p>
    <pre>{{ .Content }}</pre>
  {{ end }}
{{ end }}
```

Hugo 0.167.0 实测渲染为：

```html
<p>/css/main.css</p><pre>body {
  background-color: #fefefe;
  color: #222;
}
</pre>
```

同时 `public/css/main.css` 实测内容为：

```css
body {
  background-color: #fefefe;
  color: #222;
}
```

**你应当看到什么**：两个 `{{ site.Params.style.* }}` 被替换成了配置里的值；目标路径就是你指定的 `TARGETPATH`。注意 `CONTEXT` 传的是 `$`（当前页面）——资源模板里的 `.` 就是它，所以 `{{ .Title }}`、`{{ .Params.x }}` 也能用。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正常执行 | `.RelPermalink` = `/css/main.css`，`.Content` 为替换后的内容；同时写入 `public/css/main.css` | 否 |
| 资源里没有模板动作 | 原样输出（相当于复制） | 否 |
| 资源模板里引用了不存在的字段 | 调用本身不报错；**读取 `.Content`／`.RelPermalink` 时**失败 | 是：`EXECUTE-AS-TEMPLATE: failed to transform "/css/bad.css" (text/css): template: /css/bad.css:1:29: executing "/css/bad.css" at <.NoSuchField.Deep>: can't evaluate field NoSuchField in type *hugolib.pageState` |
| `CONTEXT` 传 `$`、`.`、`dict` | 都会成为资源模板里的 `.`（实测用 `$` 可访问 `site.Params`） | 否 |
| 目标路径为空字符串 | 上游未说明；实测可执行，但发布路径退化为 `/.` | 否 |
| 返回类型 | `resource.Resource` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 产物 CSS 里原样出现 `{{ site.Params… }}` | 只用了 `resources.Get`，没有 `ExecuteAsTemplate` | 加上执行这一步 |
| 报错看不懂 | `failed to transform …: can't evaluate field X` | 资源模板里引用了上下文没有的字段 | 检查传入的 `CONTEXT`；注意报错里的行号是**资源文件**的行号，不是调用处 |
| 没报错但结果不对 | 页面里 `{{ .Title }}` 取到的是空/别的值 | `CONTEXT` 传错（例如传了 `dict` 却按页面用） | 明确传 `$`（当前页面）或 `.Site` 等 |
| 没报错但结果不对 | 改了 CSS 模板但产物没变 | 缓存键是目标路径，路径没变 | 清理缓存重跑；或给目标路径加指纹 |
| 安全隐患 | 用户可控制的内容被当作模板执行 | 内容来源不可信 | 绝不把用户输入交给 `ExecuteAsTemplate` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Permalink`]: /methods/resource/permalink/
[`Publish`]: /methods/resource/publish/
[`RelPermalink`]: /methods/resource/relpermalink/
