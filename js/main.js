/* ==========================================================================
   JCI Khaznadar — Script principal
   - Menu mobile
   - Chargement dynamique des actualités (content/news.json)
   - Chargement dynamique de l'équipe (content/team.json)
   - Formulaire d'adhésion (mailto:)
   - Année automatique dans le footer
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initNews();
  initTeam();
  initJoinForm();
  initFooterYear();
});

/* --- Menu mobile --- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --- Actualités : lues depuis content/news.json ---
   Pour ajouter/modifier une actualité, éditez ce fichier JSON.
   Voir le README ("Mettre à jour les actualités") pour la marche à suivre. */
async function initNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  try {
    const response = await fetch('content/news.json');
    if (!response.ok) throw new Error('Impossible de charger les actualités');
    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      grid.innerHTML = '<p class="news-empty">Aucune actualité pour le moment. Suivez-nous sur Facebook !</p>';
      return;
    }

    const sorted = [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
    grid.innerHTML = sorted.map(renderNewsCard).join('');
  } catch (err) {
    grid.innerHTML = '<p class="news-empty">Actualités indisponibles pour le moment. Retrouvez-nous sur notre page Facebook.</p>';
    console.error(err);
  }
}

function renderNewsCard(item) {
  const date = formatDateFr(item.date);
  return `
    <article class="news-card">
      <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" width="800" height="500">
      <div class="news-body">
        <div class="news-meta">
          <span class="news-category">${escapeHtml(item.category || '')}</span>
          <span>${date}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.excerpt)}</p>
        <a class="news-link" href="${item.link}" target="_blank" rel="noopener">Voir sur Facebook →</a>
      </div>
    </article>
  `;
}

function formatDateFr(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* --- Équipe : lue depuis content/team.json --- */
async function initTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;

  try {
    const response = await fetch('content/team.json');
    if (!response.ok) throw new Error('Impossible de charger l\'équipe');
    const members = await response.json();
    grid.innerHTML = members.map(renderTeamCard).join('');
  } catch (err) {
    console.error(err);
  }
}

function renderTeamCard(member) {
  return `
    <div class="team-card">
      <img src="${member.photo}" alt="Photo de ${escapeHtml(member.name)}" loading="lazy" width="400" height="400">
      <div class="team-info">
        <h3>${escapeHtml(member.name)}</h3>
        <span>${escapeHtml(member.role)}</span>
      </div>
    </div>
  `;
}

/* --- Formulaire "Rejoignez-nous" ---
   Aucun backend pour l'instant : ouvre le client mail avec les infos pré-remplies.
   Pour brancher un vrai service (ex: Formspree), voir le README. */
function initJoinForm() {
  const form = document.getElementById('join-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const phone = data.get('phone') || '';
    const message = data.get('message') || '';

    const subject = encodeURIComponent(`Demande d'adhésion JCI Khaznadar — ${name}`);
    const body = encodeURIComponent(
      `Nom : ${name}\nEmail : ${email}\nTéléphone : ${phone}\n\nMessage :\n${message}`
    );

    window.location.href = `mailto:contact@jcikhaznadar.tn?subject=${subject}&body=${body}`;
  });
}

/* --- Année automatique dans le footer --- */
function initFooterYear() {
  const el = document.getElementById('current-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* --- Utilitaire anti-XSS pour l'injection de contenu JSON --- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
