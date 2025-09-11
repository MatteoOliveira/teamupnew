# ♿ Guide de Test d'Accessibilité

## 📝 Vue d'ensemble

Ce guide vous aide à tester et valider l'accessibilité de l'application TeamUp. Il couvre les tests manuels, automatisés et les outils de validation.

## 🎯 Points de Contrôle Principaux

### 1. Labels ARIA et Balises Accessibles

#### ✅ Tests à Effectuer

**Navigation principale (NavBar)**
- [ ] Vérifier que `aria-label="Navigation principale"` est présent
- [ ] Chaque lien a un `aria-label` descriptif
- [ ] Les icônes ont des labels appropriés
- [ ] Les indicateurs de statut (nouveaux messages) ont `aria-label`

**Composants de formulaire**
- [ ] Tous les inputs ont des `aria-label` ou `aria-describedby`
- [ ] Les champs obligatoires ont `aria-required="true"`
- [ ] Les erreurs de validation sont liées avec `aria-describedby`

**Cartes d'événements**
- [ ] Chaque carte a `role="article"`
- [ ] Les titres ont des IDs uniques (`event-title-{id}`)
- [ ] Les descriptions ont des IDs uniques (`event-description-{id}`)
- [ ] Les boutons d'action ont des `aria-label` descriptifs

#### 🔧 Comment Tester

1. **Avec un lecteur d'écran** (NVDA, JAWS, VoiceOver)
2. **Inspecteur d'éléments** du navigateur
3. **Extensions d'accessibilité** (axe DevTools, WAVE)

### 2. Navigation au Clavier

#### ✅ Tests à Effectuer

**Navigation générale**
- [ ] Tab : Navigation vers l'avant
- [ ] Shift+Tab : Navigation vers l'arrière
- [ ] Entrée/Espace : Activation des éléments
- [ ] Échap : Fermeture des modales/menus

**Navigation dans les cartes d'événements**
- [ ] Tab : Focus sur la carte
- [ ] Entrée/Espace : Ouverture des détails
- [ ] Tab : Navigation entre les boutons d'action
- [ ] Entrée : Activation des boutons

**Navigation dans les formulaires**
- [ ] Tab : Navigation entre les champs
- [ ] Entrée : Soumission du formulaire
- [ ] Échap : Annulation/fermeture

#### 🔧 Comment Tester

1. **Désactiver la souris** temporairement
2. **Utiliser uniquement le clavier** pour naviguer
3. **Vérifier l'ordre de tabulation** logique
4. **Tester tous les éléments interactifs**

### 3. Contraste des Couleurs

#### ✅ Tests à Effectuer

**Textes principaux**
- [ ] Contraste minimum 4.5:1 pour le texte normal
- [ ] Contraste minimum 3:1 pour le texte large (18px+)
- [ ] Contraste suffisant en mode sombre
- [ ] Contraste suffisant pour les liens

**Éléments interactifs**
- [ ] Boutons : contraste suffisant texte/fond
- [ ] États de focus : contraste suffisant
- [ ] États hover : contraste suffisant
- [ ] États disabled : contraste suffisant

#### 🔧 Comment Tester

1. **Outil de contraste** (WebAIM Contrast Checker)
2. **Extensions navigateur** (axe DevTools)
3. **Test visuel** avec différents utilisateurs
4. **Simulateur de daltonisme** (Chrome DevTools)

## 🛠️ Outils de Test

### 1. Tests Automatisés

#### Extension Chrome : axe DevTools
```bash
# Installation
npm install --save-dev @axe-core/react

# Utilisation dans les tests
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Lighthouse Accessibility Audit
```bash
# Test en ligne
https://developers.google.com/web/tools/lighthouse

# Test local
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

### 2. Tests Manuels

#### Checklist de Test
```markdown
## Test Manuel d'Accessibilité

### Navigation au Clavier
- [ ] Tab fonctionne sur tous les éléments
- [ ] Shift+Tab fonctionne
- [ ] Entrée active les boutons/liens
- [ ] Échap ferme les modales
- [ ] Flèches naviguent dans les listes

### Lecteur d'écran
- [ ] Tous les éléments sont annoncés
- [ ] L'ordre de lecture est logique
- [ ] Les états sont annoncés (expanded, pressed)
- [ ] Les erreurs sont annoncées

### Contraste
- [ ] Texte normal : contraste ≥ 4.5:1
- [ ] Texte large : contraste ≥ 3:1
- [ ] Mode sombre : contraste suffisant
- [ ] États de focus : contraste suffisant
```

### 3. Tests avec des Utilisateurs

