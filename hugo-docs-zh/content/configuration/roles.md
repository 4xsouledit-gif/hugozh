+++
title = "角色配置"
linkTitle = "角色配置"
description = "定义角色及其权重，控制多角色站点的构建顺序。"
date = 2026-10-01
weight = 250
source = "https://gohugo.io/configuration/roles/"
+++

## 这一页解决什么问题

角色（role）是「面向不同受众」的内容维度，和语言、版本并列：同一份内容可以给访客、会员、管理员各出一套变体。这一页定义**有哪些角色、默认角色是谁、角色之间怎么排序**。

普通站点不需要配置——Hugo 默认已有一个 `guest`（权重 `0`）。只有确实要按受众区分内容时才需要它。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `[roles.<name>]` | 需要按受众（访客 / 会员 / 内部）区分内容 | 只在配置里声明角色、却没有在内容的 `sites.matrix` 中引用 → 该角色不会产出任何页面，也不报错 |
| `roles.<name>.weight` | 想固定角色的先后（权重**升序**，小的在前） | 权重都留 `0` → 退化为按角色名**字典序**升序，顺序可能与你预期相反 |
| `defaultContentRole` | 指定默认角色 | 上游要求该值必须与某个已定义角色名匹配；不一致时行为不在文档保证范围内，逐字核对角色名。项目未定义任何角色时回退为 `guest` |
| `defaultContentRoleInSubdir` | 希望各角色的发布路径结构统一 | 保持 `false` 而其它角色在子目录里 → 默认角色的 URL 与其它角色不一致 |

**默认角色的确定规则**（上游已写明）：取 `defaultContentRole` 的值；项目没有定义任何角色时回退到 `guest`；定义了一个或多个角色却没设置 `defaultContentRole` 时，取权重最低的那个，权重相同或未设置时按字典序。

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 声明了角色，却没有产出对应页面 | 角色还需要在内容的 `sites.matrix` 中被引用；只写 `[roles.*]` 不生效 | 见本页开头关于 `sites.matrix` 的说明，并参考[内容管理](/content-management/) |
| 角色顺序与预期相反 | 权重都为 `0` 时退化为按角色名**字典序**升序 | 给需要固定顺序的角色写非零 `weight`（升序，小的在前） |
| 默认角色不是自己设的那个 | `defaultContentRole` 与 `[roles.*]` 中的名字不一致；或未设置该键，Hugo 取权重最低者 | 逐字核对角色名；显式设置 `defaultContentRole` 最稳妥 |
| 默认角色的 URL 与其它角色结构不一致 | `defaultContentRoleInSubdir` 保持 `false` | 需要统一路径结构时设为 `true` |
| 配置似乎被忽略 | 使用的 Hugo 版本低于 v0.153.0 | 升级 Hugo，或暂不使用该维度 |

更多排查入口见[故障排查](/troubleshooting/)。
