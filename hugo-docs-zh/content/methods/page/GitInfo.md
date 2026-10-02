+++
title = "GitInfo"
linkTitle = "GitInfo"
description = "返回给定页面的提交元数据。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/methods/page/gitinfo/"

[params.functions_and_methods]
signatures = ["PAGE.GitInfo"]
returnType = "*gitmap.GitInfo"
+++

## 这一页解决什么问题

`GitInfo` 把「这个文件在 Git 里的最后一次提交」交给模板：作者、邮箱、提交哈希、提交信息、提交时间。常见用途是页脚显示「最后由谁在什么时候更新」、给文章加编辑链接、把提交时间当作页面的日期。

## 什么时候用，什么时候别用

**该用**：

- 页脚显示最近一次提交（作者、日期、摘要）；
- 用提交时间驱动「最后更新」；
- 生成「在 GitHub 上编辑此页」链接。

**别用**：

- 只想显示页面日期 → 用 [`Date`](/methods/page/date/) / [`Lastmod`](/methods/page/lastmod/)；
- 站点没有 Git 或不想增加构建时间 → `GitInfo` 需要 `enableGitInfo = true` 且文件已被提交，否则为 `nil`；
- 想显示**代码所有者** → 用 [`CodeOwners`](/methods/page/codeowners/)。

## 用法

`Page` 对象上的 `GitInfo` 方法可以访问 Git 历史中的提交元数据，例如作者姓名、提交哈希与提交信息。

> [!NOTE]
> Hugo 的 Git 集成性能良好，但在大型项目中仍可能增加构建时间。

## 前置条件

安装 Git，创建仓库，并提交项目文件。

你还必须允许 Hugo 访问你的仓库，在项目配置中加入：

```toml
enableGitInfo = true
```

> [!NOTE]
> 把 [`enableGitInfo`][] 设为 `true` 时，每个内容页面的最后修改日期会自动取该文件最后一次提交的 Author Date。
>
> 这是可配置的。详见[说明][]。

## 作用范围

提交元数据既可用于本地仓库中存储的内容，也可用于[模块](g)提供的内容。

### 本地内容

Hugo 会为项目本地仓库中跟踪的文件获取提交元数据，其中包括主项目目录下由 Git 管理的所有内容文件。

### 模块内容

**（0.157.0 新增）**

Hugo 也会为模块提供的内容获取提交元数据。这样你就可以为以内容目录方式挂载的远程仓库显示提交数据，例如从多个来源聚合文档时。

> [!NOTE]
> 在下列情况下，`GitInfo` 方法对模块内容返回 `nil`：
>
> - 模块通过 `hugo mod vendor` 被 vendor 到本地
> - 通过 `go.mod` 中的 `replace` 指令或 [`replacements`][] 配置参数配置了[模块替换][]

## 方法

在 `GitInfo` 对象上使用这些方法。

`AbbreviatedHash`
: （`string`）返回提交哈希的 7 位缩写形式。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .AbbreviatedHash }} → aab9ec0
  {{ end }}
  ```

`AuthorDate`
: （`time.Time`）返回作者最初创建该提交的日期。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .AuthorDate.Format "2006-01-02" }} → 2023-10-09
  {{ end }}
  ```

`AuthorEmail`
: （`string`）返回作者的电子邮箱地址，并遵循 [gitmailmap][]。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .AuthorEmail }} → jsmith@example.org
  {{ end }}
  ```

`AuthorName`
: （`string`）返回作者姓名，并遵循 [gitmailmap][]。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .AuthorName }} → John Smith
  {{ end }}
  ```

`CommitDate`
: （`time.Time`）返回该提交被应用到分支的日期。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .CommitDate.Format "2006-01-02" }} → 2023-10-09
  {{ end }}
  ```

`Hash`
: （`string`）返回完整的 SHA-1 提交哈希。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .Hash }} → aab9ec0b31ebac916a1468c4c9c305f2bebf78d4
  {{ end }}
  ```

