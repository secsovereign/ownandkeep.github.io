(function () {
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  var NTFY_TOPIC = "ownandkeep-inbox-16ae8436";
  var lastSubmit = 0;

  function setScrolled() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  window.addEventListener("scroll", setScrolled, { passive: true });
  setScrolled();

  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
  }

  if (menu) {
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle) setMenu(false);
  });

  function sendNtfy(form, statusEl, title, body) {
    var now = Date.now();
    if (now - lastSubmit < 30000) {
      statusEl.textContent = "Wait a moment before sending again.";
      return;
    }
    var button = form.querySelector("button[type=submit]");
    button.disabled = true;
    statusEl.textContent = "Sending…";
    fetch("https://ntfy.sh/" + NTFY_TOPIC, {
      method: "POST",
      headers: { Title: title, Tags: "envelope" },
      body: body,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("ntfy " + res.status);
        lastSubmit = Date.now();
        form.reset();
        statusEl.textContent = "Sent.";
      })
      .catch(function () {
        statusEl.textContent = "Could not send. Try again.";
      })
      .then(function () {
        button.disabled = false;
      });
  }

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var honeypot = contactForm.querySelector("[name=website]");
      if (honeypot && honeypot.value) return;
      var name = (contactForm.elements.name.value || "").trim();
      var reach = (contactForm.elements.reach.value || "").trim();
      var message = (contactForm.elements.message.value || "").trim();
      var statusEl = document.getElementById("contact-status");
      if (!name || !reach || !message) {
        statusEl.textContent = "Fill in every field.";
        return;
      }
      sendNtfy(
        contactForm,
        statusEl,
        "OwnandKeep contact",
        "Name: " + name + "\nReach: " + reach + "\n\n" + message
      );
    });
  }

  var supportForm = document.getElementById("support-form");
  if (supportForm) {
    supportForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var honeypot = supportForm.querySelector("[name=website]");
      if (honeypot && honeypot.value) return;
      var statusEl = document.getElementById("support-status");
      var name = (supportForm.elements.name.value || "").trim();
      var email = (supportForm.elements.email.value || "").trim();
      var country = (supportForm.elements.country.value || "").trim();
      var goals = (supportForm.elements.goals.value || "").trim();
      var familiarity = supportForm.querySelector("[name=familiarity]:checked");
      var interests = Array.prototype.map
        .call(supportForm.querySelectorAll("[name=interest]:checked"), function (el) {
          return el.value;
        })
        .join(", ");
      if (!name || !email || !country || !goals || !familiarity) {
        statusEl.textContent = "Fill the required fields.";
        return;
      }
      var body = [
        "TYPE: Sovreign referral",
        "Source: OwnandKeep /support/",
        "Name: " + name,
        "Business: " + (supportForm.elements.business.value || "").trim(),
        "Email: " + email,
        "Phone: " + (supportForm.elements.phone.value || "").trim(),
        "Country: " + country,
        "State: " + (supportForm.elements.state.value || "").trim(),
        "Goals: " + goals,
        "Familiarity: " + familiarity.value,
        "Interests: " + interests,
        "Elaborate: " + (supportForm.elements.elaborate.value || "").trim(),
        "Other: " + (supportForm.elements.other.value || "").trim(),
      ].join("\n");
      sendNtfy(supportForm, statusEl, "OwnandKeep support referral", body);
    });
  }

  var cards = document.querySelectorAll(".product-card");

  if (!("IntersectionObserver" in window)) {
    cards.forEach(function (card) {
      card.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  cards.forEach(function (card) {
    observer.observe(card);
  });
})();
