(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  function initFilters() {
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
    areas.forEach(function (area) {
      var input = area.querySelector("[data-filter-input]");
      var year = area.querySelector("[data-filter-year]");
      var type = area.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(area.querySelectorAll(".filter-card"));
      var empty = area.querySelector("[data-empty-state]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var matchesType = !typeValue || normalize(card.getAttribute("data-type")).indexOf(typeValue) !== -1;
          var isVisible = matchesKeyword && matchesYear && matchesType;
          card.hidden = !isVisible;
          if (isVisible) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (input && query) {
        input.value = query;
      }
      apply();
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
})();
