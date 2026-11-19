// Carousel controls: a row of dots (one per slide, the current one drawn as a pill) on the left
// and previous/next buttons on the right, placed under each .carousel. Replaces the scrollbar.
(function () {
  var style = document.createElement('style');
  style.textContent = [
    '.carousel.has-nav { scrollbar-width: none; }',
    '.carousel.has-nav::-webkit-scrollbar { display: none; }',
    '.carousel-nav { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }',
    '.carousel-nav[hidden] { display: none; }',
    '.carousel-nav__dots { display: flex; align-items: center; gap: 4px; }',
    '.carousel-nav__dot { width: 20px; height: 20px; padding: 0; border: 0; background: none; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center; transition: width .25s ease; }',
    '.carousel-nav__dot::before { content: ""; width: 8px; height: 8px; border-radius: 4px;',
    '  background: rgba(41, 0, 114, .22); transition: width .25s ease, background-color .25s ease; }',
    '.carousel-nav__dot:hover::before { background: rgba(41, 0, 114, .45); }',
    '.carousel-nav__dot[aria-current="true"] { width: 40px; }',
    '.carousel-nav__dot[aria-current="true"]::before { width: 32px; background: #290072; }',
    '.carousel-nav__dot:focus-visible { outline: 2px solid #290072; outline-offset: 2px; border-radius: 6px; }',
    '.carousel-nav__arrows { display: flex; gap: 8px; }',
    '.carousel-nav__arrow { width: 36px; height: 36px; padding: 0; border: 1px solid rgba(41, 0, 114, .18); border-radius: 50%;',
    '  background: #fff; color: #290072; cursor: pointer; display: flex; align-items: center; justify-content: center;',
    '  transition: border-color .2s ease, opacity .2s ease; }',
    '.carousel-nav__arrow:hover:not([disabled]) { border-color: rgba(41, 0, 114, .45); }',
    '.carousel-nav__arrow[disabled] { opacity: .4; cursor: default; }',
    '.carousel-nav__arrow:focus-visible { outline: 2px solid #290072; outline-offset: 2px; }',
    '.carousel-nav__arrow svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.75;',
    '  stroke-linecap: round; stroke-linejoin: round; }'
  ].join('\n');
  document.head.appendChild(style);

  var ARROW = { prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7' };

  document.querySelectorAll('.carousel').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.children);
    if (slides.length < 2) return;
    var name = carousel.getAttribute('aria-label') || 'carousel';

    var nav = document.createElement('div');
    nav.className = 'carousel-nav wide';

    var dots = document.createElement('div');
    dots.className = 'carousel-nav__dots';
    var dotButtons = slides.map(function (slide, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'carousel-nav__dot';
      d.setAttribute('aria-label', 'Show slide ' + (i + 1) + ' of ' + slides.length + ', ' + name);
      d.addEventListener('click', function () { go(i); });
      dots.appendChild(d);
      return d;
    });

    var arrows = document.createElement('div');
    arrows.className = 'carousel-nav__arrows';
    function arrow(dir) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-nav__arrow';
      b.setAttribute('aria-label', (dir < 0 ? 'Previous' : 'Next') + ' slide, ' + name);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (dir < 0 ? ARROW.prev : ARROW.next) + '"/></svg>';
      b.addEventListener('click', function () { go(current + dir); });
      arrows.appendChild(b);
      return b;
    }
    var prev = arrow(-1), next = arrow(1);

    nav.appendChild(dots);
    nav.appendChild(arrows);
    carousel.insertAdjacentElement('afterend', nav);
    carousel.classList.add('has-nav');

    var current = 0;

    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      current = i;
      sync();
      var left = slides[i].getBoundingClientRect().left - carousel.getBoundingClientRect().left + carousel.scrollLeft
        - (parseFloat(getComputedStyle(carousel).scrollPaddingLeft) || parseFloat(getComputedStyle(carousel).paddingLeft) || 0);
      carousel.scrollTo({ left: left, behavior: 'smooth' });
    }

    function sync() {
      dotButtons.forEach(function (d, i) { d.setAttribute('aria-current', i === current ? 'true' : 'false'); });
      var max = carousel.scrollWidth - carousel.clientWidth;
      prev.disabled = carousel.scrollLeft <= 2 && current === 0;
      next.disabled = carousel.scrollLeft >= max - 2 || current === slides.length - 1;
    }

    // Work out the current slide from the scroll position (the last one once the end is reached)
    function fromScroll() {
      var max = carousel.scrollWidth - carousel.clientWidth;
      if (max <= 2) { current = 0; }
      else if (carousel.scrollLeft >= max - 2) { current = slides.length - 1; }
      else {
        var base = carousel.getBoundingClientRect().left + (parseFloat(getComputedStyle(carousel).scrollPaddingLeft) || parseFloat(getComputedStyle(carousel).paddingLeft) || 0);
        var best = 0, bestDist = Infinity;
        slides.forEach(function (s, i) {
          var dist = Math.abs(s.getBoundingClientRect().left - base);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        current = best;
      }
      sync();
    }

    function layout() {
      nav.hidden = carousel.scrollWidth <= carousel.clientWidth + 2;
      fromScroll();
    }

    var ticking = false;
    carousel.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; fromScroll(); }); }
    }, { passive: true });
    // Re-measure when the carousel or its images change size (images loading, window resizing)
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(layout);
      ro.observe(carousel);
      slides.forEach(function (s) { ro.observe(s); });
    } else {
      window.addEventListener('resize', layout);
    }
    window.addEventListener('load', layout);
    layout();
  });
})();
