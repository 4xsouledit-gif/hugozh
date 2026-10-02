+++
title = "操作系统函数"
linkTitle = "os"
description = "使用这些函数与操作系统交互。"
date = 2026-10-02
weight = 200
source = "https://gohugo.io/functions/os/"
+++

## 这一页解决什么问题

这一章收录与文件系统和构建环境打交道的函数：判断文件是否存在、读取文件内容、列出目录、查看文件元信息、读取环境变量。上游这些页原来只有签名和几行说明，本站为每页补上了「什么时候用 / 什么时候别用」「可直接粘贴的实测示例」与「返回值边界」。

## 读完本章你应该能够

- 按需求选对函数：只要存在性用 [`os.FileExists`](/functions/os/fileexists/)、要内容用 [`os.ReadFile`](/functions/os/readfile/)、要大小与类型用 [`os.Stat`](/functions/os/stat/)、要列目录用 [`os.ReadDir`](/functions/os/readdir/)；
- 记住几条实测出来的「静默行为」：不存在的路径在 `ReadFile` / `ReadDir` / `Stat` 里**不报错**（分别返回空字符串、空结果、空值），而 [`os.ReadFile`](/functions/os/readfile/) 传入**目录**会让构建失败；
- 知道 [`os.Getenv`](/functions/os/getenv/) 有**安全白名单**：默认只放行 `CI` 与 `HUGO_*`，访问其它变量会直接让构建失败，而不是返回空字符串。

## 建议阅读顺序

1. [os.FileExists](/functions/os/fileexists/)——最安全的「先确认再处理」入口；
2. [os.ReadFile](/functions/os/readfile/)——读取原始文本（记得它不是 Markdown 渲染器）；
3. [os.ReadDir](/functions/os/readdir/)——列目录（注意不递归）；
4. [os.Stat](/functions/os/stat/)——文件与目录的元信息；
5. [os.Getenv](/functions/os/getenv/)——把构建环境带进模板（注意白名单）。

路径规则在这一章是共通的：**先相对项目根解析，找不到再相对 `contentDir` 解析，前导斜杠可选**。读任意一页时记住这一条即可。
