+++
title = "Aliases"
linkTitle = "Aliases"
description = "返回前置元数据中定义的别名，形式为服务器相对 URL，并按当前内容维度解析。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/page/aliases/"

[params.functions_and_methods]
signatures = ["PAGE.Aliases"]
returnType = "[]string"
+++

## 这一页解决什么问题

页面改名或改变路径之后，旧链接不能失效。Hugo 的常规做法是在前置元数据里写 `aliases`，由 Hugo 为每个别名生成一个跳转 HTML；而 `Aliases` 方法把这份清单**读回模板**，让你自己生成服务器级重定向文件（`_redirects`、`.htaccess`），或对别名做检查。

`Page` 对象上的 `Aliases` 方法返回 [`aliases`][] 前置元数据字段中定义的值，形式为服务器相对 URL，并按当前[内容维度](g)解析。

`Aliases` 方法适合用来生成 `_redirects` 文件：其中为每个别名给出源 URL、目标 URL 与 HTTP 状态码。Cloudflare、GitLab Pages、Netlify 等托管服务都可以使用 `_redirects` 文件。

## 什么时候用，什么时候别用

**该用**：

- 托管服务商支持 `_redirects` 或 `.htaccess`，你想在**服务器层**处理跳转，而不是让浏览器先加载一个中转页——这正是下一节「重定向」的场景；
- 想在构建时校验别名：遍历 `hugo.Sites` 的每个页面，取出 `.Aliases` 逐条检查重复、空白字符或冲突；
- 只想知道某个页面挂了哪些别名。

**别用**：

- 只是想让旧 URL 跳到新 URL：在[前置元数据][]里写 `aliases` 就够了，Hugo 默认会生成跳转页，不需要写任何模板；
- 想拿当前页面的 URL：用 `.RelPermalink`（服务器相对）或 `.Permalink`（绝对 URL），与别名无关；
- 想在模板中**新增**别名：`Aliases` 只是只读返回值，别名只能来自前置元数据。

## 重定向

默认情况下，Hugo 通过为每个别名路径分别创建一个 HTML 文件来处理别名。这些文件含有 `meta http-equiv="refresh"` 标签，由浏览器完成对访问者的重定向。

这种做法确实可用，但生成单个 `_redirects` 文件可以让托管服务商在服务器层面处理重定向。它比客户端重定向更高效，也省去了加载一个中转 HTML 页面的开销，从而提升性能。

> [!TIP]
> 用同样的思路也可以生成 `.htaccess` 文件。

## 示例

下面的示例演示如何配置站点，并创建一个模板来自动生成 `_redirects` 文件。

### 内容结构

这个多语言示例的内容结构如下：

```tree
content/
├── examples/
│   ├── a.de.md   aliases = ['a-old']
│   ├── a.en.md   aliases = ['a-old', 'a-older']
│   ├── b.de.md   aliases = ['b-old']
│   └── b.en.md   aliases = ['b-old', 'b-older']
└── _index.md
```

上例中的别名是[页面相对](g)的。要指定[站点相对](g)路径，请在条目开头加上斜杠（`/`）。两种写法最终都会解析为[服务器相对](g)路径。

页面相对路径还可以包含目录跳转：

| 路径类型 | 文件路径 | 别名 | 服务器相对路径 |
| :--- | :--- | :--- | :--- |
| 页面相对 | `content/examples/a.en.md` | `a-old` | `/en/examples/a-old/` |
| 页面相对 | `content/examples/a.en.md` | `../a-old` | `/en/a-old/` |
| 站点相对 | `content/examples/a.en.md` | `/a-old` | `/en/a-old/` |

### 项目配置

为此，你必须修改项目配置：

1. 将 `disableAliases` 设为 `true`，以禁用默认的 HTML 重定向文件生成。
1. 定义一种名为 `text/redirects` 的[媒体类型][]来处理该文件格式。
1. 定义一种名为 `redirects` 的自定义[输出格式][]，把文件名设为 `_redirects`，并把它放到发布站点的根目录。
1. 配置首页的[输出][outputs]，在 `html` 之外再加上 `redirects` 格式。

```toml
baseURL = 'https://example.org/'
disableAliases = true

defaultContentLanguage         = 'en'
defaultContentLanguageInSubdir = true

[languages.en]
 locale      = 'en-US'
 direction = 'ltr'
 name      = 'English'
  weight            = 1
  title             = 'My Site in English'

[languages.de]
 locale      = 'de-DE'
 direction = 'ltr'
 name      = 'Deutsch'
  weight            = 2
  title             = 'My Site in German'

[mediaTypes]
  [mediaTypes.'text/redirects']
    delimiter = ''

[outputFormats]
  [outputFormats.redirects]
    baseName    = '_redirects'
    isPlainText = true
    mediaType   = 'text/redirects'
    root        = true

[outputs]
  home = ['html', 'redirects']
```

