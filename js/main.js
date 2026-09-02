/* ==========================================================================
   JCI KHAZNADAR — main.js
   --------------------------------------------------------------------------
   Aucune dépendance externe. Chaque module est autonome et défensif :
   si un élément est absent, le module se désactive sans casser les autres.

   01. Utilitaires (rAF, réglages, préférences)
   02. Préchargeur
   03. Curseur personnalisé
   04. En-tête : état collant, progression, lien actif, parallaxe hero
   05. Menu plein écran (piège à focus, Échap, verrou de défilement)
   06. Découpage du texte en mots (animation de révélation)
   07. Révélation au défilement
   08. Compteurs animés
   09. Boutons magnétiques
   10. Onglets du Credo (motif ARIA complet)
   11. Contenus dynamiques : actualités & équipe
   12. Formulaire d'adhésion (Formspree + repli mailto:)
   13. Retour en haut & année courante
   ========================================================================== */

(() => {
  'use strict';

  /* ======================================================================
     01. UTILITAIRES
     ====================================================================== */

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canAnimate = !reduceMotion;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Regroupe les lectures/écritures liées au défilement dans une seule frame. */
  const onScroll = (() => {
    const callbacks = [];
    let ticking = false;

    const run = () => {
      const y = window.scrollY;
      callbacks.forEach((cb) => cb(y));
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(run);
      }
    }, { passive: true });

    return (cb) => { callbacks.push(cb); cb(window.scrollY); };
  })();

  const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  /** N'autorise que des chemins d'images relatifs internes (pas de javascript:, pas de données). */
  const safeSrc = (value) => {
    const src = String(value || '');
    return /^(https?:\/\/|\/|assets\/|content\/|images\/)/i.test(src) && !/^javascript:/i.test(src)
      ? escapeHtml(src)
      : 'assets/logo/favicon.svg';
  };

  /** N'autorise que http(s) pour les liens externes. */
  const safeHref = (value) => {
    const href = String(value || '');
    return /^https?:\/\//i.test(href) ? escapeHtml(href) : '#';
  };

  /* ======================================================================
     02. PRÉCHARGEUR
     Garantie absolue : le voile disparaît toujours (chargement, minuteur
     de secours, et animation CSS de repli si le JS échoue complètement).
     ====================================================================== */

  function initPreloader() {
    const el = $('#preloader');
    const bar = $('#preloader-bar');
    const root = document.documentElement;

    const finish = () => {
      if (!el || el.classList.contains('is-done')) return;
      if (bar) bar.style.width = '100%';
      el.classList.add('is-done');
      root.classList.remove('is-locked');
      document.body.classList.add('is-ready');
    };

    if (!el || reduceMotion) {
      if (el) el.remove();
      document.body.classList.add('is-ready');
      return;
    }

    root.classList.add('is-locked');

    // Progression simulée : avance vite au début, ralentit avant la fin.
    let progress = 0;
    const tick = window.setInterval(() => {
      progress = Math.min(progress + (100 - progress) * 0.18, 92);
      if (bar) bar.style.width = `${progress}%`;
    }, 130);

    const done = () => {
      window.clearInterval(tick);
      window.setTimeout(finish, 260);
    };

    if (document.readyState === 'complete') {
      window.setTimeout(done, 480);
    } else {
      window.addEventListener('load', () => window.setTimeout(done, 380), { once: true });
    }

    // Filet de sécurité : 3,5 s maximum, quoi qu'il arrive.
    window.setTimeout(done, 3500);
  }

  /* ======================================================================
     03. CURSEUR PERSONNALISÉ (souris uniquement)
     ====================================================================== */

  function initCursor() {
    if (!finePointer || reduceMotion) return;

    const dot = $('.cursor');
    const ring = $('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    let active = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      if (!active) {
        active = true;
        ringX = mouseX; ringY = mouseY;
        document.body.classList.add('cursor-ready');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));
    document.addEventListener('mouseenter', () => { if (active) document.body.classList.add('cursor-ready'); });

    // L'anneau suit avec un léger retard (interpolation linéaire).
    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);

    // L'anneau grossit au survol des éléments interactifs.
    const interactive = 'a, button, input, textarea, [role="tab"]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactive)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactive)) document.body.classList.remove('cursor-hover');
    });
  }

  /* ======================================================================
     04. EN-TÊTE, PROGRESSION, LIEN ACTIF, PARALLAXE
     ====================================================================== */

  function initHeader() {
    const header = $('#header');
    const bar = $('#progress-bar');
    const heroMedia = $('.hero__media');

    onScroll((y) => {
      if (header) header.classList.toggle('is-stuck', y > 24);

      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (y / max) * 100 : 0;
        bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      }

      // Parallaxe douce du visuel du hero (le conteneur, pas l'image :
      // l'image porte déjà son animation Ken Burns).
      if (heroMedia && canAnimate && y < window.innerHeight * 1.2) {
        heroMedia.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
      }
    });
  }

  function initActiveLink() {
    const links = $$('[data-nav]');
    if (!links.length || !('IntersectionObserver' in window)) return;

    const map = new Map();
    links.forEach((link) => {
      const id = link.getAttribute('href');
      if (!id || !id.startsWith('#')) return;
      const section = $(id);
      if (section) map.set(section, link);
    });
    if (!map.size) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const active = map.get(entry.target);
        links.forEach((l) => l.classList.toggle('is-active', l === active));
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    map.forEach((_, section) => observer.observe(section));
  }

  /* ======================================================================
     05. MENU PLEIN ÉCRAN
     ====================================================================== */

  function initMenu() {
    const burger = $('#burger');
    const menu = $('#menu');
    if (!burger || !menu) return;

    const root = document.documentElement;
    let lastFocused = null;

    const focusables = () => $$(
      'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
      menu
    ).filter((el) => el.offsetParent !== null);

    const open = () => {
      lastFocused = document.activeElement;
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Fermer le menu');
      root.classList.add('is-locked');
      document.body.classList.add('menu-open');
      const first = focusables()[0];
      if (first) window.setTimeout(() => first.focus(), 380);
    };

    const close = ({ restoreFocus = true } = {}) => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      root.classList.remove('is-locked');
      document.body.classList.remove('menu-open');
      if (restoreFocus && lastFocused) lastFocused.focus();
    };

    const isOpen = () => menu.classList.contains('is-open');

    burger.addEventListener('click', () => (isOpen() ? close() : open()));

    // Un clic sur un lien ferme le menu (sans voler le focus à l'ancre).
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) close({ restoreFocus: false });
    });

    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      // Piège à focus : le clavier ne peut pas sortir du menu ouvert.
      if (e.key === 'Tab') {
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Referme si l'on repasse en affichage bureau pendant que le menu est ouvert.
    const desktop = window.matchMedia('(min-width: 901px)');
    const onBreakpoint = (e) => { if (e.matches && isOpen()) close({ restoreFocus: false }); };
    if (typeof desktop.addEventListener === 'function') desktop.addEventListener('change', onBreakpoint);
    else if (typeof desktop.addListener === 'function') desktop.addListener(onBreakpoint); // Safari ancien
  }

  /* ======================================================================
     06. DÉCOUPAGE DU TEXTE EN MOTS
     Chaque mot devient <span class="w"><i>mot</i></span> : le masque
     (overflow) permet de faire « monter » les mots un à un.
     Les <span> restent en ligne, la lecture par lecteur d'écran est intacte.
     ====================================================================== */

  function initSplitText() {
    if (!canAnimate) return;

    $$('[data-split]').forEach((el) => {
      if (el.dataset.splitDone === 'true') return;

      const text = el.textContent.trim();
      if (!text) return;

      const offset = parseInt(el.dataset.splitOffset, 10) || 0;
      const frag = document.createDocumentFragment();

      text.split(/\s+/).forEach((word, i) => {
        const outer = document.createElement('span');
        outer.className = 'w';
        outer.style.setProperty('--i', String(i + offset));

        const inner = document.createElement('i');
        inner.textContent = word;

        outer.appendChild(inner);
        frag.appendChild(outer);
        frag.appendChild(document.createTextNode(' '));
      });

      el.textContent = '';
      el.appendChild(frag);
      el.dataset.splitDone = 'true';
    });
  }

  /* ======================================================================
     07. RÉVÉLATION AU DÉFILEMENT
     `observeReveals` est réutilisable pour les contenus injectés plus tard.
     ====================================================================== */

  let revealObserver = null;

  function initReveal() {
    // Sans observateur (mouvement réduit ou navigateur ancien), `observeReveals`
    // bascule seul en mode « tout afficher immédiatement ».
    if (canAnimate && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' });
    }

    observeReveals(document);
  }

  function observeReveals(root) {
    // `[data-clip]` est volontairement absent : un élément masqué par
    // clip-path a une aire nulle et ne déclencherait jamais l'observateur.
    // Son masque est levé par le parent `[data-reveal]` via le CSS.
    const selector = '[data-reveal], [data-reveal-group]';
    const targets = $$(selector, root);
    if (root instanceof Element && root.matches(selector)) targets.push(root);

    if (!revealObserver) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    targets.forEach((el) => revealObserver.observe(el));
  }

  /* ======================================================================
     08. COMPTEURS ANIMÉS
     La valeur finale est déjà dans le HTML : si le JS échoue, le chiffre
     correct reste affiché (amélioration progressive).
     ====================================================================== */

  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length || !canAnimate || !('IntersectionObserver' in window)) return;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (Number.isNaN(target)) return;

      const suffix = el.dataset.suffix || '';
      const duration = parseInt(el.dataset.duration, 10) || 1600;
      const start = performance.now();

      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = `${Math.round(target * easeOutExpo(p))}${suffix}`;
        if (p < 1) window.requestAnimationFrame(step);
      };

      el.textContent = `0${suffix}`;
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((el) => observer.observe(el));
  }

  /* ======================================================================
     09. BOUTONS MAGNÉTIQUES (souris uniquement)
     ====================================================================== */

  function initMagnetic() {
    if (!finePointer || !canAnimate) return;

    $$('[data-magnetic]').forEach((el) => {
      const STRENGTH = 0.28;
      let rect = null;

      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        rect = el.getBoundingClientRect();
      });

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse' || !rect) return;
        const x = (e.clientX - (rect.left + rect.width / 2)) * STRENGTH;
        const y = (e.clientY - (rect.top + rect.height / 2)) * STRENGTH;
        // Propriété `translate` indépendante : n'entre pas en conflit
        // avec les `transform` de survol définis en CSS.
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });

      const reset = () => { rect = null; el.style.translate = ''; };
      el.addEventListener('pointerleave', reset);
      el.addEventListener('blur', reset);
    });
  }

  /* ======================================================================
     10. ONGLETS DU CREDO — motif ARIA « tabs » complet
     ====================================================================== */

  function initTabs() {
    const tablist = $('.tabs');
    if (!tablist) return;

    const tabs = $$('.tab', tablist);
    if (!tabs.length) return;

    const select = (tab, { focus = true } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;

        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => select(tab, { focus: false }));

      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        let next = null;

        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];

        if (next) {
          e.preventDefault();
          select(next);
        }
      });
    });
  }

  /* ======================================================================
     11. CONTENUS DYNAMIQUES
     Actualités : content/news.json — voir le README pour ajouter une entrée.
     Équipe     : content/team.json
     ====================================================================== */

  const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const formatDate = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : dateFormatter.format(d);
  };

  async function initNews() {
    const grid = $('#news-grid');
    if (!grid) return;

    try {
      const res = await fetch('content/news.json');
      if (!res.ok) throw new Error('Réponse HTTP invalide');
      const items = await res.json();

      if (!Array.isArray(items) || !items.length) {
        grid.innerHTML = '<p class="news-empty">Aucune actualité pour le moment. Suivez-nous sur Facebook !</p>';
        return;
      }

      grid.innerHTML = [...items]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(renderPost)
        .join('');

      observeReveals(grid);
    } catch (err) {
      grid.innerHTML = '<p class="news-empty">Actualités indisponibles pour le moment. Retrouvez-nous sur notre page Facebook.</p>';
      console.error('Chargement des actualités impossible :', err);
    }
  }

  function renderPost(item) {
    const category = item.category
      ? `<span class="post__cat">${escapeHtml(item.category)}</span>`
      : '';
    const date = formatDate(item.date);

    return `
      <article class="post">
        <div class="post__media">
          <img src="${safeSrc(item.image)}" alt="${escapeHtml(item.title || '')}" loading="lazy" width="800" height="500">
          ${category}
        </div>
        <div class="post__body">
          ${date ? `<p class="post__date">${date}</p>` : ''}
          <h3 class="post__title">${escapeHtml(item.title || '')}</h3>
          <p class="post__text">${escapeHtml(item.excerpt || '')}</p>
          <a class="post__link arrow-link" href="${safeHref(item.link)}" target="_blank" rel="noopener">
            Voir sur Facebook <span aria-hidden="true">→</span>
          </a>
        </div>
      </article>
    `;
  }

  async function initTeam() {
    const grid = $('#team-grid');
    if (!grid) return;

    try {
      const res = await fetch('content/team.json');
      if (!res.ok) throw new Error('Réponse HTTP invalide');
      const members = await res.json();
      if (!Array.isArray(members) || !members.length) return;

      grid.innerHTML = members.map(renderMember).join('');
      observeReveals(grid);
    } catch (err) {
      grid.innerHTML = '<li class="news-empty">Composition du bureau momentanément indisponible.</li>';
      console.error("Chargement de l'équipe impossible :", err);
    }
  }

  function renderMember(member) {
    const name = escapeHtml(member.name || '');
    return `
      <li class="member">
        <div class="member__photo">
          <img src="${safeSrc(member.photo)}" alt="Portrait de ${name}" loading="lazy" width="400" height="400">
        </div>
        <div class="member__body">
          <h3 class="member__name">${name}</h3>
          <span class="member__role">${escapeHtml(member.role || '')}</span>
        </div>
      </li>
    `;
  }

  /* ======================================================================
     12. FORMULAIRE D'ADHÉSION
     Envoi AJAX vers Formspree dès qu'un identifiant valide est configuré
     dans l'attribut `action`. Sinon, repli automatique sur mailto:.
     ====================================================================== */

  const CONTACT_EMAIL = 'president.jcikhaznadar@gmail.com';

  function initForm() {
    const form = $('#join-form');
    const status = $('#form-status');
    if (!form) return;

    const endpoint = form.getAttribute('action') || '';
    const configured = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint);

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validation native : on laisse le navigateur signaler les champs manquants.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (configured) sendToFormspree(form, endpoint, status);
      else sendViaMailto(form);
    });
  }

  function sendViaMailto(form) {
    const data = new FormData(form);
    const get = (k) => data.get(k) || '';

    const subject = encodeURIComponent(`Demande d'adhésion JCI Khaznadar — ${get('name')}`);
    const body = encodeURIComponent(
      `Nom : ${get('name')}\nEmail : ${get('email')}\nTéléphone : ${get('phone')}\n\nMessage :\n${get('message')}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  async function sendToFormspree(form, endpoint, status) {
    const button = form.querySelector('button[type="submit"]');

    setStatus(status, '', null);
    if (button) { button.disabled = true; button.classList.add('is-busy'); }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.reset();
        setStatus(status, 'Merci ! Votre demande a bien été envoyée, nous revenons vers vous rapidement.', 'ok');
      } else {
        setStatus(status, `L'envoi a échoué. Réessayez, ou écrivez-nous directement à ${CONTACT_EMAIL}.`, 'err');
      }
    } catch (err) {
      console.error('Envoi du formulaire impossible :', err);
      setStatus(status, `Connexion indisponible. Écrivez-nous directement à ${CONTACT_EMAIL}.`, 'err');
    } finally {
      if (button) { button.disabled = false; button.classList.remove('is-busy'); }
    }
  }

  function setStatus(el, message, kind) {
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
    el.classList.remove('is-ok', 'is-err');
    if (kind === 'ok') el.classList.add('is-ok');
    if (kind === 'err') el.classList.add('is-err');
  }

  /* ======================================================================
     13. RETOUR EN HAUT & ANNÉE COURANTE
     ====================================================================== */

  function initToTop() {
    const btn = $('#to-top');
    if (!btn) return;

    onScroll((y) => btn.classList.toggle('is-in', y > window.innerHeight * 0.7));

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      const brand = $('.brand');
      if (brand) brand.focus({ preventScroll: true });
    });
  }

  function initYear() {
    const el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ======================================================================
     DÉMARRAGE
     ====================================================================== */

  /** Isole chaque module : l'échec de l'un n'empêche pas les suivants. */
  const safe = (fn, name) => {
    try {
      fn();
    } catch (err) {
      console.error(`[JCI] Module « ${name} » en échec :`, err);
      // La révélation au défilement conditionne la visibilité du contenu :
      // si elle tombe, on affiche tout plutôt que de laisser une page vide.
      if (name === 'reveal' || name === 'split') {
        document.documentElement.classList.add('js-failed');
      }
    }
  };

  const boot = () => {
    safe(initPreloader, 'preloader');
    safe(initCursor, 'cursor');
    safe(initHeader, 'header');
    safe(initActiveLink, 'activeLink');
    safe(initMenu, 'menu');
    safe(initSplitText, 'split');   // avant « reveal » : les mots doivent exister
    safe(initReveal, 'reveal');
    safe(initCounters, 'counters');
    safe(initMagnetic, 'magnetic');
    safe(initTabs, 'tabs');
    safe(initNews, 'news');
    safe(initTeam, 'team');
    safe(initForm, 'form');
    safe(initToTop, 'toTop');
    safe(initYear, 'year');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
