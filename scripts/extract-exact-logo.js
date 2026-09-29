const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execSync } = require("child_process");

const SRC_IMG = "/Users/macmini/.gemini/antigravity-ide/brain/2f291178-7cf1-4e37-96c9-4c21958d07e7/facturim_mauritania_f_clear_2_1790654303405.jpg";
const OUT_DIR = path.join(__dirname, "../brand-pack");
const PUBLIC_DIR = path.join(__dirname, "../public/brand-pack");
const PUBLIC_LOGO_DIR = path.join(__dirname, "../public/images/logo");

[OUT_DIR, PUBLIC_DIR, PUBLIC_LOGO_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function main() {
  console.log("🔍 Extracting exact logo from high-res source image...");
  
  // 1. Get raw pixel data from top half (1024 x 480)
  const image = sharp(SRC_IMG);
  const metadata = await image.metadata();
  console.log("Source dimensions:", metadata.width, "x", metadata.height);

  // Let's crop the top section containing the full horizontal logo
  // Bounding box for symbol + text in 1024x1024:
  // Top: ~110, Left: ~85, Width: ~850, Height: ~280
  const croppedFullLogo = await sharp(SRC_IMG)
    .extract({ left: 80, top: 110, width: 855, height: 285 })
    .toBuffer();

  // Bounding box for symbol only:
  // Top: ~110, Left: ~85, Width: ~255, Height: ~280
  const croppedSymbolOnly = await sharp(SRC_IMG)
    .extract({ left: 80, top: 110, width: 255, height: 285 })
    .toBuffer();

  // Function to make light background transparent (< threshold from white/slate)
  async function makeTransparent(buffer, width, height) {
    const raw = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    const { data, info } = raw;
    const channels = info.channels; // 3 or 4
    const newBuffer = Buffer.alloc(info.width * info.height * 4);

    for (let i = 0; i < info.width * info.height; i++) {
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];

      // Calculate distance from background color (~#f4f6f9 / off-white)
      // If pixel is very close to off-white (R>230, G>232, B>235)
      const isBg = r > 230 && g > 232 && b > 235;

      if (isBg) {
        newBuffer[i * 4] = 255;
        newBuffer[i * 4 + 1] = 255;
        newBuffer[i * 4 + 2] = 255;
        newBuffer[i * 4 + 3] = 0; // 100% transparent
      } else {
        newBuffer[i * 4] = r;
        newBuffer[i * 4 + 1] = g;
        newBuffer[i * 4 + 2] = b;
        newBuffer[i * 4 + 3] = 255; // opaque
      }
    }

    return sharp(newBuffer, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    }).trim();
  }

  console.log("🎨 Processing transparent PNGs...");
  const transparentFull = await makeTransparent(croppedFullLogo);
  const transparentFullBuffer = await transparentFull.png().toBuffer();
  
  const transparentSymbol = await makeTransparent(croppedSymbolOnly);
  const transparentSymbolBuffer = await transparentSymbol.png().toBuffer();

  // Save base transparent PNGs
  const fullPngPath = path.join(OUT_DIR, "facturim-logo-couleur.png");
  fs.writeFileSync(fullPngPath, transparentFullBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, "facturim-logo-couleur.png"), transparentFullBuffer);
  fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, "facturim-logo-couleur.png"), transparentFullBuffer);

  const symbolPngPath = path.join(OUT_DIR, "facturim-symbole-couleur.png");
  fs.writeFileSync(symbolPngPath, transparentSymbolBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, "facturim-symbole-couleur.png"), transparentSymbolBuffer);
  fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, "facturim-symbole-couleur.png"), transparentSymbolBuffer);

  // 2. White Background JPEG & PNG
  console.log("📄 Generating White Background variants...");
  await sharp(transparentFullBuffer)
    .flatten({ background: "#ffffff" })
    .extend({ top: 30, bottom: 30, left: 40, right: 40, background: "#ffffff" })
    .jpeg({ quality: 95 })
    .toFile(path.join(OUT_DIR, "facturim-logo-fond-blanc.jpg"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-logo-fond-blanc.jpg"), path.join(PUBLIC_DIR, "facturim-logo-fond-blanc.jpg"));

  // 3. Fond Bleu Navy (#0F172A)
  console.log("🔵 Generating Fond Bleu (#0F172A) variants...");
  // On fond bleu, let's create a version with white text
  const rawFull = await sharp(transparentFullBuffer).raw().toBuffer({ resolveWithObject: true });
  const blueBgBuffer = Buffer.alloc(rawFull.info.width * rawFull.info.height * 4);
  
  for (let i = 0; i < rawFull.info.width * rawFull.info.height; i++) {
    const r = rawFull.data[i * 4];
    const g = rawFull.data[i * 4 + 1];
    const b = rawFull.data[i * 4 + 2];
    const a = rawFull.data[i * 4 + 3];

    if (a > 20) {
      // If it is the dark navy part (r<40, g<40, b<60), turn to White on blue background
      if (r < 50 && g < 50 && b < 70) {
        blueBgBuffer[i * 4] = 255;
        blueBgBuffer[i * 4 + 1] = 255;
        blueBgBuffer[i * 4 + 2] = 255;
        blueBgBuffer[i * 4 + 3] = a;
      } else {
        // Keep the vibrant cyan/emerald gradient as is
        blueBgBuffer[i * 4] = r;
        blueBgBuffer[i * 4 + 1] = g;
        blueBgBuffer[i * 4 + 2] = b;
        blueBgBuffer[i * 4 + 3] = a;
      }
    } else {
      blueBgBuffer[i * 4] = 0;
      blueBgBuffer[i * 4 + 1] = 0;
      blueBgBuffer[i * 4 + 2] = 0;
      blueBgBuffer[i * 4 + 3] = 0;
    }
  }

  const whiteTextLogo = await sharp(blueBgBuffer, {
    raw: { width: rawFull.info.width, height: rawFull.info.height, channels: 4 }
  }).png().toBuffer();

  // Save transparent PNG with white text (for dark mode)
  fs.writeFileSync(path.join(OUT_DIR, "facturim-logo-dark-mode-transparent.png"), whiteTextLogo);
  fs.writeFileSync(path.join(PUBLIC_DIR, "facturim-logo-dark-mode-transparent.png"), whiteTextLogo);
  fs.writeFileSync(path.join(PUBLIC_LOGO_DIR, "facturim-logo-dark-mode-transparent.png"), whiteTextLogo);

  // Flatten on #0F172A Blue Background
  await sharp(whiteTextLogo)
    .flatten({ background: "#0F172A" })
    .extend({ top: 40, bottom: 40, left: 50, right: 50, background: "#0F172A" })
    .png()
    .toFile(path.join(OUT_DIR, "facturim-logo-fond-bleu.png"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-logo-fond-bleu.png"), path.join(PUBLIC_DIR, "facturim-logo-fond-bleu.png"));

  await sharp(path.join(OUT_DIR, "facturim-logo-fond-bleu.png"))
    .jpeg({ quality: 95 })
    .toFile(path.join(OUT_DIR, "facturim-logo-fond-bleu.jpg"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-logo-fond-bleu.jpg"), path.join(PUBLIC_DIR, "facturim-logo-fond-bleu.jpg"));

  // 4. Fond Vert Émeraude (#10B981 / #00B37E)
  console.log("🟢 Generating Fond Vert (#10B981) variants...");
  // Sur fond vert, let's create a pure white monochrome logo on emerald green background
  const greenBgLogo = await sharp(transparentFullBuffer)
    .threshold(128)
    .negate({ alpha: false })
    .png()
    .toBuffer();

  await sharp(whiteTextLogo)
    .flatten({ background: "#047857" }) // Vert Émeraude profond pour contraste
    .extend({ top: 40, bottom: 40, left: 50, right: 50, background: "#047857" })
    .png()
    .toFile(path.join(OUT_DIR, "facturim-logo-fond-vert.png"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-logo-fond-vert.png"), path.join(PUBLIC_DIR, "facturim-logo-fond-vert.png"));

  await sharp(path.join(OUT_DIR, "facturim-logo-fond-vert.png"))
    .jpeg({ quality: 95 })
    .toFile(path.join(OUT_DIR, "facturim-logo-fond-vert.jpg"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-logo-fond-vert.jpg"), path.join(PUBLIC_DIR, "facturim-logo-fond-vert.jpg"));

  // 5. Noir et Blanc (Monochrome Black & White)
  console.log("⬛ Generating Monochrome Black & White variants...");
  const monoBlackBuffer = Buffer.alloc(rawFull.info.width * rawFull.info.height * 4);
  for (let i = 0; i < rawFull.info.width * rawFull.info.height; i++) {
    const a = rawFull.data[i * 4 + 3];
    if (a > 20) {
      monoBlackBuffer[i * 4] = 15;
      monoBlackBuffer[i * 4 + 1] = 23;
      monoBlackBuffer[i * 4 + 2] = 42;
      monoBlackBuffer[i * 4 + 3] = 255;
    } else {
      monoBlackBuffer[i * 4] = 0;
      monoBlackBuffer[i * 4 + 1] = 0;
      monoBlackBuffer[i * 4 + 2] = 0;
      monoBlackBuffer[i * 4 + 3] = 0;
    }
  }

  const monoBlackPng = await sharp(monoBlackBuffer, {
    raw: { width: rawFull.info.width, height: rawFull.info.height, channels: 4 }
  }).png().toBuffer();

  fs.writeFileSync(path.join(OUT_DIR, "facturim-logo-noir-blanc-transparent.png"), monoBlackPng);
  fs.writeFileSync(path.join(PUBLIC_DIR, "facturim-logo-noir-blanc-transparent.png"), monoBlackPng);

  await sharp(monoBlackPng)
    .flatten({ background: "#ffffff" })
    .extend({ top: 40, bottom: 40, left: 50, right: 50, background: "#ffffff" })
    .jpeg({ quality: 95 })
    .toFile(path.join(OUT_DIR, "facturim-logo-noir-blanc.jpg"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-logo-noir-blanc.jpg"), path.join(PUBLIC_DIR, "facturim-logo-noir-blanc.jpg"));

  // 6. Favicon & App Icon
  console.log("📱 Generating App Icons and Favicons...");
  await sharp(transparentSymbolBuffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(OUT_DIR, "facturim-app-icon-512.png"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-app-icon-512.png"), path.join(PUBLIC_DIR, "facturim-app-icon-512.png"));
  fs.copyFileSync(path.join(OUT_DIR, "facturim-app-icon-512.png"), path.join(PUBLIC_LOGO_DIR, "facturim-app-icon-512.png"));

  await sharp(transparentSymbolBuffer)
    .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, "../public/favicon.png"));

  // 7. Update ZIP Archive
  console.log("📦 Creating facturim-brand-pack.zip with all variants...");
  const zipPath = path.join(PUBLIC_DIR, "facturim-brand-pack.zip");
  const localZipPath = path.join(OUT_DIR, "facturim-brand-pack.zip");
  execSync(`cd "${OUT_DIR}" && zip -r "${zipPath}" . -x "*.DS_Store" "*.zip"`);
  fs.copyFileSync(zipPath, localZipPath);

  console.log("🎉 All exact logo files generated successfully!");
}

main().catch((err) => {
  console.error("Error generating exact logos:", err);
});
