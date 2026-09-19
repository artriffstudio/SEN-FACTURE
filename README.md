# FACTURIM 🇲🇷

> Plateforme SaaS de facturation électronique certifiée, gestion commerciale et passerelle Mobile Money (Bankily & Masrvi via Moosyl) pour les entreprises et indépendants en République Islamique de Mauritanie.

## 🚀 Accès en Ligne (Production)
- **Domaine officiel** : [https://facturim.net](https://facturim.net) (et [https://www.facturim.net](https://www.facturim.net))
- **Miroir Vercel** : [https://facturim.vercel.app](https://facturim.vercel.app)
- **Dépôt GitHub** : [https://github.com/artriffstudio/FACTURIM](https://github.com/artriffstudio/FACTURIM)

---

## 💎 Fonctionnalités Principales
- **Support Multilingue Intégral (4 langues)** : Arabe (العربية avec support RTL natif 🇲🇷), Français (FR 🇫🇷), Anglais (EN 🇬🇧) et Chinois (中文 🇨🇳).
- **Conformité Fiscale DGI Mauritanie** : Calcul automatique de la TVA légale standard à 16%, NIF officiel, Registre du Commerce (RC) et mentions certifiées.
- **Passerelle de Paiements Locaux Moosyl (moosyl.com)** : Encaissement et réconciliation automatique par Bankily (BPM), Masrvi (BMCI), Seddap et virements bancaires.
- **Tableau de bord interactif** : Suivi du chiffre d'affaires en Ouguiya (MRU), créances en attente, encours en retard et clients partenaires.
- **Atelier de Facturation en direct** : Création instantanée de factures avec aperçu synchrone sur feuille virtuelle A4 officielle (794px x 1123px).
- **Moteur d'exportation PDF Haute Définition** : Rendu vectoriel haute résolution fidèle à l'aperçu A4 avec QR Code de paiement.
- **Répertoire Clients** : Fiches détaillées, téléversement de logo d'entreprise et contact direct via WhatsApp.
- **Catalogue & Tarifs en MRU** : Forfaits de prestations, tarification unitaire et facturation en un clic.
- **Rapports & Grand Livre Comptable** : Suivi des écritures comptables, déclarations TVA DGI et export CSV.
- **Authentification & Données Sécurisées** : Sécurisation complète des données via Supabase Auth & PostgreSQL Row Level Security.

---

## 🛠️ Stack Technique
- **Framework** : Next.js 16+ (App Router, Turbopack)
- **Langage** : TypeScript 5 (Strict Mode)
- **Base de données & Auth** : Supabase (PostgreSQL 15+, RLS)
- **Paiements Mobile Money** : Moosyl Gateway (Bankily / Masrvi)
- **Styling** : Clean Light SaaS Design System (Accents Sky/Cyan)
- **Exports PDF** : html2canvas + jsPDF (Échelle Retina 2x)
- **Hébergement** : Vercel


