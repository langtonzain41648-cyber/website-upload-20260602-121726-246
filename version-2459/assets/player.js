(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachStream(video, stream) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function initPlayer(root) {
    var video = root.querySelector("video");
    var overlay = root.querySelector(".player-overlay");
    var stream = root.getAttribute("data-stream");
    var attached = false;

    if (!video || !overlay || !stream) {
      return;
    }

    function start() {
      if (!attached) {
        attachStream(video, stream);
        attached = true;
      }
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".site-player")).forEach(initPlayer);
  });
})();
