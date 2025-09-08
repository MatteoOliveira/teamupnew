const { execSync } = require('child_process');

console.log('🚀 TeamUp - Script de Test des Événements');
console.log('==========================================\n');

console.log('Choisissez une option :');
console.log('1) Créer des événements de test');
console.log('2) Nettoyer les événements de test');
console.log('3) Test complet (créer + instructions)');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Votre choix (1-3): ', (choice) => {
  switch(choice) {
    case '1':
      console.log('\n📝 Création des événements de test...\n');
      try {
        execSync('node create-test-events.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Erreur lors de la création:', error.message);
      }
      break;
      
    case '2':
      console.log('\n🧹 Nettoyage des événements de test...\n');
      try {
        execSync('node cleanup-test-events.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error.message);
      }
      break;
      
    case '3':
      console.log('\n🧪 Test complet...\n');
      try {
        execSync('node create-test-events.js', { stdio: 'inherit' });
        console.log('\n📋 Instructions de test:');
        console.log('1. Allez sur votre application TeamUp');
        console.log('2. Créez un nouvel événement');
        console.log('3. Testez les conflits avec les événements créés');
        console.log('4. Exécutez "node cleanup-test-events.js" pour nettoyer');
      } catch (error) {
        console.error('❌ Erreur:', error.message);
      }
      break;
      
    default:
      console.log('❌ Choix invalide');
  }
  
  rl.close();
});
