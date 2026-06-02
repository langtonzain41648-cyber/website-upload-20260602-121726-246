(function () {
  window.createMoviePlayer = function (videoId, buttonId, maskId, source) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const mask = document.getElementById(maskId);
    let attached = false;

    function attachVideo() {
      if (attached || !video) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function playVideo() {
      if (!video) {
        return;
      }

      attachVideo();
      video.controls = true;

      if (mask) {
        mask.classList.add('is-hidden');
      }

      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }

    if (mask) {
      mask.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          playVideo();
        }
      });
    }
  };
})();
