+++
title = "故障排查"
linkTitle = "故障排查"
description = "构建与渲染异常时的排查方法、诊断工具与常见问题解答。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/troubleshooting/"
+++

## 本章内容

站点构建失败、页面缺失或输出与预期不符时，排查的基本顺序是：先确认输入，再确认模板，最后确认输出目录中的实际结果。输入指内容文件与配置，模板指 `layouts/` 下的模板，输出指发布目录中真正生成的 HTML。沿着这条链路逐段核对，多数问题都能定位到具体的一环。

本章各页分别处理一个方面：

| 页面 | 说明 |
| --- | --- |
| [常见问题](/troubleshooting/faq/) | 新用户最常遇到的问题及其原因 |
| [审计](/troubleshooting/audit/) | 部署前对输出结果做一次系统检查 |
| [弃用说明](/troubleshooting/deprecation/) | Hugo 弃用功能的节奏与升级时的提示 |
| [检查与调试](/troubleshooting/inspection/) | 用模板函数与命令行标志检查数据与模板 |
| [日志](/troubleshooting/logging/) | 日志级别、输出重定向与 LiveReload 日志 |
| [性能](/troubleshooting/performance/) | 分析构建耗时并选择加速手段 |

## 排查的基本思路

先复现，再缩小范围。把问题固定在一个可以反复执行的最小场景上，然后一次只改动一个变量，观察输出如何变化。常见做法包括：

1. 用最小项目复现问题，排除主题、模块与第三方服务的干扰。
2. 关闭与问题无关的构建选项，减少参与渲染的内容。
3. 逐段注释模板，确认问题由哪个模板、哪个区段引起。
4. 在页面中输出中间值，核对 Hugo 实际拿到的数据是否与预期一致，做法见[检查与调试](/troubleshooting/inspection/)。

## 常用入口

以下命令适合作为排查的起点，完整选项见[命令](/commands/)：

```bash
# 显示默认配置与自定义配置，确认配置是否生效
hugo config

# 显示版本与环境信息，向他人求助时附上这份输出
hugo env

# 提高日志级别，查看构建过程中的细节
hugo build --logLevel debug

# 检查重复的目标路径等警告
hugo build --printPathWarnings
```

配置项的读取顺序与默认值规则见[配置](/configuration/)；目录结构对构建结果的影响见[目录结构](/getting-started/directory-structure/)。构建成功但页面内容不对时，先从内容文件与模板入手；构建直接失败时，日志与错误消息是首要线索。

## 获取帮助

Hugo 论坛是活跃的用户与开发者社区，可以在那里提问、分享经验并找到示例。提问前请先阅读论坛的求助指南，并准备好 `hugo env` 的输出与一个最小复现示例，这样更容易得到有用的回答。论坛地址见 [discourse.gohugo.io](https://discourse.gohugo.io)；中文提问请直接用官方论坛的[中文分类](https://discourse.gohugo.io/c/chinese/42)。