`Subject`
: （`string`）返回提交信息的第一行（即摘要）。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .Subject }} → Add tutorials
  {{ end }}
  ```

`Body`
: （`string`）返回提交信息的完整内容，不含摘要行。

  ```go-html-template
  {{ with .GitInfo }}
    {{ .Body }} → Two new pages added.
  {{ end }}
  ```

`Ancestors`
: （`gitmap.GitInfos`）返回该文件此前各次提交的列表，按由新到旧排序。

  例如，列出最近 5 次提交：

  ```go-html-template
  {{ with .GitInfo }}
    {{ range .Ancestors | first 5 }}
      {{ .CommitDate.Format "2006-01-02" }}: {{ .Subject }}
    {{ end }}
  {{ end }}
  ```

  要反转顺序：

  ```go-html-template
  {{ with .GitInfo }}
    {{ range .Ancestors.Reverse | first 5 }}
      {{ .CommitDate.Format "2006-01-02" }}: {{ .Subject }}
    {{ end }}
  {{ end }}
  ```

`Parent`
: （`*gitmap.GitInfo`）返回该文件最近的一次祖先提交（如果有）。

## 最后修改日期

默认情况下，当 `enableGitInfo` 为 `true` 时，`Page` 对象上的 `Lastmod` 方法返回包含该文件的最后一次提交的 Git AuthorDate。

你可以在[项目配置][]中改变这一行为。

## 托管注意事项

在 [CI/CD](g) 平台上，克隆项目仓库的步骤必须执行完整克隆（deep clone）。如果是浅克隆，某个文件的 Git 信息可能不准确：它可能错误地反映仓库最近的一次提交，而不是真正修改了该文件的那次提交。

有些服务商默认执行完整克隆，另一些则需要你自己配置克隆深度。

托管服务|默认克隆深度|可配置
:--|:--|:--
AWS Amplify|完整|不适用
Cloudflare|浅|是 [^1]
DigitalOcean App Platform|完整|不适用
GitHub Pages|浅|是 [^2]
GitLab Pages|浅|是 [^3]
Netlify|完整|不适用
Render|浅|是 [^1]
Vercel|浅|是 [^1]

[^1]: 在 Cloudflare、Render 或 Vercel 上托管时，要在仓库克隆完成后于构建脚本中加入以下代码，以执行完整克隆：

    ```sh
    if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
      git fetch --unshallow
    fi
    ```

[^2]: 在 GitHub Pages 上托管时，要在 GitHub Action 的 `checkout` 步骤中设置 `fetch-depth: 0`，以执行完整克隆。

[^3]: 在 GitLab Pages 上托管时，要在工作流文件中把 `GIT_DEPTH` 环境变量设为 `0`，以执行完整克隆。

## 完整示例：页脚显示最后一次提交

最小站点：临时目录里 `git init`、提交全部文件，`hugo.toml` 设 `enableGitInfo = true`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with .GitInfo }}
  <p>{{ .AbbreviatedHash }} · {{ .AuthorName }} · {{ .Subject }}</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后：

```html
<p>36f3a8a · Lab Tester · Add tutorials</p>
```

同一次构建中其它字段的实测值：

```go-html-template
{{ with .GitInfo }}{{ .Hash }} → 36f3a8a47aef3254083093eb8ab75a2d2c683080
{{ .AuthorDate.Format "2006-01-02" }} → 2026-10-03
{{ .CommitDate.Format "2006-01-02" }} → 2026-10-03
{{ .Body }} → （空，该提交没有正文）
{{ range .Ancestors }} → （空，该文件只有一次提交）{{ end }}{{ end }}
```

**你应当看到什么**：`.AbbreviatedHash` 是 7 位短哈希，`.Hash` 是完整 SHA-1；`.Body` 只包含提交信息的正文部分（摘要行的内容在 `.Subject` 里）；某个文件只有一次提交时 `.Ancestors` 是**空切片**，`range` 什么都不输出。

> [!IMPORTANT]
> `enableGitInfo = true` 会顺带改变 [`Lastmod`](/methods/page/lastmod/)：实测中 `alpha.md` 的前置元数据写了 `lastmod = 2024-05-06`，但页面输出的 `.Lastmod` 是**最后一次提交的作者日期**（2026-10-03）。想保留前置元数据的值，就要按上游「最后修改日期」一节调整[日期配置](/configuration/front-matter/#dates)。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`git init` 后提交全部文件，`enableGitInfo = true`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 文件已被提交 | 返回提交元数据对象 | 否 |
| `enableGitInfo` 未开启（默认） | `nil`，`{{ with .GitInfo }}` 不执行 | 否 |
| 文件尚未提交 | `nil` | 否 |
| 该文件只提交过一次 | `.Ancestors` 为空切片 | 否 |
| 同时启用 `enableGitInfo` | `.Lastmod` 变为该提交的作者日期 | 否 |
| 返回类型 | `*gitmap.GitInfo`（可能为 `nil`，务必用 `with` 包住） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建报错 | `nil pointer evaluating *gitmap.GitInfo.Hash` | 未启用 `enableGitInfo`，或文件没提交 | 一律用 `{{ with .GitInfo }}` 包住整段 |
| 什么都没输出 | 页脚没有提交信息 | 同上 | 在 `hugo.toml` 设 `enableGitInfo = true`，并确认文件已 `git add` + `commit` |
| 提交信息不准确 | 显示的是仓库最近一次提交，而不是改这个文件的提交 | CI 上做了浅克隆（shallow clone） | 改为完整克隆，见上游「托管注意事项」 |
| 日期与预期不符 | `.Lastmod` 与前置元数据不一致 | `enableGitInfo` 覆盖了 `Lastmod` | 通过[日期配置](/configuration/front-matter/#dates)调整优先级 |

更多排查入口见[故障排查](/troubleshooting/)。

[`enableGitInfo`]: /configuration/all/#enablegitinfo
[`replacements`]: /configuration/module/#replacements
[说明]: /configuration/front-matter/#dates
[gitmailmap]: https://git-scm.com/docs/gitmailmap
[模块替换]: /hugo-modules/use-modules/#replace
[项目配置]: /configuration/front-matter/
