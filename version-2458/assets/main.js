(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const chips = Array.from(document.querySelectorAll('[data-filter-year]'));
  let currentYear = '';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    const keyword = normalize(searchInput ? searchInput.value : '');

    cards.forEach(function (card) {
      const text = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.region
      ].join(' '));
      const yearMatch = !currentYear || card.dataset.year === currentYear;
      const keywordMatch = !keyword || text.indexOf(keyword) >= 0;
      card.classList.toggle('is-hidden', !(yearMatch && keywordMatch));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      currentYear = chip.dataset.filterYear || '';

      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip);
      });

      applyFilter();
    });
  });

  const quickSearch = document.querySelector('[data-quick-search]');

  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = quickSearch.querySelector('input');
      const query = input ? encodeURIComponent(input.value.trim()) : '';
      window.location.href = query ? './search.html?q=' + query : './search.html';
    });
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
      searchInput.value = query;
      applyFilter();
    }
  }
})();
