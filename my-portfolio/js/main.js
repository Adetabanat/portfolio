// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Simple contact form (client-side only)
const form = document.getElementById("contactForm");
const hint = document.getElementById("formHint");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  hint.textContent =
    "This demo form doesn’t send emails yet. Use your email link above or connect Formspree in step 8.";
});