### 模板实现

接下来，为 `redirects` 输出格式单独创建一个首页模板。下面的模板会遍历每种语言的每个页面，并提取其别名。

为确保生成的 `_redirects` 文件有效，该模板用 [`strings.FindRE`][] 函数检查别名字符串中是否存在制表符、换行符等空白字符。一旦检测到空白，Hugo 会抛出错误并中止构建，以免生成无效文件。

```go-html-template {file="layouts/home.redirects" copy=true}
{{- if site.IsDefault -}}
  {{- range hugo.Sites -}}
    {{- range $p := .Pages -}}
      {{- range .Aliases -}}
        {{- if findRE `\s` . -}}
          {{- errorf "One of the front matter aliases in %q contains whitespace" $p.String -}}
        {{- end -}}
        {{- printf "%s %s 301\n" . $p.RelPermalink -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
```

### 生成的输出

Hugo 处理该模板后，会产出一份干净的重定向规则列表。每一行都遵循规定的格式：源 URL、目标 URL 与 HTTP 状态码。

生成的 `_redirects` 文件如下：

```text
/de/examples/a-old /de/examples/a/ 301
/de/examples/b-old /de/examples/b/ 301
/en/examples/b-old /en/examples/b/ 301
/en/examples/b-older /en/examples/b/ 301
/en/examples/a-old /en/examples/a/ 301
/en/examples/a-older /en/examples/a/ 301
```

## 完整示例：在模板里列出页面的别名

最小站点：`content/docs/guide/alpha.md` 的前置元数据里有 `aliases = ['a-old', '/site-old']`，同目录的 `beta.md` 没有任何别名。把下面的代码放进 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ if .Aliases }}
  <p>本页别名：{{ delimit .Aliases "、" }}</p>
{{ else }}
  <p>本页没有别名</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，渲染 alpha 得到：

```html
<p>本页别名：/docs/guide/a-old、/site-old</p>
```

渲染 beta（没有别名）得到：

```html
<p>本页没有别名</p>
```

**你应当看到什么**：页面相对的写法 `a-old` 被解析为 `/docs/guide/a-old`，即**拼在当前页面所在目录之后**；站点相对的写法 `/site-old` 原样保留。两者都**不带末尾斜杠**（上游表格把它们写作 `/en/examples/a-old/`，实测返回值不含末尾斜杠）。同一次构建还会在 `public/docs/guide/a-old/index.html` 与 `public/site-old/index.html` 生成跳转页，内容形如：

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>https://example.org/docs/guide/alpha/</title>
    <link rel="canonical" href="https://example.org/docs/guide/alpha/">
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=https://example.org/docs/guide/alpha/">
  </head>
</html>
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`baseURL = 'https://example.org/'`，未设置 `disableAliases`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据中没有 `aliases` | 空切片，`len` 为 0，`if` / `with` 判为假 | 否 |
| 一个页面相对别名（页面在 `content/docs/guide/`） | 一个元素：`/docs/guide/a-old` | 否 |
| 一个站点相对别名（以 `/` 开头） | 一个元素：`/site-old` | 否 |
| 多个别名 | 顺序与前置元数据中出现的先后一致 | 否 |
| 设置了 `disableAliases = true` | 切片内容不变，但不再生成跳转 HTML（这正是上游示例的用法） | 否 |
| 返回类型 | `[]string`，元素是服务器相对路径 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 把别名和相对路径拼接，得到 `/docs/guide/a-old/docs/guide/alpha/` | 别名本身已是可以直接跳转的服务器相对路径 | 直接输出别名元素，目标页单独用 `.RelPermalink` |
| 没报错但结果不对 | 以为别名带末尾斜杠，字符串比对总是失败 | 实测返回值**不带**末尾斜杠 | 比较前先规范化（补 `/` 或用 `strings.TrimSuffix`） |
| 没报错但结果不对 | `_redirects` 文件里混入空白字符，服务商拒绝 | 别名中混进了制表符或换行 | 按上游示例用 `findRE` 检查并 `errorf` 中止构建 |
| 什么都没输出 | `range .Aliases` 空转 | 该页没有定义 `aliases`，返回空切片 | 用 `if` / `with` 给兜底文案 |

更多排查入口见[故障排查](/troubleshooting/)。

[前置元数据]: /content-management/front-matter/
[`aliases`]: /content-management/front-matter/#aliases
[`strings.FindRE`]: /functions/strings/findre/
[媒体类型]: /configuration/media-types/
[输出格式]: /configuration/output-formats/
[outputs]: /configuration/outputs/
