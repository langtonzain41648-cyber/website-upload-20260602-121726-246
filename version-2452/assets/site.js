(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-card-list]');
    if (!panel || !list) {
      return;
    }

    var searchInput = panel.querySelector('[data-filter-search]');
    var sortSelect = panel.querySelector('[data-sort-select]');
    var tagButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-tag]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var activeTag = '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var visibleCards = [];

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesTag = !activeTag || haystack.indexOf(normalize(activeTag)) !== -1;
        var visible = matchesKeyword && matchesTag;
        card.classList.toggle('is-hidden', !visible);
        if (visible) {
          visibleCards.push(card);
        }
      });

      var sortValue = sortSelect ? sortSelect.value : 'default';
      if (sortValue !== 'default') {
        visibleCards.sort(function (a, b) {
          if (sortValue === 'year-desc') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (sortValue === 'views-desc') {
            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
          }
          if (sortValue === 'title-asc') {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
          }
          return 0;
        });
        visibleCards.forEach(function (card) {
          list.appendChild(card);
        });
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilters);
    }

    tagButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeTag = button.getAttribute('data-filter-tag') || '';
        tagButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });
  }

  function setupPlayer() {
    var playButton = document.querySelector('[data-video-play]');
    if (!playButton) {
      return;
    }

    var videoId = playButton.getAttribute('data-video-play');
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }

    var shell = video.closest('.video-shell');
    var source = video.getAttribute('data-src');
    var initialized = false;

    function initSource() {
      if (initialized || !source) {
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    playButton.addEventListener('click', function () {
      initSource();
      if (shell) {
        shell.classList.add('is-playing');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (shell) {
            shell.classList.remove('is-playing');
          }
        });
      }
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-views="' + escapeHtml(movie.views) + '" data-tags="' + escapeHtml((movie.tags || []).join(' ')) + '">' +
      '  <a class="poster" href="./detail/' + escapeHtml(movie.slug) + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
      '    <img class="poster-image" src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.style.display=\'none\'; this.parentElement.classList.add(\'image-missing\');">' +
      '    <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>' +
      '  </a>' +
      '  <div class="movie-card-body">' +
      '    <div class="movie-meta-line">' +
      '      <a href="./categories/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>' +
      '      <span>' + escapeHtml(movie.year) + '</span>' +
      '      <span>' + escapeHtml(movie.region) + '</span>' +
      '    </div>' +
      '    <h3><a href="./detail/' + escapeHtml(movie.slug) + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
      '    <p>' + escapeHtml(movie.oneLine) + '</p>' +
      '    <div class="tag-row">' + tags + '</div>' +
      '    <div class="card-actions">' +
      '      <a class="watch-link" href="./detail/' + escapeHtml(movie.slug) + '.html">立即观看</a>' +
      '      <span>' + Number(movie.views).toLocaleString('zh-CN') + ' 次浏览</span>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupGlobalSearch() {
    if (!window.MOVIES) {
      return;
    }

    var form = document.querySelector('[data-global-search-form]');
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    var title = document.querySelector('[data-search-title]');

    if (!input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function render(query) {
      var keyword = normalize(query);
      var items = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      if (title) {
        title.textContent = keyword ? '“' + query + '” 的搜索结果' : '推荐浏览';
      }
      if (count) {
        count.textContent = '当前显示 ' + items.length + ' 条结果，点击卡片可进入对应详情页。';
      }
      results.innerHTML = items.map(createSearchCard).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var nextUrl = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.history.replaceState(null, '', nextUrl);
        render(query);
      });
    }

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initialQuery);
  }

  setupHero();
  setupFilters();
  setupPlayer();
  setupGlobalSearch();
})();
