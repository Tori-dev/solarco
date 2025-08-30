(function () {
  const header = document.getElementById("site-header");
  const menuButton = document.getElementById("menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconMenu = document.getElementById("icon-menu");
  const iconClose = document.getElementById("icon-close");
  const yearEl = document.getElementById("year");

  // Set current year in footer
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile menu toggle
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      const isOpen = !mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden");
      if (iconMenu && iconClose) {
        iconMenu.classList.toggle("hidden");
        iconClose.classList.toggle("hidden");
      }
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute(
        "aria-label",
        !isOpen ? "Close menu" : "Open menu"
      );
    });

    // Close on link click (mobile)
    mobileMenu.addEventListener("click", function (e) {
      const target = e.target;
      if (target && target.tagName === "A") {
        mobileMenu.classList.add("hidden");
        if (iconMenu && iconClose) {
          iconMenu.classList.remove("hidden");
          iconClose.classList.add("hidden");
        }
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      }
    });
  }

  // Header shadow on scroll
  const applyHeaderScrollStyle = function () {
    if (!header) return;
    const shouldElevate = window.scrollY > 8;
    header.classList.toggle("shadow-sm", shouldElevate);
    header.classList.toggle("bg-white/80", shouldElevate);
  };
  applyHeaderScrollStyle();
  window.addEventListener("scroll", applyHeaderScrollStyle, { passive: true });

  // Active link highlighting with GSAP ScrollTrigger (fallback to IntersectionObserver)
  const desktopNavLinks = Array.from(
    document.querySelectorAll(
      'header nav[aria-label="Primary"] a[data-section]'
    )
  );
  const mobileNavLinks = Array.from(
    document.querySelectorAll("#mobile-menu a[data-section]")
  );
  const allNavLinks = desktopNavLinks.concat(mobileNavLinks);

  function setActiveLink(sectionId) {
    allNavLinks.forEach(function (link) {
      const isActive = link.getAttribute("data-section") === sectionId;
      link.classList.toggle("text-solarGreen", isActive);
      link.classList.toggle("font-semibold", isActive);
    });
  }

  var sections = [];
  allNavLinks.forEach(function (link) {
    var id = link.getAttribute("data-section");
    if (id) {
      var el = document.getElementById(id);
      if (el && sections.indexOf(el) === -1) sections.push(el);
    }
  });

  if (sections.length) {
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      sections.forEach(function (section) {
        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          onEnter: function () {
            setActiveLink(section.id);
          },
          onEnterBack: function () {
            setActiveLink(section.id);
          },
        });
      });
    } else if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActiveLink(entry.target.id);
            }
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.5 }
      );
      sections.forEach(function (section) {
        observer.observe(section);
      });
    }
  }
})();
