+++
title = "菜单模板"
linkTitle = "菜单模板"
description = "在模板中遍历菜单项，渲染平铺或嵌套的导航结构。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/templates/menu/"
+++

## 概览

先[定义菜单项](/content-management/menus/)，再用菜单方法渲染菜单。Hugo 在 `site.Menus` 上暴露所有菜单，例如 `site.Menus.main`、`site.Menus.footer`。

决定渲染方式的因素有三个：

1. 菜单项的定义方式：自动生成、写在前置元数据中、写在项目配置中；
1. 菜单结构：平铺还是嵌套；
1. 菜单项的[本地化方式](/content-management/multilingual/)：项目配置或翻译表。

下面的示例把这些组合都考虑在内。

## 示例

这个**局部模板（partial）**递归「遍历」菜单结构，渲染出经过本地化、且具备可访问性的嵌套列表：

```go-html-template {file="layouts/_partials/menu.html"}
{{- $page := .page }}
{{- $menuID := .menuID }}

{{- with index site.Menus $menuID }}
  <nav>
    <ul>
      {{- partial "inline/menu/walk.html" (dict "page" $page "menuEntries" .) }}
    </ul>
  </nav>
{{- end }}

{{- define "_partials/inline/menu/walk.html" }}
  {{- $page := .page }}
  {{- range .menuEntries }}
    {{- $attrs := dict "href" .URL }}
    {{- if $page.IsMenuCurrent .Menu . }}
      {{- $attrs = merge $attrs (dict "class" "active" "aria-current" "page") }}
    {{- else if $page.HasMenuCurrent .Menu . }}
      {{- $attrs = merge $attrs (dict "class" "ancestor" "aria-current" "true") }}
    {{- end }}
    {{- $name := .Name }}
    {{- with .Identifier }}
      {{- with T . }}
        {{- $name = . }}
      {{- end }}
    {{- end }}
    <li>
      <a
        {{- range $k, $v := $attrs }}
          {{- with $v }}
            {{- printf " %s=%q" $k $v | safeHTMLAttr }}
          {{- end }}
        {{- end -}}
      >{{ $name }}</a>
      {{- with .Children }}
        <ul>
          {{- partial "inline/menu/walk.html" (dict "page" $page "menuEntries" .) }}
        </ul>
      {{- end }}
    </li>
  {{- end }}
{{- end }}
```

要点如下：

- 用 `index site.Menus $menuID` 取出指定 ID 的菜单，菜单不存在时 `with` 会跳过整段输出；
- `.IsMenuCurrent` 判断当前页是否就是该菜单项，命中时加上高亮属性；`.HasMenuCurrent` 判断当前页是否位于该菜单项的子层级中，命中时标记为祖先项，两者常常配合使用；
- `.Identifier` 优先作为翻译表的键交给 `T` 函数处理，取不到翻译结果时回退到 `.Name`，这就是菜单项本地化的实现方式；
- `.Children` 返回子菜单项集合，递归调用同一个模板即完成嵌套渲染。

调用上面的局部模板，传入菜单 ID 和当前页面：

```go-html-template {file="layouts/page.html"}
{{ partial "menu.html" (dict "menuID" "main" "page" .) }}
{{ partial "menu.html" (dict "menuID" "footer" "page" .) }}
```

## 页面引用

无论菜单项以何种方式定义，只要它指向某个页面，就能通过 `.Page` 拿到该页面的上下文，从而读取页面参数。比如在每个菜单项的名称后面显示页面参数 `version`：

```go-html-template {file="layouts/page.html"}
{{- range site.Menus.main }}
  <a href="{{ .URL }}">
    {{ .Name }}
    {{- with .Page }}
      {{- with .Params.version -}}
        ({{ . }})
      {{- end }}
    {{- end }}
  </a>
{{- end }}
```

写这类模板时要防御性地使用 `with` 或 `if`，因为存在两种例外：菜单项指向的是外部资源，此时没有关联页面；或者关联页面并没有定义 `version` 参数，直接取值会得到空值。

## 菜单项参数

在项目配置或前置元数据中定义菜单项时，可以附带 `params` 键。下面这个例子为每个链接元素渲染一个 `class` 属性：

```go-html-template {file="layouts/_partials/menu.html"}
{{- range site.Menus.main }}
  <a {{ with .Params.class -}} class="{{ . }}" {{ end -}} href="{{ .URL }}">
    {{ .Name }}
  </a>
{{- end }}
```

同样要防御性地处理 `params.class` 未定义的菜单项，用 `with` 判断之后再输出属性，避免渲染出空的 `class`。

## 本地化

Hugo 提供两种菜单项本地化方法，详见[多语言](/content-management/multilingual/)章节：在项目配置中为每种语言分别定义菜单项，或者用翻译表按键查找名称。
