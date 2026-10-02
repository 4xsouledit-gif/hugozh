+++
title = "字符串函数"
linkTitle = "strings"
description = "用这些函数处理字符串。"
date = 2026-10-02
weight = 260
source = "https://gohugo.io/functions/strings/"
+++

## 这一页解决什么问题

这一章收录模板里处理字符串的全部函数：判断包含关系、按模式查找、替换、切分、截取、修剪首尾、转换大小写、统计字符与词数。上游这些页原本只有签名和一两行说明，本站在每页补上了「什么时候用 / 什么时候别用」「可直接粘贴的实测示例」与「返回值边界」，所以它们可以当成手册逐页查，而不只是签名列表。

## 读完本章你应该能够

- 面对一个字符串处理需求，先判断它属于哪一类（判断、查找、替换、切分、截取、修剪、计数），再挑对应的函数；
- 说清几组最容易混用的区别：[`strings.Contains`](/functions/strings/contains/) 与 [`strings.ContainsAny`](/functions/strings/containsany/)、[`strings.Substr`](/functions/strings/substr/) 与 [`strings.SliceString`](/functions/strings/slicestring/)、[`strings.TrimLeft`](/functions/strings/trimleft/) 与 [`strings.TrimPrefix`](/functions/strings/trimprefix/)、[`strings.CountRunes`](/functions/strings/countrunes/) 与 [`strings.RuneCount`](/functions/strings/runecount/)；
- 知道越界、类型不符、正则写错时各自会发生什么（有的返回空值，有的直接让构建失败），并据此决定要不要先做校验。

## 建议阅读顺序

1. **判断类**：[strings.Contains](/functions/strings/contains/)、[strings.ContainsAny](/functions/strings/containsany/)、[strings.ContainsNonSpace](/functions/strings/containsnonspace/)、[strings.HasPrefix](/functions/strings/hasprefix/)、[strings.HasSuffix](/functions/strings/hassuffix/)；
2. **查找与替换**：[strings.FindRE](/functions/strings/findre/)、[strings.FindRESubmatch](/functions/strings/findresubmatch/)、[strings.Replace](/functions/strings/replace/)、[strings.ReplaceRE](/functions/strings/replacere/)、[strings.ReplacePairs](/functions/strings/replacepairs/)；
3. **切分与截取**：[strings.Split](/functions/strings/split/)、[strings.Substr](/functions/strings/substr/)、[strings.SliceString](/functions/strings/slicestring/)、[strings.Truncate](/functions/strings/truncate/)；
4. **修剪**：[strings.Trim](/functions/strings/trim/)、[strings.TrimLeft](/functions/strings/trimleft/)、[strings.TrimRight](/functions/strings/trimright/)、[strings.TrimPrefix](/functions/strings/trimprefix/)、[strings.TrimSuffix](/functions/strings/trimsuffix/)、[strings.TrimSpace](/functions/strings/trimspace/)、[strings.Chomp](/functions/strings/chomp/)；
5. **大小写**：[strings.ToLower](/functions/strings/tolower/)、[strings.ToUpper](/functions/strings/toupper/)、[strings.Title](/functions/strings/title/)、[strings.FirstUpper](/functions/strings/firstupper/)、[strings.FirstLower](/functions/strings/firstlower/)；
6. **计数**：[strings.RuneCount](/functions/strings/runecount/)、[strings.CountRunes](/functions/strings/countrunes/)、[strings.CountWords](/functions/strings/countwords/)、[strings.Count](/functions/strings/count/)。

侧栏的顺序与上面的分组一致；只查一个函数时，直接按文件名找即可。
