(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.add("js");
  root.dataset.reducedMotion = reduceMotion ? "true" : "false";

  function setInputMode(mode) {
    root.dataset.inputMode = mode;
  }

  doc.addEventListener("keydown", function (event) {
    if (event.key === "Tab" || event.key.indexOf("Arrow") === 0) setInputMode("keyboard");
  }, true);
  doc.addEventListener("pointerdown", function () { setInputMode("pointer"); }, true);

  function ensureMainTarget() {
    var main = doc.querySelector("main");
    if (!main) return null;
    if (!main.id) main.id = "contenuto-principale";
    if (doc.querySelector(".skip-link, .site-skip-link")) return main;

    var link = doc.createElement("a");
    link.className = "site-skip-link";
    link.href = "#" + main.id;
    link.textContent = "Salta al contenuto principale";
    doc.body.insertBefore(link, doc.body.firstChild);
    return main;
  }

  function secureExternalLinks() {
    doc.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", Array.from(rel).join(" "));
    });
  }

  function optimizeImages() {
    doc.querySelectorAll("img").forEach(function (image, index) {
      if (!image.hasAttribute("decoding")) image.decoding = "async";
      if (!image.hasAttribute("loading") && image.getAttribute("fetchpriority") !== "high" && index > 0) {
        image.loading = "lazy";
      }
    });
  }

  function optimizeVideos() {
    var videos = Array.from(doc.querySelectorAll("video"));
    videos.forEach(function (video) {
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      if (!video.getAttribute("preload")) video.preload = "metadata";
    });

    if (!("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (!video.autoplay) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !reduceMotion) {
          video.play().catch(function () {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: [0, 0.25, 0.75] });
    videos.forEach(function (video) { observer.observe(video); });
  }

  function improveDialogs() {
    doc.querySelectorAll('[role="dialog"], [role="alertdialog"]').forEach(function (dialog) {
      if (!dialog.hasAttribute("aria-modal")) dialog.setAttribute("aria-modal", "true");
    });
  }

  function init() {
    ensureMainTarget();
    secureExternalLinks();
    optimizeImages();
    optimizeVideos();
    improveDialogs();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
