+++
title = "transform.PortableText"
linkTitle = "PortableText"
description = "返回转换为 Markdown 后的给定 Portable Text。"
date = 2026-10-02
weight = 110
source = "https://gohugo.io/functions/transform/portabletext/"

[params.functions_and_methods]
signatures = ["transform.PortableText MAP"]
returnType = "string"
+++

（0.145.0 新增）

## 这一页解决什么问题

数据源里的富文本不是 HTML 也不是 Markdown，而是 [Portable Text][]（Sanity CMS 的 JSON 结构：一组 `block`，每个 block 里是若干 `span`）。这种结构在 Hugo 模板里既不能直接 `range` 出可读文本，也不能直接进页面。`transform.PortableText` 把它转成 **Markdown**，之后就交给 Hugo 正常的渲染管线（`.Content`、`markdownify`、渲染钩子都能用）。

## 什么时候用，什么时候别用

**该用**：

- 用[内容适配器][]从 Sanity 之类的外部 CMS 建页面，正文是 Portable Text；
- 想把 Portable Text 存进页面参数以便后续复用（上游示例把原始 JSON 存进 `params.portabletext`）。

**别用**：

- 数据已经是 Markdown 或 HTML → 分别用 [`transform.Markdownify`](/functions/transform/markdownify/) / [`transform.HTMLToMarkdown`](/functions/transform/htmltomarkdown/)；
- 想直接输出 HTML → 本函数返回的是 **Markdown 字符串**，还需要再渲染一次；
- 数据来自其他 CMS 的私有 JSON 结构 → 本函数只认 Portable Text 的结构。

## 用法

[Portable Text][] 是一种 JSON 结构，用于表示 [Sanity][] CMS 中的富文本内容。在 Hugo 中，该函数通常用在[内容适配器][]里，由 Sanity 数据创建页面。

支持的类型：

- `block` 与 `span`
- `image`。注意目前对图像的处理比较基础：我们用 `asset.url` 作为链接，用 `asset.altText` 作为图像替代文本，用 `asset.title` 作为标题。如果需要更精细的控制，可以在[图像渲染钩子][]中处理图像。
- `code`（参见 [code-input][] 插件）。代码会渲染为围栏代码块，其中提供的文件名会作为 Markdown 属性传入。

> [!NOTE]
> 由于 Portable Text 在传给 Hugo 之前就已转换为 Markdown，链接、标题、图像与代码块的渲染都可以用[渲染钩子][]控制。

## 示例

下面的示例用内容适配器从 Sanity 数据创建页面。

### 内容适配器

```go-html-template {file="content/_content.gotmpl" copy=true}
{{ $projectID := "mysanityprojectid" }}
{{ $useCached := true }}
{{ $api := "api" }}
{{ if $useCached }}
  {{/* See https://www.sanity.io/docs/api-cdn */}}
  {{ $api = "apicdn" }}
{{ end }}
{{ $url := printf "https://%s.%s.sanity.io/v2021-06-07/data/query/production" $projectID $api }}

{{ $q := `*[_type == 'post']{
  title, publishedAt, summary, slug, body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        path,
        url,
        altText,
        title,
        description,
        metadata {
          dimensions {
            aspectRatio,
            width,
            height
          }
        }
      }
    }
  },
  }`
}}
{{ $body := dict "query" $q | jsonify }}
{{ $opts := dict "method" "post" "body" $body }}
{{ $r := resources.GetRemote $url $opts }}
{{ $m := $r | transform.Unmarshal }}
{{ $result := $m.result }}
{{ range $result }}
  {{ if not .slug }}
    {{ continue }}
  {{ end }}
  {{ $markdown := transform.PortableText .body }}
  {{ $content := dict
    "mediaType" "text/markdown"
    "value" $markdown
  }}
  {{ $params := dict
    "portabletext" (.body | jsonify (dict "indent" " "))
  }}
  {{ $page := dict
    "content" $content
    "kind" "page"
    "path" .slug.current
    "title" .title
    "date" (.publishedAt | time )
    "summary" .summary
    "params" $params
  }}
  {{ $.AddPage $page }}
{{ end }}
```

### Sanity 设置

下面概述了适合上述示例的 Sanity studio 设置。

```ts {file="sanity.config.ts" copy=true}
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {media} from 'sanity-plugin-media'
import {codeInput} from '@sanity/code-input'

export default defineConfig({
  name: 'default',
  title: 'my-sanity-project',

  projectId: 'mysanityprojectid',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), media(),codeInput()],

  schema: {
    types: schemaTypes,
  },
})
```

类型与 schema 定义：

```ts {file="schemaTypes/postType.ts" copy=true}
import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image'
        },
        {
          type: 'code',
          options: {
            language: 'css',
            languageAlternatives: [
              {title: 'HTML', value: 'html'},
              {title: 'CSS', value: 'css'},
            ],
            withFilename: true,
          },
        },
      ],
    }),
  ],
})
```

