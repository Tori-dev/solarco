(function () {
  const header = document.getElementById("site-header");
  const menuButton = document.getElementById("menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const iconMenu = document.getElementById("icon-menu");
  const iconClose = document.getElementById("icon-close");
  const yearEl = document.getElementById("year");
  const heroSection = document.getElementById("hero");

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

  // --- Hero animations (GSAP) ---
  if (heroSection && window.gsap) {
    var prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Elements
    var headline = heroSection.querySelector(".headline");
    var subhead = heroSection.querySelector(".subhead");
    var ctas = Array.from(heroSection.querySelectorAll(".ctas a"));
    var badges = heroSection.querySelector(".badges");
    var scrollDot = heroSection.querySelector(".scroll-indicator .dot");
    var videoEl = heroSection.querySelector("video");
    var sunGlow = document.getElementById("sun-glow");

    // Initial states
    gsap.set([headline, subhead, ctas, badges], { opacity: 0, y: 16 });
    if (sunGlow) gsap.set(sunGlow, { opacity: 0, scale: 0.9 });

    var intro = function () {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(headline, { opacity: 1, y: 0, duration: 0.9 })
        .to(subhead, { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(ctas, { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, "-=0.4")
        .to(badges, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");

      // Sun glow subtle entrance + breathing
      if (sunGlow && !prefersReducedMotion) {
        tl.to(
          sunGlow,
          { opacity: 1, scale: 1, duration: 1.2, ease: "sine.out" },
          "<"
        );
        gsap.to(sunGlow, {
          scale: 1.08,
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Scroll indicator loop
      if (scrollDot && !prefersReducedMotion) {
        gsap.fromTo(
          scrollDot,
          { y: 0, opacity: 0.8 },
          {
            y: 10,
            opacity: 0.2,
            duration: 1.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }
        );
      }
    };

    // Run intro when video is ready or after a short fallback delay
    var didIntro = false;
    var runIntroOnce = function () {
      if (didIntro) return;
      didIntro = true;
      intro();
    };

    if (videoEl) {
      videoEl.addEventListener("loadeddata", runIntroOnce, { once: true });
      // Fallback in case loadeddata doesn't fire quickly
      setTimeout(runIntroOnce, 800);
    } else {
      setTimeout(runIntroOnce, 300);
    }

    // Parallax / scale on scroll
    if (window.ScrollTrigger && !prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      if (videoEl) {
        gsap.to(videoEl, {
          scale: 1.06,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
      if (sunGlow) {
        gsap.to(sunGlow, {
          x: 40,
          y: 60,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }
  }

  // --- Services / Solutions animations ---
  var servicesSection = document.getElementById("services");
  if (servicesSection && window.gsap) {
    var prefersReducedMotionServices = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var heading = servicesSection.querySelector("h2");
    var introCopy = servicesSection.querySelector("p");
    var cards = Array.from(servicesSection.querySelectorAll(".service-card"));

    // Set initial states
    gsap.set([heading, introCopy], { opacity: 0, y: 18 });
    gsap.set(cards, { opacity: 0, y: 20, scale: 0.98 });

    var reveal = function () {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to([heading, introCopy], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
      }).to(
        cards,
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12 },
        "-=0.3"
      );
    };

    if (!prefersReducedMotionServices) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: servicesSection,
          start: "top 75%",
          once: true,
          onEnter: reveal,
        });
      } else if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                reveal();
                io.disconnect();
              }
            });
          },
          { root: null, rootMargin: "0px", threshold: 0.3 }
        );
        io.observe(servicesSection);
      } else {
        // Fallback
        setTimeout(reveal, 300);
      }
    } else {
      // Reduced motion: no animation, just show
      gsap.set([heading, introCopy, cards], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
    }

    // Hover/focus micro-interactions per card
    if (!prefersReducedMotionServices) {
      cards.forEach(function (card) {
        var lift = gsap.quickTo(card, "y", {
          duration: 0.25,
          ease: "power2.out",
        });
        var scaleTo = gsap.quickTo(card, "scale", {
          duration: 0.25,
          ease: "power2.out",
        });
        var shadowTo = gsap.quickTo(card, "boxShadow", {
          duration: 0.25,
          ease: "power2.out",
        });

        function onEnter() {
          lift(-6);
          scaleTo(1.015);
          shadowTo("0 12px 40px rgba(0,0,0,0.10)");
        }
        function onLeave() {
          lift(0);
          scaleTo(1);
          shadowTo("0 8px 30px rgba(0,0,0,0.06)");
        }

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        card.addEventListener("focusin", onEnter);
        card.addEventListener("focusout", onLeave);
      });
    }
  }

  // --- Process (How It Works) animations ---
  var processSection = document.getElementById("process");
  if (processSection && window.gsap) {
    var prefersReducedMotionProcess = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var processHeading = processSection.querySelector("h2");
    var processCopy = processSection.querySelector("p");
    var processSteps = Array.from(
      processSection.querySelectorAll(".process-step")
    );
    var lineDesktop = document.getElementById("process-line-desktop");
    var lineMobile = document.getElementById("process-line-mobile");

    // Initial states
    gsap.set([processHeading, processCopy], { opacity: 0, y: 18 });
    gsap.set(processSteps, { opacity: 0, y: 24, scale: 0.98 });
    if (lineDesktop) gsap.set(lineDesktop, { width: 0 });
    if (lineMobile) gsap.set(lineMobile, { height: 0 });

    var revealProcess = function () {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to([processHeading, processCopy], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
      });

      // Steps + connecting line animation in sync
      tl.addLabel("steps");
      if (lineDesktop) {
        tl.to(
          lineDesktop,
          { width: "100%", duration: 1.2, ease: "power2.out" },
          "steps"
        );
      }
      if (lineMobile) {
        // Grow to match container height
        var mobileHeight = 0;
        try {
          // Fallback height if measurement fails
          mobileHeight =
            processSection.querySelector(".md\\:hidden.relative.mt-8")
              ?.offsetHeight || 256;
        } catch (e) {
          mobileHeight = 256;
        }
        tl.to(lineMobile, { height: mobileHeight, duration: 1.2 }, "steps");
      }

      tl.to(
        processSteps,
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15 },
        "steps+=0.1"
      );
    };

    if (!prefersReducedMotionProcess) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: processSection,
          start: "top 75%",
          once: true,
          onEnter: revealProcess,
        });
      } else if ("IntersectionObserver" in window) {
        var ioProcess = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                revealProcess();
                ioProcess.disconnect();
              }
            });
          },
          { root: null, rootMargin: "0px", threshold: 0.3 }
        );
        ioProcess.observe(processSection);
      } else {
        setTimeout(revealProcess, 300);
      }
    } else {
      gsap.set([processHeading, processCopy, processSteps], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
      if (lineDesktop) gsap.set(lineDesktop, { width: "100%" });
      if (lineMobile) gsap.set(lineMobile, { height: 256 });
    }
  }

  // --- Impact / Statistics animations ---
  var impactSection = document.getElementById("impact");
  if (impactSection && window.gsap) {
    var prefersReducedMotionImpact = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var impactHeading = impactSection.querySelector("h2");
    var impactCopy = impactSection.querySelector("p");
    var statCards = Array.from(impactSection.querySelectorAll(".stat-card"));
    var statNumbers = Array.from(
      impactSection.querySelectorAll(".stat-number")
    );

    // Initial
    gsap.set([impactHeading, impactCopy], { opacity: 0, y: 18 });
    gsap.set(statCards, { opacity: 0, y: 20, scale: 0.98 });

    function countUpNumbers() {
      statNumbers.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-target") || "0", 10);
        if (isNaN(target)) target = 0;
        if (prefersReducedMotionImpact) {
          el.textContent = String(target);
          return;
        }
        var counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: function () {
            el.textContent = String(Math.floor(counter.value));
          },
          onComplete: function () {
            el.textContent = String(target);
          },
        });
      });
    }

    var revealImpact = function () {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to([impactHeading, impactCopy], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
      }).to(
        statCards,
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12 },
        "-=0.2"
      );
      tl.add(countUpNumbers, "<+0.1");
    };

    if (!prefersReducedMotionImpact) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: impactSection,
          start: "top 75%",
          once: true,
          onEnter: revealImpact,
        });
      } else if ("IntersectionObserver" in window) {
        var ioImpact = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                revealImpact();
                ioImpact.disconnect();
              }
            });
          },
          { root: null, rootMargin: "0px", threshold: 0.3 }
        );
        ioImpact.observe(impactSection);
      } else {
        setTimeout(revealImpact, 300);
      }
    } else {
      gsap.set([impactHeading, impactCopy, statCards], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
      // Set final numbers without animation
      statNumbers.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-target") || "0", 10);
        if (isNaN(target)) target = 0;
        el.textContent = String(target);
      });
    }
  }

  // --- Testimonials carousel (GSAP fade/slide) ---
  var testimonialsSection = document.getElementById("testimonials");
  if (testimonialsSection && window.gsap) {
    var prefersReducedMotionTestimonials = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var testimonialsCarousel = document.getElementById("testimonials-carousel");
    if (testimonialsCarousel) {
      var slides = Array.from(
        testimonialsCarousel.querySelectorAll(".testimonial-slide")
      );
      var dots = Array.from(
        testimonialsCarousel.querySelectorAll(".testimonial-dot")
      );
      var prevBtn = testimonialsCarousel.querySelector(".testimonial-prev");
      var nextBtn = testimonialsCarousel.querySelector(".testimonial-next");

      var activeIndex = 0;
      var autoplayTimer = null;
      var autoplayMs = 6000;

      // Initialize slides
      if (slides.length) {
        gsap.set(slides, { opacity: 0, x: 20, pointerEvents: "none" });
        gsap.set(slides[0], { opacity: 1, x: 0, pointerEvents: "auto" });
        slides[0].setAttribute("aria-hidden", "false");
        slides.slice(1).forEach(function (s) {
          s.setAttribute("aria-hidden", "true");
        });
        updateDots();
      }

      function updateDots() {
        dots.forEach(function (dot, i) {
          var isActive = i === activeIndex;
          dot.classList.toggle("bg-solarGreen", isActive);
          dot.classList.toggle("bg-slate-300", !isActive);
          dot.setAttribute("aria-selected", String(isActive));
          dot.setAttribute("tabindex", isActive ? "0" : "-1");
        });
      }

      function goTo(index) {
        if (!slides.length) return;
        var nextIndex = (index + slides.length) % slides.length;
        if (nextIndex === activeIndex) return;

        var current = slides[activeIndex];
        var next = slides[nextIndex];

        // Animate out current, in next
        var tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.6 },
        });
        tl.to(current, { opacity: 0, x: -20, pointerEvents: "none" });
        tl.set(current, { ariaHidden: true });
        tl.fromTo(
          next,
          { opacity: 0, x: 20, pointerEvents: "none" },
          { opacity: 1, x: 0, pointerEvents: "auto" },
          "<"
        );
        next.setAttribute("aria-hidden", "false");
        current.setAttribute("aria-hidden", "true");

        activeIndex = nextIndex;
        updateDots();
      }

      function nextSlide() {
        goTo(activeIndex + 1);
      }
      function prevSlide() {
        goTo(activeIndex - 1);
      }

      // Controls
      if (nextBtn) nextBtn.addEventListener("click", nextSlide);
      if (prevBtn) prevBtn.addEventListener("click", prevSlide);
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var idx = parseInt(dot.getAttribute("data-index") || "0", 10);
          if (!isNaN(idx)) goTo(idx);
        });
      });

      // Autoplay with pause on hover/focus
      function startAutoplay() {
        if (prefersReducedMotionTestimonials) return;
        stopAutoplay();
        autoplayTimer = window.setInterval(nextSlide, autoplayMs);
      }
      function stopAutoplay() {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }
      testimonialsCarousel.addEventListener("mouseenter", stopAutoplay);
      testimonialsCarousel.addEventListener("mouseleave", startAutoplay);
      testimonialsCarousel.addEventListener("focusin", stopAutoplay);
      testimonialsCarousel.addEventListener("focusout", startAutoplay);

      // Reveal animation on scroll
      var headingT = testimonialsSection.querySelector("h2");
      var copyT = testimonialsSection.querySelector("p");
      gsap.set([headingT, copyT], { opacity: 0, y: 18 });
      function revealTestimonialsHeader() {
        var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.to([headingT, copyT], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
        });
      }
      if (!prefersReducedMotionTestimonials) {
        if (window.ScrollTrigger) {
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.create({
            trigger: testimonialsSection,
            start: "top 75%",
            once: true,
            onEnter: function () {
              revealTestimonialsHeader();
              startAutoplay();
            },
          });
        } else if ("IntersectionObserver" in window) {
          var ioT = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                  revealTestimonialsHeader();
                  startAutoplay();
                  ioT.disconnect();
                }
              });
            },
            { root: null, rootMargin: "0px", threshold: 0.3 }
          );
          ioT.observe(testimonialsSection);
        } else {
          setTimeout(function () {
            revealTestimonialsHeader();
            startAutoplay();
          }, 300);
        }
      } else {
        gsap.set([headingT, copyT], { clearProps: "all", opacity: 1, y: 0 });
      }
    }
  }

  // --- FAQ accordion (GSAP expand/collapse) ---
  var faqSection = document.getElementById("faq");
  if (faqSection && window.gsap) {
    var prefersReducedMotionFaq = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var faqItems = Array.from(faqSection.querySelectorAll(".faq-item"));
    var triggers = Array.from(faqSection.querySelectorAll(".faq-trigger"));
    var panels = Array.from(faqSection.querySelectorAll(".faq-panel"));

    function closeAll(except) {
      panels.forEach(function (panel, idx) {
        if (panel === except) return;
        triggers[idx].setAttribute("aria-expanded", "false");
        panel.classList.add("hidden");
        gsap.set(panel, { height: 0 });
      });
    }

    // Setup initial states
    panels.forEach(function (panel) {
      gsap.set(panel, { height: 0 });
    });

    function togglePanel(trigger, panel) {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        trigger.setAttribute("aria-expanded", "false");
        if (prefersReducedMotionFaq) {
          panel.classList.add("hidden");
          gsap.set(panel, { height: 0 });
          return;
        }
        gsap.to(panel, {
          height: 0,
          duration: 0.35,
          ease: "power2.out",
          onComplete: function () {
            panel.classList.add("hidden");
          },
        });
      } else {
        // open selected and close others
        closeAll(panel);
        trigger.setAttribute("aria-expanded", "true");
        panel.classList.remove("hidden");
        var contentHeight = panel.scrollHeight;
        if (prefersReducedMotionFaq) {
          gsap.set(panel, { height: contentHeight });
          return;
        }
        gsap.fromTo(
          panel,
          { height: 0 },
          { height: contentHeight, duration: 0.4, ease: "power2.out" }
        );
      }
    }

    triggers.forEach(function (trigger) {
      var controls = trigger.getAttribute("aria-controls");
      if (!controls) return;
      var panel = document.getElementById(controls);
      if (!panel) return;
      trigger.addEventListener("click", function () {
        togglePanel(trigger, panel);
      });
      // Keyboard support
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePanel(trigger, panel);
        }
      });
    });

    // Reveal header on scroll
    var headingF = faqSection.querySelector("h2");
    var copyF = faqSection.querySelector("p");
    gsap.set([headingF, copyF], { opacity: 0, y: 18 });
    function revealFaqHeader() {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to([headingF, copyF], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
      });
    }
    if (!prefersReducedMotionFaq) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: faqSection,
          start: "top 75%",
          once: true,
          onEnter: revealFaqHeader,
        });
      } else if ("IntersectionObserver" in window) {
        var ioF = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                revealFaqHeader();
                ioF.disconnect();
              }
            });
          },
          { root: null, rootMargin: "0px", threshold: 0.3 }
        );
        ioF.observe(faqSection);
      } else {
        setTimeout(revealFaqHeader, 300);
      }
    } else {
      gsap.set([headingF, copyF], { clearProps: "all", opacity: 1, y: 0 });
    }
  }

  // --- CTA (Contact) reveal + CTA glow ---
  var ctaSection = document.getElementById("contact");
  if (ctaSection && window.gsap) {
    var prefersReducedMotionCta = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    var ctaHeading = ctaSection.querySelector(".cta-heading");
    var ctaCopy = ctaSection.querySelector(".cta-copy");
    var ctaCard = ctaSection.querySelector(".cta-card");
    var ctaButton = document.getElementById("cta-submit");

    // Initial states
    gsap.set([ctaHeading, ctaCopy], { opacity: 0, y: 18 });
    gsap.set(ctaCard, { opacity: 0, y: 24, scale: 0.98 });

    function revealCta() {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to([ctaHeading, ctaCopy], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
      }).to(ctaCard, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, "-=0.2");

      // Subtle attention pulse on the button
      if (ctaButton && !prefersReducedMotionCta) {
        gsap.fromTo(
          ctaButton,
          { boxShadow: "0 8px 30px rgba(0,0,0,0.08)" },
          {
            boxShadow: "0 12px 45px rgba(22,163,74,0.35)",
            duration: 1.2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 2,
            delay: 0.3,
          }
        );
      }
    }

    if (!prefersReducedMotionCta) {
      if (window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: ctaSection,
          start: "top 75%",
          once: true,
          onEnter: revealCta,
        });
      } else if ("IntersectionObserver" in window) {
        var ioCTA = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                revealCta();
                ioCTA.disconnect();
              }
            });
          },
          { root: null, rootMargin: "0px", threshold: 0.3 }
        );
        ioCTA.observe(ctaSection);
      } else {
        setTimeout(revealCta, 300);
      }
    } else {
      gsap.set([ctaHeading, ctaCopy, ctaCard], {
        clearProps: "all",
        opacity: 1,
        y: 0,
        scale: 1,
      });
    }
  }
})();
