// EligibleMe - App Logic
// Auto-detect: works whether opened via Flask (http) or directly as a file
const API_BASE = window.location.protocol === 'file:' ? 'http://127.0.0.1:5000' : '';

// Sector tag color mapping
const SECTOR_COLORS = {
  'Education': 'tag-education',
  'Women Welfare': 'tag-women',
  'Agriculture': 'tag-agriculture',
  'Startups': 'tag-startups',
  'Employment': 'tag-employment',
  'Senior Citizens': 'tag-senior',
  'Health': 'tag-health',
  'Disability': 'tag-disability'
};

const SECTOR_ICONS = {
  'Education': '🎓',
  'Women Welfare': '👩',
  'Agriculture': '🌾',
  'Startups': '💼',
  'Employment': '👷',
  'Senior Citizens': '👵',
  'Health': '🏥',
  'Disability': '♿'
};

let allSchemes = [];
let currentSector = 'all';
let searchQuery = '';

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initEligibilityForm();
  initSearch();
  loadSchemes();
  initModal();
  initChatbot();
  initWhatsAppWidget();
});

// ── Navbar scroll effect ──
function initNavbar() {
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Active link highlight
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

// ── Mobile menu ──
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    btn.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
  });
}

// ── Load all schemes ──
async function loadSchemes() {
  try {
    const res = await fetch(`${API_BASE}/api/schemes`);
    const data = await res.json();
    allSchemes = data.schemes;
    document.getElementById('totalSchemes').textContent = allSchemes.length + '+';
    buildSectorFilters();
    renderBrowseGrid();
  } catch (err) {
    console.error('Failed to load schemes:', err);
    document.getElementById('browseGrid').innerHTML =
      '<div class="no-results"><div class="emoji">⚠️</div><p>Could not connect to server. Make sure the Flask backend is running on port 5000.</p></div>';
  }
}

// ── Build sector filter chips ──
function buildSectorFilters() {
  const container = document.getElementById('sectorFilters');
  const sectors = [...new Set(allSchemes.map(s => s.sector))].sort();

  let html = '<button class="sector-chip active" data-sector="all">All Schemes</button>';
  sectors.forEach(s => {
    html += `<button class="sector-chip" data-sector="${s}">${SECTOR_ICONS[s] || '📌'} ${s}</button>`;
  });
  container.innerHTML = html;

  container.querySelectorAll('.sector-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.sector-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentSector = chip.dataset.sector;
      renderBrowseGrid();
    });
  });
}

// ── Render browse grid ──
function renderBrowseGrid() {
  let filtered = allSchemes;
  if (currentSector !== 'all') {
    filtered = filtered.filter(s => s.sector === currentSector);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q)
    );
  }

  const grid = document.getElementById('browseGrid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results"><div class="emoji">🔎</div><p>No schemes found matching your criteria. Try a different filter or search term.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map((s, i) => createSchemeCard(s, i * 50)).join('');
  attachCardListeners(grid);
}

// ── Create scheme card HTML ──
function createSchemeCard(scheme, delay) {
  const tagClass = SECTOR_COLORS[scheme.sector] || 'tag-education';
  const lastDate = scheme.last_date
    ? `<span class="last-date">📅 Apply by: ${formatDate(scheme.last_date)}</span>`
    : '';

  return `
    <div class="scheme-card animate-in" style="animation-delay:${Math.min(delay, 400)}ms" data-id="${scheme.id}">
      <span class="sector-tag ${tagClass}">${SECTOR_ICONS[scheme.sector] || ''} ${scheme.sector}</span>
      <h3>${scheme.name}</h3>
      <p class="description">${scheme.description}</p>
      <div class="benefits">💰 ${scheme.benefits}</div>
      <div class="meta-row">
        ${lastDate}
        <a href="${scheme.apply_link}" target="_blank" class="apply-btn" onclick="event.stopPropagation()">Apply →</a>
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Search ──
function initSearch() {
  const input = document.getElementById('searchInput');
  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      searchQuery = input.value.trim();
      renderBrowseGrid();
    }, 300);
  });
}

// ── Eligibility Form ──
function initEligibilityForm() {
  const form = document.getElementById('eligibilityForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('checkBtn');
    btn.innerHTML = '<span class="spinner"></span> Checking...';
    btn.disabled = true;

    const userData = {
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      state: document.getElementById('state').value,
      income: parseInt(document.getElementById('income').value),
      education: document.getElementById('education').value,
      occupation: document.getElementById('occupation').value,
      category: document.getElementById('category').value,
      disability: document.getElementById('disability').value,
      marital_status: document.getElementById('maritalStatus').value
    };

    try {
      const res = await fetch(`${API_BASE}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      showResults(data.eligible_schemes, data.count);
    } catch (err) {
      alert('Could not connect to server. Please make sure the Flask backend is running.');
      console.error(err);
    } finally {
      btn.innerHTML = '🔍 Find My Schemes';
      btn.disabled = false;
    }
  });
}

// ── Show results ──
function showResults(schemes, count) {
  const container = document.getElementById('resultsContainer');
  const grid = document.getElementById('resultsGrid');
  const countEl = document.getElementById('resultCount');

  container.style.display = 'block';
  countEl.textContent = count;

  if (count === 0) {
    grid.innerHTML = '<div class="no-results"><div class="emoji">😔</div><p>No matching schemes found for your profile. Try adjusting your details or browse all schemes below.</p></div>';
  } else {
    grid.innerHTML = schemes.map((s, i) => createSchemeCard(s, i * 50)).join('');
    attachCardListeners(grid);
  }

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Modal ──
function initModal() {
  const overlay = document.getElementById('schemeModal');
  const closeBtn = document.getElementById('modalClose');

  closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('active');
  });
}

