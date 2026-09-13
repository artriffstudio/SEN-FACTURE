# SEN FACTURE — Guide de Référence du Projet (GEMINI.md)

Ce document constitue la **mémoire centrale et le guide d'architecture complet** de SEN FACTURE. Tout modèle d'intelligence artificielle ou développeur intervenant sur ce projet **DOIT** consulter et respecter ce fichier afin de préserver l'intégrité technique, fonctionnelle et visuelle de la plateforme.

---

## 1. 🎯 Ce que l'Application Fait (Vision & Métier)

**SEN FACTURE** est une plateforme SaaS haut de gamme de **facturation électronique, gestion commerciale et conformité comptable**, spécialement conçue pour les entreprises, PME, startups et indépendants établis en **République du Sénégal** et dans la zone **UEMOA / SYSCOHADA révisé**.

### Spécificités Métier Clés
- **Devise officielle** : Franc CFA (**FCFA** ou **F**), toujours formaté avec séparateurs de milliers français (ex: `2 500 000 FCFA`).
- **Fiscalité locale** : TVA légale de **18%** (DGID Sénégal / SYSCOHADA).
- **Identifiants fiscaux légaux** : Numéro d'Identification Nationale des Entreprises et Associations (**NINEA**), Registre de Commerce (**RC**), et Centre Fiscal de rattachement.
- **Paiements régionaux intégrés** : Support natif et mise en valeur des règlements par **Wave Mobile Money**, **Orange Money Sénégal**, et virements bancaires (BICIS, CBAO, BOA, etc.).
- **Langue de l'interface** : **100% Français**, professionnel et sans anglicismes superflus.

---

## 2. ⚡ Toutes les Fonctionnalités Implémentées

L'application couvre l'ensemble du cycle de vie financier d'une entreprise :

### 2.1 Tableau de Bord Interactif (`/`)
- **Indicateurs financiers en temps réel (KPIs)** : Chiffre d'affaires encaissé, créances en attente, encours en retard et total des clients partenaires.
- **Atelier de création rapide** : Déclenchement de la modale dynamique de facturation en un clic.
- **Graphique d'activité** : Visualisation des performances mensuelles.
- **Dernières factures** : Tableau interactif avec badges de statuts (Payée, En attente, En retard) et actions rapides (téléchargement PDF, partage WhatsApp, consultation).
- **Adresses professionnelles dynamiques** : Ajout d'adresses (bouton `+`), sélection de l'adresse par défaut et suppression en temps réel.
- **Documents et contrats officiels** : Téléchargement direct des pièces jointes sous forme de véritables factures et contrats A4 certifiés.

### 2.2 Gestion des Factures & Devis (`/invoices`)
- **Filtres par statut** : Onglets *Toutes*, *Payées*, *En attente*, *En retard*, *Brouillons*.
- **Recherche instantanée** : Par numéro de facture, nom de client ou prestation.
- **Téléchargement PDF A4 direct** : Génération instantanée sans rechargement de page.
- **Partage WhatsApp en un clic** : Génération de messages pré-formatés avec référence et montant en FCFA.

### 2.3 Atelier de Création de Facture avec Aperçu en Direct (`LiveInvoiceModal` & `/invoices/new`)
- **Disposition Double Volet (Split-Screen)** :
  - *Volet Gauche (Formulaire)* : Sélection ou saisie libre du client, choix des dates, ajustement de la TVA (18% ou exonéré), ajout/suppression dynamique de lignes de prestations avec quantité et prix unitaire HT.
  - *Volet Droit (Feuille A4 Virtuelle)* : Rendu synchrone et instantané de la facture A4 officielle avec logo de l'entreprise, coordonnées NINEA, tableau des prestations, totaux et mentions légales de paiement.
- **Adaptation Mobile** : Bascule par onglets (*Formulaire* / *Aperçu A4*) pour une lisibilité parfaite sur smartphones.

### 2.4 Fiche Détaillée de Facture A4 (`/invoices/[id]`)
- Affichage pleine page du document A4 officiel (794px x 1123px).
- Boutons d'export PDF haute résolution et d'impression directe.
- Partage client sécurisé via WhatsApp.

### 2.5 Répertoire Clients & Fiche Client (`/clients` & `/clients/[id]`)
- **Cartes clients interactives (`.card-interactive`)** : Coordonnées complètes, ville, email, téléphone, NINEA, nombre de factures et chiffre d'affaires cumulé.
- **Contact direct WhatsApp** : Bouton d'action directe pour ouvrir une discussion avec le client.
- **Fiche détaillée (`/clients/[id]`)** : Historique complet des factures émises pour ce client avec téléchargement PDF individuel.

