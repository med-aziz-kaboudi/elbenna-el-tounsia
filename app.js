/* El Benna El Tounsia — book engine (StPageFlip) */
(function () {
  "use strict";

  var wrap = document.querySelector(".book-wrap");
  var bookEl = document.getElementById("book");
  var btnPrev = document.getElementById("btn-prev");
  var btnNext = document.getElementById("btn-next");
  var indicator = document.getElementById("page-indicator");
  var pages = bookEl.querySelectorAll(".page");
  var TOTAL = pages.length;          // 8: cover + 6 + back
  var INNER = TOTAL - 2;             // numbered pages
  var RATIO = 1.41;                  // page height / width
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // gutter shadows: with a cover, odd indices sit left, even sit right
  pages.forEach(function (p, i) {
    if (i === 0 || i === TOTAL - 1) return;
    p.classList.add(i % 2 === 1 ? "--left" : "--right");
  });

  function fitBook() {
    var vw = window.innerWidth;
    var header = document.querySelector(".site-header");
    var controls = document.querySelector(".controls");
    var hint = document.querySelector(".swipe-hint");
    var chrome = header.offsetHeight + controls.offsetHeight + hint.offsetHeight + 90;
    var availH = Math.max(380, window.innerHeight - chrome);
    var single = vw < 720;
    var pw = single
      ? Math.min(vw * 0.92, availH / RATIO, 560)
      : Math.min((vw * 0.94) / 2, availH / RATIO, 560);
    pw = Math.max(pw, 260);
    var ph = pw * RATIO;
    wrap.style.width = (single ? pw : pw * 2) + "px";
    wrap.style.height = ph + "px";
    return { pw: Math.round(pw), ph: Math.round(ph) };
  }

  var dims = fitBook();

  var flip = new St.PageFlip(bookEl, {
    width: dims.pw,
    height: dims.ph,
    size: "stretch",
    minWidth: 240,
    maxWidth: 600,
    minHeight: 340,
    maxHeight: 880,
    showCover: true,
    usePortrait: true,
    maxShadowOpacity: 0.45,
    flippingTime: reduced ? 150 : 850,
    mobileScrollSupport: true,
    showPageCorners: true
  });

  flip.loadFromHTML(pages);

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

  flip.on("flip", function (e) {
    history.replaceState(null, "", "#p" + e.data);
    refresh();
  });
  flip.on("changeOrientation", refresh);

  // deep link: #p0 (cover) … #p7 (back cover)
  function applyHash() {
    var m = location.hash.match(/^#p(\d+)$/);
    if (!m) return;
    var n = Math.min(Math.max(parseInt(m[1], 10), 0), TOTAL - 1);
    if (n !== flip.getCurrentPageIndex()) flip.turnToPage(n);
    refresh();
  }
  window.addEventListener("hashchange", applyHash);
  applyHash();

  btnPrev.addEventListener("click", function () { flip.flipPrev(); });
  btnNext.addEventListener("click", function () { flip.flipNext(); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { flip.flipPrev(); }
    if (e.key === "ArrowRight") { flip.flipNext(); }
  });

  // StPageFlip re-reads the parent size on window "resize"; our own
  // handler resizes that parent, so fire one guarded follow-up event.
  var resizeTimer;
  var refitting = false;
  window.addEventListener("resize", function () {
    if (refitting) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      fitBook();
      refitting = true;
      window.dispatchEvent(new Event("resize"));
      refitting = false;
      refresh();
    }, 150);
  });

  refresh();
})();
