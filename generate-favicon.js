const sharp = require('sharp');
const path = require('path');

const inputWebp = path.join(__dirname, 'public', 'icon-192x192.webp');
const outputFavicon = path.join(__dirname, 'public', 'favicon.ico');

async function generateFavicon() {
  try {
    // Créer un favicon ICO à partir du WebP
    await sharp(inputWebp)
      .resize(32, 32)
      .png()
      .toFile(outputFavicon);
    
    console.log('✅ Favicon généré:', outputFavicon);
    
    // Créer aussi des favicons PNG pour différents navigateurs
    const sizes = [16, 32, 48, 64, 96, 128, 256];
    
    for (const size of sizes) {
      const outputPath = path.join(__dirname, 'public', `favicon-${size}x${size}.png`);
      await sharp(inputWebp)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Favicon ${size}x${size} généré`);
    }
    
    console.log('🎉 Tous les favicons ont été générés !');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des favicons:', error);
  }
}

generateFavicon();
