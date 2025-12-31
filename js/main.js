(() => {
  const qs = (sel, root = document) => root.querySelector(sel);

  // Footer year
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Formspree UX (loading + success/error)
  const form = qs("#contactForm");
  if (!form) return;

  const statusEl = qs("#formStatus");
  const submitBtn = qs("#submitBtn");
  const defaultBtnText = submitBtn ? submitBtn.textContent : "Send";

  let clearStatusTimer = null;

  const setStatus = (message, type = "") => {
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.className = ["hint", type].filter(Boolean).join(" ");

    // Scroll status into view on small screens
    if (window.innerWidth < 768) {
      statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Auto-clear after 6 seconds
    if (clearStatusTimer) clearTimeout(clearStatusTimer);
    clearStatusTimer = setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "hint";
    }, 6000);
  };

  const setLoading = (isLoading) => {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Sending..." : defaultBtnText;
    submitBtn.setAttribute("aria-busy", String(isLoading));
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent double-submit
    if (submitBtn?.disabled) return;

    // Honeypot spam trap
    const gotcha = qs('input[name="_gotcha"]', form);
    if (gotcha && gotcha.value.trim() !== "") return;

    // Built-in browser validation
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
        setStatus(
          "Message sent successfully. I’ll get back to you soon!",
          "success"
        );
        form.reset();
        return;
      }

      // Try to extract Formspree error message
      let errorText =
        "Something went wrong. Please try again or email me directly.";

      try {
        const data = await res.json();
        if (data?.errors?.length) {
          errorText = data.errors.map((e) => e.message).join(" ");
        }
      } catch {
        // Ignore JSON parsing errors
      }

      setStatus(errorText, "error");
    } catch {
      setStatus(
        "Network error. Please check your connection and try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
