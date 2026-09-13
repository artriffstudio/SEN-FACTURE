# SEN FACTURE — RÈGLE OFFICIELLE DU DESIGN SYSTEM

Cette règle s'applique impérativement à **tous** les composants, pages, modales, formulaires et éléments interactifs créés ou modifiés dans l'application SEN FACTURE. Tout code produit doit respecter scrupuleusement ces directives stylistiques et architecturales pour garantir une cohérence visuelle et ergonomique totale.

---

## 1. Identité Visuelle & Palette Chromatique

L'application repose sur un thème **Clean Light SaaS** avec des accents **Sky/Cyan**, des contrastes profonds en **Slate 900**, et un traitement minutieux des micro-interactions.

### 1.1 Couleurs de Base & Neutres (Slate)
* **Fond principal de l'application** : `bg-slate-50` (`#f8fafc`).
* **Fond des cartes & conteneurs principaux** : `bg-white` (`#ffffff`).
* **Fond secondaire / zones de prévisualisation / inputs** : `bg-slate-50` / `bg-slate-100/70`.
* **Texte principal (Titres, montants clés)** : `text-slate-900` (`#0f172a`) avec font `font-bold` ou `font-extrabold`.
* **Texte secondaire (Labels, descriptions)** : `text-slate-600` ou `text-slate-500` (`text-xs` / `text-sm`).
* **Texte tertiaire / métadonnées légères** : `text-slate-400` (`text-[10px]` ou `text-[11px]`).

### 1.2 Couleur Primaire & Accents (Sky / Cyan)
* **Accent principal (Boutons CTA, badges actifs, focus)** : `bg-sky-500` (`#0ea5e9`) / `hover:bg-sky-600`.
* **Texte & Icônes interactives** : `text-sky-600` (`#0284c7`).
* **Fonds subtils d'activation** : `bg-sky-50` (`#f0f9ff`) ou `bg-sky-100/90` (`#e0f2fe`).
* **Gradients de boutons primaires** : `bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700`.

### 1.3 Couleurs Sémantiques (Statuts OHADA / Sénégal)
* **Payée / Succès / Wave & OM** :
  * Fond : `bg-emerald-50` / `bg-emerald-100/80`
  * Texte : `text-emerald-700` (`#047857`)
  * Bordure : `border-emerald-200/60`
* **En attente / En cours d'émission** :
  * Fond : `bg-amber-50` / `bg-amber-100`
  * Texte : `text-amber-800` (`#92400e`)
  * Bordure : `border-amber-200/60`
* **En retard / Danger / Suppression / Badges PDF** :
  * Fond : `bg-rose-50` / `bg-rose-100`
  * Texte : `text-rose-700` (`#be123c`)
  * Badge PDF rouge : `bg-gradient-to-br from-rose-500 to-rose-600 text-white`

---

## 2. Bordures, Arrondis & Ombres

