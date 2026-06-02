(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (slides.length <= 1) {
      return;
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));
    var searchInput = document.querySelector("[data-filter-search]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var sortSelect = document.querySelector("[data-filter-sort]");
    var result = document.querySelector("[data-filter-result]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function numeric(card, key) {
      return Number(card.getAttribute(key) || 0);
    }

    function applySort(visibleCards) {
      if (!sortSelect) {
        return;
      }
      var mode = sortSelect.value;
      if (mode === "default") {
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        return;
      }
      visibleCards.sort(function (a, b) {
        if (mode === "score") {
          return numeric(b, "data-score") - numeric(a, "data-score");
        }
        if (mode === "views") {
          return numeric(b, "data-views") - numeric(a, "data-views");
        }
        if (mode === "year") {
          return numeric(b, "data-year") - numeric(a, "data-year");
        }
        return 0;
      });
      visibleCards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    function applyFilters() {
      var query = normalize(searchInput && searchInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visibleCards = [];

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visibleCards.push(card);
        }
      });

      applySort(visibleCards);
      if (result) {
        result.textContent = query || type || region || year ? "筛选到 " + visibleCards.length + " 个结果" : "";
      }
    }

    [searchInput, typeSelect, regionSelect, yearSelect, sortSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var source = video ? video.getAttribute("data-source") : "";
      var initialized = false;
      var hlsInstance = null;

      function initialize() {
        if (!video || !source) {
          return Promise.resolve();
        }
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          return new Promise(function (resolve) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                try {
                  hlsInstance.destroy();
                } catch (error) {
                  hlsInstance = null;
                }
                video.src = source;
                resolve();
              }
            });
          });
        }
        video.src = source;
        return Promise.resolve();
      }

      function play() {
        initialize().then(function () {
          player.classList.add("is-playing");
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        });
      }

      if (button) {
        button.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (!video.ended) {
            player.classList.remove("is-playing");
          }
        });
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
