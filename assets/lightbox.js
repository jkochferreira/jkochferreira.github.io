// Click-to-zoom for case study images and videos: opens the media large over a dimmed page.
// Closes on Esc, on the close button or on a click outside the media.
(function () {
  var SELECTOR = '.sheet .media img, .sheet .media video, .sheet .carousel img';

  var style = document.createElement('style');
  style.textContent = [
    '.is-zoomable { cursor: zoom-in; }',
    '.is-zoomable:focus-visible { outline: 2px solid #290072; outline-offset: 4px; }',
    '.lightbox { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center;',
    '  padding: 4vh 4vw; background: rgba(20, 12, 40, .55); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);',
    '  opacity: 0; transition: opacity .25s ease; cursor: zoom-out; }',
    '.lightbox.is-open { opacity: 1; }',
    '.lightbox__card { position: relative; max-width: 100%; max-height: 100%; padding: clamp(12px, 2vw, 32px);',
    '  background: var(--lightbox-bg, #fff); border-radius: 12px; box-shadow: 0 24px 64px rgba(20, 12, 40, .25);',
    '  transform: scale(.96); transition: transform .25s ease; cursor: default; }',
    '.lightbox.is-open .lightbox__card { transform: scale(1); }',
    '.lightbox__card img, .lightbox__card video { display: block; max-width: calc(92vw - 64px); max-height: calc(92vh - 64px);',
    '  width: auto; height: auto; border-radius: 6px; }',
    '.lightbox__close { position: absolute; top: -14px; right: -14px; width: 36px; height: 36px; border: 0; border-radius: 50%;',
    '  background: #fff; color: #290072; font-size: 22px; line-height: 36px; text-align: center; cursor: pointer;',
    '  box-shadow: 0 2px 8px rgba(20, 12, 40, .2); }',
    '.lightbox__close:focus-visible { outline: 2px solid #290072; outline-offset: 2px; }',
    '.lightbox__nav { position: absolute; top: 50%; width: 44px; height: 44px; margin-top: -22px; border: 0; border-radius: 50%;',
    '  background: #fff; color: #290072; cursor: pointer; box-shadow: 0 2px 8px rgba(20, 12, 40, .2);',
    '  display: flex; align-items: center; justify-content: center; }',
    '.lightbox__nav svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }',
    '.lightbox__nav--prev { left: -22px; }',
    '.lightbox__nav--next { right: -22px; }',
    '.lightbox__nav:focus-visible { outline: 2px solid #290072; outline-offset: 2px; }',
    '.lightbox__nav[disabled] { opacity: .35; cursor: default; }',
    '@media (max-width: 600px) { .lightbox__nav--prev { left: 4px; } .lightbox__nav--next { right: 4px; } }',
    'body.has-lightbox { overflow: hidden; }'
  ].join('\n');
  document.head.appendChild(style);

  var opener = null;

  function close(box) {
    box.classList.remove('is-open');
    document.body.classList.remove('has-lightbox');
    document.removeEventListener('keydown', onKey);
    step = null;
    setTimeout(function () { box.remove(); }, 250);
    if (opener) opener.focus();
  }

  var step = null; // set while a carousel image is open: moves to the previous (-1) or next (1) slide

  function onKey(e) {
    var box = document.querySelector('.lightbox');
    if (!box) return;
    if (e.key === 'Escape') close(box);
    else if (step && e.key === 'ArrowLeft') step(-1);
    else if (step && e.key === 'ArrowRight') step(1);
  }

  function open(el) {
    opener = el;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', el.getAttribute('alt') || el.getAttribute('aria-label') || 'Enlarged image');

    var card = document.createElement('div');
    card.className = 'lightbox__card';
    // Images framed in a coloured box keep that colour around them when enlarged
    var frame = el.closest('.media__frame');
    if (frame) card.style.setProperty('--lightbox-bg', getComputedStyle(frame).backgroundColor);

    function makeMedia(src) {
      var m;
      if (src.tagName === 'VIDEO') {
        m = document.createElement('video');
        m.src = src.currentSrc || src.src;
        m.poster = src.poster;
        m.muted = true; m.loop = true; m.autoplay = true; m.playsInline = true;
        m.currentTime = src.currentTime;
      } else {
        m = document.createElement('img');
        m.src = src.currentSrc || src.src;
        m.alt = src.alt || '';
      }
      return m;
    }
    var media = makeMedia(el);

    var btn = document.createElement('button');
    btn.className = 'lightbox__close';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Close');
    btn.textContent = '×';

    card.appendChild(media);
    card.appendChild(btn);

    // Images opened from a carousel get arrows to move through the other slides
    var carousel = el.closest('.carousel');
    var slides = carousel ? Array.prototype.slice.call(carousel.querySelectorAll('img, video')) : [];
    if (slides.length > 1) {
      var index = slides.indexOf(el);
      var arrow = function (dir) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'lightbox__nav lightbox__nav--' + (dir < 0 ? 'prev' : 'next');
        b.setAttribute('aria-label', dir < 0 ? 'Previous image' : 'Next image');
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>';
        b.addEventListener('click', function (e) { e.stopPropagation(); step(dir); });
        card.appendChild(b);
        return b;
      };
      var prev = arrow(-1), next = arrow(1);
      var sync = function () {
        prev.disabled = index === 0;
        next.disabled = index === slides.length - 1;
        box.setAttribute('aria-label', slides[index].getAttribute('alt') || 'Enlarged image');
      };
      step = function (dir) {
        var to = index + dir;
        if (to < 0 || to >= slides.length) return;
        index = to;
        var fresh = makeMedia(slides[index]);
        card.replaceChild(fresh, media);
        media = fresh;
        opener = slides[index];
        slides[index].scrollIntoView({ block: 'nearest', inline: 'start' });
        sync();
      };
      sync();
    }
    box.appendChild(card);
    document.body.appendChild(box);
    document.body.classList.add('has-lightbox');
    requestAnimationFrame(function () { box.classList.add('is-open'); });

    box.addEventListener('click', function (e) { if (e.target === box) close(box); });
    btn.addEventListener('click', function () { close(box); });
    document.addEventListener('keydown', onKey);
    btn.focus();
  }

  document.querySelectorAll(SELECTOR).forEach(function (el) {
    el.classList.add('is-zoomable');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var label = el.getAttribute('alt') || el.getAttribute('aria-label');
    el.setAttribute('aria-label', 'View larger' + (label ? ': ' + label : ''));
    el.addEventListener('click', function () { open(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });
})();