### 2.6 Création de Client & Téléversement de Logo (`/clients/new`)
- Formulaire d'enregistrement avec préfixes sénégalais (+221, Dakar).
- **Module de téléversement interactif du logo du client** : Cadre pointillé, sélection de fichier (PNG, JPG, SVG, WebP, max 2 Mo), aperçu instantané en Data URL et suppression.

### 2.7 Catalogue Articles & Prestations SYSCOHADA (`/inventory`)
- Répertoire officiel des services et forfaits (Développement Web/Mobile, Hébergement Cloud, Maintenance, Audit Sécurité, Formation, Câblage fibre).
- Filtres instantanés par familles professionnelles et barre de recherche.
- Bouton direct **« Facturer cette prestation »** qui pré-remplit une nouvelle facture.
- Modale interactive d'ajout d'une nouvelle prestation avec code référence, unité de mesure (Forfait, Mois, Jour, Heure, Lot) et tarif unitaire HT.

### 2.8 Rapports Financiers & Chiffre d'Affaires (`/reports`)
- **4 Cartes KPI** : CA encaissé, créances à échoir, taux de recouvrement avec jauge animée `.animate-shimmer`, et TVA 18% collectée (déclaration fiscale).
- **Graphique d'évolution mensuel** : Bâtons verticaux interactifs avec mise en avant du mois en cours.
- **Ventilation par client clé** : Pourcentages de contribution au chiffre d'affaires et barres de progression.
- **Grand Livre Comptable SYSCOHADA** : Journal exhaustif des écritures comptables (débit/crédit), statut d'encaissement et boutons d'export CSV et d'impression.

### 2.9 Assistance & Support Client (`/support`)
- **3 Canaux d'assistance directs** : WhatsApp Business direct (+221 77 890 12 34), Hotline téléphonique Dakar (+221 33 820 45 67) et Email support officiel.
- **Formulaire de création de ticket** : Choix de la catégorie, niveau de priorité, objet, description, avec horodatage certifié et confirmation par toast réactif.
- **Foire Aux Questions (FAQ)** : 5 accordéons traitant de la conformité SYSCOHADA, des paiements Mobile Money et de la fiscalité sénégalaise.

### 2.10 Paramètres de l'Entreprise & Logo Officiel (`/settings`)
- Configuration de la raison sociale, marque commerciale, email, téléphone, NINEA, Registre de Commerce, coordonnées bancaires BICIS, et numéros Wave / Orange Money.
- **Téléversement fonctionnel du logo officiel** : Cadre pointillé interactif (PNG, JPG, SVG, max 2 Mo), aperçu instantané, stockage persistant (`localStorage`), boutons *Changer* et *Supprimer*.
- **Mise à jour en cascade** : La modification du logo met immédiatement à jour les aperçus en direct et les exports PDF grâce à un système d'événements personnalisés.

### 2.11 Moteur d'Exportation PDF Haute Définition (`src/lib/pdfGenerator.ts`)
- Rendu 100% fidèle à l'aperçu A4 standard (794px x 1123px à 96 DPI).
- Conversion vectorielle via `html2canvas` (scale 2x Retina) et `jsPDF`.
- **Centrage vectoriel du logo SF** : Utilisation d'un élément SVG avec `dominant-baseline="central"` et `text-anchor="middle"` garantissant un centrage mathématique absolu au pixel près (sans aucun décalage de ligne).
- Si un logo personnalisé d'entreprise est importé, il s'affiche automatiquement à la place du monogramme SF.

### 2.12 Intégration Supabase & Serveur MCP de Base de Données
- **Serveur MCP Officiel (`@supabase/mcp-server-supabase`)** : Connecte directement l'assistant IA au projet Supabase pour la création automatique et le maintien de la base de données.
- **33 Outils MCP Disponibles** :
  - Création et modification de tables : `execute_sql`, `apply_migration`, `list_tables`, `list_migrations`.
  - Administration de projet : `create_project`, `get_project`, `list_projects`, `get_publishable_keys`.
  - Synchronisation de types : `generate_typescript_types` pour garder les interfaces TypeScript synchronisées avec la base PostgreSQL.
  - Stockage et buckets : `list_storage_buckets`, `update_storage_config` pour les logos et justificatifs.
