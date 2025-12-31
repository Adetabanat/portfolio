// Footer year (safe)
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Formspree UX: loading + success/error
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

function setStatus(message, type = "") {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `hint ${type}`.trim();
}

function setLoading(isLoading) {
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Sending..." : "Send";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Honeypot spam trap
    const gotcha = form.querySelector('input[name="_gotcha"]');
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
        setStatus("Message sent successfully. I’ll get back to you soon!", "success");
        form.reset();
      } else {
        setStatus("Something went wrong. Please try again or email me directly.", "error");
      }
    } catch {
      setStatus("Network error. Please check your connection and try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}
