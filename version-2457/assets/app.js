(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function clean(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMenu() {
    var button = $('[data-menu-toggle]');
    var menu = $('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function resultHtml(movie) {
    return '<a class="search-result-item" href="./' + escapeHtml(movie.url) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
      '<div><strong>' + escapeHtml(movie.title) + '</strong>' +
      '<span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</span>' +
      '<p>' + escapeHtml(movie.line) + '</p></div></a>';
  }

  function initSearch() {
    var movies = window.siteMovies || [];
    $all('[data-search-box]').forEach(function (box) {
      var input = $('[data-search-input]', box);
      var results = $('[data-search-results]', box);
      if (!input || !results) {
        return;
      }

      input.addEventListener('input', function () {
        var query = clean(input.value);
        if (!query) {
          results.classList.remove('is-open');
          results.innerHTML = '';
          return;
        }
        var matched = movies.filter(function (movie) {
          var text = clean([movie.title, movie.year, movie.region, movie.type, movie.genre, movie.line].join(' '));
          return text.indexOf(query) !== -1;
        }).slice(0, 12);
        results.innerHTML = matched.map(resultHtml).join('') || '<div class="search-result-item"><div></div><div><strong>暂无匹配影片</strong><p>换一个关键词继续搜索</p></div></div>';
        results.classList.add('is-open');
      });

      input.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter') {
          return;
        }
        var first = $('a', results);
        if (first) {
          event.preventDefault();
          window.location.href = first.getAttribute('href');
        }
      });

      document.addEventListener('click', function (event) {
        if (!box.contains(event.target)) {
          results.classList.remove('is-open');
        }
      });
    });
  }

  function initFilters() {
    $all('[data-filter-group]').forEach(function (group) {
      var parent = group.parentElement;
      var grid = parent ? $('[data-filter-grid]', parent) : null;
      if (!grid) {
        return;
      }
      var cards = $all('[data-searchable]', grid);
      $all('[data-filter-button]', group).forEach(function (button) {
        button.addEventListener('click', function () {
          var value = clean(button.getAttribute('data-filter-value'));
          $all('[data-filter-button]', group).forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          cards.forEach(function (card) {
            var text = clean(card.getAttribute('data-searchable'));
            var match = value === 'all' || text.indexOf(value) !== -1;
            card.classList.toggle('is-hidden', !match);
          });
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
  });
})();
