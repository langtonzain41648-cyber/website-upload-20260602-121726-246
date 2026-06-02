(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = qsa('[data-hero-slide]');
    if (!slides.length) {
      return;
    }
    var dots = qsa('[data-hero-dot]');
    var prev = qs('[data-hero-prev]');
    var next = qs('[data-hero-next]');
    var index = 0;
    var timer;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        reset();
      });
    }

    show(0);
    start();
  }

  function setupFilters() {
    var input = qs('[data-search-input]');
    var filters = qsa('[data-filter]');
    var cards = qsa('[data-card]');
    if (!cards.length || (!input && !filters.length)) {
      return;
    }

    function matchCard(card) {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var text = (card.getAttribute('data-title') || '').toLowerCase();
      var matched = !keyword || text.indexOf(keyword) !== -1;

      filters.forEach(function (filter) {
        var key = filter.getAttribute('data-filter');
        var value = filter.value;
        if (value && value !== 'all' && card.getAttribute('data-' + key) !== value) {
          matched = false;
        }
      });

      return matched;
    }

    function apply() {
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden-card', !matchCard(card));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayer() {
    var video = qs('video[data-stream]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var overlay = qs('[data-player-button]');
    var wrap = qs('[data-player-wrap]');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }

    function requestPlay() {
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        hideOverlay();
        requestPlay();
      });
    }

    if (wrap) {
      wrap.addEventListener('click', function (event) {
        if (event.target === video || event.target === overlay || (overlay && overlay.contains(event.target))) {
          return;
        }
        hideOverlay();
        requestPlay();
      });
    }

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
