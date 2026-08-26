# Site vitrine — JCI Khaznadar

Site vitrine ("brochure website") en français pour **JCI Khaznadar**, filière locale de
[JCI Tunisie](https://www.jcitunisia.com) basée à Khaznadar, Le Bardo (gouvernorat de Tunis).

Site statique **HTML / CSS / JavaScript pur**, sans framework ni backend — simple à héberger,
à modifier et à déployer.

## 📁 Structure du projet

```
JCIKhaznadar/
├── index.html              # Page unique (one-page avec ancres)
├── css/
│   └── styles.css          # Toute la feuille de style (variables de couleur en haut du fichier)
├── js/
│   └── main.js             # Menu mobile, chargement des actualités/équipe, formulaire
├── content/
│   ├── news.json           # Actualités affichées dans la section "Actualités"
│   └── team.json           # Membres du bureau affichés dans la section "Notre équipe"
├── assets/
│   ├── logo/
│   │   ├── logo-khaznadar-color.svg           # Logo complet couleur — fond blanc/clair (header)
│   │   ├── logo-khaznadar-black.svg           # Logo complet monochrome noir — impression
│   │   ├── logo-khaznadar-white-on-blue.svg   # Logo blanc sur pastille bleue #0097D6
│   │   ├── logo-khaznadar-white-on-navy.svg   # Logo blanc/couleur sur pastille bleu marine #140F2D
│   │   ├── logo-khaznadar-transparent-white.svg # Logo blanc, fond transparent — pour sections déjà sombres (footer)
│   │   ├── jci-icon-navy.svg        # Écusson seul, bleu marine — icône/décoratif
│   │   ├── jci-icon-black.svg       # Écusson seul, noir — icône/décoratif monochrome
│   │   └── favicon.svg              # Badge navy + écusson blanc, optimisé petit format
│   └── images/
│       ├── hero-placeholder.svg     # Image de couverture (hero + section "Qui sommes-nous")
│       ├── news-placeholder.svg     # Image par défaut des actualités
│       └── team-placeholder.svg     # Photo par défaut des membres
└── README.md
```

## 🚀 Lancer le site en local

Le site utilise `fetch()` pour charger `content/news.json` et `content/team.json` : la plupart
des navigateurs bloquent `fetch` sur les fichiers ouverts directement en `file://`. Il faut donc
servir le dossier via un petit serveur local (aucune installation lourde requise) :

**Avec Node.js (recommandé si déjà installé) :**
```bash
npx serve .
# puis ouvrez l'URL affichée (ex: http://localhost:3000)
```

**Avec Python :**
```bash
python -m http.server 8000
# puis ouvrez http://localhost:8000
```

**Avec l'extension VS Code "Live Server" :** clic droit sur `index.html` → "Open with Live Server".

## ✏️ Personnaliser le contenu

### Textes généraux
Tous les textes (accroche, présentation, missions, coordonnées...) sont directement dans
[index.html](index.html), organisés par section avec des commentaires `<!-- ======= NOM ======= -->`.
Remplacez le texte entre les balises directement.

### Logo
Le logo officiel JCI Khaznadar (écusson dégradé bleu/turquoise + mot-symbole "JCI" et
"Khaznadar") a été redessiné fidèlement en **SVG vectoriel** à partir des fichiers fournis par
l'association, pour une qualité d'affichage parfaite à toutes les tailles. Six déclinaisons sont
disponibles dans `assets/logo/`, chacune prévue pour un fond précis :

| Fichier | Usage | Utilisé actuellement dans |
|---|---|---|
| `logo-khaznadar-color.svg` | Logo couleur, fond blanc/clair | Header, meta Open Graph |
| `logo-khaznadar-transparent-white.svg` | Logo blanc, fond transparent | Footer (fond bleu marine) |
| `logo-khaznadar-white-on-blue.svg` | Logo blanc sur pastille bleue `#0097D6` | Usage libre (ex: réseaux sociaux) |
| `logo-khaznadar-white-on-navy.svg` | Logo blanc/couleur sur pastille bleu marine `#140F2D` | Usage libre (ex: réseaux sociaux) |
| `logo-khaznadar-black.svg` | Logo monochrome noir | Impression, fond très clair |
| `jci-icon-navy.svg` / `jci-icon-black.svg` | Écusson seul, sans texte | Favicon, éléments décoratifs |
| `favicon.svg` | Badge navy + écusson blanc, optimisé petit format | Onglet du navigateur |

Étant vectoriels, ces logos peuvent être redimensionnés sans perte et affinés dans n'importe quel
éditeur SVG (Figma, Illustrator, Inkscape...). Si vous obtenez les fichiers vectoriels sources
officiels (AI/EPS/SVG du designer), vous pouvez remplacer n'importe lequel de ces fichiers en
gardant le même nom — aucune autre modification du site n'est nécessaire.

Pensez aussi à générer un `og-image.png` (1200×630px, format raster) à partir de
`logo-khaznadar-color.svg` pour un meilleur rendu lors des partages sur les réseaux sociaux, et à
le référencer dans la balise `<meta property="og:image">` de [index.html](index.html) (actuellement
pointée sur le SVG, qui n'est pas supporté par tous les réseaux sociaux).

### Photos (placeholders à remplacer)
Le dossier `assets/images/` contient des visuels de substitution, à remplacer par de vraies
photos récupérées **manuellement** depuis la page Facebook de l'association (voir plus bas) :

| Fichier | Utilisé pour | Dimensions recommandées |
|---|---|---|
| `hero-placeholder.svg` | Image de couverture (hero + section "Qui sommes-nous") | 1600×900px |
| `news-placeholder.svg` | Image par défaut d'une actualité | 800×500px |
| `team-placeholder.svg` | Photo par défaut d'un membre du bureau | 400×400px (carré) |

Pour remplacer un placeholder : déposez votre photo (`.jpg` ou `.png`) dans `assets/images/`,
puis mettez à jour le chemin correspondant dans `index.html` (image du hero) ou dans
`content/news.json` / `content/team.json` (champ `"image"` / `"photo"`).

### Équipe / Bureau
Éditez [content/team.json](content/team.json). Chaque membre est un objet :

```json
{
  "name": "Prénom Nom",
  "role": "Présidente",
  "photo": "assets/images/team-placeholder.svg"
}
```

Ajoutez, supprimez ou réordonnez les entrées du tableau selon la composition actuelle du bureau.
La grille se met à jour automatiquement au chargement de la page.

### 📰 Mettre à jour les actualités

La page Facebook de l'association (https://www.facebook.com/people/JCI-Khaznadar/61567749201924/)
ne peut pas être récupérée automatiquement (Facebook bloque le scraping). Les actualités du site
sont donc gérées **manuellement** via un fichier JSON simple :

1. Ouvrez [content/news.json](content/news.json).
2. Copiez le texte et téléchargez la/les photo(s) de la publication Facebook que vous voulez
   reprendre sur le site.
3. Ajoutez un nouvel objet en tête (ou n'importe où) du tableau :

```json
{
  "id": "identifiant-unique-de-la-news",
  "title": "Titre de l'actualité",
  "date": "2026-08-20",
  "category": "Humanitaire",
  "excerpt": "Résumé court de 1 à 2 phrases.",
  "image": "assets/images/news-placeholder.svg",
  "link": "https://www.facebook.com/people/JCI-Khaznadar/61567749201924/"
}
```

4. Si vous avez une photo dédiée, placez-la dans `assets/images/` (ex: `news-2026-08-reboisement.jpg`)
   et référencez-la dans le champ `"image"`.
5. Enregistrez : le site affiche automatiquement les actualités triées de la plus récente à la
   plus ancienne (aucune limite de nombre).

Le lien "Suivez-nous sur Facebook" est présent dans le header (via l'onglet réseaux sociaux),
la section Actualités et le footer — pensez à mettre à jour l'URL partout si la page Facebook
change un jour (recherchez `facebook.com/people/JCI-Khaznadar` dans le projet).

### Formulaire "Rejoignez-nous"
Le formulaire est déjà **prêt à être branché sur [Formspree](https://formspree.io)** (gratuit pour
un usage basique, 50 soumissions/mois) — il ne reste qu'une valeur à remplacer, aucun code à
écrire :

1. Créez un compte gratuit sur [formspree.io](https://formspree.io) et un nouveau formulaire.
2. Récupérez son identifiant (dans l'URL fournie par Formspree, du type `https://formspree.io/f/abcdwxyz`).
3. Dans [index.html](index.html), repérez le formulaire `<form id="join-form" ...>` et remplacez
   `YOUR_FORM_ID` dans son attribut `action="https://formspree.io/f/YOUR_FORM_ID"` par votre
   identifiant.
4. Enregistrez : c'est tout. Le script ([js/main.js](js/main.js), fonction `initJoinForm`)
   détecte automatiquement qu'une vraie URL Formspree est configurée et envoie le formulaire en
   AJAX (sans recharger la page), avec un message de succès ou d'erreur affiché sous le bouton
   "Envoyer ma demande".

**Tant que `YOUR_FORM_ID` n'est pas remplacé**, le formulaire fonctionne quand même en mode
dégradé : il ouvre le client mail de l'utilisateur avec un email pré-rempli (`mailto:`), pour ne
jamais laisser un visiteur sans solution.

Un champ caché anti-spam (`_gotcha`, standard Formspree) est déjà en place et invisible pour les
vrais visiteurs. Le sujet des emails reçus sur Formspree peut être personnalisé via le champ cadré
`_subject` dans le formulaire (déjà présent).

### Carte Google Maps
La carte intégrée dans la section Contact utilise une simple recherche "Khaznadar, Le Bardo,
Tunis" (aucune clé API requise). Pour affiner l'emplacement exact, remplacez le texte de la
requête dans l'URL de l'`<iframe>` (section Contact d'`index.html`) par l'adresse précise du
local de l'association, ou générez un lien d'intégration directement depuis Google Maps
("Partager" → "Intégrer une carte").

### Coordonnées
Remplacez les valeurs placeholder dans la section Contact d'`index.html` :
- Email : `contact@jcikhaznadar.tn` (aussi utilisé comme destinataire du formulaire dans `js/main.js`)
- Téléphone : `+216 00 000 000`
- Adresse : à préciser si vous avez une adresse exacte de local

### Couleurs et typographie

Toute la palette est centralisée en variables CSS en haut de [css/styles.css](css/styles.css)
(`:root { ... }`) et reprend la charte graphique officielle de JCI Khaznadar :

| Variable | Hex | Usage |
|---|---|---|
| `--color-navy` | `#140F2D` | Couleur principale foncée : footer, sections sombres, titres |
| `--color-blue` | `#0097D6` | Accent principal : icônes, dégradés, fonds décoratifs |
| `--color-teal` | `#56BDBC` | Accent secondaire : hovers, petits détails, texte sur fond navy |
| `--color-white` | `#FFFFFF` | Fond clair, texte sur fonds foncés |
| `--color-black` | `#000000` | Logo monochrome, textes noirs stricts |

Deux variantes **assombries pour l'accessibilité** complètent cette palette : le bleu et le
turquoise "bruts" ci-dessus n'offrent pas un contraste suffisant (norme WCAG AA, ratio ≥ 4.5:1)
avec du texte blanc superposé. `--color-blue-deep` (`#00719D`, ratio ≈ 5.45:1) et
`--color-teal-deep` (`#277775`, ratio ≈ 5.27:1) sont donc utilisées à la place partout où du texte
ou une icône blanche repose directement sur un fond de cette couleur (boutons CTA, liens,
badges de rôle, etc.). `--color-blue` et `--color-teal` "purs" restent utilisés pour les éléments
non-textuels (dégradés, icônes, bordures) où l'exigence de contraste est moins stricte (3:1).

La police utilisée est [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts.

## ✅ Accessibilité & SEO — déjà en place

- Attribut `lang="fr"`, balises meta `title`/`description`/Open Graph.
- Lien d'évitement ("Aller au contenu principal") pour la navigation clavier.
- Contrastes de couleurs vérifiés et ajustés pour la norme WCAG AA (voir tableau des couleurs
  ci-dessus — `--color-blue-deep`/`--color-teal-deep` pour le texte blanc sur fond de couleur).
- `alt` sur toutes les images, `loading="lazy"` sur les images hors zone visible immédiate.
- Menu mobile accessible au clavier (`aria-expanded`), focus visible personnalisé.

## 🌐 Déployer le site

Le site est 100% statique : n'importe quel hébergeur de fichiers statiques convient.

**Netlify / Vercel (glisser-déposer) :** déposez le dossier du projet sur
[app.netlify.com/drop](https://app.netlify.com/drop) ou importez le dépôt sur
[vercel.com](https://vercel.com) — aucune configuration de build nécessaire (pas de framework).

**GitHub Pages :**
1. Poussez ce dossier dans un dépôt GitHub.
2. Dans les paramètres du dépôt → Pages, sélectionnez la branche `main` et le dossier racine `/`.
3. Le site sera disponible à `https://<votre-utilisateur>.github.io/<nom-du-depot>/`.

Aucune variable d'environnement ni étape de build n'est requise.

## 🔜 À faire avant mise en ligne définitive

- [ ] Remplacer les photos placeholder par de vraies photos (Facebook + photos de membres).
- [ ] Compléter `content/team.json` avec les vrais noms/postes du bureau actuel.
- [ ] Mettre à jour l'email et le téléphone réels dans `index.html`.
- [ ] Générer un `og-image.png` (1200×630px) pour un meilleur rendu au partage.
- [ ] Ajouter les vrais liens Instagram/LinkedIn s'ils existent (actuellement `href="#"`).
- [ ] Vérifier/affiner la localisation exacte sur la carte Google Maps.
- [ ] (Optionnel) Créer un compte Formspree et remplacer `YOUR_FORM_ID` dans `index.html` — voir "Formulaire Rejoignez-nous" ci-dessus.
