import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");

async function optimizeProfilePhoto() {
  const inputPath = path.join(publicDir, "profile-photo.png");
  const outputWebP = path.join(publicDir, "profile-photo.webp");
  const outputPng = path.join(publicDir, "profile-photo-optimized.png");

  const inputSizeKb = (fs.statSync(inputPath).size / 1024).toFixed(1);
  console.log(`\n📸 Input: profile-photo.png (${inputSizeKb} KB)`);

  // Convert to WebP - best quality/size ratio for photos
  await sharp(inputPath)
    .resize(800, 1000, { fit: "cover", position: "top" }) // cap max px - no need for 4K profile
    .webp({ quality: 82 })
    .toFile(outputWebP);

  const webpSizeKb = (fs.statSync(outputWebP).size / 1024).toFixed(1);
  console.log(`✅ Output: profile-photo.webp (${webpSizeKb} KB) — ${Math.round((1 - webpSizeKb / inputSizeKb) * 100)}% smaller`);

  // Also produce a compressed PNG fallback for older browsers
  await sharp(inputPath)
    .resize(800, 1000, { fit: "cover", position: "top" })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPng);

  const pngSizeKb = (fs.statSync(outputPng).size / 1024).toFixed(1);
  console.log(`✅ Fallback: profile-photo-optimized.png (${pngSizeKb} KB)`);

  // Also optimise hero-bg.jpg if it exists
  const bgInput = path.join(publicDir, "hero-bg.jpg");
  if (fs.existsSync(bgInput)) {
    const bgInputKb = (fs.statSync(bgInput).size / 1024).toFixed(1);
    console.log(`\n🖼  Input: hero-bg.jpg (${bgInputKb} KB)`);
    const bgOutput = path.join(publicDir, "hero-bg.webp");
    await sharp(bgInput)
      .resize(1920, 1080, { fit: "cover" })
      .webp({ quality: 70 })
      .toFile(bgOutput);
    const bgOutKb = (fs.statSync(bgOutput).size / 1024).toFixed(1);
    console.log(`✅ Output: hero-bg.webp (${bgOutKb} KB) — ${Math.round((1 - bgOutKb / bgInputKb) * 100)}% smaller`);
  }

  console.log("\n🎉 Done! Update your img src to use .webp files.\n");
}

optimizeProfilePhoto().catch(console.error);
