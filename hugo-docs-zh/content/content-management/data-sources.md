+++
title = "数据源"
linkTitle = "数据源"
description = "用 data 目录与各类资源中的数据增强或生成内容。"
date = 2026-10-01
weight = 245
source = "https://gohugo.io/content-management/data-sources/"
+++

## 概述

Hugo 可以访问并解析本地与远程数据源，支持的格式包括 CSV、JSON、TOML、YAML 与 XML。用这些数据可以增强既有内容，也可以创建新内容。

数据源可以是 `data` 目录中的一个文件，也可以是全局资源、页面资源或远程资源。

## data 目录

项目根目录下的 `data` 目录可以包含一个或多个数据文件，文件既可平铺也可嵌套成树。Hugo 会把这些数据文件合并成一个数据结构，用 `Site` 对象的 `Data` 方法访问，因此在模板中通过 `.Site.Data` 即可取用全部数据。例如 `data/foo.json` 中的内容对应 `.Site.Data.foo`。

Hugo 还会把主题与模块中的 `data` 目录合并进同一个数据结构，其中项目根目录下的 `data` 目录优先级最高。

> [!NOTE]
> Hugo 会把合并后的数据结构读入内存，并在整个构建过程中保留。访问频率低的数据，请改用全局资源或页面资源。

主题与模块作者可以用子目录为数据文件加命名空间，避免与其他来源冲突。例如：

```tree
project/
└── data/
    └── mytheme/
        └── foo.json
```

> [!NOTE]
> 不要把 CSV 文件放进 `data` 目录，CSV 文件应作为页面资源、全局资源或远程资源访问。

## 全局资源

用 `resources.Get` 与 `transform.Unmarshal` 可以访问作为全局资源存在的数据文件。

## 页面资源

用 `Page` 对象的 `Resources.Get` 方法配合 `transform.Unmarshal`，可以访问作为页面资源存在的数据文件。

## 远程资源

用 `resources.GetRemote` 与 `transform.Unmarshal` 可以访问远程数据。

## 增强既有内容

数据源可以用来增强既有内容。例如，创建一个短代码，把全局 CSV 资源渲染成 HTML 表格。数据文件如下：

```csv
"name","type","breed","age"
"Spot","dog","Collie","3"
"Felix","cat","Malicious","7"
```

在内容文件中调用这个短代码：

```md
{{</* csv-to-table "pets.csv" */>}}
```

短代码模板如下：

```go-html-template
{{ with $file := .Get 0 }}
  {{ with resources.Get $file }}
    {{ with . | transform.Unmarshal }}
      <table>
        <thead>
          <tr>
            {{ range index . 0 }}
              <th>{{ . }}</th>
            {{ end }}
          </tr>
        </thead>
        <tbody>
          {{ range after 1 . }}
            <tr>
              {{ range . }}
                <td>{{ . }}</td>
              {{ end }}
            </tr>
          {{ end }}
        </tbody>
      </table>
    {{ end }}
  {{ else }}
    {{ errorf "The %q shortcode was unable to find %s. See %s" $.Name $file $.Position }}
  {{ end }}
{{ else }}
  {{ errorf "The %q shortcode requires one positional argument, the path to the CSV file relative to the assets directory. See %s" .Name .Position }}
{{ end }}
```

Hugo 渲染出的表格如下：

name|type|breed|age
:--|:--|:--|:--
Spot|dog|Collie|3
Felix|cat|Malicious|7

## data 目录与页面资源的区别

- `data` 目录中的数据文件会在构建开始时被合并成一个数据结构并常驻内存，模板里用 `.Site.Data` 直接读取，适合站点级、需要频繁访问的小型数据。
- 全局资源、页面资源与远程资源不会被预先合并，需要用 `transform.Unmarshal` 解析，因此更适合访问频率不高的数据。
- CSV 不能放在 `data` 目录中，只能作为页面资源、全局资源或远程资源使用。
- 页面资源属于某个页面，与页面一起参与页面包的资源查找；`data` 目录中的数据则与具体页面无关。

## 创建新内容

若要在构建时动态生成新页面，请使用[内容适配器](/content-management/content-adapters/)。