- **Configuration MCP (`.agents/mcp_config.json` et `mcp_config.json`)** : Enregistré au niveau de l'espace de travail pour Antigravity / Gemini IDE et assistants IA compatibles.
- **Schéma PostgreSQL Clé en Main (`supabase/schema.sql`)** : Structure complète prête à être exécutée comprenant :
  - Tables : `companies`, `clients`, `catalog_items`, `invoices`, `invoice_items`, `support_tickets`.
  - Sécurité RLS (Row Level Security) activée pour isoler les données par utilisateur `auth.uid()`.
  - Catalogue de prestations SYSCOHADA pré-rempli (Développement, Cloud, Audit, Maintenance, Formation).
- **Client Web (`src/lib/supabase.ts`)** : Initialisation sécurisée et résiliente du SDK `@supabase/supabase-js`.

### 2.13 Module d'Authentification Supabase Auth (`/login` & `/register`)
- **Élimination intégrale des données fictives** : Toutes les données de démonstration (Sonatel, Auchan, faux montants de 24M FCFA) ont été purgées de la base PostgreSQL et du code frontend au profit d'Empty States dynamiques et certifiés.
- **Page de Connexion (`/login`)** :
  - **Design inspiré fidèlement de la capture utilisateur** : Grande carte flottante à coins ultra-arrondis (`rounded-[28px] sm:rounded-[36px]`) combinant un volet visuel architectural chaleureux et une carte blanche intérieure en superposition.
  - **Volet Gauche (Espace & Accueil)** : Image d'ambiance de studio d'architecture moderne en haute définition (`/images/auth-bg.jpg`), courbes et contours vectoriels géométriques blancs semi-transparents, pastille pilule blanche *« Bonjour ! »*, titre *« **Bon retour** sur votre espace personnel ! »*, et sous-titre *« Nous sommes ravis de vous retrouver parmi nous. »*.
  - **Volet Droit (Carte Blanche Formulaire)** : Titre *« Se connecter »*, sous-titre *« Accédez à votre espace personnel »*, champs arrondis en pilule *« Email »* (placeholder: *« Entrez votre email »*) et *« Mot de passe »* (placeholder: *« Entrez votre mot de passe »*), lien *« Mot de passe oublié ? »*, bouton CTA *« Connexion »*, et lien *« Pas encore de compte ? **Créer un compte** »*.
- **Page de Création de Compte (`/register`) & Accès Instantané** :
  - Même univers visuel (carte flottante, décor géométrique, badge *« Bienvenue ! »*, champs pilules et bouton *« Créer mon compte »*).
  - Enregistrement du dirigeant (nom, prénom), de son entreprise (raison sociale), email et mot de passe.
  - **Accès instantané sans confirmation d'email requise** : Grâce au paramètre `mailer_autoconfirm: true` activé dans Supabase Auth, le compte est validé à la seconde même de l'inscription et l'utilisateur est automatiquement connecté et redirigé vers son tableau de bord (`/`).
  - Liaison immédiate avec la table `companies` (`user_id = auth.uid()`).
- **Route de Redirection & Callback (`/auth/callback`)** :
  - Route universelle de réception pour les éventuels liens de réinitialisation de mot de passe ou d'invitation avec support PKCE et OTP.
- **Protection des Routes & Session (`AuthContext.tsx`)** :
  - Contexte global `<AuthProvider>` avec écoute en temps réel (`onAuthStateChange`).
  - Layout Dashboard protégé : redirection automatique des utilisateurs non connectés vers `/login`.
  - Profil utilisateur dynamique dans la barre latérale avec initiales, nom de l'entreprise, email et bouton de déconnexion immédiate (`signOut`).

---

## 3. 📂 Structure des Fichiers du Projet