function openSchemeModal(scheme) {
  const overlay = document.getElementById('schemeModal');
  document.getElementById('modalTitle').textContent = scheme.name;
  document.getElementById('modalSector').textContent = `${SECTOR_ICONS[scheme.sector] || ''} ${scheme.sector}`;
  document.getElementById('modalDesc').textContent = scheme.description;
  document.getElementById('modalBenefits').textContent = scheme.benefits;

  // Eligibility summary
  const e = scheme.eligibility;
  let eligText = '';
  if (e.age_min !== undefined) eligText += `Age: ${e.age_min}-${e.age_max} years\n`;
  if (e.gender !== 'all') eligText += `Gender: ${e.gender}\n`;
  if (e.income_max < 9999999) eligText += `Max Income: ₹${e.income_max.toLocaleString('en-IN')}\n`;
  if (e.occupation && !e.occupation.includes('all')) eligText += `Occupation: ${e.occupation.join(', ')}\n`;
  if (e.category && !e.category.includes('all')) eligText += `Category: ${e.category.join(', ').toUpperCase()}\n`;
  if (e.disability === 'yes') eligText += `Disability: Required\n`;
  if (e.education && !e.education.includes('all')) eligText += `Education: ${e.education.join(', ')}\n`;
  if (e.marital_status !== 'all') eligText += `Marital Status: ${e.marital_status}\n`;
  document.getElementById('modalEligibility').textContent = eligText || 'Open to all eligible citizens.';

  // Documents
  const docsUl = document.getElementById('modalDocs');
  docsUl.innerHTML = scheme.documents.map(d => `<li>${d}</li>`).join('');

  // Last date
  const dateSection = document.getElementById('modalDateSection');
  const dateEl = document.getElementById('modalDate');
  if (scheme.last_date) {
    dateSection.style.display = 'block';
    dateEl.textContent = formatDate(scheme.last_date);
  } else {
    dateSection.style.display = 'none';
  }

  // Apply link
  document.getElementById('modalApplyLink').href = scheme.apply_link;

  overlay.classList.add('active');
}

function attachCardListeners(container) {
  container.querySelectorAll('.scheme-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const scheme = allSchemes.find(s => s.id === id);
      if (scheme) openSchemeModal(scheme);
    });
  });
}

// ── Chatbot ──
function initChatbot() {
  const fab = document.getElementById('chatbotFab');
  const panel = document.getElementById('chatbotPanel');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');

  // Toggle chatbot
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    fab.classList.toggle('active');
    if (panel.classList.contains('open')) {
      fab.textContent = '✕';
      input.focus();
    } else {
      fab.textContent = '💬';
    }
  });

  // Send message
  sendBtn.addEventListener('click', () => sendChatMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Suggestion buttons
  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      input.value = msg;
      sendChatMessage();
    });
  });
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const msg = input.value.trim();
  if (!msg) return;

  // Add user message
  addChatMsg(msg, 'user');
  input.value = '';

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();

    // Remove typing indicator
    typing.remove();

    // Format response (convert **bold** to styled text)
    const formatted = data.response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    addChatMsg(formatted, 'bot', true);
  } catch (err) {
    typing.remove();
    addChatMsg('Sorry, I couldn\'t connect to the server. Please make sure the backend is running.', 'bot');
  }
}

function addChatMsg(text, type, isHTML = false) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  if (isHTML) {
    div.innerHTML = text;
  } else {
    div.textContent = text;
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ── WhatsApp Notification Widget ──
function initWhatsAppWidget() {
  const fab = document.getElementById('waFab');
  const panel = document.getElementById('waPanel');
  const closeBtn = document.getElementById('waClose');
  const subscribeBtn = document.getElementById('waSubscribeBtn');
  const input = document.getElementById('waNumber');
  const panelBody = document.getElementById('waPanelBody');
  const successDiv = document.getElementById('waSuccess');
  const confirmedNumber = document.getElementById('waConfirmedNumber');

  function openPanel() {
    // Always reset to a clean form state when (re-)opening
    input.value = '';
    input.style.outline = '';
    input.placeholder = 'e.g. 98765 43210';
    panelBody.style.display = 'flex';
    successDiv.style.display = 'none';
    panel.classList.add('open');
    fab.style.transform = 'scale(0.9)';
    setTimeout(() => input.focus(), 100);
  }

  function closePanel() {
    panel.classList.remove('open');
    fab.style.transform = '';
  }

  // FAB toggle
  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('open') ? closePanel() : openPanel();
  });

  // Close (×) button – stop propagation so document handler doesn't interfere
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });

  // Clicks inside the panel must NOT bubble to the document close handler
  panel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Close when clicking anywhere outside the panel or FAB
  document.addEventListener('click', () => {
    closePanel();
  });

  // Allow only digits, max 10
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
  });

  // Subscribe
  subscribeBtn.addEventListener('click', () => {
    const num = input.value.trim();
    if (num.length < 10) {
      input.style.outline = '2px solid #ef4444';
      input.placeholder = 'Enter valid 10-digit number';
      input.focus();
      setTimeout(() => {
        input.style.outline = '';
        input.placeholder = 'e.g. 98765 43210';
      }, 2200);
      return;
    }
    const formatted = `+91\u00a0${num.slice(0, 5)}\u00a0${num.slice(5)}`;
    confirmedNumber.textContent = formatted;
    panelBody.style.display = 'none';
    successDiv.style.display = 'flex';
  });
}

