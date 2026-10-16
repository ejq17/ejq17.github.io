/* Scroll reveal (IntersectionObserver) + mobile menu niceties. No dependencies. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');

  if (!reduce && 'IntersectionObserver' in window && items.length) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  var menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.hasAttribute('open')) {
        menu.removeAttribute('open');
        var s = menu.querySelector('summary');
        if (s) s.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (menu.hasAttribute('open') && !menu.contains(e.target)) menu.removeAttribute('open');
    });
  }
})();
