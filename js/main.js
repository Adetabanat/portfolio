(() => {
  "use strict";

  // ---------- helpers ----------
  const qs = (sel, root = document) => root.querySelector(sel);

  const on = (el, event, handler, options) => {
    if (!el) return;
    el.addEventListener(event, handler, options);
  };

  const setText = (el, text) => {
    if (!el) return;
    el.textContent = text;
  };

  // ---------- footer year ----------
  setText(qs("#year"), String(new Date().getFullYear()));

  // ---------- contact form (Formspree) ----------
  const initContactForm = () => {
    const form = qs("#contactForm");
    if (!form) return;

    const statusEl = qs("#formStatus");
    const submitBtn = qs("#submitBtn");
    const defaultBtnText = submitBtn?.textContent?.trim() || "Send";

    let clearStatusTimer;

    const setStatus = (message = "", type = "") => {
      if (!statusEl) return;

      statusEl.textContent = message;
      statusEl.className = ["hint", type].filter(Boolean).join(" ");

      // bring feedback into view on small screens
      if (message && window.innerWidth < 768) {
        statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (clearStatusTimer) window.clearTimeout(clearStatusTimer);
      if (message) {
        clearStatusTimer = window.setTimeout(() => {
          statusEl.textContent = "";
          statusEl.className = "hint";
        }, 6000);
      }
    };

    const setLoading = (isLoading) => {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      submitBtn.textContent = isLoading ? "Sending..." : defaultBtnText;
      submitBtn.setAttribute("aria-busy", String(isLoading));
    };

    const getFormspreeError = async (res) => {
      const fallback =
        "Something went wrong. Please try again or email me directly.";

      try {
        const data = await res.json();
        if (Array.isArray(data?.errors) && data.errors.length) {
          return data.errors.map((e) => e?.message).filter(Boolean).join(" ");
        }
      } catch {
        // ignore parsing errors
      }
      return fallback;
    };

    on(form, "submit", async (e) => {
      e.preventDefault();

      // Prevent double-submit
      if (submitBtn?.disabled) return;

      // Honeypot spam trap
      const gotcha = qs('input[name="_gotcha"]', form);
      if (gotcha?.value?.trim()) return;

      // Native validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setLoading(true);
      setStatus("");

      try {
        const formData = new FormData(form);

        const res = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });

        if (res.ok) {
          setStatus("Message sent successfully. I’ll get back to you soon!", "success");
          form.reset();
        } else {
          const msg = await getFormspreeError(res);
          setStatus(msg, "error");
        }
      } catch {
        setStatus("Network error. Please check your connection and try again.", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  // ---------- mobile nav (hamburger) ----------
  const initMobileNav = () => {
    const navToggle = qs(".nav-toggle");
    const navLinks = qs("#primary-nav");
    if (!navToggle || !navLinks) return;

    const setOpen = (isOpen) => {
      navLinks.dataset.open = String(isOpen);
      navToggle.dataset.open = String(isOpen);

      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");

      // optional: prevent background scroll when menu is open
      // document.body.style.overflow = isOpen ? "hidden" : "";
    };

    const isOpen = () => navLinks.dataset.open === "true";

    const close = () => setOpen(false);
    const open = () => setOpen(true);
    const toggle = () => (isOpen() ? close() : open());

    // initial state
    setOpen(false);

    on(navToggle, "click", toggle);

    // Close when clicking a nav link
    on(navLinks, "click", (e) => {
      const a = e.target?.closest?.("a");
      if (a) close();
    });

    // Close when clicking outside
    on(document, "click", (e) => {
      if (!isOpen()) return;
      const clickedInsideMenu = navLinks.contains(e.target);
      const clickedToggle = navToggle.contains(e.target);
      if (!clickedInsideMenu && !clickedToggle) close();
    });

    // Close on Escape
    on(document, "keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // Auto-close if resized to desktop
    on(window, "resize", () => {
      if (window.innerWidth > 900) close();
    });
  };

  // ---------- boot ----------
  initContactForm();
  initMobileNav();
})();
