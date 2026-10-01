+++
title = "分类法配置"
linkTitle = "分类法配置"
description = "通过 taxonomies 配置定义分类法及其单复数映射关系。"
date = 2026-10-01
weight = 310
source = "https://gohugo.io/configuration/taxonomies/"
+++

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
