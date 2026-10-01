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

[GitHub CODEOWNERS 文档]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[GitLab CODEOWNERS 文档]: https://docs.gitlab.com/ee/user/project/code_owners.html
[`resources.GetRemote`]: /functions/resources/getremote/
