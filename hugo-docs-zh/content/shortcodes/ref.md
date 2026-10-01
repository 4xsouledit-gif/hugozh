+++
title = "ref"
linkTitle = "ref"
description = "用 ref 短代码插入指向指定页面的永久链接，并说明参数与报错处理。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/shortcodes/ref/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `ref` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

> [!NOTE]
> 在 Markdown 内容中，这个短代码已经过时。要正确解析 Markdown 的链接目标地址，请改用[内置链接渲染钩子][]，或自行编写。
>
> 在默认配置下，Hugo 对多语言单主机（multilingual single-host）项目会自动使用内置链接渲染钩子，前提是[共享页面资源复制][]功能处于禁用状态，这也是此类项目的默认行为。如果项目、模块或主题定义了自定义链接渲染钩子，则会改用这些钩子。
>
> 也可以配置 Hugo 始终（`always`）使用内置链接渲染钩子、仅作兜底（`fallback`），或从不（`never`）使用，详见[内置链接渲染钩子][]。

## 用法

`ref` 短代码接受单个位置参数（路径），或者一个或多个命名参数，见下表。

## 参数

`path`
: （`string`）目标页面的路径。不以斜杠（`/`）开头的路径先相对当前页面解析，再相对站点其余部分解析。

`lang`
: （`string`）目标页面的语言。默认为当前语言。可选。

`outputFormat`
: （`string`）目标页面的输出格式。默认为当前输出格式。可选。

## 示例

`ref` 短代码的典型用途是为 Markdown 链接提供目标地址。

> [!NOTE]
> 调用这个短代码时，务必使用 [Markdown 写法][]。

下面的例子给出站点英文版页面上的渲染结果：

```md
[Link A]({{%/* ref "/books/book-1" */%}})

[Link B]({{%/* ref path="/books/book-1" */%}})

[Link C]({{%/* ref path="/books/book-1" lang="de" */%}})

[Link D]({{%/* ref path="/books/book-1" lang="de" outputFormat="json" */%}})
```

渲染结果：

```html
<a href="https://example.org/en/books/book-1/">Link A</a>

<a href="https://example.org/en/books/book-1/">Link B</a>

<a href="https://example.org/de/books/book-1/">Link C</a>

<a href="https://example.org/de/books/book-1/index.json">Link D</a>
```

## 错误处理

默认情况下，Hugo 无法解析路径时会抛出错误并让构建失败。可以在项目配置中改为警告，并指定无法解析路径时返回的地址：

```toml
refLinksErrorLevel = 'warning'
refLinksNotFoundURL = '/some/other/url'
```

[Markdown 写法]: /shortcodes/
[内置链接渲染钩子]: /render-hooks/
[共享页面资源复制]: /content-management/page-resources/
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/ref.html
