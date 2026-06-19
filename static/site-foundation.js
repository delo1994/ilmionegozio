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
    if (pathname.indexOf("face5") !== -1) return { name: "analisi-linee", html: "&#128200;" };
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

  function setupWhatsAppChat() {
    if (doc.querySelector(".site-whatsapp")) return;

    var phoneNumber = "393347992295";
    var widget = doc.createElement("aside");
    widget.className = "site-whatsapp";
    widget.setAttribute("aria-label", "Assistenza WhatsApp");
    widget.innerHTML = [
      '<section class="site-whatsapp__panel" id="site-whatsapp-panel" role="dialog" aria-modal="false" aria-labelledby="site-whatsapp-title" hidden>',
        '<header class="site-whatsapp__header">',
          '<span class="site-whatsapp__avatar" aria-hidden="true">',
            '<svg viewBox="0 0 32 32" focusable="false"><path fill="currentColor" d="M16 3.2A12.6 12.6 0 0 0 5.1 22.1L3.3 28.7l6.8-1.8A12.6 12.6 0 1 0 16 3.2Zm0 22.9c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 .9 1.1-3.9-.3-.4a10.3 10.3 0 1 1 9.1 5.2Zm5.7-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-1.8-.9-3-1.7-4.2-3.8-.3-.6.3-.6.9-1.3.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.5c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.7 0 1.6 1.2 3.1 1.3 3.3.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.6.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z"/></svg>',
          '</span>',
          '<span class="site-whatsapp__identity"><strong id="site-whatsapp-title">ilmionegozio.com</strong><small>WhatsApp &middot; +39 334 799 2295</small></span>',
          '<button class="site-whatsapp__close" type="button" aria-label="Chiudi la minichat">&times;</button>',
        '</header>',
        '<div class="site-whatsapp__body">',
          '<p class="site-whatsapp__bubble">Ciao! Scrivi il tuo messaggio: lo apriremo direttamente su WhatsApp.</p>',
          '<form class="site-whatsapp__form">',
            '<label class="site-visually-hidden" for="site-whatsapp-message">Messaggio WhatsApp</label>',
            '<textarea id="site-whatsapp-message" rows="3" maxlength="500" placeholder="Come possiamo aiutarti?"></textarea>',
            '<button class="site-whatsapp__send" type="submit">Apri WhatsApp <span aria-hidden="true">&#8599;</span></button>',
          '</form>',
        '</div>',
      '</section>',
      '<button class="site-whatsapp__launcher" type="button" aria-label="Apri la minichat WhatsApp" aria-controls="site-whatsapp-panel" aria-expanded="false">',
        '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3.2A12.6 12.6 0 0 0 5.1 22.1L3.3 28.7l6.8-1.8A12.6 12.6 0 1 0 16 3.2Zm0 22.9c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 .9 1.1-3.9-.3-.4a10.3 10.3 0 1 1 9.1 5.2Zm5.7-7.7c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.7.1-1.8-.9-3-1.7-4.2-3.8-.3-.6.3-.6.9-1.3.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.5c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.7 0 1.6 1.2 3.1 1.3 3.3.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.6.8.3 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z"/></svg>',
        '<span class="site-whatsapp__unread" aria-hidden="true">1</span>',
      '</button>'
    ].join("");
    doc.body.appendChild(widget);

    var panel = widget.querySelector(".site-whatsapp__panel");
    var launcher = widget.querySelector(".site-whatsapp__launcher");
    var closeButton = widget.querySelector(".site-whatsapp__close");
    var form = widget.querySelector(".site-whatsapp__form");
    var message = widget.querySelector("#site-whatsapp-message");

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      widget.classList.toggle("is-open", open);
      launcher.setAttribute("aria-expanded", String(open));
      launcher.setAttribute("aria-label", open ? "Chiudi la minichat WhatsApp" : "Apri la minichat WhatsApp");
      if (open) window.setTimeout(function () { message.focus(); }, reduceMotion ? 0 : 170);
      else if (returnFocus) launcher.focus();
    }

    launcher.addEventListener("click", function () { setOpen(panel.hidden, false); });
    closeButton.addEventListener("click", function () { setOpen(false, true); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var text = message.value.trim() || "Ciao, vorrei ricevere informazioni sui vostri servizi.";
      var url = "https://wa.me/" + phoneNumber + "?text=" + encodeURIComponent(text);
      var whatsappWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (whatsappWindow) whatsappWindow.opener = null;
    });
    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) setOpen(false, true);
    });
    doc.addEventListener("pointerdown", function (event) {
      if (!panel.hidden && !widget.contains(event.target)) setOpen(false, false);
    });

    window.IlmioWhatsApp = Object.freeze({
      phone: phoneNumber,
      open: function () { setOpen(true, false); },
      close: function () { setOpen(false, false); },
      state: function () { return { open: !panel.hidden, phone: phoneNumber }; }
    });
  }

  function init() {
    ensureMainTarget();
    secureExternalLinks();
    optimizeImages();
    optimizeVideos();
    improveDialogs();
    setupCustomCursor();
    setupWhatsAppChat();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
