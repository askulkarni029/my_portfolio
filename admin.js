const loginView     = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginForm     = document.getElementById('loginForm');
const loginBtn      = document.getElementById('loginBtn');
const loginStatus   = document.getElementById('loginStatus');
const logoutBtn     = document.getElementById('logoutBtn');

function waitForFirebase() {
  return new Promise(resolve => {
    (function check() {
      if (window.PortfolioAuth && window.PortfolioAdmin) resolve();
      else setTimeout(check, 30);
    })();
  });
}

await waitForFirebase();

window.PortfolioAuth.onChange((user) => {
  if (user) {
    loginView.hidden = true;
    dashboardView.hidden = false;
    loadAllPanels();
  } else {
    loginView.hidden = false;
    dashboardView.hidden = true;
  }
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in…';
  loginStatus.textContent = '';
  loginStatus.className = 'form-status';
  try {
    await window.PortfolioAuth.signIn(email, password);
  } catch (err) {
    loginStatus.textContent = 'Invalid email or password.';
    loginStatus.className = 'form-status error';
    console.error(err);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

logoutBtn.addEventListener('click', () => window.PortfolioAuth.signOut());

// ── Tabs ──
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function loadAllPanels() {
  loadProjects();
  loadExperience();
  loadTestimonials();
  loadMessages();
}

// ── PROJECTS ──
const projectForm = document.getElementById('projectForm');
const projectCancelBtn = document.getElementById('projectCancelBtn');
const projectSubmitBtn = document.getElementById('projectSubmitBtn');

function resetProjectForm() {
  projectForm.reset();
  document.getElementById('projectId').value = '';
  projectSubmitBtn.textContent = 'Add Project';
  projectCancelBtn.hidden = true;
}

projectCancelBtn.addEventListener('click', resetProjectForm);

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('projectId').value;
  const data = {
    title: document.getElementById('projectTitle').value.trim(),
    emoji: document.getElementById('projectEmoji').value.trim(),
    order: Number(document.getElementById('projectOrder').value) || 0,
    description: document.getElementById('projectDescription').value.trim(),
    tags: document.getElementById('projectTags').value.split(',').map(t => t.trim()).filter(Boolean),
    liveUrl: document.getElementById('projectLive').value.trim(),
    githubUrl: document.getElementById('projectGithub').value.trim(),
  };
  try {
    if (id) await window.PortfolioAdmin.update('projects', id, data);
    else await window.PortfolioAdmin.add('projects', data);
    resetProjectForm();
    loadProjects();
  } catch (err) {
    alert('Failed to save project: ' + err.message);
  }
});

async function loadProjects() {
  const list = document.getElementById('projectsList');
  list.innerHTML = '<p class="admin-empty">Loading…</p>';
  const items = await window.PortfolioAdmin.fetchAll('projects');
  if (!items.length) { list.innerHTML = '<p class="admin-empty">No projects yet.</p>'; return; }
  list.innerHTML = items.map(p => `
    <div class="admin-list-item">
      <div class="admin-list-item-main">
        <h4>${esc(p.emoji || '')} ${esc(p.title)} <span class="meta">#${p.order ?? 0}</span></h4>
        <p>${esc(p.description)}</p>
      </div>
      <div class="admin-list-item-actions">
        <button class="btn btn-sm btn-ghost" data-edit="${p.id}">Edit</button>
        <button class="btn btn-sm btn-outline" data-delete="${p.id}">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => {
    const p = items.find(i => i.id === btn.dataset.edit);
    document.getElementById('projectId').value = p.id;
    document.getElementById('projectTitle').value = p.title || '';
    document.getElementById('projectEmoji').value = p.emoji || '';
    document.getElementById('projectOrder').value = p.order ?? 0;
    document.getElementById('projectDescription').value = p.description || '';
    document.getElementById('projectTags').value = (p.tags || []).join(', ');
    document.getElementById('projectLive').value = p.liveUrl || '';
    document.getElementById('projectGithub').value = p.githubUrl || '';
    projectSubmitBtn.textContent = 'Update Project';
    projectCancelBtn.hidden = false;
    projectForm.scrollIntoView({ behavior: 'smooth' });
  }));

  list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this project?')) return;
    await window.PortfolioAdmin.remove('projects', btn.dataset.delete);
    loadProjects();
  }));
}

// ── EXPERIENCE ──
const experienceForm = document.getElementById('experienceForm');
const experienceCancelBtn = document.getElementById('experienceCancelBtn');
const experienceSubmitBtn = document.getElementById('experienceSubmitBtn');

function resetExperienceForm() {
  experienceForm.reset();
  document.getElementById('experienceId').value = '';
  experienceSubmitBtn.textContent = 'Add Experience';
  experienceCancelBtn.hidden = true;
}

experienceCancelBtn.addEventListener('click', resetExperienceForm);

experienceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('experienceId').value;
  const data = {
    role: document.getElementById('experienceRole').value.trim(),
    company: document.getElementById('experienceCompany').value.trim(),
    duration: document.getElementById('experienceDuration').value.trim(),
    description: document.getElementById('experienceDescription').value.trim(),
    order: Number(document.getElementById('experienceOrder').value) || 0,
  };
  try {
    if (id) await window.PortfolioAdmin.update('experience', id, data);
    else await window.PortfolioAdmin.add('experience', data);
    resetExperienceForm();
    loadExperience();
  } catch (err) {
    alert('Failed to save experience: ' + err.message);
  }
});

async function loadExperience() {
  const list = document.getElementById('experienceList2');
  list.innerHTML = '<p class="admin-empty">Loading…</p>';
  const items = await window.PortfolioAdmin.fetchAll('experience');
  if (!items.length) { list.innerHTML = '<p class="admin-empty">No experience entries yet.</p>'; return; }
  list.innerHTML = items.map(x => `
    <div class="admin-list-item">
      <div class="admin-list-item-main">
        <h4>${esc(x.role)} · ${esc(x.company)} <span class="meta">#${x.order ?? 0}</span></h4>
        <p>${esc(x.duration)}</p>
        <p>${esc(x.description)}</p>
      </div>
      <div class="admin-list-item-actions">
        <button class="btn btn-sm btn-ghost" data-edit="${x.id}">Edit</button>
        <button class="btn btn-sm btn-outline" data-delete="${x.id}">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => {
    const x = items.find(i => i.id === btn.dataset.edit);
    document.getElementById('experienceId').value = x.id;
    document.getElementById('experienceRole').value = x.role || '';
    document.getElementById('experienceCompany').value = x.company || '';
    document.getElementById('experienceDuration').value = x.duration || '';
    document.getElementById('experienceDescription').value = x.description || '';
    document.getElementById('experienceOrder').value = x.order ?? 0;
    experienceSubmitBtn.textContent = 'Update Experience';
    experienceCancelBtn.hidden = false;
    experienceForm.scrollIntoView({ behavior: 'smooth' });
  }));

  list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this experience entry?')) return;
    await window.PortfolioAdmin.remove('experience', btn.dataset.delete);
    loadExperience();
  }));
}

