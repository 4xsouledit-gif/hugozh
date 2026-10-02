+++
title = "表格"
linkTitle = "表格"
description = "创建表格渲染钩子，遍历表头与表体单元格覆盖 Markdown 表格到 HTML 的转换；含对齐取值与结构遗漏的风险。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/render-hooks/tables/"

[params.teach]
difficulty = "参考"
time = "10–15 分钟"
prereq = [
  "读过[简介](/render-hooks/introduction/)，知道钩子模板要放在 `layouts/_markup/`、文件名怎么取。",
  "能看懂 Go 模板里的双层 `range` 循环（外层行、内层单元格）。",
]
outcomes = [
  "写出一个与 Hugo 默认行为一致的 `render-table.html`，并会按需要加 `class`、`scope` 等结构；",
  "说清 `THead`／`TBody` 的「切片的切片」结构，以及 `Alignment` 为空字符串时该怎么处理；",
  "知道表格钩子只要漏掉表头或表体，页面结构就会不完整——而且不会有任何报错。",
]
next = ["/render-hooks/passthrough/", "/render-hooks/introduction/", "/content-management/markdown-attributes/"]

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

实测（Hugo 0.167，本站）：本站 `hugo.toml` 里 `[markup.goldmark.parser.attribute] block = true`，因此表格下方独立一行的 `{.no-wrap-first-col}` 这类块级属性在表格钩子里可以通过 `.Attributes` 取到。不开这项时，那一行会被当成表格的数据行渲染成垃圾文本——这也是本站必须打开它的原因。

## 表格单元格

`THead` 与 `TBody` 返回的是「切片的切片」，其中每个表格单元格具有以下字段：

`Alignment`
: （`string`）单元格内文本的对齐方式，取值为 `left`、`center` 或 `right`。

`Text`
: （`template.HTML`）单元格内的文本。

## 示例

