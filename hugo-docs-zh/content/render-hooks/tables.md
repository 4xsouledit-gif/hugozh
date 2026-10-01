+++
title = "表格"
linkTitle = "表格"
description = "创建表格渲染钩子，遍历表头与表体单元格，覆盖 Markdown 表格到 HTML 的转换。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/render-hooks/tables/"
+++

## 上下文

表格**渲染钩子**模板接收以下上下文：

`Attributes`
: （`map`）[Markdown 属性](/content-management/markdown-attributes/)，需要按下面的方式配置站点后才可用：

  ```toml
  [markup.goldmark.parser.attribute]
  block = true
  ```

`Ordinal`
: （`int`）表格在页面中的序号，从 0 开始。

`Page`
: （`page`）当前页面的引用。

`PageInner`
: （`page`）通过 `RenderShortcodes` 方法嵌套的页面的引用。详见下文 [PageInner details](#pageinner-details)。

`Position`
: （`string`）表格在页面内容中的位置。

`THead`
: （`slice`）表头行的切片，其中每个元素是一行单元格的切片。

`TBody`
: （`slice`）表体行的切片，其中每个元素是一行单元格的切片。

## 表格单元格

`THead` 与 `TBody` 返回的是「切片的切片」，其中每个表格单元格具有以下字段：

`Alignment`
: （`string`）单元格内文本的对齐方式，取值为 `left`、`center` 或 `right`。

`Text`
: （`template.HTML`）单元格内的文本。

## 示例

默认配置下，Hugo 按 [GitHub 风格 Markdown 规范](https://github.github.com/gfm/#tables-extension-)渲染 Markdown 表格。要写出行为一致的渲染钩子：

```go-html-template
<table
  {{- range $k, $v := .Attributes }}
    {{- if $v }}
      {{- printf " %s=%q" $k $v | safeHTMLAttr }}
    {{- end }}
  {{- end }}>
  <thead>
    {{- range .THead }}
      <tr>
        {{- range . }}
          <th
            {{- with .Alignment }}
              {{- printf " style=%q" (printf "text-align: %s" .) | safeHTMLAttr }}
            {{- end -}}
          >
            {{- .Text -}}
          </th>
        {{- end }}
      </tr>
    {{- end }}
  </thead>
  <tbody>
    {{- range .TBody }}
      <tr>
        {{- range . }}
          <td
            {{- with .Alignment }}
              {{- printf " style=%q" (printf "text-align: %s" .) | safeHTMLAttr }}
            {{- end -}}
          >
            {{- .Text -}}
          </td>
        {{- end }}
      </tr>
    {{- end }}
  </tbody>
</table>
```

## 使用要点

模板对 `THead` 与 `TBody` 各做一次外层遍历得到行，再对每一行做一次内层遍历得到单元格，因此表头与表体的结构完全由模板决定：可以给表头行加 `scope` 属性、给表格外层加 `class`，或者按列拆分渲染。

`Alignment` 为空字符串时表示该列没有显式对齐要求，上例用 `with` 判断后再输出 `style`，避免产生多余的空属性。单元格内容已经是 `template.HTML`，直接输出即可；确有必要拼接属性时，应像上例那样通过 `safeHTMLAttr` 处理，以免属性被转义。

只要提供了表格钩子，输出的 `<table>` 结构就由模板负责，表头、表体与单元格都不能遗漏，否则页面结构会不完整。
