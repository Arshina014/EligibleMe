// EligibleMe - Fully Client-Side App Logic
// No backend needed – loads schemes.json directly (works on GitHub Pages)

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
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      btn.textContent = '☰';
    });
  });
}

// ── Load all schemes (directly from schemes.json – no Flask needed) ──
async function loadSchemes() {
  try {
    const res = await fetch('schemes.json');
    if (!res.ok) throw new Error('Failed to fetch schemes.json');
    allSchemes = await res.json();
    document.getElementById('totalSchemes').textContent = allSchemes.length + '+';
    buildSectorFilters();
    renderBrowseGrid();
  } catch (err) {
    console.error('Failed to load schemes:', err);
    document.getElementById('browseGrid').innerHTML =
      '<div class="no-results"><div class="emoji">⚠️</div><p>Could not load schemes. Please refresh the page.</p></div>';
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

// ── Client-Side Eligibility Check (ported from Python) ──
function checkEligibility(user, scheme) {
  const elig = scheme.eligibility || {};

  const age = user.age || 0;
  if (age < (elig.age_min || 0) || age > (elig.age_max || 999)) return false;

  const gender = (user.gender || '').toLowerCase();
  const schemeGender = (elig.gender || 'all').toLowerCase();
  if (schemeGender !== 'all' && gender !== schemeGender) return false;

  const income = user.income || 0;
  if (income > (elig.income_max || 9999999)) return false;

  const occupation = (user.occupation || '').toLowerCase();
  const schemeOccupations = (elig.occupation || ['all']).map(o => o.toLowerCase());
  if (!schemeOccupations.includes('all') && !schemeOccupations.includes(occupation)) return false;

  const category = (user.category || '').toLowerCase();
  const schemeCategories = (elig.category || ['all']).map(c => c.toLowerCase());
  if (!schemeCategories.includes('all') && !schemeCategories.includes(category)) return false;

  const disability = (user.disability || 'no').toLowerCase();
  const schemeDisability = (elig.disability || 'all').toLowerCase();
  if (schemeDisability === 'yes' && disability !== 'yes') return false;

  const education = (user.education || '').toLowerCase();
  const schemeEducation = (elig.education || ['all']).map(e => e.toLowerCase());
  if (!schemeEducation.includes('all') && !schemeEducation.includes(education)) return false;

  const marital = (user.marital_status || '').toLowerCase();
  const schemeMarital = (elig.marital_status || 'all').toLowerCase();
  if (schemeMarital !== 'all' && marital !== schemeMarital) return false;

  return true;
}

// ── Eligibility Form ──
function initEligibilityForm() {
  const form = document.getElementById('eligibilityForm');
  form.addEventListener('submit', (e) => {
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

    // Run eligibility check entirely in the browser
    setTimeout(() => {
      try {
        const matched = allSchemes.filter(scheme => checkEligibility(userData, scheme));
        showResults(matched, matched.length);
      } catch (err) {
        console.error(err);
        alert('Something went wrong while checking eligibility. Please try again.');
      } finally {
        btn.innerHTML = '🔍 Find My Schemes';
        btn.disabled = false;
      }
    }, 400); // Small delay for spinner UX
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

  const docsUl = document.getElementById('modalDocs');
  docsUl.innerHTML = scheme.documents.map(d => `<li>${d}</li>`).join('');

  const dateSection = document.getElementById('modalDateSection');
  const dateEl = document.getElementById('modalDate');
  if (scheme.last_date) {
    dateSection.style.display = 'block';
    dateEl.textContent = formatDate(scheme.last_date);
  } else {
    dateSection.style.display = 'none';
  }

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

// ── Client-Side Chatbot (ported from Python) ──
const CHATBOT_RESPONSES = {
  greeting: "Hello! 👋 I'm your EligibleMe assistant. I can help you find government schemes. Try asking me about schemes for students, farmers, women, or any other category!",
  help: "I can help you with:\n• Finding schemes by sector (education, agriculture, startups, etc.)\n• Searching for specific schemes by name\n• Understanding eligibility criteria\n• Knowing required documents\n\nJust ask me something like 'Show me schemes for farmers' or 'What is PM Kisan?'",
  thanks: "You're welcome! 😊 Feel free to ask if you need more help finding government schemes.",
  fallback: "I'm not sure I understand. Try asking about:\n• Schemes for a specific group (students, farmers, women, etc.)\n• A specific scheme by name\n• Schemes in a sector (education, health, startups)\n• Or type 'help' for more options."
};

const SECTOR_KEYWORDS = {
  'Education': ['student', 'scholarship', 'education', 'study', 'college', 'university', 'school', 'exam', 'learn'],
  'Women Welfare': ['women', 'woman', 'girl', 'female', 'mahila', 'beti', 'matru', 'mother', 'pregnant', 'lady'],
  'Agriculture': ['farmer', 'farm', 'agriculture', 'crop', 'kisan', 'krishi', 'soil', 'irrigation', 'dairy', 'fish', 'livestock'],
  'Startups': ['startup', 'business', 'entrepreneur', 'msme', 'loan', 'mudra', 'enterprise', 'company'],
  'Employment': ['job', 'employ', 'worker', 'labour', 'pension', 'insurance', 'skill', 'apprentice', 'career', 'shram'],
  'Senior Citizens': ['senior', 'old age', 'elderly', 'vayoshri', 'retired', 'retirement', '60 years'],
  'Health': ['health', 'hospital', 'medical', 'doctor', 'ayushman', 'treatment', 'disease', 'dialysis', 'mental health', 'immunization'],
  'Disability': ['disability', 'disabled', 'handicap', 'differently abled', 'blind', 'deaf', 'wheelchair']
};

function chatbotRespond(message) {
  const msg = message.toLowerCase().trim();

  if (['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'].some(w => msg.includes(w))) {
    return CHATBOT_RESPONSES.greeting;
  }

  if (['help', '?', 'what can you do', 'options'].includes(msg)) {
    return CHATBOT_RESPONSES.help;
  }

  if (['thank', 'thanks', 'dhanyavaad', 'shukriya'].some(w => msg.includes(w))) {
    return CHATBOT_RESPONSES.thanks;
  }

  // Check for specific scheme name
  for (const scheme of allSchemes) {
    const schemeLower = scheme.name.toLowerCase();
    const words = schemeLower.split(' ').filter(w => w.length > 4);
    if (schemeLower.includes(msg) || words.some(word => msg.includes(word))) {
      return formatSchemeResponse(scheme);
    }
  }

  // Check sector keywords
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some(kw => msg.includes(kw))) {
      const sectorSchemes = allSchemes.filter(s => s.sector.toLowerCase() === sector.toLowerCase());
      if (sectorSchemes.length > 0) {
        let response = `📋 **${sector} Schemes** (${sectorSchemes.length} found):\n\n`;
        sectorSchemes.slice(0, 8).forEach(s => {
          response += `• **${s.name}**: ${s.benefits.substring(0, 80)}...\n`;
        });
        if (sectorSchemes.length > 8) {
          response += `\n...and ${sectorSchemes.length - 8} more! Use the Browse section to see all.`;
        }
        response += '\n\n💡 Click on any scheme card for full details, or ask me about a specific scheme!';
        return response;
      }
    }
  }

  if (['eligible', 'eligibility', 'qualify', 'can i get', 'am i eligible'].some(w => msg.includes(w))) {
    return 'To check your eligibility, please use the **Check Eligibility** form above. Fill in your details like age, income, occupation, and category – I\'ll match you with the best schemes! 🔍';
  }

  if (['document', 'documents', 'papers', 'required', 'what do i need'].some(w => msg.includes(w))) {
    return '📄 Most government schemes require these common documents:\n\n• Aadhaar Card\n• Income Certificate\n• Bank Account/Passbook\n• Passport-size Photos\n• Caste Certificate (if applicable)\n• Address Proof\n\nSpecific documents vary by scheme. Click on any scheme card to see its exact requirements!';
  }

  if (['how to apply', 'apply', 'application', 'register', 'sign up'].some(w => msg.includes(w))) {
    return '📝 **How to Apply for Government Schemes:**\n\n1. Check your eligibility using our form above\n2. Click on the scheme card to see details\n3. Click \'Apply Now\' to go to the official portal\n4. Register on the portal with Aadhaar/mobile\n5. Fill in the application form\n6. Upload required documents\n7. Submit and save the reference number\n\n💡 You can also visit your nearest CSC (Common Service Centre) for help!';
  }

  return CHATBOT_RESPONSES.fallback;
}

function formatSchemeResponse(scheme) {
  let response = `📌 **${scheme.name}**\n`;
  response += `🏷️ Sector: ${scheme.sector}\n\n`;
  response += `📝 ${scheme.description}\n\n`;
  response += `💰 **Benefits:** ${scheme.benefits}\n\n`;
  response += `📄 **Documents needed:** ${scheme.documents.join(', ')}\n\n`;
  if (scheme.last_date) {
    response += `📅 **Last Date:** ${formatDate(scheme.last_date)}\n\n`;
  }
  response += `🔗 **Apply:** ${scheme.apply_link}`;
  return response;
}

// ── Chatbot UI ──
function initChatbot() {
  const fab = document.getElementById('chatbotFab');
  const panel = document.getElementById('chatbotPanel');
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('chatSendBtn');

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

  sendBtn.addEventListener('click', () => sendChatMessage());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  document.querySelectorAll('.chat-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.msg;
      input.value = msg;
      sendChatMessage();
    });
  });
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const msg = input.value.trim();
  if (!msg) return;

  addChatMsg(msg, 'user');
  input.value = '';

  // Show typing indicator
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;

  // Simulate a small delay for a natural feel, then respond
  setTimeout(() => {
    typing.remove();
    const response = chatbotRespond(msg);
    const formatted = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    addChatMsg(formatted, 'bot', true);
  }, 500);
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

  fab.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('open') ? closePanel() : openPanel();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closePanel();
  });

  panel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    closePanel();
  });

  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
  });

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
