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
      } catch {}
      return fallback;
    };

    on(form, "submit", async (e) => {
      e.preventDefault();
      if (submitBtn?.disabled) return;

      const gotcha = qs('input[name="_gotcha"]', form);
      if (gotcha?.value?.trim()) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setLoading(true);
      setStatus("");

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        if (res.ok) {
          setStatus("Message sent successfully. I’ll get back to you soon!", "success");
          form.reset();
        } else {
          setStatus(await getFormspreeError(res), "error");
        }
      } catch {
        setStatus("Network error. Please check your connection and try again.", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  // ---------- mobile nav (hamburger -> cross) ----------
  const initMobileNav = () => {
    const navToggle = qs(".nav-toggle");
    const navLinks = qs("#primary-nav");
    if (!navToggle || !navLinks) return;

    const applyState = (open) => {
      navLinks.dataset.open = open ? "true" : "false";
      navToggle.dataset.open = open ? "true" : "false";

      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    const isOpen = () => navLinks.dataset.open === "true";

    const open = () => applyState(true);
    const close = () => applyState(false);
    const toggle = () => (isOpen() ? close() : open());

    // initial state (important for CSS cross animation)
    applyState(false);

    on(navToggle, "click", (e) => {
      e.preventDefault();
      toggle();
    });

    // close when a link is clicked
    on(navLinks, "click", (e) => {
      if (e.target?.closest?.("a")) close();
    });

    // close when clicking outside
    on(document, "click", (e) => {
      if (!isOpen()) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      close();
    });

    // close on Escape
    on(document, "keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // close on desktop resize
    on(window, "resize", () => {
      if (window.innerWidth > 900) close();
    });
  };

  // ---------- boot ----------
  initContactForm();
  initMobileNav();
})();
