# FACTURIM — Guide de Référence du Projet (GEMINI.md)

Ce document constitue la **mémoire centrale et le guide d'architecture complet** de FACTURIM. Tout modèle d'intelligence artificielle ou développeur intervenant sur ce projet **DOIT** consulter et respecter ce fichier afin de préserver l'intégrité technique, fonctionnelle et visuelle de la plateforme.

---

## 1. 🎯 Ce que l'Application Fait (Vision & Métier)

**FACTURIM** est une plateforme SaaS haut de gamme de **facturation électronique, gestion commerciale et conformité comptable**, spécialement conçue pour les entreprises, PME, startups et indépendants établis en **République Islamique de Mauritanie**.

### Spécificités Métier Clés
- **Devise officielle** : Ouguiya mauritanienne (**MRU**), formaté avec séparateurs de milliers français (ex: `250 000 MRU` ou `250 000 أوقية`).
- **Fiscalité locale** : TVA légale de **16%** (Direction Générale des Impôts - DGI Mauritanie).
- **Identifiants fiscaux légaux** : Numéro d'Identification Fiscale (**NIF**) et Registre de Commerce (**RC**).
- **Paiements locaux intégrés** : Support natif et mise en valeur des règlements par **Bankily (BPM)**, **Seddap**, **Masrvi (BIM)**, et virements bancaires (BPM, BMCI, BNM, etc.).
- **Internationalisation & Multilingue** : **Arabe (العربية - RTL)**, **Français (FR)**, **Anglais (EN)** et **Chinois (中文 - ZH)** avec commutateur dynamique et persistance locale.

---

## 2. ⚡ Toutes les Fonctionnalités Implémentées

L'application couvre l'ensemble du cycle de vie financier d'une entreprise :

### 2.1 Moteur Multilingue & Internationalisation (`LanguageContext.tsx` & `src/lib/translations/`)
- Support complet de 4 langues : **Français**, **Arabe (avec inversion de direction RTL `dir="rtl"`)**, **Anglais**, et **Chinois**.
- Sélecteur de langue sous forme de pastille interactive avec drapeaux (🇫🇷, 🇲🇷, 🇬🇧, 🇨🇳).
- Formatage monétaire adapté à la langue active (`XXX MRU` en FR/EN/ZH, `XXX أوقية` en Arabe).

### 2.2 Tableau de Bord Interactif (`/dashboard`)
- **Indicateurs financiers en temps réel (KPIs)** : Chiffre d'affaires encaissé en MRU, créances en attente, encours en retard et total des clients partenaires.
- **Atelier de création rapide** : Déclenchement de la modale dynamique de facturation en un clic.
- **Graphique d'activité** : Visualisation des performances mensuelles en MRU.
- **Dernières factures** : Tableau interactif avec badges de statuts (Payée, En attente, En retard) et actions rapides (téléchargement PDF, partage WhatsApp, consultation).
- **Adresses professionnelles dynamiques** : Ajout d'adresses (bouton `+`), sélection de l'adresse par défaut et suppression en temps réel.
- **Documents et contrats officiels** : Téléchargement direct des pièces jointes sous forme de véritables factures et contrats A4 certifiés.

### 2.3 Gestion des Factures & Devis (`/invoices`)
- **Filtres par statut** : Onglets *Toutes*, *Payées*, *En attente*, *En retard*, *Brouillons*.
- **Recherche instantanée** : Par numéro de facture, nom de client ou prestation.
- **Téléchargement PDF A4 direct** : Génération instantanée sans rechargement de page.
- **Partage WhatsApp en un clic** : Génération de messages pré-formatés avec référence et montant en MRU.

### 2.4 Atelier de Création de Facture avec Aperçu en Direct (`LiveInvoiceModal` & `/invoices/new`)
- **Disposition Double Volet (Split-Screen)** :
  - *Volet Gauche (Formulaire)* : Sélection ou saisie libre du client, choix des dates, ajustement de la TVA (16% ou exonéré), ajout/suppression dynamique de lignes de prestations avec quantité et prix unitaire HT en MRU.
  - *Volet Droit (Feuille A4 Virtuelle)* : Rendu synchrone et instantané de la facture A4 officielle avec logo de l'entreprise ou monogramme `FI`, coordonnées NIF, tableau des prestations, totaux et mentions de paiement Bankily/Seddap.
- **Adaptation Mobile** : Bascule par onglets (*Formulaire* / *Aperçu A4*) pour une lisibilité parfaite sur smartphones.

### 2.5 Fiche Détaillée de Facture A4 (`/invoices/[id]`)
- Affichage pleine page du document A4 officiel (794px x 1123px).
- Boutons d'export PDF haute résolution et d'impression directe.
- Partage client sécurisé via WhatsApp.

