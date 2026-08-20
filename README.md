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
│   │   ├── jci-khaznadar-logo.svg   # Logo complet (header, footer)
│   │   └── favicon.svg              # Icône simplifiée (favicon)
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
Le logo a été recréé en SVG à partir du logo officiel JCI Tunisie, en remplaçant "Tunisie" par
"Khaznadar" (même bleu, même or, même disposition) :
- [assets/logo/jci-khaznadar-logo.svg](assets/logo/jci-khaznadar-logo.svg) — logo complet (header/footer)
- [assets/logo/favicon.svg](assets/logo/favicon.svg) — version simplifiée pour l'onglet du navigateur

Étant vectoriel, ce logo peut être redimensionné sans perte et modifié dans n'importe quel éditeur
SVG (Figma, Illustrator, Inkscape...) si vous voulez l'affiner ou coller plus précisément au logo
officiel. Si vous obtenez un export officiel du logo JCI Khaznadar (PNG/SVG), vous pouvez
simplement remplacer ces fichiers en gardant les mêmes noms — aucune autre modification n'est
nécessaire.

Pensez aussi à générer un `og-image.png` (1200×630px, format raster) à partir du logo pour un
meilleur rendu lors des partages sur les réseaux sociaux, et à le référencer dans la balise
`<meta property="og:image">` de [index.html](index.html) (actuellement pointée sur le SVG, qui
n'est pas supporté par tous les réseaux sociaux).

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
Le formulaire de contact/adhésion est **statique** : il n'y a pas de backend. À la soumission,
il ouvre le client mail de l'utilisateur avec un email pré-rempli (voir `mailto:` dans
[js/main.js](js/main.js), fonction `initJoinForm`).

Pour recevoir les demandes directement en ligne sans coder de backend, vous pouvez brancher un
service comme [Formspree](https://formspree.io) (gratuit pour un usage basique) :
1. Créez un formulaire sur Formspree et récupérez son URL d'action (`https://formspree.io/f/xxxxxxx`).
2. Dans `index.html`, remplacez `<form id="join-form" class="join-form" ...>` par :
   ```html
   <form id="join-form" class="join-form" action="https://formspree.io/f/xxxxxxx" method="POST" ...>
   ```
3. Supprimez ou adaptez le `event.preventDefault()` dans `initJoinForm()` (js/main.js) pour
   laisser le formulaire se soumettre normalement à Formspree.

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
Toute la palette est centralisée en variables CSS en haut de
[css/styles.css](css/styles.css) (`:root { ... }`) : `--color-blue`, `--color-gold`, etc. La
police utilisée est [Poppins](https://fonts.google.com/specimen/Poppins) via Google Fonts.

## ✅ Accessibilité & SEO — déjà en place

- Attribut `lang="fr"`, balises meta `title`/`description`/Open Graph.
- Lien d'évitement ("Aller au contenu principal") pour la navigation clavier.
- Contrastes de couleurs vérifiés (bleu/or/blanc sur fond blanc ou bleu foncé).
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
- [ ] (Optionnel) Brancher le formulaire à Formspree ou équivalent.
