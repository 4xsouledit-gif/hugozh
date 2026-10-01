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

[`enableGitInfo`]: /configuration/all/#enablegitinfo
[`replacements`]: /configuration/module/#replacements
[说明]: /configuration/front-matter/#dates
[gitmailmap]: https://git-scm.com/docs/gitmailmap
[模块替换]: /hugo-modules/use-modules/#replace
[项目配置]: /configuration/front-matter/
