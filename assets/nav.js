// Main menu: a line marks the current section. When you go to another section,
// the line slides there from the link you came from (remembered for the length of the visit).
(function () {
  var links = document.querySelector('.nav__links');
  if (!links) return;
  var items = Array.prototype.slice.call(links.querySelectorAll('a'));
  var current = links.querySelector('a[aria-current="page"]');
  var KEY = 'nav-from';

  function store(i) { try { sessionStorage.setItem(KEY, String(i)); } catch (e) {} }
  function read() { try { var v = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); return v === null ? -1 : +v; } catch (e) { return -1; } }

  // Remember which section we leave from
  items.forEach(function (a) {
    a.addEventListener('click', function () { store(current ? items.indexOf(current) : -1); });
  });

  var from = read();
  if (!current) return;

  var dot = document.createElement('span');
  dot.className = 'nav__line';
  dot.setAttribute('aria-hidden', 'true');
  links.appendChild(dot);
  links.classList.add('has-line');

  function place(a) { dot.style.width = a.offsetWidth + 'px'; dot.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }

  place(from >= 0 && items[from] && items[from] !== current ? items[from] : current);
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animating = from >= 0 && items[from] && items[from] !== current && !reduce;
  if (animating) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { dot.classList.add('is-moving'); place(current); });
    });
  } else {
    place(current);
  }
  // Keep it under the link when the layout changes (fonts loading, resizing)
  function settle() { animating = false; dot.classList.remove('is-moving'); place(current); }
  dot.addEventListener('transitionend', function (e) { if (e.propertyName !== 'transform') return; animating = false; dot.classList.remove('is-moving'); });
  addEventListener('resize', settle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!animating) place(current); });
})();
