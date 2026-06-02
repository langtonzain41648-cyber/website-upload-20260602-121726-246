(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (menuButton && panel) {
    menuButton.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
  if (slides.length) {
    var active = 0;
    var show = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === active);
      });
    };
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-filter-input]');
  var year = document.querySelector('[data-filter-year]');
  var type = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var empty = document.querySelector('[data-empty-state]');
  var urlParams = new URLSearchParams(window.location.search);
  if (input && urlParams.get('q')) {
    input.value = urlParams.get('q');
  }
  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var y = year ? year.value : '';
    var t = type ? type.value : '';
    var visible = 0;
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || ''
      ].join(' ').toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !y || card.getAttribute('data-year') === y;
      var matchType = !t || (card.getAttribute('data-type') || '').indexOf(t) !== -1;
      var ok = matchKeyword && matchYear && matchType;
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  };
  [input, year, type].forEach(function (el) {
    if (el) {
      el.addEventListener('input', applyFilter);
      el.addEventListener('change', applyFilter);
    }
  });
  applyFilter();
})();
