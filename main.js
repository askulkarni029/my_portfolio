// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Contact form
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const status    = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  status.textContent = '';
  status.className = 'form-status';

  try {
    // submitContactForm is defined in firebase.js (loaded as module)
    await window.submitContactForm(name, email, message);
    status.textContent = '✓ Message sent! I\'ll get back to you soon.';
    status.className = 'form-status success';
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = '✗ Something went wrong. Please try again.';
    status.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
});

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card, .section-title').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});
