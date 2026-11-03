(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = window.matchMedia("(max-width: 768px)");
  const nav = document.querySelector(".nav");
  let lenis = null;
  let unbindNav = null;

  function tune(getY, subscribe) {
    if (!nav) return function () {};
    let last = getY();
    let intent = 0;
    return subscribe(function () {
      const y = getY();
      const delta = y - last;
      last = y;
      if (y < 16) {
        nav.classList.remove("is-min");
        intent = 0;
        return;
      }
      if (Math.abs(delta) < 0.4) return;
      if (Math.sign(delta) !== Math.sign(intent)) intent = 0;
      intent += delta;
      if (intent > 36) nav.classList.add("is-min");
      else if (intent < -36) nav.classList.remove("is-min");
    });
  }

  function unbind() {
    if (unbindNav) unbindNav();
    unbindNav = null;
  }

  function useNative() {
    if (lenis) {
      lenis.destroy();
      lenis = null;
      unbind();
    }
    if (unbindNav) return;
    unbindNav = tune(function () { return window.scrollY; }, function (fn) {
      window.addEventListener("scroll", fn, { passive: true });
      return function () { window.removeEventListener("scroll", fn); };
    });
  }

  function useLenis() {
    if (lenis) return;
    unbind();
    lenis = new Lenis({
      autoRaf: true,
      anchors: false,
      duration: 1.2,
      easing: function (t) { return 1 - Math.pow(3, -10 * t); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      syncTouch: false
    });
    unbindNav = tune(function () { return lenis.animatedScroll; }, function (fn) {
      return lenis.on("scroll", fn);
    });
  }

  function sync() {
    if (reduce || typeof Lenis !== "function" || phone.matches) useNative();
    else useLenis();
  }

  document.addEventListener("click", function (event) {
    if (!lenis) return;
    const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
    if (!link) return;
    const target = document.getElementById(link.getAttribute("href").slice(1));
    if (!target) return;
    event.preventDefault();
    lenis.scrollTo(target, { offset: -62 });
  });

  phone.addEventListener("change", sync);
  sync();
})();
