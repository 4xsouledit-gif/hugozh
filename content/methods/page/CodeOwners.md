+++
title = "CodeOwners"
linkTitle = "CodeOwners"
description = "返回给定页面的代码所有者切片，数据来自项目目录根部的 CODEOWNERS 文件。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/methods/page/codeowners/"

[params.functions_and_methods]
signatures = ["PAGE.CodeOwners"]
returnType = "[]string"
+++

## 这一页解决什么问题

文档站常常要回答「这一页谁负责」：合并请求该找谁、页面底部该显示哪个团队。GitHub/GitLab 用仓库根部的 `CODEOWNERS` 文件声明归属，`CodeOwners` 方法把**当前页面对应的所有者**读进模板。

## 什么时候用，什么时候别用

**该用**：

- 在页面底部或页头显示内容负责人；
- 生成一份「页面 → 负责人」清单，交给审核流程使用。

**别用**：

- 想在托管平台上**强制执行**审批 → 那是 `CODEOWNERS` 文件本身的职责，模板读它只用于展示；
- 想展示提交信息（作者、哈希、提交日期）→ 用 [`GitInfo`](/methods/page/gitinfo/)；`CodeOwners` 与提交历史无关；
- 站点没有启用 `enableGitInfo` → 本方法返回空切片（见下文）。

## 用法

GitHub 与 GitLab 都支持 CODEOWNERS 文件。该文件指定负责开发和维护软件与文档的用户，其声明可以作用于整个仓库、特定目录，也可以作用于单个文件。了解更多：

- [GitHub CODEOWNERS 文档][]
- [GitLab CODEOWNERS 文档][]

使用 `Page` 对象上的 `CodeOwners` 方法可以确定给定页面的代码所有者。

要使用 `CodeOwners` 方法，必须启用对本地 Git 仓库的访问：

```toml
enableGitInfo = true
```

假设项目结构如下：

```tree
my-project/
├── content/
│   ├── books/
│   │   └── les-miserables.md
│   └── films/
│       └── the-hunchback-of-notre-dame.md
└── CODEOWNERS
```

CODEOWNERS 文件如下：

```text
* @jdoe
/content/books/ @tjones
/content/films/ @mrichards @rsmith
```

下表列出每个文件返回的代码所有者切片：

路径|代码所有者
:--|:--
`books/les-miserables.md`|`[@tjones]`
`films/the-hunchback-of-notre-dame.md`|`[@mrichards @rsmith]`

渲染每个内容页面的代码所有者：

```go-html-template
{{ range .CodeOwners }}
  {{ . }}
{{ end }}
```

把这个方法与 [`resources.GetRemote`][] 结合使用，可以通过查询 Git 服务商的 API 获取姓名与头像。

## 完整示例：在页脚列出内容负责人

最小站点：临时目录里 `git init` 并提交全部文件，`hugo.toml` 设 `enableGitInfo = true`，仓库根部有 `CODEOWNERS`：

```text
* @jdoe
/content/docs/guide/ @tjones
```

模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with .CodeOwners }}
  <p>内容负责人：{{ delimit . "、" }}</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后：

```html
<p>内容负责人：@jdoe</p>
```

**你应当看到什么**：返回值里的元素**带前导 `@`**（与 CODEOWNERS 文件里的写法一致）；没有命中任何模式时 `with` 判为假，整段不输出——这就是必须加 `with` 的原因。

## 路径匹配：实测与上游示例的差异

上游示例使用仓库根目录式的模式（`/content/books/ @tjones`）。在 Hugo 0.167.0 extended（Windows）的实测站点里，这类模式**一个都没有命中页面**，只有通配模式命中了。对同一个页面 `content/docs/guide/alpha.md` 逐条测试（每行单独一次构建）：

模式|命中
:--|:--
`*`|是
`*.md`|是
`*alpha.md`|是
`*guide*`|是
`**/*.md`|是
`/*.md`|是
`/content/docs/guide/alpha.md`|否
`content/docs/guide/alpha.md`|否
`/docs/guide/alpha.md`|否
`docs/guide/alpha.md`|否
`alpha.md`|否
`/content/docs/`|否
`content/`|否
`docs/guide/*`|否

> [!IMPORTANT]
> **先在目标平台上验证一次**：先只写 `*` 或 `*.md`，确认 `.CodeOwners` 有输出，再逐步收紧模式。跨平台项目不要把 `CODEOWNERS` 的目录模式当作可移植配置。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；临时目录 `git init` 并提交全部文件，`enableGitInfo = true`，仓库根部有 `CODEOWNERS`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 有模式命中 | `[]string`，元素保留 `@` 前缀 | 否 |
| 没有模式命中 | **空切片**，`with` / `if` 判为假 | 否 |
| 未启用 `enableGitInfo` | 空切片（不读取 `CODEOWNERS`） | 否 |
| 页面没有对应文件（分类法页、术语页） | 空切片 | 否 |
| 同时命中多条模式 | 返回一个所有者集合（本机环境中表现为 `*` 那条生效） | 否 |
| 返回类型 | `[]string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 什么都没输出 | `.CodeOwners` 始终为空 | 未启用 `enableGitInfo`，或站点不在 git 仓库中 | 设置 `enableGitInfo = true`，并确保文件已提交 |
| 什么都没输出 | 启用了 git 仍为空 | 模式没命中（见上文实测表） | 先用 `*` 验证链路，再逐步收紧 |
| 没报错但结果不对 | 显示的负责人不是预期的人 | 命中的是另一条模式 | 用 `{{ debug.Dump .CodeOwners }}` 打印实际值再调整 `CODEOWNERS` |
| 拼接链接出错 | 拼出 `https://github.com/@@jdoe` | 返回值**带** `@` | 拼接前先去掉 `@`（如 `strings.TrimPrefix "@"`） |

更多排查入口见[故障排查](/troubleshooting/)。

[GitHub CODEOWNERS 文档]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[GitLab CODEOWNERS 文档]: https://docs.gitlab.com/ee/user/project/code_owners.html
[`resources.GetRemote`]: /functions/resources/getremote/
