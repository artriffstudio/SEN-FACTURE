<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FACTURIM — RÈGLE DU DESIGN SYSTEM OBLIGATOIRE (MAURITANIE)

Toute création ou modification de composant, page, formulaire, tableau ou modale dans ce projet **DOIT OBLIGATOIREMENT** respecter ce Design System inspiré du Dashboard de référence.

---

## 1. Palette Chromatique & Identité Visuelle
* **Style** : Clean Light SaaS haut de gamme avec contrastes profonds et accents Sky/Cyan.
* **Fonds** :
  * Page principale : `bg-slate-50` (`#f8fafc`).
  * Cartes & conteneurs : `bg-white` (`#ffffff`).
  * Zones de prévisualisation & formulaires : `bg-slate-50` / `bg-slate-100/70`.
* **Typographie & Textes** :
  * Titres et montants clés : `text-slate-900` (`#0f172a`), `font-bold` ou `font-extrabold`.
  * Textes secondaires & labels : `text-slate-600` ou `text-slate-500` (`text-xs` / `text-sm`).
  * Métadonnées & timestamps : `text-slate-400` (`text-[10px]` / `text-[11px]`).
* **Accents Sky / Cyan** :
  * Boutons CTA & pastilles actives : `bg-sky-500` (`#0ea5e9`) / `hover:bg-sky-600`.
  * Icônes & textes interactifs : `text-sky-600` (`#0284c7`).
  * Gradients CTA primaires : `bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700`.
  * Fonds d'activation subtils : `bg-sky-50` (`#f0f9ff`) ou `bg-sky-100/90`.
* **Statuts & Moyens de paiement (Mauritanie)** :
  * **Payée / Succès / Bankily, Seddap, Masrvi** : Fond `bg-emerald-50` ou `bg-emerald-100/80`, texte `text-emerald-700`, bordure `border-emerald-200/60`.
  * **En attente / Émission** : Fond `bg-amber-50` ou `bg-amber-100`, texte `text-amber-800`, bordure `border-amber-200/60`.
  * **En retard / Danger / Fichiers PDF** : Fond `bg-rose-50` ou `bg-rose-100`, texte `text-rose-700`.

---

## 2. Bordures, Arrondis & Ombres
* **Bordures de cartes standards** : `border border-slate-200/80` ou `border-slate-200/90`.
* **Séparateurs de cartes** : `border-b border-slate-100`.
* **Bordures d'état actif** : `border-sky-400 ring-1 ring-sky-300`.
* **Bordures au survol** : `hover:border-sky-300/80`.
* **Rayons de courbure (Radius)** :
  * Cartes et Modales : `rounded-2xl` (16px).
  * Sous-cartes, boutons, formulaires : `rounded-xl` (12px).
  * Petits boutons d'icône : `rounded-lg` (8px).
  * Badges pilules de statut : `rounded-full` (9999px).
* **Ombres (Shadows)** :
  * Cartes au repos : `shadow-sm` ou `shadow-2xs`.
  * Cartes interactives au survol (`.card-interactive`) :
    `box-shadow: 0 12px 28px -6px rgba(14, 165, 233, 0.08), 0 8px 16px -4px rgba(15, 23, 42, 0.04);`
  * Sous-cartes interactives (`.sub-card-interactive`) :
    `box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.06);`

---

## 3. Animations & Micro-Interactions
* **Transitions globales** : `transition-all duration-200 ease-in-out`.
* **Élévation au survol** :
  * Modules : `hover:-translate-y-0.75` (`.card-interactive`) ou `hover:-translate-y-0.5`.
  * Boutons d'actions rapides : `hover:scale-105 active:scale-95`.
* **Pulsation d'activité** : Classe `.pulse-gentle` sur les voyants d'état en direct.
* **Brillance animée** : Classe `.animate-shimmer` sur les jauges et barres de progression.

---

## 4. Composants Clés & Directives Spécifiques

