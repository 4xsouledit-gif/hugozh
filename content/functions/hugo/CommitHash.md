+++
title = "hugo.CommitHash"
linkTitle = "hugo.CommitHash"
description = "返回 Hugo 二进制的 Git 提交哈希。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/hugo/commithash/"

[params.functions_and_methods]
signatures = ["hugo.CommitHash"]
returnType = "string"
+++

## 这一页解决什么问题

官方发布的 Hugo 二进制与你自己用源码编译的二进制可能同版本号、甚至同编译日期，但源码提交不同。`hugo.CommitHash` 返回构建这个二进制所用的 Git 提交哈希，是精确到「哪一次提交」的标识——提 issue、比对两台机器上的 Hugo 是否真的一样时用它。

## 什么时候用，什么时候别用

**该用**：

- 报告问题时附上精确的构建来源（配合 [`hugo.Version`](/functions/hugo/version/) 与 [`hugo.BuildDate`](/functions/hugo/builddate/)）；
- CI 里校验「用的确实是我们锁定的那个构建」。

**别用**：

- 想标识**你的站点仓库**当前提交 → 用 [`hugo.Deps`](/functions/hugo/deps/) 或开启 `enableGitInfo` 后页面上的 [`.GitInfo`](/methods/page/gitinfo/)；
- 想判断版本新旧 → 用 [`hugo.Version`](/functions/hugo/version/)：哈希本身没有顺序含义（哈希大小与提交先后无关）。

`hugo.CommitHash` 是**字段值，不是方法**：不要写成 `hugo.CommitHash "参数"`（实测构建失败，见边界表）。

上游给出的示意输出：

```go-html-template
{{ hugo.CommitHash }} → a4892a07b41b7b3f1f143140ee4ec0a9a5cf3970
```

## 完整示例：在调试页输出精确构建信息

```go-html-template {file="layouts/_partials/build-info.html"}
<ul>
  <li>版本：{{ hugo.Version }}</li>
  <li>提交：{{ hugo.CommitHash }}</li>
  <li>编译日期：{{ hugo.BuildDate }}</li>
</ul>
```

在本机（Hugo 0.167.0 extended，Windows）实测渲染为：

```html
<ul>
  <li>版本：0.167.0</li>
  <li>提交：3fff6fb5c267dacb26280c78dbe8c344054249c8</li>
  <li>编译日期：2026-09-28T14:50:38Z</li>
</ul>
```

**你应当看到什么**：40 位十六进制字符串。这个值与你的二进制绑定，不会随站点内容变化；`hugo version` 命令行输出里的那串哈希就是同一个值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hugo.CommitHash }}` | `string`，40 位十六进制（本机 `3fff6fb5c267dacb26280c78dbe8c344054249c8`） | 否 |
| 空值 / `nil` | 不适用：由二进制提供，恒有值 | 否 |
| 传入参数 `{{ hugo.CommitHash "x" }}` | —— | 是：`CommitHash has arguments but cannot be invoked as function`（字段而非方法） |
| 自行编译、且源码目录不是 Git 仓库 | 上游未说明 | —— |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `CommitHash has arguments but cannot be invoked as function` | 把它当方法调用 | 去掉参数，直接写 `{{ hugo.CommitHash }}` |
| 没报错但结果不对 | 想用它表示「我的站点是哪个提交」 | 它标识的是 **Hugo 二进制**的构建提交，与你的站点仓库无关 | 站点提交用 `enableGitInfo` + `.GitInfo`，或 [`hugo.Deps`](/functions/hugo/deps/) |
| 没报错但结果不对 | 用哈希比较「谁更新」 | 哈希无序 | 比较版本用 [`hugo.Version`](/functions/hugo/version/) |

更多排查入口见[故障排查](/troubleshooting/)。
