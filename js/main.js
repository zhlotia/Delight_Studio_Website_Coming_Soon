/* Delight Studio — interactions
   - floating champagne sparkles on the hero
   - scroll-reveal
   - contact form -> mailto composer
*/
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Champagne sparkles (drift up from the lower third) ---------- */
  var sparkHost = document.querySelector(".landing, .hero");
  if (sparkHost && !reduceMotion) {
    var count = window.innerWidth < 600 ? 16 : 30;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.className = "spark";
      var size = Math.random() * 3.5 + 1.5;
      s.style.width = s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = 48 + Math.random() * 52 + "%";      /* seeded across the lower half */
      var dur = 7 + Math.random() * 9;
      s.style.animation = "drift " + dur + "s linear " + (-Math.random() * dur) + "s infinite";
      sparkHost.appendChild(s);
    }
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (el, idx) {
        el.style.transitionDelay = (idx % 3) * 90 + "ms";
        io.observe(el);
      });
    }
  }

  /* ---------- Contact form -> Google Apps Script (emails the studio) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var ENDPOINT = "https://script.google.com/macros/s/AKfycbyBHadvm8M2d-JvRg-LWXyb9hAn5wMkO7amRfijP6D-cTjEbiEKgwTwtZLASNn9lpQhwQ/exec";
    var status = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      // Honeypot: bots fill the hidden "company" field — silently drop them.
      var hp = form.querySelector('input[name="company"]');
      if (hp && hp.value.trim() !== "") { return; }

      var btnLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
      if (status) { status.className = "form-note"; status.textContent = "Sending your inquiry…"; }

      // URL-encoded body (not multipart) so Apps Script reliably reads e.parameter
      fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: new URLSearchParams(new FormData(form)) })
        .then(function () {
          form.reset();
          if (status) {
            status.className = "form-note is-success";
            status.textContent = "Thank you — your inquiry is on its way. We'll be in touch soon.";
          }
          if (submitBtn) { submitBtn.textContent = "Sent ✓"; }
        })
        .catch(function () {
          if (status) {
            status.className = "form-note is-error";
            status.innerHTML = "Sorry, something went wrong. Please email us directly at " +
              "<a href=\"mailto:hello@thedelightstudio.com\">hello@thedelightstudio.com</a>.";
          }
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = btnLabel; }
        });
    });
  }
})();
