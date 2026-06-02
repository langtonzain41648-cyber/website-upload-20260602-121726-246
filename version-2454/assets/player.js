(function () {
  var video = document.getElementById('main-video');
  var cover = document.getElementById('player-cover');
  var button = document.getElementById('player-button');
  if (!video || typeof videoSource === 'undefined') {
    return;
  }

  var attached = false;
  var attachSource = function (HlsCtor) {
    if (attached) {
      return Promise.resolve();
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource;
      return Promise.resolve();
    }
    if (HlsCtor && HlsCtor.isSupported && HlsCtor.isSupported()) {
      var hls = new HlsCtor({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(videoSource);
      hls.attachMedia(video);
      return Promise.resolve();
    }
    video.src = videoSource;
    return Promise.resolve();
  };

  var start = function () {
    var run = function (HlsCtor) {
      attachSource(HlsCtor).then(function () {
        video.controls = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {
            video.controls = true;
          });
        }
      });
    };
    if (window.Hls) {
      run(window.Hls);
      return;
    }
    if (typeof hlsModulePath !== 'undefined') {
      import(hlsModulePath).then(function (mod) {
        run(mod.H || mod.default);
      }).catch(function () {
        run(null);
      });
      return;
    }
    run(null);
  };

  if (button) {
    button.addEventListener('click', start);
  }
  if (cover) {
    cover.addEventListener('click', start);
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
})();
