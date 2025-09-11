# 🛡️ Conformité RGPD et Sécurité

## 📝 Description Simple

La conformité RGPD garantit que l'application respecte les droits des utilisateurs concernant leurs données personnelles. Cela inclut la transparence sur l'utilisation des données, le consentement des utilisateurs, et la possibilité de supprimer ou exporter leurs données.

## 🔧 Description Technique

### Architecture de Conformité RGPD

L'application implémente une approche complète de conformité RGPD avec :
- **Politique de confidentialité** transparente
- **Banner de cookies** avec consentement
- **Gestion des droits utilisateur** (accès, rectification, portabilité, opposition, effacement)
- **Sécurité des données** avec validation et chiffrement

### Fichiers Principaux

```
src/
├── app/
│   ├── privacy/page.tsx           # Politique de confidentialité
│   ├── legal/page.tsx             # Mentions légales
│   └── contact/page.tsx           # Page de contact
├── components/
│   ├── CookieBanner.tsx           # Banner de consentement cookies
│   ├── DataViewer.tsx             # Droit d'accès aux données
│   ├── DataEditor.tsx             # Droit de rectification
│   ├── DataExporter.tsx           # Droit à la portabilité
│   ├── DataPreferences.tsx        # Droit d'opposition
│   └── GoogleAnalytics.tsx        # Analytics conditionnel
└── hooks/
    └── useCookieConsent.ts        # Gestion du consentement
```

### 1. Politique de Confidentialité

#### Page Politique de Confidentialité
```typescript
// src/app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Collecte des Données</h2>
        <p className="mb-4">
          TeamUp collecte les données suivantes :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Données d'authentification</strong> : Email, nom d'utilisateur</li>
          <li><strong>Données de profil</strong> : Nom, ville, préférences</li>
          <li><strong>Données d'activité</strong> : Événements créés, participations</li>
          <li><strong>Données techniques</strong> : Adresse IP, cookies, tokens de notification</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Finalités du Traitement</h2>
        <p className="mb-4">
          Vos données sont utilisées pour :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Fournir le service de réservation d'événements sportifs</li>
          <li>Gérer votre compte et vos préférences</li>
          <li>Envoyer des notifications d'événements</li>
          <li>Améliorer l'expérience utilisateur</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Base Légale</h2>
        <p className="mb-4">
          Le traitement de vos données repose sur :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Consentement</strong> : Pour les cookies et notifications</li>
          <li><strong>Exécution du contrat</strong> : Pour la fourniture du service</li>
          <li><strong>Intérêt légitime</strong> : Pour l'amélioration du service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Vos Droits</h2>
        <p className="mb-4">
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Droit d'accès</strong> : Consulter vos données</li>
          <li><strong>Droit de rectification</strong> : Corriger vos données</li>
          <li><strong>Droit à la portabilité</strong> : Exporter vos données</li>
          <li><strong>Droit d'opposition</strong> : Refuser certains traitements</li>
          <li><strong>Droit à l'effacement</strong> : Supprimer votre compte</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
        <p className="mb-4">
          Pour exercer vos droits ou pour toute question :
        </p>
        <p className="mb-2">Email : privacy@teamup.app</p>
        <p className="mb-2">Adresse : [Votre adresse]</p>
      </section>
    </div>
  );
}
```

### 2. Banner de Cookies

