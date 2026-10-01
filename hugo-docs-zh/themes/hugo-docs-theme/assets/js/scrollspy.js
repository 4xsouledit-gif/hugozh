/* ============================================================
   本页目录（右侧 TOC）滚动高亮
   - 原生 JS，无依赖
   - 滚动时把当前所在章节对应的目录项标记为 .is-current
   - 目录自身可滚动，高亮项会自动保持可见
   - 窄屏下右侧目录由 CSS 隐藏，此时脚本不做任何事
   ============================================================ */
(function () {
  'use strict';

  var toc = document.querySelector('.toc');
  if (!toc) {
    return;
  }

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (links.length === 0) {
    return;
  }

  var header = document.querySelector('.site-header');

  var entries = [];
  links.forEach(function (link) {
    var id = idFromHref(link.getAttribute('href'));
    if (id === '') {
      return;
    }
    var heading = document.getElementById(id);
    if (heading) {
      entries.push({ link: link, heading: heading });
    }
  });

  if (entries.length === 0) {
    return;
  }

  var current = null;
  var ticking = false;
  var suppressUntil = 0;

  /* 目录里的链接形如 #准备条件，取回对应的元素 id */
  function idFromHref(href) {
    if (!href || href.charAt(0) !== '#') {
      return '';
    }
    var raw = href.slice(1);
    try {
      return decodeURIComponent(raw);
    } catch (error) {
      return raw;
    }
  }

  /* 吸顶头部让出的空间：既作为高亮判定阈值，也同步给 scroll-padding-top，
     这样点击目录项后的落点与「当前章节」的判定始终一致 */
  function padTop() {
    return (header ? header.offsetHeight : 0) + 20;
  }

  function syncScrollPadding() {
    document.documentElement.style.scrollPaddingTop = padTop() + 'px';
  }

  function activate(link) {
    if (current === link) {
      return;
    }
    if (current) {
      current.classList.remove('is-current');
      current.removeAttribute('aria-current');
    }
    current = link;
    if (!current) {
      return;
    }
    current.classList.add('is-current');
    current.setAttribute('aria-current', 'true');
    keepInView(current);
  }

  /* 目录很长时，保证高亮项留在目录自己的可视区域内 */
  function keepInView(link) {
    var box = toc.getBoundingClientRect();
    var item = link.getBoundingClientRect();
    if (item.top < box.top) {
      toc.scrollTop -= box.top - item.top + 12;
    } else if (item.bottom > box.bottom) {
      toc.scrollTop += item.bottom - box.bottom + 12;
    }
  }

  function activeEntry() {
    var limit = padTop() + 4;
    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) {
      return entries[entries.length - 1];
    }
    var result = entries[0];
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].heading.getBoundingClientRect().top <= limit) {
        result = entries[i];
      } else {
        break;
      }
    }
    return result;
  }

  function update() {
    ticking = false;
    if (toc.offsetParent === null) {
      /* 目录当前不可见（窄屏），清掉高亮即可 */
      activate(null);
      return;
    }
    activate(activeEntry().link);
  }

  function onScroll() {
    if (Date.now() < suppressUntil) {
      return;
    }
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(update);
  }

  links.forEach(function (link) {
    link.addEventListener('click', function () {
      /* 平滑滚动期间先锁住高亮，避免中途来回跳动 */
      suppressUntil = Date.now() + 500;
      activate(link);
      window.setTimeout(onScroll, 540);
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    syncScrollPadding();
    onScroll();
  });
  window.addEventListener('hashchange', onScroll);

  function init() {
    syncScrollPadding();
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ============================================================
   左侧目录：把当前页滚到侧栏可视区中部
   - methods/page 等章节有近百个页面，当前项常落在可视区之外，
     用户会以为「侧栏没有保持激活」，因此进入页面时主动居中。
   - 只滚动侧栏自身，不触碰页面滚动位置，避免刷新时跳动。
   ============================================================ */
(function () {
  'use strict';

  function centerActiveInSidebar() {
    var box = document.querySelector('.sidebar');
    if (!box) {
      return;
    }
    var active = box.querySelector('a[aria-current="page"]');
    if (!active || box.scrollHeight <= box.clientHeight) {
      return;
    }
    box.scrollTop = Math.max(
      0,
      active.offsetTop - box.clientHeight / 2 + active.offsetHeight / 2
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', centerActiveInSidebar);
  } else {
    centerActiveInSidebar();
  }
})();