// ── TESTIMONIALS ──
const testimonialForm = document.getElementById('testimonialForm');
const testimonialCancelBtn = document.getElementById('testimonialCancelBtn');
const testimonialSubmitBtn = document.getElementById('testimonialSubmitBtn');

function resetTestimonialForm() {
  testimonialForm.reset();
  document.getElementById('testimonialId').value = '';
  testimonialSubmitBtn.textContent = 'Add Testimonial';
  testimonialCancelBtn.hidden = true;
}

testimonialCancelBtn.addEventListener('click', resetTestimonialForm);

testimonialForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('testimonialId').value;
  const data = {
    name: document.getElementById('testimonialName').value.trim(),
    role: document.getElementById('testimonialRole').value.trim(),
    avatar: document.getElementById('testimonialAvatar').value.trim(),
    text: document.getElementById('testimonialText').value.trim(),
    order: Number(document.getElementById('testimonialOrder').value) || 0,
  };
  try {
    if (id) await window.PortfolioAdmin.update('testimonials', id, data);
    else await window.PortfolioAdmin.add('testimonials', data);
    resetTestimonialForm();
    loadTestimonials();
  } catch (err) {
    alert('Failed to save testimonial: ' + err.message);
  }
});

async function loadTestimonials() {
  const list = document.getElementById('testimonialsList');
  list.innerHTML = '<p class="admin-empty">Loading…</p>';
  const items = await window.PortfolioAdmin.fetchAll('testimonials');
  if (!items.length) { list.innerHTML = '<p class="admin-empty">No testimonials yet.</p>'; return; }
  list.innerHTML = items.map(t => `
    <div class="admin-list-item">
      <div class="admin-list-item-main">
        <h4>${esc(t.avatar || '')} ${esc(t.name)} <span class="meta">#${t.order ?? 0}</span></h4>
        <p>${esc(t.role)}</p>
        <p>"${esc(t.text)}"</p>
      </div>
      <div class="admin-list-item-actions">
        <button class="btn btn-sm btn-ghost" data-edit="${t.id}">Edit</button>
        <button class="btn btn-sm btn-outline" data-delete="${t.id}">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => {
    const t = items.find(i => i.id === btn.dataset.edit);
    document.getElementById('testimonialId').value = t.id;
    document.getElementById('testimonialName').value = t.name || '';
    document.getElementById('testimonialRole').value = t.role || '';
    document.getElementById('testimonialAvatar').value = t.avatar || '';
    document.getElementById('testimonialText').value = t.text || '';
    document.getElementById('testimonialOrder').value = t.order ?? 0;
    testimonialSubmitBtn.textContent = 'Update Testimonial';
    testimonialCancelBtn.hidden = false;
    testimonialForm.scrollIntoView({ behavior: 'smooth' });
  }));

  list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this testimonial?')) return;
    await window.PortfolioAdmin.remove('testimonials', btn.dataset.delete);
    loadTestimonials();
  }));
}

// ── MESSAGES ──
async function loadMessages() {
  const list = document.getElementById('messagesList');
  list.innerHTML = '<p class="admin-empty">Loading…</p>';
  const items = await window.PortfolioAdmin.fetchMessages();
  if (!items.length) { list.innerHTML = '<p class="admin-empty">No messages yet.</p>'; return; }
  list.innerHTML = items.map(m => `
    <div class="admin-list-item">
      <div class="admin-list-item-main">
        <h4>${esc(m.name)} · <a href="mailto:${esc(m.email)}" style="color:var(--primary)">${esc(m.email)}</a></h4>
        <p>${esc(m.message)}</p>
      </div>
      <div class="admin-list-item-actions">
        <button class="btn btn-sm btn-outline" data-delete="${m.id}">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Delete this message?')) return;
    await window.PortfolioAdmin.deleteMessage(btn.dataset.delete);
    loadMessages();
  }));
}
