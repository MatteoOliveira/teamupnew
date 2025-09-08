const fs = require('fs');
const { createCanvas } = require('canvas');

// Fonction pour créer une icône PNG
function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Arrière-plan bleu avec coins arrondis
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.125);
  ctx.fill();
  
  // Cercle blanc au centre
  const centerX = size / 2;
  const centerY = size / 2;
  const circleSize = size * 0.4;
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(centerX, centerY, circleSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Lettre "T" pour TeamUp
  ctx.fillStyle = '#3b82f6';
  ctx.font = `bold ${circleSize * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('T', centerX, centerY);
  
  return canvas.toBuffer('image/png');
}

// Générer les icônes
try {
  const icon192 = createIcon(192);
  const icon512 = createIcon(512);
  
  fs.writeFileSync('public/icon-192x192.png', icon192);
  fs.writeFileSync('public/icon-512x512.png', icon512);
  
  console.log('✅ Icônes PWA générées avec succès !');
  console.log('- icon-192x192.png');
  console.log('- icon-512x512.png');
} catch (error) {
  console.error('❌ Erreur lors de la génération des icônes:', error.message);
  console.log('💡 Installation de canvas nécessaire: npm install canvas');
}
