/* ============================================================
   站点 UI 交互：搜索、主题切换、移动端抽屉、阅读进度、
   标题锚点、代码块复制、返回顶部。
   约定：
     · 全部原生 JS，无依赖、无构建步骤；用 Hugo 的资源管道 minify + fingerprint。
     · 所有 DOM 增强都做「能力检测」：元素不存在就跳过，因此同一份脚本
       在首页、章节页、内容页都能安全加载。
     · 首屏不做任何网络请求：搜索索引在首次打开搜索框时才拉取。
   ============================================================ */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 主题切换 ---------- */
  function initTheme() {
    var buttons = $$("[data-theme-toggle]");
    if (!buttons.length) return;

    var media = window.matchMedia("(prefers-color-scheme: dark)");

    function current() {
      var set = document.documentElement.getAttribute("data-theme");
      if (set === "dark" || set === "light") return set;
      return media.matches ? "dark" : "light";
    }

    function label() {
      // 按钮上写「当前状态」还是「点击后变成什么」，容易让人误解；
      // 这里统一写动作：处于深色则按钮显示「浅色」，反之亦然。
      var next = current() === "dark" ? "浅色" : "深色";
      buttons.forEach(function (b) {
        b.setAttribute("aria-label", "切换到" + next + "主题");
        b.setAttribute("title", "切换到" + next + "主题");
        var t = $("[data-theme-label]", b);
        if (t) t.textContent = next;
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var next = current() === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("theme", next); } catch (e) {}
        label();
      });
    });

    // 用户没手动选择过时，切换系统偏好应当跟随
    var onMedia = function () {
      if (!document.documentElement.getAttribute("data-theme")) label();
    };
    if (media.addEventListener) media.addEventListener("change", onMedia);
    else if (media.addListener) media.addListener(onMedia);

    label();
  }

  /* ---------- 移动端目录抽屉 ---------- */
  function initDrawer() {
    var openers = $$("[data-drawer-open]");
    var closers = $$("[data-drawer-close]");
    var backdrop = $(".drawer-backdrop");
    if (!openers.length) return;

    function setOpen(open) {
      document.body.classList.toggle("drawer-open", open);
      openers.forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
      if (open) {
        var first = $(".sidebar a, .sidebar button");
        if (first) first.focus();
      }
    }

    openers.forEach(function (b) {
      b.addEventListener("click", function () { setOpen(!document.body.classList.contains("drawer-open")); });
    });
    closers.forEach(function (b) { b.addEventListener("click", function () { setOpen(false); }); });
    if (backdrop) backdrop.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("drawer-open")) setOpen(false);
    });
    // 抽屉里点链接后自动收起，避免移动端「点了没反应」的错觉
    $$(".sidebar a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 860px)").matches) setOpen(false);
      });
    });
  }

  /* ---------- 章节下拉：点外部或按 Esc 收起 ----------
     <details> 原生只响应 summary 点击，不点外部不会关，容易挡住内容。 */
  function initDropdown() {
    var list = $$(".nav-dropdown");
    if (!list.length) return;

    list.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (!d.open) return;
        // 同时只开一个
        list.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });

    document.addEventListener("click", function (e) {
      list.forEach(function (d) {
        if (d.open && !d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      list.forEach(function (d) { d.open = false; });
    });
  }

  /* ---------- 阅读进度条 ---------- */
  function initProgress() {
    var bar = $(".read-progress");
    if (!bar) return;
    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = Math.min(100, Math.max(0, pct * 100)) + "%";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* ---------- 标题锚点：悬停显示 #，点击复制该节链接 ---------- */
  function initHeadingAnchors() {
    var headings = $$(".doc-body h2[id], .doc-body h3[id], .doc-body h4[id]");
    if (!headings.length) return;

    headings.forEach(function (h) {
      if ($(".heading-anchor", h)) return;
      var a = document.createElement("a");
      a.className = "heading-anchor";
      a.href = "#" + h.id;
      a.textContent = "#";
      a.setAttribute("aria-label", "复制本节链接");
      a.setAttribute("title", "复制本节链接");
      a.addEventListener("click", function (e) {
        // 点击后把带锚点的地址复制出来；不支持剪贴板时保持默认跳转行为
        if (!navigator.clipboard) return;
        e.preventDefault();
        var url = location.origin + location.pathname + "#" + h.id;
        navigator.clipboard.writeText(url).then(function () {
          a.textContent = "已复制";
          setTimeout(function () { a.textContent = "#"; }, 1200);
          history.replaceState(null, "", "#" + h.id);
        }).catch(function () { a.textContent = "#"; });
      });
      h.appendChild(a);
    });
  }

  /* ---------- 代码块复制 ---------- */
  function initCodeCopy() {
    $$(".code-block").forEach(function (block) {
      var pre = $("pre", block);
      if (!pre) return;
      var head = $(".code-block-head", block) || block;
      if ($(".copy-code", head)) return;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-code";
      btn.textContent = "复制";
      btn.setAttribute("aria-label", "复制这段代码");

      btn.addEventListener("click", function () {
        var text = pre.innerText;
        var done = function () {
          btn.textContent = "已复制";
          btn.classList.add("is-done");
          setTimeout(function () { btn.textContent = "复制"; btn.classList.remove("is-done"); }, 1400);
        };
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text, done); });
        } else {
          fallback(text, done);
        }
      });

      // 老浏览器 / 非安全上下文的兜底：临时选中后用 execCommand
      function fallback(text, done) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }

      head.appendChild(btn);
    });
  }

  /* ---------- 搜索 ---------- */
  function initSearch() {
    var panel = $("#search-panel");
    var trigger = $("[data-search-open]");
    if (!panel || !trigger) return;

    var input = $("input[type=search]", panel);
    var list = $(".search-results", panel);
    var empty = $(".search-empty", panel);
    var timer = null;
    var data = null;
    var loading = false;
    var active = -1;
    var results = [];

    function open() {
      panel.setAttribute("open", "");
      input.focus();
      input.select();
      if (!data && !loading) load();
    }

    function close() {
      panel.removeAttribute("open");
      trigger.focus();
    }

    function load() {
      loading = true;
      if (empty) empty.hidden = false;
      var url = panel.getAttribute("data-index-url");
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      }).then(function (json) {
        data = json.items || [];
        loading = false;
        if (empty) { empty.hidden = true; }
        if (input.value.trim()) render(input.value);
      }).catch(function () {
        loading = false;
        if (empty) { empty.hidden = false; empty.textContent = "搜索索引加载失败，请刷新后重试。"; }
      });
    }

    // 中文没有词边界，统一按「小写 + 去空格 + 子串」匹配；
    // 再把查询拆成字符组，避免用户输入带空格时整串匹配不上。
    function norm(s) { return (s || "").toLowerCase().replace(/\s+/g, ""); }

    /* 打分规则（改动时请同步 .testing/search-check.mjs —— 它用同一组向量盯着这里）：
         标题完全等于查询                100
         标题以查询开头                   80
         限定名的「最后一段」以查询开头     78   ← 见下
         标题含查询                       60（并按标题长度小幅扣分）
         章节名含查询                     22
         摘要含查询                       18
       限定名（含 `.` 的标题）统一 +10。
       为什么要单独看最后一段：模板里写的是 `strings.Truncate`，读者却只会搜 `Truncate`。
       若只看整串前缀，`Truncate DURATION1.…` 这类裸方法名会以 80 分压过读者真正想要的
       `strings.Truncate`（它整串以 `strings.` 开头，只能拿子串分）。
       同级再按标题更短者优先；并列时保持索引原顺序（sort 稳定），结果可复现。 */
    function score(item, q) {
      var t = norm(item.t);
      var s = norm(item.s);
      var d = norm(item.d);
      var dotted = item.q ? 10 : 0;
      if (t === q) return 100 + dotted;
      if (t.indexOf(q) === 0) return 80 + dotted;
      if (item.q) {
        var last = t.slice(t.lastIndexOf(".") + 1);
        if (last.indexOf(q) === 0) return 78 + dotted;
      }
      if (t.indexOf(q) > -1) {
        return 60 + dotted - Math.min(8, t.length / 8);
      }
      if (s.indexOf(q) > -1) return 22;
      if (d.indexOf(q) > -1) return 18;
      return 0;
    }

    function render(q) {
      if (!data) return;
      var query = norm(q);
      list.innerHTML = "";
      active = -1;
      if (!query) { results = []; return; }

      results = data
        .map(function (it) { return { it: it, sc: score(it, query) }; })
        .filter(function (r) { return r.sc > 0; })
        .sort(function (a, b) { return b.sc - a.sc; })
        .slice(0, 20)
        .map(function (r) { return r.it; });

      if (!results.length) {
        if (empty) {
          empty.hidden = false;
          empty.textContent = "没有匹配「" + q + "」的页面。试试更短的关键词，例如 truncate、pagination、hugo server。";
        }
        return;
      }
      if (empty) empty.hidden = true;

      results.forEach(function (item, i) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.u;
        a.dataset.index = String(i);

        var title = document.createElement("span");
        title.className = "search-result-title";
        title.textContent = item.t;
        a.appendChild(title);

        var meta = document.createElement("span");
        meta.className = "search-result-meta";
        meta.textContent = (item.s ? item.s + " · " : "") + item.u;
        a.appendChild(meta);

        li.appendChild(a);
        list.appendChild(li);
      });
    }

    function move(delta) {
      var links = $$(".search-results a", panel);
      if (!links.length) return;
      active = (active + delta + links.length) % links.length;
      links.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
      links[active].scrollIntoView({ block: "nearest" });
    }

    trigger.addEventListener("click", open);
    $$("[data-search-close]", panel).forEach(function (b) { b.addEventListener("click", close); });
    var backdrop = $(".search-panel-backdrop", panel);
    if (backdrop) backdrop.addEventListener("click", close);

    input.addEventListener("input", function () {
      clearTimeout(timer);
      var v = input.value;
      timer = setTimeout(function () { render(v); }, 90);
    });

    list.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a) close();
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        var links = $$(".search-results a", panel);
        var target = active > -1 ? links[active] : links[0];
        if (target) { e.preventDefault(); location.href = target.href; }
      }
    });

    // 全局快捷键：Cmd/Ctrl+K 打开搜索；斜杠键在非输入状态下也打开
    document.addEventListener("keydown", function (e) {
      var typing = /^(input|textarea|select)$/i.test((e.target.tagName || "")) || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        panel.hasAttribute("open") ? close() : open();
        return;
      }
      if (panel.hasAttribute("open") && e.key === "Escape") { e.preventDefault(); close(); return; }
      if (!typing && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        open();
      }
    });
  }

  /* ---------- 返回顶部 ---------- */
  function initToTop() {
    var btn = $("[data-to-top]");
    if (!btn) return;
    var visible = false;
    function update() {
      var should = (window.scrollY || document.documentElement.scrollTop) > 600;
      if (should !== visible) {
        visible = should;
        btn.hidden = !should;
      }
    }
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    update();
  }

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    initTheme();
    initDrawer();
    initDropdown();
    initProgress();
    initSearch();
    initHeadingAnchors();
    initCodeCopy();
    initToTop();
  });
})();
