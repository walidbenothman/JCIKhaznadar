/* ==========================================================================
   JCI Khaznadar — Script principal
   - Barre de progression de lecture + en-tête dynamique + lien actif au scroll
   - Révélation des sections au scroll (IntersectionObserver)
   - Compteurs animés (statistiques du hero)
   - Onglets bilingues du Credo (FR / عربي)
   - Menu mobile
   - Chargement dynamique des actualités (content/news.json) et de l'équipe (content/team.json)
   - Formulaire d'adhésion (Formspree avec repli mailto:)
   - Bouton "retour en haut" + année automatique dans le footer
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initHeaderScroll();
  initScrollProgress();
  initActiveNavLink();
  initRevealOnScroll();
  initCounters();
  initCredoTabs();
  initNews();
  initTeam();
  initJoinForm();
  initBackToTop();
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

/* --- En-tête : effet verre dépoli renforcé après un léger scroll --- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* --- Barre de progression de lecture en haut de page --- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress-bar');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* --- Mise en surbrillance du lien de navigation correspondant à la section visible --- */
function initActiveNavLink() {
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --- Révélation progressive des sections au scroll --- */
function initRevealOnScroll() {
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* --- Compteurs animés (statistiques du hero) --- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  const statics = document.querySelectorAll('[data-count-static]');

  statics.forEach((el) => { el.textContent = el.getAttribute('data-count-static'); });

  if (!counters.length) return;

  if (prefersReducedMotion) {
    counters.forEach((el) => {
      const suffix = el.getAttribute('data-count-suffix') || '';
      el.textContent = `${el.getAttribute('data-count-to')}${suffix}`;
    });
    return;
  }

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    const suffix = el.getAttribute('data-count-suffix') || '';
    const duration = parseInt(el.getAttribute('data-count-duration'), 10) || 1600;
    const start = performance.now();

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * easeOutExpo(progress));
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* --- Onglets bilingues du Credo (Français / العربية) --- */
function initCredoTabs() {
  const tabs = document.querySelectorAll('.credo-tab');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const lang = tab.getAttribute('data-lang');

      tabs.forEach((t) => {
        const isActive = t === tab;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', String(isActive));
      });

      document.querySelectorAll('.credo-panel').forEach((panel) => {
        const isActive = panel.id === `credo-panel-${lang}`;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
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
      <div class="news-media">
        <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy" width="800" height="500">
      </div>
      <div class="news-body">
        <div class="news-meta">
          <span class="news-category">${escapeHtml(item.category || '')}</span>
          <span>${date}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.excerpt)}</p>
        <a class="news-link" href="${item.link}" target="_blank" rel="noopener">Voir sur Facebook <span aria-hidden="true">→</span></a>
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
    if (!response.ok) throw new Error("Impossible de charger l'équipe");
    const members = await response.json();
    grid.innerHTML = members.map(renderTeamCard).join('');
  } catch (err) {
    console.error(err);
  }
}

function renderTeamCard(member) {
  return `
    <div class="team-card">
      <div class="team-photo">
        <img src="${member.photo}" alt="Photo de ${escapeHtml(member.name)}" loading="lazy" width="400" height="400">
      </div>
      <div class="team-info">
        <h3>${escapeHtml(member.name)}</h3>
        <span>${escapeHtml(member.role)}</span>
      </div>
    </div>
  `;
}

/* --- Formulaire "Rejoignez-nous" ---
   Tant que l'attribut action="..." du formulaire (index.html) pointe encore vers le
   placeholder "YOUR_FORM_ID", le formulaire ouvre le client mail (mailto:) en secours.
   Dès que vous créez un compte sur https://formspree.io et remplacez YOUR_FORM_ID par votre
   véritable identifiant de formulaire, ce script bascule automatiquement sur un envoi AJAX à
   Formspree, avec message de succès/erreur affiché sous le bouton — aucune autre modification
   de code n'est nécessaire. Voir le README ("Formulaire Rejoignez-nous"). */
function initJoinForm() {
  const form = document.getElementById('join-form');
  const status = document.getElementById('join-form-status');
  if (!form) return;

  const endpoint = form.getAttribute('action') || '';
  const isConfigured = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!isConfigured) {
      submitViaMailto(form);
      return;
    }

    submitViaFormspree(form, endpoint, status);
  });
}

function submitViaMailto(form) {
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
}

async function submitViaFormspree(form, endpoint, status) {
  const submitBtn = form.querySelector('button[type="submit"]');
  setFormStatus(status, '', null);
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      form.reset();
      setFormStatus(status, 'Merci ! Votre demande a bien été envoyée, nous revenons vers vous rapidement.', 'success');
    } else {
      setFormStatus(status, "Une erreur est survenue lors de l'envoi. Réessayez, ou écrivez-nous directement à contact@jcikhaznadar.tn.", 'error');
    }
  } catch (err) {
    console.error(err);
    setFormStatus(status, "Impossible d'envoyer le formulaire (connexion indisponible). Écrivez-nous directement à contact@jcikhaznadar.tn.", 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  }
}

function setFormStatus(status, message, type) {
  if (!status) return;
  status.textContent = message;
  status.hidden = !message;
  status.classList.remove('success', 'error');
  if (type) status.classList.add(type);
}

/* --- Bouton "retour en haut" --- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const update = () => btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  update();
  window.addEventListener('scroll', update, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
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
