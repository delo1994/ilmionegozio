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

  function cursorThemeForPath() {
    var pathname = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    pathname = pathname.replace(/\.html$/, "");

    if (pathname === "/" || pathname === "/index") return { name: "nave", html: "&#128640;", directional: true };
    if (pathname.indexOf("face4round1") !== -1) return { name: "round", html: "&#10148;" };
    if (pathname.indexOf("face1") !== -1) return { name: "ambienti", html: "&#128142;" };
    if (pathname.indexOf("face2") !== -1) return { name: "video", html: "&#127916;" };
    if (pathname.indexOf("face3") !== -1) return { name: "appuntamenti", html: "&#128197;" };
    if (pathname.indexOf("face4") !== -1) return { name: "giochi", html: "&#127918;" };
    if (pathname.indexOf("face5") !== -1) return { name: "analisi", html: "&#128202;" };
    if (pathname.indexOf("face6") !== -1) return { name: "scanner", html: "&#9672;" };
    if (pathname.indexOf("esempio-1") !== -1 || pathname.indexOf("example1") !== -1) return { name: "gridline", html: "&#128208;" };
    if (pathname.indexOf("esempio-2") !== -1 || pathname.indexOf("example2") !== -1) return { name: "pixzen", html: "&#129302;" };
    if (pathname.indexOf("esempio-3") !== -1 || pathname.indexOf("example3") !== -1) return { name: "zedian", html: "&#9889;" };
    if (pathname.indexOf("cookie") !== -1) return { name: "cookie", html: "&#127850;" };
    if (pathname.indexOf("privacy") !== -1) return { name: "privacy", html: "&#128737;" };
    if (pathname.indexOf("termini") !== -1) return { name: "termini", html: "&sect;" };
    if (pathname.indexOf("accessibilita") !== -1) return { name: "accessibilita", html: "&#9678;" };
    return { name: "documento", html: "&#128196;" };
  }

  window.IlmioCursor = Object.freeze({ themeForPath: cursorThemeForPath });

  function setupCustomCursor() {
    if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var theme = cursorThemeForPath();
    var cursor = doc.createElement("div");
    var object = doc.createElement("span");
    cursor.className = "site-cursor";
    cursor.setAttribute("aria-hidden", "true");
    object.className = "site-cursor__object";
    object.innerHTML = theme.html;
    cursor.appendChild(object);
    doc.body.appendChild(cursor);
    root.dataset.customCursor = "true";
    root.dataset.cursorTheme = theme.name;

    var pointerX = -80;
    var pointerY = -80;
    var lastX = pointerX;
    var lastY = pointerY;
    var rotation = theme.directional ? -45 : 0;
    var framePending = false;

    function renderCursor() {
      framePending = false;
      cursor.style.transform = "translate3d(" + (pointerX - 19) + "px," + (pointerY - 19) + "px,0)";
      cursor.style.setProperty("--cursor-rotation", rotation + "deg");
    }

    function requestRender() {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(renderCursor);
    }

    doc.addEventListener("pointermove", function (event) {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      var deltaX = event.clientX - lastX;
      var deltaY = event.clientY - lastY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (theme.directional && Math.abs(deltaX) + Math.abs(deltaY) > 1.5) {
        rotation = Math.atan2(deltaY, deltaX) * 180 / Math.PI + 45;
      }
      lastX = event.clientX;
      lastY = event.clientY;

      var target = event.target;
      var interactive = target && target.closest && target.closest("a, button, canvas, video, summary, [role='button'], [tabindex]");
      var nativeField = target && target.closest && target.closest("input, textarea, select, option");
      cursor.classList.add("is-visible");
      cursor.classList.toggle("is-over-interactive", Boolean(interactive));
      cursor.classList.toggle("is-over-native", Boolean(nativeField));
      requestRender();
    }, { passive: true });

    doc.addEventListener("pointerdown", function () { cursor.classList.add("is-pressed"); }, true);
    doc.addEventListener("pointerup", function () { cursor.classList.remove("is-pressed"); }, true);
    doc.addEventListener("pointercancel", function () { cursor.classList.remove("is-pressed"); }, true);
    doc.documentElement.addEventListener("mouseleave", function () { cursor.classList.remove("is-visible"); });
    window.addEventListener("blur", function () { cursor.classList.remove("is-visible"); });
  }

  function init() {
    ensureMainTarget();
    secureExternalLinks();
    optimizeImages();
    optimizeVideos();
    improveDialogs();
    setupCustomCursor();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