注意上面还需要额外安装一些插件：

```sh
npm i sanity-plugin-media @sanity/code-input
```

```ts {file="schemaTypes/index.ts" copy=true}
import {postType} from './postType'

export const schemaTypes = [postType]
```

### 服务器设置

遗憾的是，Sanity 的 API 不支持 [RFC 7234][]，而且即使数据没有变化，它的输出也会变。因此推荐的设置是使用它们带缓存的 `apicdn` 端点（见上文），再在 Hugo 配置里安排合理的轮询与文件缓存策略，例如：

```toml
[HTTPCache]
  [[HTTPCache.polls]]
    disable = false
    low = '30s'
    high = '3m'
    [HTTPCache.polls.for]
      includes = ['https://*.*.sanity.io/**']

[caches.getresource]
    dir    = ':cacheDir/:project'
    maxAge = "5m"
```

上面的轮询配置在运行服务器或监听模式时生效，并在你向 Sanity 推送新内容时触发重新构建。

更精细的控制参见 [resources.GetRemote 中的缓存][]。

## 完整示例：把 Portable Text 转成 Markdown

关键点先说：**直接传模板里用 `slice (dict …)` 造出来的数组会报错**（实测 `error calling PortableText: unsupported type []map[string]interface {}`），因为它的具体类型是 `[]map[string]interface{}`，而函数要的是从 JSON 解析出来的 `[]any`。稳妥的写法是先 `jsonify` 再 `transform.Unmarshal`：

```go-html-template {file="layouts/_partials/pt.html"}
{{ $pt := slice
  (dict "_type" "block" "style" "normal" "children" (slice
    (dict "_type" "span" "text" "Hello " "marks" (slice))
    (dict "_type" "span" "text" "World" "marks" (slice))))
}}
<p>{{ $pt | jsonify | transform.Unmarshal | transform.PortableText }}</p>

{{ $h := slice (dict "_type" "block" "style" "h2" "children" (slice
  (dict "_type" "span" "text" "标题" "marks" (slice)))) }}
<p>{{ $h | jsonify | transform.Unmarshal | transform.PortableText }}</p>

{{ $c := slice (dict "_type" "code" "language" "go" "code" "fmt.Println(1)") }}
<p>{{ $c | jsonify | transform.Unmarshal | transform.PortableText }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>Hello World
</p>
<p>## 标题
</p>
<p>```go
fmt.Println(1)
```
</p>
```

**你应当看到什么**：`normal` block 合并成一个段落；`h2` block 变成 `## 标题`；`code` block 变成带语言标记的围栏代码块——全都是 **Markdown 文本**，需要再经 Hugo 渲染才会变成最终 HTML（上游 NOTE 说明的正是这一点：转换发生在传给 Hugo 之前，所以链接、标题、图片、代码块都能被渲染钩子接管）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| 经 JSON 解析得到的 Portable Text 数组（`[]any`） | Markdown 字符串，如 `Hello World\n`、`## 标题\n`、`` ```go\nfmt.Println(1)\n``` `` | 否 |
| 单个 block 映射（`dict "_type" "block" …`） | 同样得到 Markdown（实测 `Hello`） | 否 |
| 模板里用 `slice (dict …)` 造出的数组（类型 `[]map[string]interface {}`） | —— | 是：`error calling PortableText: unsupported type []map[string]interface {}` |
| 返回类型 | `string`（Markdown 文本） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `unsupported type []map[string]interface {}` | 模板造出的切片类型与函数期望的 `[]any` 不符 | 过一遍 `\| jsonify \| transform.Unmarshal`（见完整示例），数据来自 API 时本来就会是 `[]any` |
| 没报错但结果不对 | 页面上出现字面的 `## 标题`、`` ```go `` | 返回值是 Markdown，没有经过渲染 | 交给页面渲染管线（`.Content`）或 [`transform.Markdownify`](/functions/transform/markdownify/) |
| 没报错但结果不对 | 图片/链接样式不对 | 上游已说明图片处理是基础的（用 `asset.url` + `asset.altText`） | 用[图像渲染钩子][]精细控制 |
| 没报错但结果不对 | 代码块没有文件名标题 | 文件名会作为 Markdown 属性传入，需要渲染钩子支持 | 检查代码块渲染钩子是否读取了属性 |

更多排查入口见[故障排查](/troubleshooting/)。

[Portable Text]: https://www.portabletext.org/
[RFC 7234]: https://tools.ietf.org/html/rfc7234
[Sanity]: https://www.sanity.io/
[code-input]: https://www.sanity.io/plugins/code-input
[resources.GetRemote 中的缓存]: /functions/resources/getremote/#缓存
[内容适配器]: /content-management/content-adapters/
[图像渲染钩子]: /render-hooks/images/
[渲染钩子]: /render-hooks/