### 2.1 Couleurs & Épaisseurs de Bordures
* **Bordures par défaut de cartes** : `border border-slate-200/80` ou `border-slate-200/90`.
* **Séparateurs internes de sections** : `border-b border-slate-100` ou `border-slate-200/70`.
* **Bordures d'état actif / sélection** : `border-sky-400 ring-1 ring-sky-300`.
* **Bordures au survol interactif** : `hover:border-sky-300/80`.
* **Contraste tableau A4 / document officiel** : `border-b-2 border-slate-900` (lignes d'en-tête de facture et totaux TTC).

### 2.2 Rayons de Courbure (Border Radius)
* **Cartes principales & Modales** : `rounded-2xl` (16px).
* **Sous-cartes, items de listes, boutons, inputs** : `rounded-xl` (12px).
* **Petits boutons d'icônes, badges compacts** : `rounded-lg` (8px).
* **Badges de statut (pill)** : `rounded-full` (9999px).
* **Pastilles PDF documentaires** : `rounded-xs` (2px).

### 2.3 Ombres & Élévation (Shadows)
* **Cartes au repos** : `shadow-sm` ou `shadow-2xs`.
* **Cartes interactives au survol (`.card-interactive:hover`)** :
  `box-shadow: 0 12px 28px -6px rgba(14, 165, 233, 0.08), 0 8px 16px -4px rgba(15, 23, 42, 0.04);`
* **Sous-éléments au survol (`.sub-card-interactive:hover`)** :
  `box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.06);`
* **Boutons CTA primaires** : `shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30`.

---

## 3. Animations & Micro-Interactions

Toutes les transitions doivent être soignées, fluides et professionnelles :
* **Transitions par défaut** : `transition-all duration-200 ease-in-out`.
* **Élévation au survol** :
  * Pour les modules : `hover:-translate-y-0.75` (`.card-interactive`) ou `hover:-translate-y-0.5`.
  * Pour les boutons d'action : `hover:scale-105 active:scale-95`.
* **Pulsation douce (`.pulse-gentle`)** : Utilisée sur les voyants de statut et indicateurs d'activité en temps réel.
* **Brillance animée (`.animate-shimmer`)** : Utilisée sur les jauges de progression budgétaires et statistiques financières.
* **Apparition d'infobulles** : `animate-in fade-in zoom-in-95 duration-100`.

---

## 4. Composants & Éléments Standards

### 4.1 Infobulles / Tooltips (`<Tooltip>`)
* **Design strict** :
  * Fond **BLANC** (`bg-white`), texte en anthracite (`text-slate-800 font-bold text-xs`), bordure fine (`border border-slate-200/90`), ombre douce et anneau subtil (`ring-1 ring-slate-900/5`).
  * **Icône obligatoire en BLEU** (`text-sky-600 shrink-0 stroke-[2.3]`).
  * Flèche blanche sous l'infobulle (`border-t-white`).
* **Règle absolue sur le texte** :
  * **UNIQUEMENT LE NOM DU BOUTON OU LE TITRE DE L'ACTION** (ex : *« Factures & Devis »*, *« Télécharger le PDF »*, *« Nouvelle facture »*).
  * **INTERDICTION** d'ajouter des phrases explicatives, sous-titres ou textes à rallonge.

### 4.2 Boutons & Actions (CTA)
* **Bouton Primaire Unique** :
  * Classe : `bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer`.
  * Règle : Maximum **1 seul CTA primaire par écran/en-tête** (ex : « + Nouvelle facture »).
* **Boutons Secondaires & Tertiaires** :
  * Blanc sobre : `bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs hover:scale-105 active:scale-95`.
  * Action Sky : `bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold shadow-2xs`.
  * WhatsApp Business : `bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shadow-2xs`.
  * Bouton d'icône carré : `w-7 h-7` ou `w-9 h-9`, bordure `border-slate-200/90`, hover `text-sky-600 border-sky-300 bg-sky-50`.

### 4.3 Tableaux & Registres de Données
* **En-tête `<thead>`** : `bg-slate-50/90 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/70`.
* **Lignes `<tbody>`** : `divide-y divide-slate-100`.
* **Ligne au survol** : `hover:bg-sky-50/40 transition-colors group cursor-pointer`.
* **Alignements des cellules** :
  * Texte & noms de clients : `text-left font-semibold text-slate-900`.
  * Dates & métadonnées : `text-left text-slate-600`.
  * Quantités : `text-center font-bold text-slate-600`.
  * Montants financiers : `text-right font-extrabold text-slate-900 tabular-nums`.
  * Badges & statuts : `text-center` ou `text-left`.

### 4.4 Formulaires & Champs de Saisie
* **Inputs & Selects** :
  * `w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100`.
  * Labels : `block font-semibold text-slate-700 text-xs mb-1`.
  * Placeholders : `placeholder:text-slate-400`.

### 4.5 Modales
* **Overlay** : `fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 lg:p-6 overflow-y-auto`.
* **Boîte modale** : `relative w-full max-w-7xl bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] overflow-hidden`.
* **En-tête & Pied de modale** : Fond blanc `bg-white`, bordures `border-slate-200`, padding `px-4 sm:px-6 py-3.5`.

---

## 5. Standard du Document A4 & Génération PDF

Toute vue de facture ou téléchargement PDF doit reproduire fidèlement la maquette A4 officielle :
1. **Dimensions standard** : 794px x 1123px (A4 à 96 DPI / 210mm x 297mm).
2. **Logo & En-tête** :
   * Carré noir `SF` (`bg-slate-900 text-white rounded-lg font-black`).
   * Titre : **SEN FACTURE** (gras, lettrage resserré).
   * Coordonnées : *Teranga Digital SARL*, 46 Bd de la République Dakar Plateau, NINEA *SN-009876543-2B*, RC et contact.
3. **Badge Facture & Dates** :
   * Badge `FACTURE` encadré bleu ciel (`bg-sky-50 text-sky-700 border-sky-200 font-extrabold uppercase`).
   * Numéro de facture (`FAC-2025-XXXX`).
   * Dates d'émission et d'échéance.
4. **Cartouche Facturé À** :
   * Fond `bg-slate-50`, bordure `border-slate-200`, titre en majuscules gris clair `FACTURÉ À`.
   * Coordonnées complètes du client et pastille de statut de règlement.
5. **Tableau des prestations** :
   * Bordure inférieure de titre : `border-b-2 border-slate-900`.
   * Colonnes : Description, Quantité, Prix unitaire, Total HT.
6. **Récapitulatif Financier** :
   * Sous-total HT, TVA légale 18% (SYSCOHADA), Total TTC mis en avant en grand bleu ciel bold (`#0284c7`).
7. **Pied de page & Réglementation** :
   * Modalités : Wave Mobile Money, Orange Money, virement bancaire BICIS.
   * Mention de conformité : *« SEN FACTURE — Document certifié conforme aux normes fiscales SYSCOHADA et République du Sénégal »*.
8. **Impression native (`@media print`)** : Toujours masquer l'interface globale et isoler la feuille `#live-invoice-preview-sheet`.

---

## 6. Responsivité & Mobile-First

* **Barre Latérale (Sidebar)** :
  * **Desktop (lg+)** : Rail compact fixe de `w-[76px]`, icônes centrées `w-11 h-11`, info-bulles blanches s'ouvrant au survol sans rognage (`lg:overflow-visible`).
  * **Mobile / Tablette (<lg)** : Tiroir coulissant complet (`w-72 sm:w-80`), fond blanc, ombre `shadow-2xl`, avec libellé du bouton affiché en clair (sans description secondaire).
* **Logo** : Ne **jamais** compresser le logo `SF` (`shrink-0`, dimensions fixes `w-11 h-11`).
* **Grilles adaptatives** :
  * Mobile : `grid-cols-1 gap-4`.
  * Tablette : `grid-cols-1 md:grid-cols-2 gap-4`.
  * Desktop : `lg:grid-cols-12 gap-5`.
* **Vues Split (Création + Aperçu direct)** :
  * Desktop : Division côte-à-côte 50/50 (`lg:col-span-6`).
  * Mobile : Onglets de bascule intégrés en haut (`Formulaire` / `Aperçu A4`).

---

## 7. Règles Linguistiques & Données Métier

* **Langue unique** : **100% Français**.
* **Devise** : Franc CFA (`FCFA` ou `F`), formatage avec séparateurs de milliers à espace (`toLocaleString("fr-FR")`).
* **Fiscalité** : TVA 18% (taux standard SYSCOHADA / Sénégal).
* **Identifiants uniques** : Chaque icône de navigation doit pointer vers une route unique pour qu'une seule icône ne soit active à la fois.
