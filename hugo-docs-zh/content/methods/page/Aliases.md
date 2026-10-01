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

`Page` 对象上的 `Aliases` 方法返回 [`aliases`][] 前置元数据字段中定义的值，形式为服务器相对 URL，并按当前[内容维度](g)解析。

`Aliases` 方法适合用来生成 `_redirects` 文件：其中为每个别名给出源 URL、目标 URL 与 HTTP 状态码。Cloudflare、GitLab Pages、Netlify 等托管服务都可以使用 `_redirects` 文件。

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

[`aliases`]: /content-management/front-matter/#aliases
[`strings.FindRE`]: /functions/strings/findre/
[媒体类型]: /configuration/media-types/
[输出格式]: /configuration/output-formats/
[outputs]: /configuration/outputs/