### 4.1 Infobulles / Tooltips (`<Tooltip>`)
* **Fond blanc** (`bg-white`), texte sombre anthracite (`text-slate-800 font-bold text-xs`), bordure `border-slate-200/90`, ombre douce, flèche blanche.
* **Icône obligatoire en bleu** (`text-sky-600 shrink-0 stroke-[2.3]`).
* **Contenu strict** : **UNIQUEMENT LE NOM / TITRE DU BOUTON** (ex: *« Factures & Devis »*, *« Télécharger le PDF »*). Ne **JAMAIS** ajouter de phrases explicatives ou descriptions secondaires.

### 4.2 Boutons & CTA
* **Bouton CTA Primaire** : Un seul par écran / vue (`bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5`).
* **Boutons secondaires** : Fond blanc `bg-white`, texte `text-slate-700`, bordure `border-slate-200`, `rounded-lg`, `hover:scale-105 active:scale-95`.
* **Bouton d'icône** : `w-7 h-7` ou `w-9 h-9`, bordure `border-slate-200/90`, hover `text-sky-600 border-sky-300 bg-sky-50`.

### 4.3 Tableaux & Données
* En-tête `<thead>` : `bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70`.
* Lignes `<tbody>` : `divide-y divide-slate-100 hover:bg-sky-50/40 transition-colors group cursor-pointer`.
* Alignements : Texte à gauche, nombres et montants à droite (`font-extrabold text-slate-900 tabular-nums`), quantités centrées, badges centrés.

### 4.4 Formulaires
* Inputs & sélecteurs : `bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100`.
* Labels : `block font-semibold text-slate-700 text-xs mb-1`.

### 4.5 Standard Document Facture A4 & Téléchargement PDF
* Tout document ou export PDF doit reproduire 100% fidèlement la facture A4 de l'aperçu :
  * Dimensions : 794px x 1123px (A4 à 96 DPI).
  * En-tête : Carré noir `FI`, titre *FACTURIM*, *Facturim Mauritanie SARL*, NIF *00987654-MR*, RC et téléphone.
  * Cartouche Destinataire : Fond `bg-slate-50`, bordure `border-slate-200`, pastille de statut.
  * Tableau : Entête avec bordure `border-b-2 border-slate-900`, quantités, prix unitaires et sous-totaux MRU.
  * Totaux : Sous-total HT, TVA 16%, et Total Net TTC en grand bleu ciel bold (`#0284c7`).
  * Modalités : Bankily (BPM), Seddap, Masrvi, virement bancaire BPM, et mention légale DGI / Mauritanie.

---

## 5. Responsivité & Mobile First
* **Sidebar** : Rail desktop compact `w-[76px]` (icônes seules avec tooltips blancs), et Drawer complet coulissant sur mobile (`w-72 sm:w-80`) sans descriptions secondaires tronquées.
* **Logo** : Dimensions fixes `w-11 h-11 shrink-0`, ne jamais compresser.
* **Mise en page Split** : Sur mobile, toujours proposer un onglet de bascule (`Formulaire` / `Aperçu A4`) plutôt que d'empiler verticalement des zones illisibles.
* **Grilles** : `grid-cols-1 md:grid-cols-2 lg:grid-cols-12`.

---

## 6. Localisation & Données Métier (Mauritanie)
* **Langues** : **Arabe (العربية - RTL)**, **Français (FR)**, **Anglais (EN)**, **Chinois (中文 - ZH)**.
* **Devise** : Ouguiya mauritanienne (**MRU**), formatage `toLocaleString("fr-FR")` (ex: `250 000 MRU` ou `250 000 أوقية`).
* **Fiscalité** : TVA légale **16%** (Direction Générale des Impôts - DGI Mauritanie).
* **Identifiant Fiscal** : Numéro d'Identification Fiscale (**NIF**).
* **Navigation** : Détection stricte d'URL, **une seule icône active à la fois**.
