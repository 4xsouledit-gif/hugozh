+++
title = "Params"
linkTitle = "Params"
description = "返回给定菜单条目的 `params` 属性。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/methods/menu-entry/params/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Params"]
returnType = "maps.Params"
+++

在[项目配置][]或[前置元数据][front matter]中定义菜单条目时，可以加入 `params` 键，为条目附加额外信息。例如：

```toml
[[menus.main]]
name = 'About'
pageRef = '/about'
weight = 10

[[menus.main]]
name = 'Contact'
pageRef = '/contact'
weight = 20

[[menus.main]]
name = 'Hugo'
url = 'https://gohugo.io'
weight = 30
[menus.main.params]
  rel = 'external'
```

使用下面的模板：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li>
      <a href="{{ .URL }}" {{ with .Params.rel }}rel="{{ . }}"{{ end }}>
        {{ .Name }}
      </a>
    </li>
  {{ end }}
</ul>
```

Hugo 渲染出：

```html
<ul>
  <li><a href="/about/">About</a></li>
  <li><a href="/contact/">Contact</a></li>
  <li><a href="https://gohugo.io" rel="external">Hugo</a></li>
</ul>
```

更多信息请参见[菜单模板][menu templates]一节。

[front matter]: /content-management/menus/#define-in-front-matter
[menu templates]: /templates/menu/#menu-entry-parameters
[项目配置]: /content-management/menus/
