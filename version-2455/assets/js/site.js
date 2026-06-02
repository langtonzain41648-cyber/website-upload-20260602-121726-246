(function () {
  const body = document.body;
  const searchToggle = document.querySelector(".search-toggle");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteSearch = document.querySelector(".site-search");
  const mobileNav = document.querySelector(".mobile-nav");

  if (searchToggle && siteSearch) {
    searchToggle.addEventListener("click", function () {
      siteSearch.classList.toggle("open");
      if (mobileNav) {
        mobileNav.classList.remove("open");
      }
      const input = siteSearch.querySelector("input");
      if (input && siteSearch.classList.contains("open")) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
      if (siteSearch) {
        siteSearch.classList.remove("open");
      }
    });
  }

  const hero = document.querySelector(".hero-slider");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = function (target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle("active", itemIndex === index);
      });
    };

    const restart = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        show(Number(thumb.dataset.heroThumb || 0));
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    const scope = panel.closest("section") || document;
    const input = panel.querySelector(".filter-input");
    const selects = Array.from(panel.querySelectorAll(".filter-select"));
    const cards = Array.from(scope.querySelectorAll(".filter-card"));

    const apply = function () {
      const keyword = (input && input.value ? input.value : "").trim().toLowerCase();
      const filters = selects.map(function (select) {
        return {
          key: select.dataset.filter,
          value: select.value.trim().toLowerCase()
        };
      });

      cards.forEach(function (card) {
        const text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
        let visible = !keyword || text.indexOf(keyword) !== -1;
        filters.forEach(function (filter) {
          if (!filter.value) {
            return;
          }
          const cardValue = (card.dataset[filter.key] || "").toLowerCase();
          if (cardValue.indexOf(filter.value) === -1) {
            visible = false;
          }
        });
        card.style.display = visible ? "" : "none";
      });
    };

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
  });

  const searchArea = document.querySelector("[data-search-page]");
  if (searchArea && window.MOVIE_INDEX) {
    const input = searchArea.querySelector(".search-page-input");
    const select = searchArea.querySelector("[data-search-type]");
    const button = searchArea.querySelector(".search-page-button");
    const results = document.querySelector("[data-search-results]");
    const loadMore = document.querySelector("[data-load-more]");
    const params = new URLSearchParams(window.location.search);
    let visibleLimit = 48;
    let current = [];

    const card = function (movie) {
      const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<a class=\"movie-card\" href=\"" + movie.url + "\">" +
        "<figure><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"play-chip\">▶</span><span class=\"year-chip\">" + escapeHtml(movie.year) + "</span></figure>" +
        "<div class=\"card-body\"><h2>" + escapeHtml(movie.title) + "</h2><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div>" +
        "</a>";
    };

    const render = function () {
      if (!results) {
        return;
      }
      results.innerHTML = current.slice(0, visibleLimit).map(card).join("");
      if (loadMore) {
        loadMore.style.display = current.length > visibleLimit ? "inline-flex" : "none";
      }
    };

    const runSearch = function () {
      const keyword = (input && input.value ? input.value : "").trim().toLowerCase();
      const type = (select && select.value ? select.value : "").trim().toLowerCase();
      current = window.MOVIE_INDEX.filter(function (movie) {
        const text = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
        const byKeyword = !keyword || text.indexOf(keyword) !== -1;
        const byType = !type || String(movie.type).toLowerCase().indexOf(type) !== -1 || String(movie.genre).toLowerCase().indexOf(type) !== -1;
        return byKeyword && byType;
      }).sort(function (a, b) {
        return b.heat - a.heat;
      });
      visibleLimit = 48;
      render();
    };

    const initial = params.get("q") || "";
    if (input) {
      input.value = initial;
      input.addEventListener("input", runSearch);
    }
    if (select) {
      select.addEventListener("change", runSearch);
    }
    if (button) {
      button.addEventListener("click", runSearch);
    }
    if (loadMore) {
      loadMore.addEventListener("click", function () {
        visibleLimit += 48;
        render();
      });
    }
    runSearch();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  if (body) {
    body.classList.add("ready");
  }
})();
