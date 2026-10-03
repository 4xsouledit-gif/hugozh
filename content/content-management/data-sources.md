+++
title = "数据源"
linkTitle = "数据源"
description = "用 data 目录与各类资源中的数据增强或生成内容；含配置位置、取值方法、返回值边界与常见坑。"
date = 2026-10-01
weight = 245
source = "https://gohugo.io/content-management/data-sources/"

[params.teach]
difficulty = "进阶"
time = "15–20 分钟"
prereq = [
  "会写 `go-html-template`，知道 `assets/`、`content/`、`data/` 三个目录的区别。",
  "读过[页面资源](/content-management/page-resources/)，知道 `.Resources` 是什么。",
]
outcomes = [
  "把 JSON/TOML/YAML 数据放进 `data/` 目录并在模板里读出来；",
  "用 `transform.Unmarshal` 解析 CSV 等不能放进 `data/` 的格式；",
  "判断一份数据该放 `data/`、`assets/` 还是页面包里；",
  "预判取不到数据、字段缺失时模板会怎样，而不是靠报错猜。",
]
next = ["/methods/site/data/", "/functions/transform/unmarshal/", "/content-management/content-adapters/"]

+++

## 这一页解决什么问题

Hugo 可以访问并解析本地与远程数据源，支持的格式包括 CSV、JSON、TOML、YAML 与 XML。用这些数据可以增强既有内容，也可以创建新内容。

数据源可以是 `data` 目录中的一个文件，也可以是全局资源、页面资源或远程资源。

选哪一类，决定了三件事：**放在哪个目录、模板里怎么取、构建时会不会占内存**。本页逐类给出答案，并在[常见坑](#常见坑)里集中列出「取到的值是空的」这类现象的原因。

**验证数据是否读到的最快方法**：模板里直接打印。

```go-html-template
<pre>{{ printf "%v" hugo.Data }}</pre>
```

**你应当看到什么**：`data/` 下每个文件的**文件名（不含扩展名）**成为一个顶层键。例如 `data/foo.json` 的内容是 `{"bar":"baz"}`，上面会打印出 `map[foo:map[bar:baz]]`，而 `{{ hugo.Data.foo.bar }}` 输出 `baz`。文件名里有连字符时不能用点号连接，要写 `{{ index hugo.Data.foo "bar-baz" }}`。

## data 目录

项目根目录下的 `data` 目录可以包含一个或多个数据文件，文件既可平铺也可嵌套成树。Hugo 会把这些数据文件合并成一个数据结构，用 `Site` 对象的 `Data` 方法访问，因此在模板中通过 `.Site.Data` 即可取用全部数据。例如 `data/foo.json` 中的内容对应 `.Site.Data.foo`。

> [!WARNING]
> **实测（Hugo 0.167）**：`.Site.Data` 会打印一条弃用警告——`deprecated: .Site.Data was deprecated in Hugo v0.156.0 and will be removed in a future release. Use hugo.Data instead`。它目前仍可用，但新写模板请用等价的 `hugo.Data`（写法与取值完全相同：`hugo.Data.foo`），免得升级后突然失效。

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

- `data` 目录中的数据文件会在构建开始时被合并成一个数据结构并常驻内存，模板里用 `.Site.Data`（推荐改写成 `hugo.Data`）直接读取，适合站点级、需要频繁访问的小型数据。
- 全局资源、页面资源与远程资源不会被预先合并，需要用 `transform.Unmarshal` 解析，因此更适合访问频率不高的数据。
- CSV 不能放在 `data` 目录中，只能作为页面资源、全局资源或远程资源使用。
- 页面资源属于某个页面，与页面一起参与页面包的资源查找；`data` 目录中的数据则与具体页面无关。

## 创建新内容

若要在构建时动态生成新页面，请使用[内容适配器](/content-management/content-adapters/)。

## 什么时候用哪种数据源

| 情形 | 该用 | 理由 |
| --- | --- | --- |
| 站点级的配置型数据（导航、团队成员、站点常量），构建时要反复读 | `data/` 目录 | 构建开始时合并成一个结构并常驻内存，读取零成本 |
| 一份数据只服务某一个页面（该页的表格、图表数据） | 页面资源（放进页面包） | 与页面同生命周期，删页面即删数据，不会留下孤儿文件 |
| 较大的数据文件（图片清单、长表格），只在个别页面用到 | `assets/` + `resources.Get` | 不常驻内存，按需解析；还能交给资源管道处理 |
| CSV / XML 等格式 | 资源（页面、全局或远程） | **CSV 不能放进 `data/` 目录**，见上面的提示 |
| 数据来自网络、构建时抓取 | `resources.GetRemote` | 带缓存与超时控制，构建可复现 |
| **别用**：把 CSV 放进 `data/` | —— | 官方明确不支持，Hugo 不会把它解析成表格 |
| **别用**：为了一份只用一次的大数据而全部塞进 `data/` | —— | 会常驻内存、拖慢每一次构建；改用资源按需解析 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `{{ hugo.Data.foo }}` 输出空白或 `<nil>` | 文件名与键名不一致（`data/foo.json` 的键是 `foo`，不是 `foo.json`）；或文件不在项目根的 `data/` 下 | 用 `{{ printf "%v" hugo.Data }}` 打印整个结构，核对顶层键名 |
| 没报错但结果不对 | 数据里的某个字段取不到 | 键名含连字符或大写，用点号连接取不到 | 用 `index` 取值，例如 `{{ index hugo.Data.foo "bar-baz" }}` |
| 没报错但结果不对 | CSV 放进 `data/` 后完全读不出来 | `data/` 目录不支持 CSV | 把 CSV 移到 `assets/` 或页面包，用 `resources.Get` / `.Resources.Get` 配合 `transform.Unmarshal` |
| 没报错但结果不对 | 项目与主题都有同名数据文件，取到的是「别人的」 | 主题与模块的 `data/` 会合并进来，项目根目录的优先 | 主题作者应把数据放进以主题名命名的子目录做命名空间 |
| 没报错但结果不对 | 构建明显变慢 | 大数据文件放在了 `data/`，每次构建都会读入内存并常驻 | 把不常访问的数据改成全局资源或页面资源 |
| 报错看不懂 | 终端出现 `deprecated: .Site.Data` | 用了旧写法（0.156.0 起弃用） | 改成 `hugo.Data`，取值方式不变 |
| 报错看不懂 | `transform.Unmarshal` 报解析失败 | 资源取到了但格式不匹配（例如把 TOML 内容按 JSON 解析），或文件为空 | 先用 `{{ . }}` 打印原始内容确认取到的是哪个文件，再核对格式 |

更多排查入口见[故障排查](/troubleshooting/)。
