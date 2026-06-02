var hlsPromise = null;

function loadHls() {
  if (hlsPromise) {
    return hlsPromise;
  }
  hlsPromise = new Promise(function (resolve, reject) {
    if (window.Hls) {
      resolve(window.Hls);
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      resolve(window.Hls);
    };
    script.onerror = function () {
      reject(new Error('hls'));
    };
    document.head.appendChild(script);
  });
  return hlsPromise;
}

async function attachSource(video, source) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  try {
    var Hls = await loadHls();
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = source;
    }
  } catch (error) {
    video.src = source;
  }
}

async function startPlayer(wrapper) {
  var video = wrapper.querySelector('video');
  var button = wrapper.querySelector('[data-play-button]');
  if (!video) {
    return;
  }
  var source = video.getAttribute('data-src');
  if (!source) {
    return;
  }
  if (!video.getAttribute('src') && !video._hls) {
    await attachSource(video, source);
  }
  if (button) {
    button.classList.add('is-hidden');
  }
  video.controls = true;
  var playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(function (wrapper) {
    var button = wrapper.querySelector('[data-play-button]');
    var video = wrapper.querySelector('video');
    if (video && !video.canPlayType('application/vnd.apple.mpegurl')) {
      loadHls().catch(function () {});
    }
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(wrapper);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(wrapper);
        }
      });
    }
  });
});
