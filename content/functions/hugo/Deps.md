+++
title = "hugo.Deps"
linkTitle = "hugo.Deps"
description = "返回项目依赖的切片，依赖可以是模块，也可以是本地主题组件。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/hugo/deps/"

[params.functions_and_methods]
signatures = ["hugo.Deps"]
returnType = "[]hugo.Dependency"
+++

## 这一页解决什么问题

「为什么我的 partial 还是旧版主题的？」「这个模块是谁引入的？」——依赖解析出问题时，你需要看到 Hugo **实际加载了哪些依赖**，以及每个依赖是被谁引入的。`hugo.Deps` 返回项目依赖的切片：模块（module）与 `themes/` 下的本地主题组件都会出现在里面，站点自身也会作为一个条目出现。

## 什么时候用，什么时候别用

**该用**：

- 调试「主题/模块到底加载了没有、是哪个版本」；
- 在调试页列出依赖清单，方便贴进 issue。

**别用**：

- 想列出**内容页面** → 用 `site.RegularPages` 之类；
- 想读站点配置 → 用 `hugo config` 命令或站点参数，本函数只返回依赖信息；
- 想标识站点仓库的提交 → 用 `enableGitInfo` + `.GitInfo`。

实测补充：即使是纯本地主题（`themes/mytheme`），也会出现在列表中，其 `.Owner.Path` 就是引入它的模块（站点自身 `project`）；本地依赖没有版本号与时间，`.Version`/`.Time` 为空。

## 用法

`hugo.Deps` 函数返回项目依赖的切片，依赖可以是模块，也可以是本地主题组件。

## 方法

在 `hugo.Deps` 返回的每个 `hugo.Dependency` 对象上使用以下方法。

`Owner`
: （`hugo.Dependency`）在依赖树中，这是第一个把当前模块声明为依赖的模块（例如 `github.com/gohugoio/hugo-mod-bootstrap-scss/v5`）。

`Path`
: （`string`）返回模块路径，或 `themes` 目录下的路径（例如 `github.com/gohugoio/hugo-mod-jslibs-dist/popperjs/v2`）。

`Replace`
: （`hugo.Dependency`）返回替换当前依赖的那个依赖。

`Time`
: （`time.Time`）返回该版本的创建时间（例如 `2022-02-13 15:11:28 +0000 UTC`）。

`Vendor`
: （`bool`）报告该依赖是否被 vendor（内置于项目）。

`Version`
: （`string`）返回模块版本（例如 `v2.21100.20000`）。

## 示例

下面是一个列出依赖的表格示例：

```go-html-template
<h2>Dependencies</h2>
<table class="table table-dark">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Owner</th>
      <th scope="col">Path</th>
      <th scope="col">Version</th>
      <th scope="col">Time</th>
      <th scope="col">Vendor</th>
    </tr>
  </thead>
  <tbody>
    {{ range $index, $element := hugo.Deps }}
    <tr>
      <th scope="row">{{ add $index 1 }}</th>
      <td>{{ with $element.Owner }}{{ .Path }}{{ end }}</td>
      <td>
        {{ $element.Path }}
        {{ with $element.Replace }}
        => {{ .Path }}
        {{ end }}
      </td>
      <td>{{ $element.Version }}</td>
      <td>{{ with $element.Time }}{{ . }}{{ end }}</td>
      <td>{{ $element.Vendor }}</td>
    </tr>
    {{ end }}
  </tbody>
</table>
```

## 完整示例：一个本地主题的依赖清单

项目结构：站点自身 + `themes/mytheme`（本地主题组件），`hugo.toml` 里写 `theme = "mytheme"`。

```toml {file="hugo.toml"}
baseURL = "https://example.org/"
theme = "mytheme"
```

用上游那份表格模板（`layouts/index.html`）渲染，在本机（Hugo 0.167.0 extended，Windows）实测 `hugo --source <临时目录> --ignoreCache` 后，表格主体为：

```html
    <tr>
      <th scope="row">1</th>
      <td></td>
      <td>
        project
        
      </td>
      <td></td>
      <td></td>
      <td>false</td>
    </tr>
    
    <tr>
      <th scope="row">2</th>
      <td>project</td>
      <td>
        mytheme
        
      </td>
      <td></td>
      <td></td>
      <td>false</td>
    </tr>
```

**你应当看到什么**：两条记录。第一条是站点自身（`Path` 为 `project`，没有 owner）；第二条是本地主题 `mytheme`，它的 `Owner` 是 `project`，而 `Version`、`Time` 两栏为空（本地组件没有模块版本），`Vendor` 为 `false`。删除 `theme = "mytheme"` 后只剩一条 `project`（实测）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点（含一个本地主题）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 无主题、无模块 | 长度 1：只有站点自身（`Path` 为 `project`） | 否 |
| `themes/` 下有一个本地主题 | 长度 2：`project` + 该主题（`.Owner.Path` 为 `project`） | 否 |
| 本地依赖的 `.Version` / `.Time` | 空字符串 / 空（`with` 不渲染） | 否 |
| `.Vendor` | `false` | 否 |
| 元素类型（`printf "%T"`） | `*hugo.Dependency`（返回类型为 `[]*hugo.Dependency`，签名写作 `[]hugo.Dependency`） | 否 |
| 传入参数 `{{ hugo.Deps "x" }}` | —— | 是：`wrong number of args for Deps: want 0 got 1` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 列表里没有你刚加的主题 | 主题没在 `theme` 里启用，或路径不在 `themes/` 下 | 确认 `hugo.toml` 的 `theme`/`module.imports` 配置，再重新构建 |
| 没报错但结果不对 | 本地主题的 `Version` 一栏始终为空 | 本地组件没有模块版本号（实测），只有远程模块才有 | 本地依赖用 `.Path` 标识，不要期待版本号 |
| 没报错但结果不对 | 把 `project` 当成第三方依赖 | 站点自身也是一个依赖条目 | 需要过滤时判断 `.Owner` 是否为空，或跳过 `Path == "project"` |
| 报错看不懂 | `wrong number of args for Deps: want 0 got 1` | 给它传了参数 | 它无参数，直接写 `{{ hugo.Deps }}` |

更多排查入口见[故障排查](/troubleshooting/)。

