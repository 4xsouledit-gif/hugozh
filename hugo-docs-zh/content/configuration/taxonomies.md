+++
title = "分类法配置"
linkTitle = "分类法配置"
description = "通过 taxonomies 配置定义分类法及其单复数映射关系。"
date = 2026-10-01
weight = 310
source = "https://gohugo.io/configuration/taxonomies/"
+++

## 这一页解决什么问题

`[taxonomies]` 定义站点使用哪些分类法（taxonomy），以及它们在 front matter 里用什么键名。默认有两个：`category = 'categories'` 与 `tag = 'tags'`。

两个最容易踩的点：**新增分类法时忘记把默认的两个写回去**（`[taxonomies]` 是整表覆盖，不写就等于删除），以及**没有关掉不用的分类法**（Hugo 会为它们生成空的 `/tags/`、`/categories/` 页面并进入站点地图）。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| 新增 `[taxonomies]` 条目 | 需要按作者、系列、难度等额外维度归类内容 | 新增时漏写默认项 → `tags` / `categories` 的列表页与术语页不再生成，且**不报错** |
| 单数键、复数值 | 键用单数（`category`），值用复数（`categories`）；值同时是 front matter 里的键名 | 键值写反 → front matter 中的 `categories` 匹配不上，分类法页面为空 |
| `disableKinds` | 站点不使用分类法，不想生成空页面 | 只想着「关掉页面」却仍在 front matter 里写 `tags`：数据还在页面参数里，但没有可访问的列表页 |

**实测（Hugo 0.167，本站）**：本站 `hugo.toml` 设置了 `disableKinds = ['taxonomy','term']`，因此不会生成 `/tags/`、`/categories/` 这类页面（也不会进站点地图），而 front matter 中仍可保留分类数据供模板读取。

**什么时候别用**：内容量小、维度还没稳定时不要急着加自定义分类法——每加一个都会多出一类列表页与术语页，并进入站点地图与搜索索引。

默认配置定义了两个分类法：`categories` 与 `tags`。

## 默认配置

```toml
[taxonomies]
  category = 'categories'
  tag = 'tags'
```

`[taxonomies]` 是一个映射：键为分类法的单数形式，值为其复数形式，也就是该分类法在 front matter 中使用的键名。

## 配置规则

创建分类法时：

- 键使用单数形式，例如 `category`。
- 值使用复数形式，例如 `categories`。

随后在 front matter 中把该值作为键使用：

```yaml
title: 示例
categories:
  - vegetarian
  - gluten-free
tags:
  - appetizer
  - main course
```

如果某个分类法不预期给一个内容页面分配多个术语，键和值可以都使用单数形式：

```toml
[taxonomies]
  author = 'author'
```

然后在 front matter 中：

```yaml
title: 示例
author:
  - Robert Smith
```

上面的示例表明，即使只有一个术语，取值仍然要写成数组。

添加新分类法时，必须显式保留默认分类法，否则它们会丢失：

```toml
[taxonomies]
  author = 'author'
  category = 'categories'
  tag = 'tags'
```

## 字段

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `category` | `string` | `categories` | 内置分类法之一，键为单数、值为复数，值同时是 front matter 中使用的键名。 |
| `tag` | `string` | `tags` | 内置分类法之一，键为单数、值为复数，值同时是 front matter 中使用的键名。 |

上表只是内置的两个分类法。`[taxonomies]` 没有固定的键名列表，只要符合「单数键、复数值」的约定，任何自定义项都可以写在这里。

## 关闭分类法

要关闭分类法系统，在项目配置根层使用 `disableKinds` 设置，禁用 `taxonomy` 与 `term` 两种页面类型：

```toml
disableKinds = ['taxonomy','term']
```

相关内容参见[内容管理](/content-management/)中的分类法部分。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 新增分类法后，`/tags/` 与 `/categories/` 页面消失 | `[taxonomies]` 整表覆盖，新增时没保留默认条目 | 把 `category = 'categories'` 与 `tag = 'tags'` 一并写回 |
| front matter 里写了分类，页面上却没有 | 配置中的值（复数）与 front matter 的键名不一致 | 键用单数、值用复数；值必须与 front matter 的键逐字一致 |
| 站点里混进了空的分类法页面 | 没有使用分类法，却保留了默认定义 | 在配置根层写 `disableKinds = ['taxonomy','term']` |
| 只给一个术语却报类型错误 | 取值仍必须写成数组 | 用 YAML 列表或 TOML 数组，例如 `- Robert Smith` |

更多排查入口见[故障排查](/troubleshooting/)；分类法在模板与内容中的完整用法见[内容管理](/content-management/)。
