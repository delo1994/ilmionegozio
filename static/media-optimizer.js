(function (window) {
  "use strict";

  var sharedContext = null;
  var firstInteractionDone = false;
  var firstInteractionCallbacks = [];
  var firstInteractionListening = false;

  function getAudioContext() {
    if (sharedContext) return sharedContext;
    var AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    sharedContext = new AudioContextCtor();
    return sharedContext;
  }

  function unlockAudioContext() {
    var ctx = getAudioContext();
    if (!ctx) return Promise.resolve(false);

    var resume = ctx.state === "suspended" ? ctx.resume().catch(function () {}) : Promise.resolve();
    return resume.then(function () {
      try {
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (error) {
        // Some older mobile browsers reject the silent buffer. Audio can still work via HTMLAudio.
      }
      return true;
    });
  }

  function onFirstInteraction(callback) {
    if (firstInteractionDone) {
      callback();
      return;
    }
    firstInteractionCallbacks.push(callback);
    if (firstInteractionListening) return;
    firstInteractionListening = true;

    var events = ["pointerdown", "touchstart", "click", "keydown"];
    function handler(event) {
      if (firstInteractionDone) return;
      firstInteractionDone = true;
      events.forEach(function (name) {
        document.removeEventListener(name, handler, true);
      });
      firstInteractionCallbacks.splice(0).forEach(function (queuedCallback) {
        queuedCallback(event);
      });
    }
    events.forEach(function (name) {
      document.addEventListener(name, handler, { once: true, passive: name !== "keydown", capture: true });
    });
  }

  function whenIdle(callback, fallbackDelay) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: fallbackDelay || 1200 });
    } else {
      window.setTimeout(callback, fallbackDelay || 300);
    }
  }

  function normalizeEntries(entries) {
    return entries.map(function (entry) {
      if (typeof entry === "string") {
        return { id: entry, src: entry };
      }
      return entry;
    });
  }

  function createAudioPool(entries, options) {
    var list = normalizeEntries(entries);
    var settings = options || {};
    var buffers = new Map();
    var pending = new Map();
    var fallbackAudio = new Map();

    list.forEach(function (entry) {
      var audio = new Audio(entry.src);
      audio.preload = settings.htmlPreload || "auto";
      audio.crossOrigin = "anonymous";
      audio.load();
      fallbackAudio.set(entry.id, audio);
    });

    function getEntry(id) {
      return list.find(function (entry) { return entry.id === id || entry.src === id; });
    }

    function load(entry) {
      if (!entry || buffers.has(entry.id)) return Promise.resolve(buffers.get(entry && entry.id));
      if (pending.has(entry.id)) return pending.get(entry.id);

      var promise = Promise.resolve()
        .then(getAudioContext)
        .then(function (ctx) {
          if (!ctx) return null;
          return fetch(entry.src, { cache: "force-cache" })
            .then(function (response) {
              if (!response.ok) throw new Error("Audio fetch failed: " + entry.src);
              return response.arrayBuffer();
            })
            .then(function (arrayBuffer) {
              return ctx.decodeAudioData(arrayBuffer.slice(0));
            })
            .then(function (buffer) {
              buffers.set(entry.id, buffer);
              return buffer;
            });
        })
        .catch(function () {
          return null;
        })
        .finally(function () {
          pending.delete(entry.id);
        });

      pending.set(entry.id, promise);
      return promise;
    }

    function preload(ids) {
      var selected = ids && ids.length ? ids.map(getEntry).filter(Boolean) : list;
      return Promise.all(selected.map(load));
    }

    function play(id) {
      var entry = id ? getEntry(id) : list[Math.floor(Math.random() * list.length)];
      if (!entry) return Promise.resolve(false);

      var ctx = getAudioContext();
      if (ctx && buffers.has(entry.id)) {
        try {
          var source = ctx.createBufferSource();
          source.buffer = buffers.get(entry.id);
          source.connect(ctx.destination);
          source.start(0);
          return Promise.resolve(true);
        } catch (error) {
          // Fallback below.
        }
      }

      load(entry);
      var audio = fallbackAudio.get(entry.id);
      if (!audio) return Promise.resolve(false);
      try {
        audio.currentTime = 0;
      } catch (error) {}
      return audio.play().then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }

    function playRandom() {
      var readyEntries = list.filter(function (entry) { return buffers.has(entry.id); });
      var pool = readyEntries.length ? readyEntries : list;
      var entry = pool[Math.floor(Math.random() * pool.length)];
      return play(entry.id);
    }

    return {
      preload: preload,
      unlock: unlockAudioContext,
      play: play,
      playRandom: playRandom,
      hasBuffer: function (id) { return buffers.has(id); },
      getAudioElement: function (id) { return fallbackAudio.get(id); }
    };
  }

  function prepareVideo(video, options) {
    if (!video) return null;
    var settings = options || {};
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.playsInline = true;
    video.preload = settings.preload || video.preload || "metadata";
    if (settings.poster && !video.poster) video.poster = settings.poster;
    try {
      video.load();
    } catch (error) {}
    return video;
  }

  function warmVideo(video, options) {
    if (!video) return Promise.resolve(false);
    var settings = options || {};
    prepareVideo(video, settings);
    if (settings.forceAuto) video.preload = "auto";
    try {
      video.load();
    } catch (error) {}

    if (settings.tryMutedPlay && video.muted) {
      return video.play().then(function () {
        video.pause();
        try {
          if (video.currentTime > 0.05) video.currentTime = 0;
        } catch (error) {}
        return true;
      }).catch(function () {
        return false;
      });
    }
    return Promise.resolve(true);
  }

  window.IlmioMedia = {
    createAudioPool: createAudioPool,
    getAudioContext: getAudioContext,
    unlockAudioContext: unlockAudioContext,
    onFirstInteraction: onFirstInteraction,
    prepareVideo: prepareVideo,
    warmVideo: warmVideo,
    whenIdle: whenIdle
  };
})(window);
