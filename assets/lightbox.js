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
    'body.has-lightbox { overflow: hidden; }'
  ].join('\n');
  document.head.appendChild(style);

  var opener = null;

  function close(box) {
    box.classList.remove('is-open');
    document.body.classList.remove('has-lightbox');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { box.remove(); }, 250);
    if (opener) opener.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      var box = document.querySelector('.lightbox');
      if (box) close(box);
    }
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

    var media;
    if (el.tagName === 'VIDEO') {
      media = document.createElement('video');
      media.src = el.currentSrc || el.src;
      media.poster = el.poster;
      media.muted = true; media.loop = true; media.autoplay = true; media.playsInline = true;
      media.currentTime = el.currentTime;
    } else {
      media = document.createElement('img');
      media.src = el.currentSrc || el.src;
      media.alt = el.alt || '';
    }

    var btn = document.createElement('button');
    btn.className = 'lightbox__close';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Close');
    btn.textContent = '×';

    card.appendChild(media);
    card.appendChild(btn);
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
