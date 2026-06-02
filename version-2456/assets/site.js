(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var setSlide = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', value.length > 0 && text.indexOf(value) === -1);
      });
    });
  });
})();
