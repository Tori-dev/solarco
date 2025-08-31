(function () {
  var form = document.getElementById("quote-form");
  if (!form) return;

  function showError(inputEl, message) {
    var err = form.querySelector('[data-error-for="' + inputEl.name + '"]');
    if (err) {
      err.textContent = message;
      err.classList.remove("hidden");
    }
    inputEl.setAttribute("aria-invalid", "true");
  }

  function clearError(inputEl) {
    var err = form.querySelector('[data-error-for="' + inputEl.name + '"]');
    if (err) err.classList.add("hidden");
    inputEl.removeAttribute("aria-invalid");
  }

  function validateEmail(value) {
    return /.+@.+\..+/.test(String(value || "").toLowerCase());
  }

  function validatePhone(value) {
    return /[0-9()+\-\s]{7,}/.test(String(value || ""));
  }

  ["name", "email", "phone", "location"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      clearError(el);
    });
    el.addEventListener("blur", function () {
      if (!el.value.trim()) {
        showError(el, "This field is required.");
      } else if (id === "email" && !validateEmail(el.value)) {
        showError(el, "Enter a valid email address.");
      } else if (id === "phone" && !validatePhone(el.value)) {
        showError(el, "Enter a valid phone number.");
      } else {
        clearError(el);
      }
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nameEl = document.getElementById("name");
    var emailEl = document.getElementById("email");
    var phoneEl = document.getElementById("phone");
    var locationEl = document.getElementById("location");
    var ctaBtn = document.getElementById("cta-submit");

    var valid = true;
    if (!nameEl.value.trim()) {
      showError(nameEl, "Please enter your name.");
      valid = false;
    }
    if (!validateEmail(emailEl.value)) {
      showError(emailEl, "Enter a valid email address.");
      valid = false;
    }
    if (!validatePhone(phoneEl.value)) {
      showError(phoneEl, "Enter a valid phone number.");
      valid = false;
    }
    if (!locationEl.value.trim()) {
      showError(locationEl, "Please tell us your city/state.");
      valid = false;
    }

    if (!valid) return;

    // Mock submit
    if (ctaBtn) ctaBtn.disabled = true;
    var payload = {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      phone: phoneEl.value.trim(),
      location: locationEl.value.trim(),
      source: "solar-site-cta",
      timestamp: new Date().toISOString(),
    };
    console.log("CTA submission:", payload);
    setTimeout(function () {
      alert(
        "Thanks! We received your request and will reach out within 1 business day."
      );
      form.reset();
      if (ctaBtn) ctaBtn.disabled = false;
    }, 600);
  });
})();