#### Test avec Lecteur d'écran
```markdown
## Test avec NVDA (Windows)

1. Installer NVDA
2. Démarrer l'application
3. Naviguer avec Tab et les flèches
4. Vérifier que tous les éléments sont annoncés
5. Tester les formulaires et interactions

## Test avec VoiceOver (Mac)

1. Activer VoiceOver (Cmd+F5)
2. Naviguer avec Tab et les flèches
3. Vérifier l'annonce des éléments
4. Tester les gestes tactiles
```

## 📊 Métriques d'Accessibilité

### 1. Score Lighthouse
- **Objectif** : 90+ en accessibilité
- **Test** : `npx lighthouse --only-categories=accessibility`

### 2. Violations axe-core
- **Objectif** : 0 violation critique
- **Test** : Extension axe DevTools

### 3. Tests WCAG 2.1
- **Niveau AA** : Conformité minimale
- **Niveau AAA** : Conformité maximale

## 🔧 Configuration des Tests

### 1. Jest + axe-core
```javascript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testEnvironment: 'jsdom',
};

// src/setupTests.js
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

### 2. Tests d'Accessibilité
```javascript
// src/components/__tests__/Button.test.js
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '../Button';

expect.extend(toHaveNoViolations);

test('Button should be accessible', async () => {
  const { container } = render(
    <Button aria-label="Test button">Click me</Button>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  
  expect(screen.getByRole('button', { name: 'Test button' })).toBeInTheDocument();
});
```

## 🚨 Problèmes Courants et Solutions

### 1. Labels ARIA Manquants
```jsx
// ❌ Problème
<button onClick={handleClick}>
  <Icon />
</button>

// ✅ Solution
<button onClick={handleClick} aria-label="Fermer la modal">
  <Icon />
</button>
```

### 2. Navigation Clavier Cassée
```jsx
// ❌ Problème
<div onClick={handleClick}>Click me</div>

// ✅ Solution
<button onClick={handleClick} tabIndex={0}>
  Click me
</button>
```

### 3. Contraste Insuffisant
```css
/* ❌ Problème */
.text-gray-400 { color: #9ca3af; }

/* ✅ Solution */
.text-gray-600 { color: #4b5563; }
```

## 📈 Améliorations Continues

### 1. Intégration CI/CD
```yaml
# .github/workflows/accessibility.yml
name: Accessibility Tests
on: [push, pull_request]
jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run accessibility tests
        run: npm run test:accessibility
```

### 2. Monitoring en Production
```javascript
// src/utils/accessibilityMonitoring.js
export const trackAccessibilityIssues = (issue) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'accessibility_issue', {
      issue_type: issue.type,
      element: issue.element,
      severity: issue.severity
    });
  }
};
```

### 3. Formation de l'Équipe
- **Sensibilisation** aux enjeux d'accessibilité
- **Formation** aux outils de test
- **Bonnes pratiques** de développement
- **Tests utilisateurs** réguliers

## 🎯 Objectifs de Conformité

### WCAG 2.1 Niveau AA
- [ ] **Perceptible** : Contraste, alternatives textuelles
- [ ] **Utilisable** : Navigation clavier, pas de saisie temporelle
- [ ] **Compréhensible** : Langue, prévisibilité
- [ ] **Robuste** : Compatible avec les technologies d'assistance

### Standards Techniques
- [ ] **HTML sémantique** : Balises appropriées
- [ ] **ARIA** : Labels et rôles corrects
- [ ] **CSS** : Contraste et focus visibles
- [ ] **JavaScript** : Gestion des événements clavier

## 📚 Ressources Utiles

### Outils de Test
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Documentation
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

### Tests Utilisateurs
- [NVDA](https://www.nvaccess.org/) (Windows)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) (Windows)
- [VoiceOver](https://www.apple.com/accessibility/vision/) (Mac/iOS)
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) (Android)

## ✅ Checklist de Validation

### Avant Mise en Production
- [ ] Tests automatisés passent
- [ ] Tests manuels effectués
- [ ] Score Lighthouse ≥ 90
- [ ] 0 violation axe-core critique
- [ ] Test avec lecteur d'écran
- [ ] Test navigation clavier complète
- [ ] Contraste validé sur tous les écrans
- [ ] Documentation mise à jour

### Maintenance Continue
- [ ] Tests d'accessibilité dans CI/CD
- [ ] Monitoring des métriques
- [ ] Formation de l'équipe
- [ ] Tests utilisateurs réguliers
- [ ] Mise à jour des outils
- [ ] Veille sur les nouvelles normes
