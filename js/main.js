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

  /* ---------- Contact form -> mailto ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || "").toString().trim(); };

      var name = get("name");
      var email = get("email");
      var phone = get("phone");
      var eventType = get("event_type");
      var eventDate = get("event_date");
      var venueName = get("venue_name");
      var venueAddress = get("venue_address");
      var pkg = get("package");
      var message = get("message");

      var subject = "New inquiry — " + (eventType || "Event") + (name ? " · " + name : "");

      var lines = [
        "Hi Delight Studio team,",
        "",
        "I'd love to learn more about your photobooth packages.",
        "",
        "Name:        " + name,
        "Email:       " + email,
        "Phone:       " + phone,
        "Event type:  " + eventType,
        "Event date:  " + eventDate,
        "Venue name:  " + venueName,
        "Venue address: " + venueAddress,
        "Interested in: " + pkg,
        "",
        "Details:",
        message,
        "",
        "Thank you!",
        name
      ];

      var href =
        "mailto:hello@thedelightstudio.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\r\n"));

      window.location.href = href;

      var note = document.getElementById("form-status");
      if (note) {
        note.textContent = "Opening your email app… if nothing happens, email us directly at hello@thedelightstudio.com";
        note.style.color = "var(--gold-soft)";
      }
    });
  }
})();
