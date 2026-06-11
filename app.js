/* El Benna El Tounsia — book engine (StPageFlip) */
(function () {
  "use strict";

  var wrap = document.querySelector(".book-wrap");
  var bookEl = document.getElementById("book");
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");
  var indicator = document.getElementById("page-indicator");
  var template = bookEl.innerHTML;       // pristine pages, used on rebuild
  var TOTAL = bookEl.querySelectorAll(".page").length;  // 8: cover + 6 + back
  var INNER = TOTAL - 2;                 // numbered pages
  var RATIO = 1.41;                      // page height / width
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var flip = null;
  var singleMode = null;

  // single page: phones, and tablets held in portrait (iPad 768–1100px)
  function wantsSingle() {
    var vw = window.innerWidth, vh = window.innerHeight;
    return vw < 720 || (vw < 1100 && vh > vw);
  }

  function fitBook(single) {
    var header = document.querySelector(".site-header");
    var controls = document.querySelector(".controls");
    var hint = document.querySelector(".swipe-hint");
    var chrome = header.offsetHeight + controls.offsetHeight + hint.offsetHeight + 90;
    var availH = Math.max(380, window.innerHeight - chrome);
    var vw = window.innerWidth;
    var pw = single
      ? Math.min(vw * 0.9, availH / RATIO, 620)
      : Math.min((vw * 0.94) / 2, availH / RATIO, 560);
    pw = Math.max(pw, 250);
    var ph = pw * RATIO;
    wrap.style.width = (single ? pw : pw * 2) + "px";
    wrap.style.height = ph + "px";
    return { pw: Math.round(pw), ph: Math.round(ph) };
  }

  function label(idx) {
    if (idx <= 0) return "Copertina";
    if (idx >= TOTAL - 1) return "Retro";
    if (flip.getOrientation() === "portrait") {
      return "Pagina " + idx + " / " + INNER;
    }
    var left = idx % 2 === 1 ? idx : idx - 1;
    var right = Math.min(left + 1, INNER);
    return left === right ? "Pagina " + left + " / " + INNER
                          : "Pagine " + left + "–" + right + " / " + INNER;
  }

  function refresh() {
    var idx = flip.getCurrentPageIndex();
    indicator.textContent = label(idx);
    btnPrev.disabled = idx <= 0;
    btnNext.disabled = idx >= TOTAL - 1;
  }

  function buildBook(startPage) {
    var single = wantsSingle();
    singleMode = single;
    var dims = fitBook(single);

    if (flip) {
      flip.destroy();
      bookEl.innerHTML = template;
    }

    var pages = bookEl.querySelectorAll(".page");
    // gutter shadows: with a cover, odd indices sit left, even sit right
    pages.forEach(function (p, i) {
      if (i === 0 || i === TOTAL - 1) return;
      p.classList.add(i % 2 === 1 ? "--left" : "--right");
    });

    flip = new St.PageFlip(bookEl, {
      width: dims.pw,
      height: dims.ph,
      size: "stretch",
      // StPageFlip goes portrait only when container < 2*minWidth,
      // so a huge minWidth forces single-page mode deterministically.
      minWidth: single ? 5000 : 250,
      maxWidth: 680,
      minHeight: 340,
      maxHeight: 940,
      showCover: true,
      usePortrait: true,
      maxShadowOpacity: 0.45,
      flippingTime: reduced ? 150 : 850,
      mobileScrollSupport: true,
      showPageCorners: true
    });

    flip.loadFromHTML(pages);

    flip.on("flip", function (e) {
      history.replaceState(null, "", "#p" + e.data);
      refresh();
    });
    flip.on("changeOrientation", refresh);

    if (startPage > 0) flip.turnToPage(startPage);
    refresh();
  }

  // deep link: #p0 (cover) … #p7 (back cover)
  function hashPage() {
    var m = location.hash.match(/^#p(\d+)$/);
    return m ? Math.min(Math.max(parseInt(m[1], 10), 0), TOTAL - 1) : 0;
  }

  buildBook(hashPage());

  window.addEventListener("hashchange", function () {
    var n = hashPage();
    if (n !== flip.getCurrentPageIndex()) flip.turnToPage(n);
    refresh();
  });

  btnPrev.addEventListener("click", function () { flip.flipPrev(); });
  btnNext.addEventListener("click", function () { flip.flipNext(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { flip.flipPrev(); }
    if (e.key === "ArrowRight") { flip.flipNext(); }
  });

  // On resize: rebuild when the single/spread mode flips (iPad rotation),
  // otherwise refit the container and nudge StPageFlip with one guarded
  // synthetic "resize" so it re-reads the parent size after our layout.
  var resizeTimer;
  var refitting = false;
  window.addEventListener("resize", function () {
    if (refitting) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (wantsSingle() !== singleMode) {
        buildBook(flip.getCurrentPageIndex());
        return;
      }
      fitBook(singleMode);
      refitting = true;
      window.dispatchEvent(new Event("resize"));
      refitting = false;
      refresh();
    }, 150);
  });
})();
