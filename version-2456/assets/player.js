(function () {
  var video = document.querySelector('[data-player]');
  var button = document.querySelector('[data-play-button]');
  var message = document.querySelector('[data-player-message]');

  if (!video || !button) {
    return;
  }

  var source = video.getAttribute('data-source');
  var ready = false;

  var setMessage = function (text) {
    if (message) {
      message.textContent = text || '';
    }
  };

  var attach = function () {
    if (ready) {
      return;
    }
    ready = true;

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function () {
        setMessage('播放连接暂时不可用');
      });
      window.addEventListener('beforeunload', function () {
        hls.destroy();
      });
      return;
    }

    video.src = source;
  };

  var play = function () {
    attach();
    var promise = video.play();
    if (promise && promise.then) {
      promise.then(function () {
        button.classList.add('is-hidden');
        setMessage('');
      }).catch(function () {
        setMessage('请再次点击播放');
      });
    } else {
      button.classList.add('is-hidden');
    }
  };

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    button.classList.remove('is-hidden');
  });
})();