```text
SEN FACTURE/
├── .agents/
│   └── rules/
│       └── design-system.md       # Règle officielle du Design System
├── public/                        # Actifs statiques publics
├── src/
│   ├── app/
│   │   ├── (auth)/                # Groupe de routes d'authentification
│   │   │   ├── layout.tsx         # Layout auth épuré (badges DGID, SSL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Page de connexion
│   │   │   └── register/
│   │   │       └── page.tsx       # Page d'inscription et création entreprise
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx       # Route de validation et confirmation d'email Supabase
│   │   ├── (dashboard)/           # Groupe de routes sous layout protégé
│   │   │   ├── layout.tsx         # Layout principal protégé (Sidebar + Header + Guard)
│   │   │   ├── page.tsx           # Tableau de bord principal (Accueil)
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx       # Liste des clients & entreprises
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Création client avec téléversement logo
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Fiche client détaillée & historique
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx       # Catalogue articles & prestations SYSCOHADA
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx       # Liste filtrable des factures & devis
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx   # Atelier création avec aperçu A4 direct
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Consultation pleine page facture A4
│   │   │   ├── reports/
│   │   │   │   └── page.tsx       # Chiffres d'affaires & Grand Livre comptable
│   │   │   ├── settings/
│   │   │   │   └── page.tsx       # Paramètres entreprise & téléversement logo
│   │   │   └── support/
│   │   │       └── page.tsx       # Support client, tickets & FAQ
│   │   ├── globals.css            # Styles globaux, tokens et animations CSS
│   │   └── layout.tsx             # Root layout HTML avec AuthProvider et polices Geist
│   ├── components/
│   │   ├── invoices/
│   │   │   └── LiveInvoiceModal.tsx # Modale atelier création & aperçu live
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Barre supérieure responsive avec recherche
│   │   │   └── Sidebar.tsx        # Navigation latérale (Rail desktop + Drawer mobile)
│   │   └── ui/
│   │       └── Tooltip.tsx        # Infobulle blanche épurée avec icône bleue
│   ├── lib/
│   │   ├── constants.ts           # Devises, constantes fiscales et labels
│   │   ├── mock-data.ts           # Données de démonstration réalistes (Dakar / Sénégal)
│   │   ├── pdfGenerator.ts        # Moteur de capture et téléchargement PDF A4
│   │   ├── supabase.ts            # Client Supabase résilient (@supabase/supabase-js)
│   │   ├── services/              # Couche de services Full-Stack Supabase
│   │   │   ├── clientService.ts   # CRUD clients et téléversement logo
│   │   │   ├── companyService.ts  # Profil entreprise et logo sur Bucket Supabase
│   │   │   ├── invoiceService.ts  # Création atomique, KPIs, statut, et factures
│   │   │   ├── catalogService.ts  # Catalogue articles & prestations SYSCOHADA
│   │   │   └── supportService.ts  # Enregistrement des tickets support
│   │   ├── types/
│   │   │   └── index.ts           # Définitions TypeScript (Invoices, Clients, Company, Catalog)
│   │   └── utils/
│   │       └── index.ts           # Helpers (cn, calculs, formatage)
│   └── ...
├── supabase/
│   └── schema.sql                 # Schéma PostgreSQL complet (tables, RLS, index, catalogue SYSCOHADA)
├── .agents/
│   ├── mcp_config.json            # Configuration MCP Supabase pour Antigravity / Gemini IDE
│   └── rules/
│       └── design-system.md       # Règle officielle du Design System
├── .env.example                   # Gabarit des variables d'environnement Supabase & MCP
├── .env.local                     # Variables d'environnement locales (URL, clés Supabase)
├── mcp_config.json                # Configuration MCP Supabase racine (IDE / Assistant compatible)
├── AGENTS.md                      # Règles système pour agents IA
├── GEMINI.md                      # Ce fichier de référence exhaustif
├── package.json                   # Dépendances et scripts npm
├── tailwind.config.ts             # Configuration du Design System Tailwind
└── tsconfig.json                  # Configuration TypeScript stricte
```

---

## 4. 🛠️ Technologies Utilisées

| Rôle | Technologie | Rationale & Précisions |
| :--- | :--- | :--- |
| **Framework Web** | **Next.js 16.3+ (App Router)** | Architecture moderne avec Turbopack, rendu hybride statique/dynamique ultra-rapide. |
| **Langage** | **TypeScript 5 (Strict Mode)** | Typage strict de toutes les entités financières, clients, et formulaires. 0 erreur de compilation. |
| **Base de Données** | **Supabase (PostgreSQL 15+)** | Hébergement PostgreSQL géré, Row Level Security (RLS), SDK `@supabase/supabase-js`. |
| **Serveur MCP** | **@supabase/mcp-server-supabase** | Serveur MCP officiel pour création et gestion de tables, migrations et exécution de requêtes SQL. |
| **Styling & CSS** | **Tailwind CSS + CSS Vanilla** | Design System sur-mesure (`bg-slate-50`, ombres HSL fines, bordures `border-slate-200/80`). |
| **Génération PDF** | **html2canvas + jsPDF** | Rendu A4 officiel (794x1123px) à l'échelle 2x pour une netteté de qualité impression. |
| **Icônes** | **lucide-react** | Bibliothèque d'icônes cohérente, moderne et légère. |
| **Notifications** | **react-hot-toast** | Notifications toasts réactives avec retours d'actions immédiats. |

---

## 5. 🎨 Décisions de Design (Design System Officiel)

