const players = document.querySelectorAll(".static-player");

players.forEach(function (player) {
  const video = player.querySelector("video");
  const overlay = player.querySelector(".player-overlay");
  const message = player.querySelector(".player-message");
  const source = player.dataset.hls;
  const poster = player.dataset.poster;
  let started = false;
  let instance = null;

  if (video && poster) {
    video.poster = poster;
  }

  const start = async function () {
    if (!video || !source) {
      return;
    }
    if (!started) {
      started = true;
      if (message) {
        message.textContent = "正在加载...";
      }
      try {
        instance = await attachStream(video, source);
      } catch (error) {
        if (message) {
          message.textContent = "播放遇到问题，请稍后重试";
        }
        started = false;
        return;
      }
    }
    player.classList.add("playing");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(function () {
        if (message) {
          message.textContent = "";
        }
      }).catch(function () {
        if (message) {
          message.textContent = "点击视频继续播放";
        }
      });
    }
  };

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  if (video) {
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("playing");
    });
  }

  window.addEventListener("pagehide", function () {
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
    }
  });
});

async function attachStream(video, source) {
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    return null;
  }

  const module = await import("./hls-vendor-dru42stk.js");
  const Hls = module.H || module.default;

  if (Hls && typeof Hls.isSupported === "function" && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    return hls;
  }

  video.src = source;
  return null;
}