默认配置下，Hugo 按 [GitHub 风格 Markdown 规范](https://github.github.com/gfm/#tables-extension-)渲染 Markdown 表格。要写出行为一致的渲染钩子：

```go-html-template {file="layouts/_markup/render-table.html"}
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

### 边界情况

- **`.Alignment` 是空字符串**表示这一列没有显式对齐要求（Markdown 分隔行里写的是 `---` 而不是 `:---`）。示例用 `with` 判断后再输出 `style`，正是为了避免产生多余的 `style=""`。
- **`.Attributes` 里值为空字符串的键会被跳过**（示例里的 `{{- if $v }}`）。这是必要的：否则会输出 `class=""` 这样的空属性。
- **`.Text` 已经是 `template.HTML`**，直接输出即可，不要再套 `htmlEscape`——那会把单元格里的 `<code>`、`<a>` 变成可见的标签文本。
- **表体为空时**，`range .TBody` 什么都不输出，但模板仍然会写出 `<tbody></tbody>`；这在 HTML 里是合法的，目录与样式不受影响。
- **确有必要拼接属性时**，必须像示例那样通过 `safeHTMLAttr` 处理，否则引号会被转义成 `&#34;`（见[简介的三种值类型](/render-hooks/introduction/#钩子模板输出的三种值类型)）。

## 使用要点

模板对 `THead` 与 `TBody` 各做一次外层遍历得到行，再对每一行做一次内层遍历得到单元格，因此表头与表体的结构完全由模板决定：可以给表头行加 `scope` 属性、给表格外层加 `class`，或者按列拆分渲染。

`Alignment` 为空字符串时表示该列没有显式对齐要求，上例用 `with` 判断后再输出 `style`，避免产生多余的空属性。单元格内容已经是 `template.HTML`，直接输出即可；确有必要拼接属性时，应像上例那样通过 `safeHTMLAttr` 处理，以免属性被转义。

只要提供了表格钩子，输出的 `<table>` 结构就由模板负责，表头、表体与单元格都不能遗漏，否则页面结构会不完整。

**「不能遗漏」具体指什么**：默认渲染会输出 `<thead>`、`<tbody>` 以及每个单元格的 `<th>`／`<td>`。一旦自己接管，模板少写哪个标签，页面上就少哪一段结构——例如只写了 `range .TBody`，表头整个消失，表格的第一行被当成数据行。Hugo 不会校验你的 HTML 是否完整，**构建照样成功**。

给表头单元格补 `scope="col"` 是一个低成本、收益明确的做法：屏幕阅读器据此知道该单元格是列标题，表格的可访问性会明显变好。把 `THead` 里输出的 `<th>` 改成：

```go-html-template {file="layouts/_markup/render-table.html"}
<th scope="col"
  {{- with .Alignment }}
    {{- printf " style=%q" (printf "text-align: %s" .) | safeHTMLAttr }}
  {{- end -}}
>
  {{- .Text -}}
</th>
```

## 什么时候用，什么时候别用

**该用**：

- 给全站表格统一套一层可横向滚动的容器，或统一的 `class`；
- 给表头单元格补 `scope="col"`，改善可访问性；
- 让内容侧可以用 `{.no-wrap-first-col}` 这样的属性开关控制某张表格的呈现；
- 按列渲染不同结构（例如首列输出为行标题 `<th scope="row">`）。

**别用**：

- 只想改表格的边框、斑马纹、字号——CSS 就够了；
- 只想改**某一章**里的表格——用分区级的 `_markup` 目录，或直接写 HTML；
- 想给表格加排序、筛选——那是前端脚本的事，钩子只输出静态 HTML。

## 验证与常见坑

**验证方法**：写一个与默认行为一致的钩子，构建后确认结构完整。

```bash
hugo --ignoreCache --destination tmp-out
```

```bash
# Linux / macOS
grep -c '<thead>\|<tbody>' tmp-out/posts/example/index.html
```

```powershell
# Windows PowerShell
(Select-String -Path tmp-out\posts\example\index.html -Pattern '<thead>|<tbody>' -AllMatches).Matches.Count
```

**你应当看到什么**：每个 Markdown 表格都同时有 `<thead>` 与 `<tbody>`；表头里的单元格是 `<th>`，表体里的是 `<td>`；有 `.Attributes` 时属性出现在 `<table>` 上而不是单元格上。三者缺一，就是模板漏了结构。

三类典型问题：

| 类别 | 现象 | 原因与修法 |
| --- | --- | --- |
| 钩子没生效 | 没有报错，表格和以前一样 | 文件名或位置不对；到[简介的排查表](/render-hooks/introduction/#配错时的典型报错与常见坑)逐条核对 |
| 没报错但结果不对 | 表头整行消失，或表格只剩表头没有数据 | 模板漏了 `range .THead` 或 `range .TBody`；注意 `THead`、`TBody` 的大小写不能写错 |
| 没报错但结果不对 | 单元格里出现 `&#34;`，或 `<code>` 变成了可见文本 | 属性没套 `safeHTMLAttr`，或把 `template.HTML` 的 `.Text` 又转义了一遍 |
| 没报错但结果不对 | 表格下方多出一行 `{.no-wrap-first-col}` 文本 | 站点没开 `[markup.goldmark.parser.attribute] block = true`，块级属性没被解析 |
| 报错看不懂 | 报错带模板文件名与行号 | 模板里双层 `range` 少写了 `{{ end }}`；每个 `range` 都要有自己的 `{{ end }}` |

更多相关问题见[故障排查](/troubleshooting/)；表格属性的写法见 [Markdown 属性](/content-management/markdown-attributes/)。

## PageInner details

`PageInner` 的主要用途是相对于被包含的页面来解析链接与页面资源。例如可以创建一个「包含」短代码，用多个内容文件拼装一个页面，同时为脚注与目录保留全局上下文：先用位置参数取出要包含的页面逻辑路径，再调用该页面的 [`RenderShortcodes`](/methods/page/rendershortcodes/) 方法，取不到页面时用 `errorf` 报错。

```go-html-template {file="layouts/_shortcodes/include.html"}
{{ with .Get 0 }}
  {{ with $.Page.GetPage . }}
    {{- .RenderShortcodes }}
  {{ else }}
    {{ errorf "The %q shortcode was unable to find %q. See %s" $.Name . $.Position }}
  {{ end }}
{{ else }}
  {{ errorf "The %q shortcode requires a positional parameter indicating the logical path of the file to include. See %s" .Name .Position }}
{{ end }}
```

然后在 Markdown 中用 Markdown 记法调用这个短代码，被包含页面的路径写在位置参数里。

```md {file="content/posts/post-1.md"}
{{%/* include "/posts/post-2" */%}}
```

渲染 `/posts/post-2` 时触发的任何渲染钩子，调用 `Page` 会得到 `/posts/post-1`，调用 `PageInner` 则会得到 `/posts/post-2`。

`PageInner` 在不适用时会回退为 `Page` 的值，并且始终有返回值。它只对调用 `RenderShortcodes` 方法的短代码有意义，并且必须以 Markdown 记法调用该短代码。
