+++
title = "反射函数"
linkTitle = "reflect"
description = "用这些函数判断一个值的数据类型。"
date = 2026-10-02
weight = 230
source = "https://gohugo.io/functions/reflect/"
+++

## 这一页解决什么问题

模板里经常拿到「不知道是什么」的值：`where` 的结果可能是页面集合也可能是映射切片，`index` 从数据文件取出的可能是字符串也可能是嵌套映射，`.Params.foo` 有时有值有时没有。**直接对这些值调用方法，写错了不会温柔地失败**——轻则 `can't evaluate field`，重则整个构建中断。

本节这组函数只做一件事：**告诉你这个值是什么类型**，让你在调用方法之前先分叉。它们不改值、不做转换，返回的都是 `bool`。

## 什么时候用，什么时候别用

| 你想确认的事 | 用哪个函数 |
| --- | --- |
| 是不是映射（`dict` 的产物、`index` 取出的对象） | [`reflect.IsMap`](/functions/reflect/ismap/) |
| 是不是切片（`slice`、页面集合、`where` 的结果） | [`reflect.IsSlice`](/functions/reflect/isslice/) |
| 是不是页面对象（`site.GetPage` 的返回值、`range` 里的 `.`） | [`reflect.IsPage`](/functions/reflect/ispage/) |
| 是不是站点对象（`.Site`、`site` 全局变量） | [`reflect.IsSite`](/functions/reflect/issite/) |
| 是不是资源对象（`resources.Get`、`.Resources.Get` 的返回值） | [`reflect.IsResource`](/functions/reflect/isresource/) |
| 是不是「能当图片用」的资源 | [`reflect.IsImageResource`](/functions/reflect/isimageresource/) |
| 是不是「能被缩放/裁剪/转换」的图片资源 | [`reflect.IsImageResourceProcessable`](/functions/reflect/isimageresourceprocessable/) |
| 是不是「能读出 Exif/IPTC/XMP」的图片资源 | [`reflect.IsImageResourceWithMeta`](/functions/reflect/isimageresourcewithmeta/) |

**该用**：

- 同一个模板要处理多种输入（例如内容数据文件里既有字符串又有映射）；
- 调用 `.Process`、`.Meta`、`.Width` 这类**只在部分类型上存在**的方法之前先做守卫——实测对 ICO 资源调用 `.Meta` 会直接让构建失败，报错本身就建议先用这些函数检查；
- 写主题时对用户的参数做防御性判断。

**别用**：

- 只是「有没有值」的判断 → 用 `with` 或 [`compare.Default`](/functions/compare/default/) 更直接；
- 想**转换**类型 → 本节函数只回答真假，不转换。数字与字符串互转用 [`cast`](/functions/cast/) 系列，字符串解析用 [`transform.Unmarshal`](/functions/transform/unmarshal/)；
- 想判断具体媒体类型（`image/jpeg` 还是 `image/png`）→ 看资源的 `.MediaType.Type`，这几个函数只回答「是不是这一类」。

## 完整示例：一次判断六种类型

站点里有一个页面 `content/example/index.md`，`assets/data/a.json` 与 `assets/images/a.jpg` 各存在一个文件：

```go-html-template {file="layouts/index.html"}
{{ $m := dict "a" 1 }}
{{ $p := site.GetPage "/example" }}
reflect.IsMap：{{ reflect.IsMap $m }} / {{ reflect.IsMap "yo" }}
reflect.IsSlice：{{ reflect.IsSlice (slice 1 2 3) }} / {{ reflect.IsSlice "yo" }}
reflect.IsPage：{{ reflect.IsPage $p }} / {{ reflect.IsPage .Site }}
reflect.IsSite：{{ reflect.IsSite .Site }} / {{ reflect.IsSite $p }}
reflect.IsResource：{{ reflect.IsResource (resources.Get "data/a.json") }} / {{ reflect.IsResource "yo" }}
reflect.IsImageResource：{{ with resources.Get "images/a.jpg" }}{{ reflect.IsImageResource . }}{{ end }} / {{ reflect.IsImageResource $p }}
```

Hugo 0.167.0 实测渲染为（前一个值是「是」，后一个值是「不是」）：

```html
reflect.IsMap：true / false
reflect.IsSlice：true / false
reflect.IsPage：true / false
reflect.IsSite：true / false
reflect.IsResource：true / false
reflect.IsImageResource：true / false
```

**你应当看到什么**：每个函数都返回 `true` 或 `false`，从不报错——包括 `nil`、字符串这类「明显不对」的输入（实测 `reflect.IsMap nil`、`reflect.IsSlice nil`、`reflect.IsImageResource "yo"` 都是 `false`）。这正是它们适合做守卫的原因。

> [!NOTE]
> 有一个反直觉但实测确凿的点：`site.GetPage` 返回的页面对象**同时**是 `Page` 和 `Resource`（实测 `reflect.IsPage` 与 `reflect.IsResource` 都为 `true`）。所以不要用 `reflect.IsResource` 来区分「页面」与「资源文件」，那要用 `reflect.IsPage` 或对比 `reflect.IsImageResource`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 输入是目标类型 | `true` | 否 |
| 输入是别的类型 | `false` | 否 |
| 输入是 `nil`、字符串、映射等「明显不对」的值 | 一律 `false`，**从不报错** | 否 |
| `site.GetPage` 指向不存在的页面 | 返回占位页面，`reflect.IsPage` 与 `reflect.IsResource` 都是 `true`（但 `with` 判假） | 否 |
| 页面对象 | `IsPage` 与 `IsResource` **同时**为 `true` | 否 |
| 参数个数不对 | 构建失败：`wrong number of args for IsMap: want 1 got 2` 之类（内层调用忘写括号） | 是 |

## 读完本章你应该能够

- 为每一种「不确定类型的值」选对判断函数
- 写出「先判断、后调用」的守卫写法，避免 `can't evaluate field` 与构建中断
- 解释为什么页面对象既算 `Page` 也算 `Resource`
- 用 `reflect.IsImageResource*` 三兄弟判断一张图片支持哪些操作

## 阅读顺序

1. [reflect.IsMap](/functions/reflect/ismap/) 与 [reflect.IsSlice](/functions/reflect/isslice/) —— 处理普通数据；
2. [reflect.IsPage](/functions/reflect/ispage/) 与 [reflect.IsSite](/functions/reflect/issite/) —— 处理页面与站点对象；
3. [reflect.IsResource](/functions/reflect/isresource/) —— 处理资源；
4. [reflect.IsImageResource](/functions/reflect/isimageresource/)、[reflect.IsImageResourceProcessable](/functions/reflect/isimageresourceprocessable/)、[reflect.IsImageResourceWithMeta](/functions/reflect/isimageresourcewithmeta/) —— 处理图片，调用 `.Process`／`.Meta` 之前必读。

更多排查入口见[故障排查](/troubleshooting/)。