### 2.6 Répertoire Clients & Fiche Client (`/clients` & `/clients/[id]`)
- **Cartes clients interactives (`.card-interactive`)** : Coordonnées complètes, ville (Nouakchott, Nouadhibou...), email, téléphone, NIF, nombre de factures et chiffre d'affaires cumulé en MRU.
- **Contact direct WhatsApp** : Bouton d'action directe pour ouvrir une discussion avec le client.
- **Fiche détaillée (`/clients/[id]`)** : Historique complet des factures émises pour ce client avec téléchargement PDF individuel.

### 2.7 Création de Client & Téléversement de Logo (`/clients/new`)
- Formulaire d'enregistrement avec préfixes mauritaniens (+222, Nouakchott).
- **Module de téléversement interactif du logo du client** : Cadre pointillé, sélection de fichier (PNG, JPG, SVG, WebP, max 2 Mo), aperçu instantané en Data URL et suppression.

### 2.8 Catalogue Articles & Prestations Mauritanie (`/inventory`)
- Répertoire officiel des services et forfaits (Développement Web/Mobile, Hébergement Cloud, Maintenance, Audit Sécurité, Formation, Câblage fibre).
- Tarifs configurés en MRU (Ouguiya) avec TVA 16%.
- Filtres instantanés par familles professionnelles et barre de recherche.
- Bouton direct **« Facturer cette prestation »** qui pré-remplit une nouvelle facture.

### 2.9 Rapports Financiers & Chiffre d'Affaires (`/reports`)
- **4 Cartes KPI** : CA encaissé, créances à échoir, taux de recouvrement avec jauge animée `.animate-shimmer`, et TVA 16% collectée (déclaration fiscale DGI).
- **Graphique d'évolution mensuel** : Bâtons verticaux interactifs avec mise en avant du mois en cours.
- **Ventilation par client clé** : Pourcentages de contribution au chiffre d'affaires et barres de progression.
- **Grand Livre Comptable** : Journal exhaustif des écritures comptables (débit/crédit), statut d'encaissement et boutons d'export CSV et d'impression.

### 2.10 Assistance & Support Client (`/support`)
- **3 Canaux d'assistance directs** : WhatsApp Business direct (+222 36 00 00 00), Hotline téléphonique Nouakchott (+222 45 00 00 00) et Email support officiel (support@facturim.mr).
- **Formulaire de création de ticket** : Choix de la catégorie, niveau de priorité, objet, description, avec horodatage certifié et confirmation par toast réactif.
- **Foire Aux Questions (FAQ)** : 5 accordéons traitant de la conformité DGI Mauritanie, des paiements Bankily & Seddap et de la TVA 16%.

### 2.11 Paramètres de l'Entreprise & Logo Officiel (`/settings`)
- Configuration de la raison sociale, marque commerciale, email, téléphone, NIF, Registre de Commerce, coordonnées bancaires BPM, et numéros Bankily / Seddap.
- **Téléversement fonctionnel du logo officiel** : Cadre pointillé interactif (PNG, JPG, SVG, max 2 Mo), aperçu instantané, stockage persistant (`localStorage`), boutons *Changer* et *Supprimer*.

### 2.12 Moteur d'Exportation PDF Haute Définition (`src/lib/pdfGenerator.ts`)
- Rendu 100% fidèle à l'aperçu A4 standard (794px x 1123px à 96 DPI).
- Conversion vectorielle via `html2canvas` (scale 2x Retina) et `jsPDF`.
- **Centrage vectoriel du logo FI** : Utilisation d'un élément SVG avec `dominant-baseline="central"` et `text-anchor="middle"` garantissant un centrage mathématique absolu.

---

## 3. 🎨 Décisions de Design (Design System Officiel)

L'interface conserve **100%** de sa forme, typographie et palette visuelle :
- **Fonds** : `bg-slate-50` (`#f8fafc`), cartes `bg-white` (`#ffffff`).
- **Accents Sky / Cyan** : Boutons primaires `bg-gradient-to-r from-sky-500 to-sky-600`, liens `text-sky-600`.
- **Badges de statut** :
  - *Payée / Bankily / Seddap* : `bg-emerald-50 text-emerald-700 border-emerald-200/60`.
  - *En attente* : `bg-amber-50 text-amber-800 border-amber-200/60`.
  - *En retard / Danger* : `bg-rose-50 text-rose-700 border-rose-200/60`.

---

## 4. 🤖 Instructions Strictes pour les Futurs Modèles IA

1. **Préservation stricte du Design System** : Ne modifier ni la palette chromatique ni la typographie ni l'architecture des cartes.
2. **Localisation Mauritanie** :
   - TVA standard : **16%**.
   - Devise par défaut : **MRU** (Ouguiya).
   - Identifiant fiscal : **NIF**.
   - Solutions de paiement : **Bankily**, **Seddap**, **Masrvi**, **BPM**.
3. **Multilingue** : Toute nouvelle chaîne de texte doit être couverte dans les dictionnaires `fr.ts`, `ar.ts`, `en.ts` et `zh.ts` dans `src/lib/translations/`.
4. **Validation Systématique** : `npx tsc --noEmit` et `npm run build` doivent toujours réussir avec **0 erreur**.
