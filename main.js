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
// Static fallback so real projects show even before any are added via admin.html/Firestore.
// Anything added in the admin panel will take priority over this list automatically.
const fallbackProjects = [
  {
    emoji: '📦',
    title: 'Agentic AI CRM — AI-Powered Inventory Management',
    description: 'AI-driven inventory management system that automates stock tracking, categorization, and reorder decisions using LLMs and OpenAI GPT, with real-time monitoring, predictive alerts, and automated reporting.',
    tags: ['LLM', 'OpenAI GPT', 'AI Automation', 'Inventory Management'],
    liveUrl: 'https://agentic-ai-crm.vercel.app',
    githubUrl: 'https://github.com/askulkarni029/agentic_ai_crm',
  },
  {
    emoji: '🏠',
    title: 'Real Estate Web Scraping Automation Bot',
    description: 'UiPath RPA bot that scrapes real estate listings from Zillow by city, extracting prices, beds, baths, area, and addresses, calculating price per sq ft, and exporting clean results to Excel.',
    tags: ['UiPath', 'RPA', 'Web Scraping', 'Data Extraction'],
    githubUrl: 'https://github.com/askulkarni029/Real-Estate-Web-Scraping-Automation-Bot',
  },
  {
    emoji: '🌦️',
    title: 'WeatherWear Advisor Bot',
    description: 'UiPath RPA solution that fetches live weather data from Google and recommends suitable clothing based on predefined rules, showcasing UI automation, selectors, and decision-making logic.',
    tags: ['UiPath', 'RPA', 'Automation', 'Decision Logic'],
    githubUrl: 'https://github.com/askulkarni029/WeatherWear-Advisor-Bot',
  },
  {
    emoji: '🤖',
    title: 'AI-Robot Warehouse Simulator',
    description: 'AI-generated robotics simulation depicting autonomous warehouse intralogistics, a robot transporting and shelving packages, produced entirely with AI image and video generation.',
    tags: ['AI Video Generation', 'Robotics Simulation', 'Prompt Engineering'],
    githubUrl: 'https://github.com/askulkarni029/AI-Robot-Warehouse-Simulator',
  },
  {
    emoji: '💧',
    title: 'Journey of Wastewater — ETP/STP & PCB Compliance',
    description: 'A visual explainer project using AI-generated imagery and voiceover to demonstrate industrial wastewater treatment (ETP/STP) and Pollution Control Board compliance.',
    tags: ['AI Visual Explainer', 'Environmental Compliance', 'Infographic'],
    githubUrl: 'https://github.com/askulkarni029/Journey-of-Wastewater-ETP-STP-and-PCB-Compliance.',
  },
  {
    emoji: '📝',
    title: 'Technical Content Project — Help Center Documentation',
    description: 'AI-assisted technical writing workflow producing a multi-level approval workflow help center article, covering prompt design, draft analysis, and human validation of AI-generated content.',
    tags: ['Technical Writing', 'AI-Assisted Content', 'Documentation'],
    githubUrl: 'https://github.com/askulkarni029/Technical-Content-Project',
  },
];

async function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !window.PortfolioData) return;
  try {
    const fetched = await window.PortfolioData.fetchProjects();
    const projects = fetched.length ? fetched : fallbackProjects;

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
