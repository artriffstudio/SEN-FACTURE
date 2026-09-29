const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { jsPDF } = require("jspdf");

const OUT_DIR = path.join(__dirname, "../brand-pack");
const PUBLIC_DIR = path.join(__dirname, "../public/brand-pack");

[OUT_DIR, PUBLIC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log("🚀 Generating FACTURIM Brand Pack (Concept 4B)...");

// 1. Vector SVGs
const svgSymbolPath = `
  <defs>
    <linearGradient id="facturim-grad" x1="20" y1="45" x2="80" y2="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0EA5E9" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <!-- HAUT : Tête de Mauritanie & Barre haute du F -->
  <path d="M 22 22 C 22 20.89 22.89 20 24 20 L 44 20 L 54 11 C 54.8 10.3 56 10.3 56.8 11 L 76 21 C 77.2 21.6 77.8 22.9 77.4 24.2 L 72 40 C 71.6 41.2 70.4 42 69.1 42 L 49 42 L 49 45.5 L 22 61.5 L 22 22 Z" fill="__TOP_COLOR__" />
  <!-- BAS : Découpe oblique, Barre centrale du F & Bassin Sud -->
  <path d="M 22 69.5 L 52 51.5 L 74 51.5 C 75.3 51.5 76.4 52.4 76.8 53.6 L 78 57.5 C 78.4 58.8 77.6 60.1 76.3 60.4 L 47 60.4 L 47 84 C 47 85.1 46.1 86 45 86 L 30 86 C 28.9 86 28 85.1 28 84 L 28 77 C 26.5 77 24.5 75.5 23 74 L 22 69.5 Z" fill="__BOTTOM_COLOR__" />
  <!-- Point Nouakchott -->
  <circle cx="22" cy="51.5" r="2.5" fill="__DOT_COLOR__" />
`;

// A. Facturim Symbol (100x100)
const svgSymbol = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
${svgSymbolPath.replace(/__TOP_COLOR__/g, "#0F172A").replace(/__BOTTOM_COLOR__/g, "url(#facturim-grad)").replace(/__DOT_COLOR__/g, "#0EA5E9")}
</svg>`;

// B. Facturim App Icon Squircle Light
const svgAppIconLight = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="28" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <g transform="translate(10, 10)">
    ${svgSymbolPath.replace(/__TOP_COLOR__/g, "#0F172A").replace(/__BOTTOM_COLOR__/g, "url(#facturim-grad)").replace(/__DOT_COLOR__/g, "#0EA5E9")}
  </g>
</svg>`;

// C. Facturim App Icon Squircle Dark
const svgAppIconDark = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="28" fill="#0F172A"/>
  <rect x="1" y="1" width="118" height="118" rx="27" fill="none" stroke="#334155" stroke-width="1.5"/>
  <g transform="translate(10, 10)">
    ${svgSymbolPath.replace(/__TOP_COLOR__/g, "#FFFFFF").replace(/__BOTTOM_COLOR__/g, "url(#facturim-grad)").replace(/__DOT_COLOR__/g, "#38BDF8")}
  </g>
</svg>`;

// D. Master Horizontal Full Color (360x90)
const svgLogoPrimary = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="270" viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(5, -5)">
    ${svgSymbolPath.replace(/__TOP_COLOR__/g, "#0F172A").replace(/__BOTTOM_COLOR__/g, "url(#facturim-grad)").replace(/__DOT_COLOR__/g, "#0EA5E9")}
  </g>
  <text x="108" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="38" font-weight="900" letter-spacing="-1px" fill="#0F172A">
    FACTU<tspan fill="#0EA5E9">RIM</tspan>
  </text>
  <text x="110" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1.5px" fill="#0284C7">
    FACTURATION &amp; GESTION | MAURITANIE
  </text>
</svg>`;

// E. Master Horizontal Dark Mode
const svgLogoDark = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="270" viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="90" rx="12" fill="#0F172A"/>
  <g transform="translate(10, -5)">
    ${svgSymbolPath.replace(/__TOP_COLOR__/g, "#FFFFFF").replace(/__BOTTOM_COLOR__/g, "url(#facturim-grad)").replace(/__DOT_COLOR__/g, "#38BDF8")}
  </g>
  <text x="113" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="38" font-weight="900" letter-spacing="-1px" fill="#FFFFFF">
    FACTU<tspan fill="#0EA5E9">RIM</tspan>
  </text>
  <text x="115" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1.5px" fill="#94A3B8">
    FACTURATION &amp; GESTION | MAURITANIE
  </text>
</svg>`;

// F. Monochrome Black
const svgLogoBlack = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="270" viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(5, -5)">
    ${svgSymbolPath.replace(/__TOP_COLOR__/g, "#000000").replace(/__BOTTOM_COLOR__/g, "#000000").replace(/__DOT_COLOR__/g, "#000000")}
  </g>
  <text x="108" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="38" font-weight="900" letter-spacing="-1px" fill="#000000">
    FACTURIM
  </text>
  <text x="110" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1.5px" fill="#000000">
    FACTURATION &amp; GESTION | MAURITANIE
  </text>
</svg>`;

// F. Monochrome White
const svgLogoWhite = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="270" viewBox="0 0 360 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="90" rx="12" fill="#000000"/>
  <g transform="translate(10, -5)">
    ${svgSymbolPath.replace(/__TOP_COLOR__/g, "#FFFFFF").replace(/__BOTTOM_COLOR__/g, "#FFFFFF").replace(/__DOT_COLOR__/g, "#FFFFFF")}
  </g>
  <text x="113" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="38" font-weight="900" letter-spacing="-1px" fill="#FFFFFF">
    FACTURIM
  </text>
  <text x="115" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1.5px" fill="#FFFFFF">
    FACTURATION &amp; GESTION | MAURITANIE
  </text>
</svg>`;

const filesToSave = [
  { name: "facturim-symbol.svg", content: svgSymbol },
  { name: "facturim-app-icon-squircle.svg", content: svgAppIconLight },
  { name: "facturim-app-icon-dark.svg", content: svgAppIconDark },
  { name: "facturim-logo-primary.svg", content: svgLogoPrimary },
  { name: "facturim-logo-dark.svg", content: svgLogoDark },
  { name: "facturim-logo-monochrome-black.svg", content: svgLogoBlack },
  { name: "facturim-logo-monochrome-white.svg", content: svgLogoWhite },
];

filesToSave.forEach((f) => {
  fs.writeFileSync(path.join(OUT_DIR, f.name), f.content, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, f.name), f.content, "utf8");
});

console.log("✅ All SVG files created!");

// 2. Convert to high-res PNG and JPEG using macOS QuickLook & sips
try {
  console.log("🖼️ Converting SVGs to High-Res PNGs and JPEGs...");
  const tempDir = path.join(__dirname, "../.tmp_renders");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  filesToSave.forEach((f) => {
    const svgPath = path.join(OUT_DIR, f.name);
    const baseName = f.name.replace(".svg", "");
    
    // QuickLook thumbnail generator (1024px)
    try {
      execSync(`qlmanage -t -s 1024 -o "${tempDir}" "${svgPath}" 2>/dev/null`);
      const generatedPng = path.join(tempDir, `${f.name}.png`);
      
      if (fs.existsSync(generatedPng)) {
        const destPng = path.join(OUT_DIR, `${baseName}.png`);
        const destJpg = path.join(OUT_DIR, `${baseName}.jpg`);
        const publicPng = path.join(PUBLIC_DIR, `${baseName}.png`);
        const publicJpg = path.join(PUBLIC_DIR, `${baseName}.jpg`);

        fs.copyFileSync(generatedPng, destPng);
        fs.copyFileSync(generatedPng, publicPng);

        // Convert PNG to JPG with sips
        execSync(`sips -s format jpeg "${destPng}" --out "${destJpg}" 2>/dev/null`);
        fs.copyFileSync(destJpg, publicJpg);
      }
    } catch (e) {
      console.warn(`Could not render raster for ${f.name}:`, e.message);
    }
  });

  // Clean temp
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {}

  console.log("✅ High-Res PNGs & JPEGs generated!");
} catch (err) {
  console.warn("Rasterization warning:", err.message);
}

// 3. Generate Official PDF Brand Guidelines Guide
console.log("📄 Generating FACTURIM Brand Guidelines PDF...");
try {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page 1 : Cover & Brand Identity
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, 210, 297, "F");

  // Cyan Top Banner Line
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, 210, 6, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("FACTURIM", 20, 50);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(14, 165, 233);
  doc.text("BRAND GUIDELINES & IDENTITE VISUELLE 2026", 20, 60);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.text("Solution de Facturation Électronique & Conformité DGI | Mauritanie", 20, 68);

  // Concept description box
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(20, 85, 170, 45, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CONCEPT OFFICIEL : CARTE DE MAURITANIE & « F » FINTECH", 28, 98);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "Le symbole FACTURIM fusionne l'empreinte territoriale de la Republique Islamique de Mauritanie\navec la structure d'un « F » majuscule moderne. La decoupe oblique symbolise le flux financier,\nl'encaissement instantane (Bankily, Masrvi, Sedad) et la vitesse technologique.",
    28,
    108
  );

  // Color Palette Grid
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PALETTE CHROMATIQUE OFFICIELLE", 20, 150);

  // Swatch 1 : Obsidian Navy
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(20, 158, 38, 25, 3, 3, "FD");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Obsidian Navy", 23, 190);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("#0F172A", 23, 196);

  // Swatch 2 : Sky Cyan
  doc.setFillColor(14, 165, 233);
  doc.roundedRect(64, 158, 38, 25, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Sky Cyan", 67, 190);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("#0EA5E9", 67, 196);

  // Swatch 3 : Mauritania Emerald
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(108, 158, 38, 25, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Emerald Green", 111, 190);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("#10B981", 111, 196);

  // Swatch 4 : Studio White
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(152, 158, 38, 25, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Pure White", 155, 190);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("#FFFFFF", 155, 196);

  // Typography Section
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TYPOGRAPHIE & LANGUES", 20, 218);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(20, 226, 170, 38, 4, 4, "F");

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("• Police Principale (FR / EN / ZH) : Geist Sans & Inter (Modern Clean Neo-Grotesque)", 28, 236);
  doc.text("• Police Arabe (العربية - RTL) : Rubik Arabic (Geometrique, lisible et harmonieuse)", 28, 244);
  doc.text("• Devises & Chiffres : Tabular Numbers, Formatage Ouguiya (MRU) conforme DGI", 28, 252);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("FACTURIM SARL • Nouakchott, Mauritanie • www.facturim.net • Document Confidentiel & Proprietaire", 20, 285);

  const pdfPath = path.join(OUT_DIR, "FACTURIM-BRAND-GUIDELINES-2026.pdf");
  const publicPdfPath = path.join(PUBLIC_DIR, "FACTURIM-BRAND-GUIDELINES-2026.pdf");

  fs.writeFileSync(pdfPath, Buffer.from(doc.output("arraybuffer")));
  fs.writeFileSync(publicPdfPath, Buffer.from(doc.output("arraybuffer")));

  console.log("✅ PDF Brand Guidelines generated!");
} catch (e) {
  console.warn("PDF generation warning:", e.message);
}

// 4. Create ZIP Archive
try {
  console.log("📦 Creating facturim-brand-pack.zip archive...");
  const zipPath = path.join(PUBLIC_DIR, "facturim-brand-pack.zip");
  const localZipPath = path.join(OUT_DIR, "facturim-brand-pack.zip");

  execSync(`cd "${OUT_DIR}" && zip -r "${zipPath}" . -x "*.DS_Store" "*.zip"`);
  fs.copyFileSync(zipPath, localZipPath);
  console.log("✅ ZIP Archive created successfully!");
} catch (e) {
  console.warn("ZIP creation warning:", e.message);
}

// 5. Write README.md in brand-pack folder
const readmeContent = `# 📦 FACTURIM — Official Brand Pack & Assets (2026)

Bienvenue dans le **Pack de Marque Officiel de FACTURIM** (Concept 4B — Carte de Mauritanie & Monogramme FinTech « F »).

---

## 📁 Contenu du dossier :

### 1. 📐 Fichiers Vectoriels SVG (Scalabilité infinie)
- \`facturim-logo-primary.svg\` : Logo principal horizontal (couleur originale sur fond transparent)
- \`facturim-logo-dark.svg\` : Logo horizontal optimisé pour fonds sombres (Dark Mode)
- \`facturim-logo-monochrome-black.svg\` : Version 100% Noir (tampons, impression N&B)
- \`facturim-logo-monochrome-white.svg\` : Version 100% Blanc (sur fond noir)
- \`facturim-symbol.svg\` : Symbole seul 4B (vectoriel pur)
- \`facturim-app-icon-squircle.svg\` : Icône d'application style Apple iOS (fond clair)
- \`facturim-app-icon-dark.svg\` : Icône d'application style Apple iOS (fond sombre)

### 2. 🖼️ Fichiers Images Haute Résolution (PNG & JPEG)
- \`facturim-logo-primary.png\` (HD avec transparence)
- \`facturim-logo-dark.png\` (HD fond sombre)
- \`facturim-symbol.png\` (Symbole 1024×1024)
- \`facturim-app-icon-squircle.png\` (App Icon HD)
- \`facturim-logo-primary.jpg\` & \`facturim-logo-dark.jpg\`

### 3. 📄 Document PDF Officiel
- \`FACTURIM-BRAND-GUIDELINES-2026.pdf\` : Guide de marque et charte d'utilisation officielle.

### 4. 🗜️ Archive ZIP Téléchargeable
- \`facturim-brand-pack.zip\` : L'ensemble des fichiers packagés en un seul clic.

---

## 🎨 Codes Couleurs Officiels :
- **Obsidian Navy** : \`#0F172A\`
- **Sky Cyan Luminescent** : \`#0EA5E9\`
- **Mauritania Emerald** : \`#10B981\`
- **Studio White** : \`#FFFFFF\`

---
© 2026 FACTURIM SARL • Nouakchott, Mauritanie • www.facturim.net
`;

fs.writeFileSync(path.join(OUT_DIR, "README.md"), readmeContent, "utf8");
fs.writeFileSync(path.join(PUBLIC_DIR, "README.md"), readmeContent, "utf8");

console.log("🎉 FACTURIM Brand Pack generation complete!");
