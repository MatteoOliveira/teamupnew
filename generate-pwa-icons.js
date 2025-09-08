const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputWebp192 = path.join(__dirname, 'public', 'icon-192x192.webp');
const inputWebp512 = path.join(__dirname, 'public', 'icon-512x512.webp');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Convertir 192x192 WebP vers PNG
    if (fs.existsSync(inputWebp192)) {
      const outputPath192 = path.join(outputDir, 'icon-192x192.png');
      await sharp(inputWebp192)
        .png()
        .toFile(outputPath192);
      console.log(`✅ Généré ${outputPath192}`);
    } else {
      console.log('❌ Fichier icon-192x192.webp non trouvé');
    }

    // Convertir 512x512 WebP vers PNG
    if (fs.existsSync(inputWebp512)) {
      const outputPath512 = path.join(outputDir, 'icon-512x512.png');
      await sharp(inputWebp512)
        .png()
        .toFile(outputPath512);
      console.log(`✅ Généré ${outputPath512}`);
    } else {
      console.log('❌ Fichier icon-512x512.webp non trouvé');
    }

    console.log('🎉 Icônes PWA générées avec succès à partir des WebP !');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error);
  }
}

generateIcons();
