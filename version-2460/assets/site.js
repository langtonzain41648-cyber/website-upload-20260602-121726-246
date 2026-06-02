(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('.mobile-menu-button');
    if (header && menuButton) {
      menuButton.addEventListener('click', function () {
        header.classList.toggle('is-open');
      });
    }

    initHeroSlider();
    initLocalSearch();
    initQuerySearch();
    initPlayer();
  });

  function initHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    restart();
  }

  function initLocalSearch() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-local-search]');
      var allButton = scope.querySelector('[data-filter-all]');
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year], [data-filter-genre], [data-filter-region], [data-filter-type], [data-filter-all]'));
      var container = scope.nextElementSibling || document;
      var items = Array.prototype.slice.call(container.querySelectorAll('.searchable-item'));
      var active = { year: '', genre: '', region: '', type: '' };

      function textOf(item) {
        return [
          item.dataset.title || '',
          item.dataset.year || '',
          item.dataset.region || '',
          item.dataset.genre || '',
          item.dataset.tags || '',
          item.textContent || ''
        ].join(' ').toLowerCase();
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        items.forEach(function (item) {
          var haystack = textOf(item);
          var matched = true;
          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (active.year && String(item.dataset.year) !== String(active.year)) {
            matched = false;
          }
          if (active.genre && (item.dataset.genre || '').indexOf(active.genre) === -1 && (item.dataset.tags || '').indexOf(active.genre) === -1) {
            matched = false;
          }
          if (active.region && (item.dataset.region || '').indexOf(active.region) === -1) {
            matched = false;
          }
          if (active.type && haystack.indexOf(active.type.toLowerCase()) === -1) {
            matched = false;
          }
          item.classList.toggle('is-hidden', !matched);
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (btn) {
            btn.classList.remove('is-active');
          });
          button.classList.add('is-active');

          active = { year: '', genre: '', region: '', type: '' };
          if (button.hasAttribute('data-filter-year')) {
            active.year = button.getAttribute('data-filter-year');
          }
          if (button.hasAttribute('data-filter-genre')) {
            active.genre = button.getAttribute('data-filter-genre');
          }
          if (button.hasAttribute('data-filter-region')) {
            active.region = button.getAttribute('data-filter-region');
          }
          if (button.hasAttribute('data-filter-type')) {
            active.type = button.getAttribute('data-filter-type');
          }
          if (button === allButton && input) {
            input.value = '';
          }
          apply();
        });
      });
    });
  }

  function initQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    var input = document.querySelector('[data-local-search]');
    if (input) {
      input.value = q;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function initPlayer() {
    var shell = document.querySelector('[data-video-url]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var src = shell.getAttribute('data-video-url');
    var started = false;

    function start() {
      if (!video || !src) {
        return;
      }

      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
        started = true;
      }

      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
  }
})();
