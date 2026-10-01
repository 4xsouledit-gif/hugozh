+++
title = "hugo new content"
linkTitle = "hugo new content"
description = "hugo new content：依据原型创建内容文件。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/commands/hugo_new_content/"
+++

`hugo new content` 是 [hugo new](/commands/hugo-new/) 的子命令，用来创建新的内容文件。它会自动填入日期与标题，并根据你给出的路径推断要创建哪一类文件；也可以用 `-k KIND` 显式指定种类。如果主题或项目里提供了原型（archetype），新建的文件就会按原型生成。

## 用法

```text
hugo new content [path] [flags]
```

请确保在项目根目录下执行，Hugo 才能找到原型与内容目录。

## 选项

| 选项 | 说明 |
| --- | --- |
| `-b, --baseURL` | 站点根目录的主机名与路径 |
| `--cacheDir` | 缓存目录的文件系统路径 |
| `-c, --contentDir` | 内容目录的文件系统路径 |
| `--editor` | 指定编辑器名称，用于编辑新内容 |
| `-f, --force` | 文件已存在时覆盖它 |
| `-h, --help` | 显示 content 的帮助信息 |
| `-k, --kind` | 要创建的内容种类 |
| `--renderSegments` | 要渲染的命名分段，在 segments 配置中定义 |
| `-t, --theme` | 要使用的主题，主题位于 themes/THEMENAME/ 下 |

### 继承自父命令的选项

本命令还会继承 `hugo` 的选项，常用者有 `--config`、`--configDir`、`--logLevel`、`--quiet`、`-s` / `--source`、`--themesDir`、`--clock`、`-e` / `--environment`、`-M` / `--renderToMemory`、`-d` / `--destination`、`--noBuildLock` 与 `--ignoreVendorPaths`。

## 示例

在 `content/` 下新建一篇文章：

```bash
hugo new content posts/my-first-post.md
```

用 `-k` 指定要使用的原型：

```bash
hugo new content --kind posts posts/my-first-post.md
```

文件已存在时强制覆盖：

```bash
hugo new content --force posts/my-first-post.md
```

创建完成后用指定的编辑器打开：

```bash
hugo new content --editor nano posts/my-first-post.md
```

## 说明

- 路径是相对于 `content/` 目录的，因此 `posts/my-first-post.md` 对应 `content/posts/my-first-post.md`。
- 没有任何选项指定种类时，Hugo 会从路径推断种类，并选用 `archetypes/` 下与之同名的原型；找不到时退回默认原型。相关内容参见[原型](/content-management/archetypes/)与[前置元数据](/content-management/front-matter/)。
- 新文件通常会带有草稿标记，正式发布前需要按[前置元数据](/content-management/front-matter/)的说明处理。
- 想先看创建结果，可以配合使用 [hugo server](/commands/hugo-server/)；要新建项目骨架，请使用 [hugo new project](/commands/hugo-new-project/)。