#### Composant CookieBanner
```typescript
// src/components/CookieBanner.tsx
export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    // Vérifier si le consentement existe déjà
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    } else {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setShowBanner(false);
    
    // Activer Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  };

  const handleAcceptNecessary = () => {
    const newConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    
    setConsent(newConsent);
    localStorage.setItem('cookie-consent', JSON.stringify(newConsent));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              🍪 Utilisation des Cookies
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
              Vous pouvez choisir quels cookies accepter.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Nécessaires</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Analytics</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Marketing</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAcceptNecessary}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Nécessaires uniquement
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Accepter tout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Gestion des Droits Utilisateur

#### Droit d'Accès (DataViewer)
```typescript
// src/components/DataViewer.tsx
export default function DataViewer() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Récupérer les données utilisateur
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Récupérer les événements créés
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy', '==', user.uid)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Récupérer les participations
        const participationsQuery = query(
          collection(db, 'event_participants'),
          where('userId', '==', user.uid)
        );
        const participationsSnapshot = await getDocs(participationsQuery);
        setParticipations(participationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Récupérer les messages
        const messagesQuery = query(
          collection(db, 'messages'),
          where('userId', '==', user.uid)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        setMessages(messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) return <div>Chargement de vos données...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">📊 Vos Données Personnelles</h3>
      
      <div className="grid gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">👤 Profil Utilisateur</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">🏃 Événements Créés ({events.length})</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(events, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">👥 Participations ({participations.length})</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(participations, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">💬 Messages ({messages.length})</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(messages, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
```

#### Droit à la Portabilité (DataExporter)
```typescript
// src/components/DataExporter.tsx
export default function DataExporter() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportUserData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      // Collecter toutes les données utilisateur
      const exportData = {
        user: {
          uid: user.uid,
          email: user.email,
          exportDate: new Date().toISOString()
        },
        profile: null,
        events: [],
        participations: [],
        messages: [],
        notifications: []
      };

      // Récupérer le profil
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        exportData.profile = userDoc.data();
      }

      // Récupérer les événements créés
      const eventsQuery = query(collection(db, 'events'), where('createdBy', '==', user.uid));
      const eventsSnapshot = await getDocs(eventsQuery);
      exportData.events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les participations
      const participationsQuery = query(collection(db, 'event_participants'), where('userId', '==', user.uid));
      const participationsSnapshot = await getDocs(participationsQuery);
      exportData.participations = participationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les messages
      const messagesQuery = query(collection(db, 'messages'), where('userId', '==', user.uid));
      const messagesSnapshot = await getDocs(messagesQuery);
      exportData.messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Récupérer les notifications
      const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
      const notificationsSnapshot = await getDocs(notificationsQuery);
      exportData.notifications = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Créer et télécharger le fichier JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `teamup-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">📤 Export de vos Données</h3>
      <p className="text-gray-600">
        Téléchargez toutes vos données personnelles au format JSON. 
        Ce fichier contient votre profil, événements, participations, messages et notifications.
      </p>
      <Button
        onClick={exportUserData}
        disabled={exporting}
        className="bg-green-600 text-white hover:bg-green-700"
      >
        {exporting ? 'Export en cours...' : '📥 Télécharger mes Données'}
      </Button>
    </div>
  );
}
```

### 4. Sécurité des Données

#### Règles Firestore Sécurisées
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Utilisateurs : accès limité au propriétaire
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Événements : lecture publique, écriture limitée
    match /events/{eventId} {
      allow read: if true; // Tous peuvent lire
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.createdBy;
    }
    
    // Participants : accès limité
    match /event_participants/{participantId} {
      allow read, write: if request.auth != null 
        && (request.auth.uid == resource.data.userId 
            || request.auth.uid == resource.data.eventCreatedBy);
    }
    
    // Messages : accès limité aux participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Notifications : accès limité au destinataire
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Validation des Données
```typescript
// src/lib/validation.ts
export const validateUserData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email invalide');
  }
  
  if (data.name && data.name.length > 100) {
    errors.push('Nom trop long (max 100 caractères)');
  }
  
  if (data.city && data.city.length > 50) {
    errors.push('Ville trop longue (max 50 caractères)');
  }
  
  return errors;
};

export const sanitizeInput = (input: string) => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .substring(0, 1000); // Limiter la longueur
};
```

### 5. Analytics Conditionnel

#### GoogleAnalytics avec Consentement
```typescript
// src/components/GoogleAnalytics.tsx
export default function GoogleAnalytics() {
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) return;

    const consentData = JSON.parse(consent);
    if (!consentData.analytics) return;

    // Initialiser Google Analytics seulement avec consentement
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XP9K67C013';
      
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-XP9K67C013', {
          anonymize_ip: true,
          cookie_flags: 'SameSite=None;Secure'
        });
      };
      
      document.head.appendChild(script);
    }
  }, []);

  return null;
}
```

### 6. Suppression de Compte

#### Suppression Complète des Données
```typescript
// src/app/profile/page.tsx
const handleDeleteAccount = async () => {
  if (!user) return;

  try {
    // Supprimer toutes les données utilisateur
    const batch = writeBatch(db);
    
    // Supprimer le profil
    batch.delete(doc(db, 'users', user.uid));
    
    // Supprimer les participations
    const participationsQuery = query(collection(db, 'event_participants'), where('userId', '==', user.uid));
    const participationsSnapshot = await getDocs(participationsQuery);
    participationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Supprimer les messages
    const messagesQuery = query(collection(db, 'messages'), where('userId', '==', user.uid));
    const messagesSnapshot = await getDocs(messagesQuery);
    messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Supprimer les notifications
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    
    // Supprimer le compte Firebase Auth
    await deleteUser(user);
    
    // Rediriger vers la page d'accueil
    router.push('/');
    
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
  }
};
```

### 7. Tests et Conformité

#### Tests de Conformité RGPD
1. **Banner de cookies** : Affichage et consentement
2. **Politique de confidentialité** : Accessibilité et contenu
3. **Droit d'accès** : Affichage des données utilisateur
4. **Droit de rectification** : Modification des données
5. **Droit à la portabilité** : Export des données
6. **Droit d'opposition** : Désactivation des services
7. **Droit à l'effacement** : Suppression complète du compte

#### Audit de Sécurité
- [ ] Validation des entrées utilisateur
- [ ] Chiffrement des données sensibles
- [ ] Authentification sécurisée
- [ ] Protection contre les injections
- [ ] Gestion des sessions
- [ ] Logs de sécurité

### 8. Améliorations Futures

#### Fonctionnalités RGPD à Ajouter
- [ ] Consentement granulaire par service
- [ ] Historique des consentements
- [ ] Notifications de modification de politique
- [ ] DPO (Délégué à la Protection des Données)
- [ ] Analyse d'impact (DPIA)
- [ ] Chiffrement bout en bout

#### Optimisations Sécurité
- [ ] Authentification à deux facteurs
- [ ] Détection d'intrusion
- [ ] Sauvegarde sécurisée
- [ ] Audit trail complet
- [ ] Chiffrement des communications
