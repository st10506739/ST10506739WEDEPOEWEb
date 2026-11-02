document.addEventListener('DOMContentLoaded', function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  if (!items.length) return;

  var current = 0;
  var opener = null;

    var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<button type="button" class="lb-close" aria-label="Close image">&times;</button>' +
    '<button type="button" class="lb-prev" aria-label="Previous image">&#8249;</button>' +
    '<figure><img src="" alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-next" aria-label="Next image">&#8250;</button>';
  document.body.appendChild(box);

  var img = box.querySelector('img');
  var caption = box.querySelector('figcaption');
  var closeBtn = box.querySelector('.lb-close');

  function show(index) {
    current = (index + items.length) % items.length;
    var thumb = items[current].querySelector('img');
    img.src = items[current].dataset.full;
    img.alt = thumb.alt;
    caption.textContent = items[current].dataset.caption;
  }
  function open(index) {
    opener = items[index];
    show(index);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }

  items.forEach(function (item, i) { item.addEventListener('click', function () { open(i); }); });
  closeBtn.addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) close(); });

  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'Tab') {
      var buttons = box.querySelectorAll('button');
      var first = buttons[0], last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
});
