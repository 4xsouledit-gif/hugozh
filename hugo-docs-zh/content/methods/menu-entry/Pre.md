+++
title = "Pre"
linkTitle = "Pre"
description = "返回给定菜单条目的 `pre` 属性。"
date = 2026-10-02
weight = 120
source = "https://gohugo.io/methods/menu-entry/pre/"

[params.functions_and_methods]
signatures = ["MENUENTRY.Pre"]
returnType = "template.HTML"
+++

在下面的项目配置中，我们启用了 [emoji 短代码][]的渲染，并在每个菜单条目的前面（pre）和后面（post）各添加一个 emoji 短代码：

```toml
enableEmoji = true

[[menus.main]]
name = 'About'
pageRef = '/about'
post = ':point_left:'
pre = ':point_right:'
weight = 10

[[menus.main]]
name = 'Contact'
pageRef = '/contact'
post = ':arrow_left:'
pre = ':arrow_right:'
weight = 20
```

要渲染该菜单：

```go-html-template
<ul>
  {{ range .Site.Menus.main }}
    <li>
      {{ .Pre | markdownify }}
      <a href="{{ .URL }}">{{ .Name }}</a>
      {{ .Post | markdownify }}
    </li>
  {{ end }}
</ul>
```

[emoji 短代码]: /quick-reference/emojis/
