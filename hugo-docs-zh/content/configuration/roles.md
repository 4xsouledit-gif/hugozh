+++
title = "角色配置"
linkTitle = "角色配置"
description = "定义角色及其权重，控制多角色站点的构建顺序。"
date = 2026-10-01
weight = 250
source = "https://gohugo.io/configuration/roles/"
+++

## 默认配置

> 该特性自 v0.153.0 起可用。

Hugo 默认配置了一个名为 `guest`、权重为 `0` 的角色：

```toml
[roles.guest]
weight = 0
```

角色（role）是与语言、版本并列的内容维度之一：同一个逻辑页面可以同时存在多个语言版本、多个版本号以及多个角色的变体。角色在配置文件的 `roles` 区段中声明，在页面前置元数据的 `sites.matrix` 中引用。

## 基础设置

先配置下面两项基础设置：

```toml
defaultContentRole = 'guest'
defaultContentRoleInSubdir = false
```

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `defaultContentRole` | `string` | `guest` | 项目的默认角色。当一个或多个角色已被定义时，该值必须与其中一个已定义的角色名匹配。 |
| `defaultContentRoleInSubdir` | `bool` | `false` | 是否把默认内容角色发布到与 `defaultContentRole` 同名的子目录中。 |

默认角色的确定规则是：先取 `defaultContentRole` 的值；当项目没有定义任何角色时回退到 `guest`。如果项目定义了一个或多个角色、却没有设置 `defaultContentRole`，则默认角色是项目中的第一个角色，也就是权重最低的那个；权重相同或都未设置权重时，以字典序作为最终的判定依据。

## 角色设置

用下面这个设置为每个角色定义 Hugo 的排序依据：

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `roles.<name>.weight` | `int` | `0` | 角色权重。设为非零值时，它是该角色的首要排序依据。 |

## 排序顺序

Hugo 先按权重升序排列角色，权重相同时再按字典序升序排列。这个顺序会影响构建顺序，也会影响补集（complement）的选取，因此在给角色赋权重时需要留意先后关系。

## 示例

下面的配置定义了两个带明确权重的角色：

```toml
[roles.guest]
weight = 20

[roles.member]
weight = 10
```

`member` 的权重是 `10`，`guest` 的权重是 `20`，因此 `member` 排在 `guest` 之前。若把两者的权重都设为 `0` 或都省略 `weight`，排序就完全由角色名的字典序决定，此时 `guest` 会排在 `member` 之前。

## 延伸阅读

- [配置](/configuration/)
- [前置元数据](/content-management/front-matter/)
- [内容管理](/content-management/)
