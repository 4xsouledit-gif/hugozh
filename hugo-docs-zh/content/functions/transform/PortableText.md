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

[resources.GetRemote 中的缓存]: /functions/resources/getremote/#缓存
[Portable Text]: https://www.portabletext.org/
[RFC 7234]: https://tools.ietf.org/html/rfc7234
[Sanity]: https://www.sanity.io/
[code-input]: https://www.sanity.io/plugins/code-input
[内容适配器]: /content-management/content-adapters/
[图像渲染钩子]: /render-hooks/images/
[渲染钩子]: /render-hooks/
