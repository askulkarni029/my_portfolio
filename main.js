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

// Fade-in on scroll (re-run after dynamic content is injected)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function observeFadeIns(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

observeFadeIns('.skill-card, .section-title');

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ── Dynamic Projects ──
async function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !window.PortfolioData) return;
  try {
    const projects = await window.PortfolioData.fetchProjects();
    if (!projects.length) return; // keep the static "Coming Soon" fallback card

    grid.innerHTML = projects.map(p => `
      <div class="project-card">
        <div class="project-img">
          <span class="project-emoji">${escapeHtml(p.emoji || '💻')}</span>
        </div>
        <div class="project-info">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="project-tags">
            ${(p.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
          </div>
          <div class="project-links">
            ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" class="btn btn-sm">Live Demo</a>` : ''}
            ${p.githubUrl ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" class="btn btn-sm btn-ghost">GitHub</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');
    observeFadeIns('#projectsGrid .project-card');
  } catch (err) {
    console.error('Failed to load projects', err);
  }
}

// ── Dynamic Experience ──
async function renderExperience() {
  const list = document.getElementById('experienceList');
  if (!list || !window.PortfolioData) return;
  try {
    const items = await window.PortfolioData.fetchExperience();
    if (!items.length) return; // keep "Experience coming soon" fallback

    list.innerHTML = items.map(e => `
      <div class="experience-item">
        <div class="experience-header">
          <h3>${escapeHtml(e.role)}</h3>
          <span class="experience-duration">${escapeHtml(e.duration)}</span>
        </div>
        <p class="experience-company">${escapeHtml(e.company)}</p>
        <p class="experience-desc">${escapeHtml(e.description)}</p>
      </div>
    `).join('');
    observeFadeIns('#experienceList .experience-item');
  } catch (err) {
    console.error('Failed to load experience', err);
  }
}

// ── Dynamic Testimonials ──
async function renderTestimonials() {
  const grid = document.getElementById('testimonialsGrid');
  const section = document.getElementById('testimonials');
  if (!grid || !window.PortfolioData) return;
  try {
    const items = await window.PortfolioData.fetchTestimonials();
    if (!items.length) {
      if (section) section.style.display = 'none';
      return;
    }
    grid.innerHTML = items.map(t => `
      <div class="testimonial-card">
        <p class="testimonial-text">"${escapeHtml(t.text)}"</p>
        <div class="testimonial-author">
          <span class="testimonial-avatar">${escapeHtml(t.avatar || '🧑')}</span>
          <div>
            <p class="testimonial-name">${escapeHtml(t.name)}</p>
            <p class="testimonial-role">${escapeHtml(t.role || '')}</p>
          </div>
        </div>
      </div>
    `).join('');
    observeFadeIns('#testimonialsGrid .testimonial-card');
  } catch (err) {
    console.error('Failed to load testimonials', err);
  }
}

renderProjects();
renderExperience();
renderTestimonials();