L'interface doit impérativement respecter les standards suivants :

### 5.1 Palette Chromatique
- **Fonds** :
  - Page principale : `bg-slate-50` (`#f8fafc`).
  - Cartes et panneaux : `bg-white` (`#ffffff`).
  - Sous-zones et champs : `bg-slate-50` ou `bg-slate-100/70`.
- **Accents Sky / Cyan** :
  - Bouton CTA principal : `bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700`.
  - Liens et icônes interactives : `text-sky-600`.
  - Sélections actives : `border-sky-400 ring-1 ring-sky-300`.
- **Badges de statut** :
  - *Payée / Succès* : `bg-emerald-50 text-emerald-700 border-emerald-200/60`.
  - *En attente* : `bg-amber-50 text-amber-800 border-amber-200/60`.
  - *En retard / Danger* : `bg-rose-50 text-rose-700 border-rose-200/60`.

### 5.2 Micro-Interactions & Élévation
- **Cartes interactives (`.card-interactive`)** :
  - Ombre subtile au repos : `box-shadow: 0 1px 3px rgba(0,0,0,0.05)`.
  - Survol : élévation `hover:-translate-y-0.75` avec ombre douce cyanée `0 12px 28px -6px rgba(14,165,233,0.08)`.
- **Voyants en direct** : Classe `.pulse-gentle` sur les statuts temps réel.
- **Barres de progression** : Classe `.animate-shimmer` sur les jauges financières.

### 5.3 Infobulles (`<Tooltip>`) — Règle Stricte
- **Fond blanc pur** (`bg-white`), bordure fine `border-slate-200/90`, texte sombre `text-slate-800 font-bold text-xs`.
- **Icône en bleu ciel obligatoire** (`text-sky-600 stroke-[2.3]`).
- **Contenu strict** : **UNIQUEMENT LE NOM / TITRE DU BOUTON** (ex: *« Factures & Devis »*, *« Télécharger le PDF »*). Ne **JAMAIS** ajouter de paragraphes ou de phrases secondaires explicatives.

### 5.4 Standard Document Facture A4
- Dimensions : 794px de large x 1123px de haut (ratio officiel A4 à 96 DPI).
- En-tête : Carré `SF` noir vectoriel (ou logo entreprise), Teranga Digital SARL, NINEA, RC.
- Totaux : Sous-total HT, TVA 18%, et **TOTAL NET TTC** en grand bold bleu ciel (`#0284c7`).
- Pied de page : Coordonnées Wave, Orange Money, RIB BICIS et mention de conformité SYSCOHADA.

---

## 6. 🤖 Instructions Strictes pour les Futurs Modèles IA

Lors de toute intervention future sur ce projet, le modèle IA **DOIT** suivre ces règles sans exception :

1. **Règle Mobile First & Aucun Bouton Débordant** :
   - Dans le `Header.tsx`, le CTA d'action sur mobile doit rester compact (`+ Facture` sur `< 640px`) pour **ne jamais chevaucher ou masquer le bouton WhatsApp Business**.
   - Dans les formulaires (ex: `/support`, `/settings`), les boutons d'envoi et les mentions légales doivent s'adapter via `flex-col-reverse sm:flex-row` pour éviter d'écraser les textes d'horodatage ou de certification.
2. **Navigation Univoque dans la Sidebar** :
   - Une seule icône doit être active à la fois.
   - Respecter la logique de détection stricte des routes dans `isItemActive()` de `Sidebar.tsx`.
3. **Persistance et Intégration des Logos** :
   - Tout téléversement de logo doit lire l'image en base64 Data URL, la stocker dans `localStorage.getItem("sen_facture_company_logo")`, et déclencher l'événement personnalisé `"company-logo-updated"` pour mettre à jour instantanément les autres composants ouverts.
4. **Centrage Absolu du Monogramme SF** :
   - Dans tout template PDF ou aperçu virtuel, ne jamais utiliser un simple `<div>SF</div>` flexbox qui souffre de décalage de ligne sous `html2canvas`. Utiliser l'élément vectoriel SVG avec `dominant-baseline="central"` et `text-anchor="middle"`.
5. **Validation Systématique** :
   - Avant de conclure toute modification, exécuter `npx tsc --noEmit` et vérifier que le code compile avec **0 erreur**.
   - S'assurer que `npm run build` réussit sur les 12 routes sans incident.
6. **Langue et Localisation** :
   - Tout texte visible par l'utilisateur doit être en **Français**.
   - Tous les montants financiers doivent être accompagnés de la mention **FCFA**.
