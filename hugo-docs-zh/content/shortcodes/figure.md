+++
title = "figure"
linkTitle = "figure"
description = "用 figure 短代码在内容中插入 HTML figure 元素与图注。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/shortcodes/figure/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `figure` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 示例

正文里这样写：

```md
{{</* figure
  src="/images/examples/zion-national-park.jpg"
  alt="A photograph of Zion National Park"
  link="https://www.nps.gov/zion/index.htm"
  caption="Zion National Park"
  class="ma0 w-75"
*/>}}
```

Hugo 渲染出这样的 HTML：

```html
<figure class="ma0 w-75">
  <a href="https://www.nps.gov/zion/index.htm">
    <img
      src="/images/examples/zion-national-park.jpg"
      alt="A photograph of Zion National Park"
    >
  </a>
  <figcaption>
    <p>Zion National Park</p>
  </figcaption>
</figure>
```

## 参数

`src`
: （`string`）`img` 元素的 `src` 属性。取值通常是页面资源（page resource）或全局资源（global resource）。

`alt`
: （`string`）`img` 元素的 `alt` 属性。

`width`
: （`int`）`img` 元素的 `width` 属性。

`height`
: （`int`）`img` 元素的 `height` 属性。

`loading`
: （`string`）`img` 元素的 `loading` 属性。

`class`
: （`string`）`figure` 元素的 `class` 属性。

`link`
: （`string`）包裹 `img` 元素的锚点元素的 `href` 属性。

`target`
: （`string`）包裹 `img` 元素的锚点元素的 `target` 属性。

`rel`
: （`rel`）包裹 `img` 元素的锚点元素的 `rel` 属性。

`title`
: （`string`）在 `figurecaption` 元素内位于顶部，包裹在 `h4` 元素中。

`caption`
: （`string`）在 `figurecaption` 元素内位于底部，可以包含纯文本或 Markdown。

`attr`
: （`string`）在 `figurecaption` 元素内出现在图注旁边，可以包含纯文本或 Markdown。

`attrlink`
: （`string`）包裹署名文字的锚点元素的 `href` 属性。

## 图片位置

`figure` 短代码解析内部 Markdown 目标地址时，先查找匹配的页面资源（page resource），找不到时回退到匹配的全局资源（global resource）。远程地址原样传递，无法解析目标地址时不会抛出错误或警告。

全局资源必须放在 `assets` 目录。如果资源已经放在 `static` 目录，且不便或不愿迁移，就需要在项目配置中把该目录挂载到 `assets` 目录，即同时加入下面两段配置：

```toml
[[module.mounts]]
source = 'assets'
target = 'assets'

[[module.mounts]]
source = 'static'
target = 'assets'
```

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/figure.html
