# 🏃 Création d'Événements Sportifs

## 📝 Description Simple

La création d'événements permet aux utilisateurs de créer des activités sportives avec toutes les informations nécessaires : nom, sport, lieu, date, nombre de participants, etc. Le système inclut une recherche d'adresse automatique et une carte interactive.

## 🔧 Description Technique

### Architecture de Création d'Événements

Le système utilise **Next.js App Router** avec des composants React pour créer une interface intuitive de création d'événements.

### Fichiers Principaux

```
src/
├── app/event-create/page.tsx     # Page principale de création
├── components/
│   ├── Input.tsx                # Composant d'input réutilisable
│   ├── Button.tsx              # Composant de bouton
│   └── Map.tsx                 # Composant de carte interactive
└── lib/firebase.ts             # Configuration Firestore
```

### Structure des Données

#### Interface Event
```typescript
interface Event {
  id: string;
  name: string;
  sport: string;
  sportEmoji: string;
  sportColor: string;
  city: string;
  location: string;
  address: string;
  postcode: string;
  lat: number;
  lng: number;
  date: string;
  endDate: string;
  description: string;
  maxParticipants: number;
  contactInfo: string;
  createdBy: string;
  createdAt: Date;
  isReserved: boolean;
}
```

### Fonctionnalités Implémentées

#### 1. **Formulaire de Création**
```typescript
// src/app/event-create/page.tsx
const [eventData, setEventData] = useState({
  name: '',
  sport: '',
  city: '',
  location: '',
  address: '',
  postcode: '',
  lat: 0,
  lng: 0,
  date: '',
  endDate: '',
  description: '',
  maxParticipants: 10,
  contactInfo: '',
  isReserved: false
});
```

#### 2. **Sélection de Sport avec Couleurs**
```typescript
const SPORTS = [
  { name: 'Football', emoji: '⚽', color: 'bg-green-500' },
  { name: 'Basketball', emoji: '🏀', color: 'bg-orange-500' },
  { name: 'Tennis', emoji: '🎾', color: 'bg-yellow-500' },
  { name: 'Natation', emoji: '🏊', color: 'bg-blue-500' },
  { name: 'Course', emoji: '🏃', color: 'bg-red-500' }
];
```

#### 3. **Recherche d'Adresse Automatique**
```typescript
const searchAddress = async (query: string) => {
  if (query.length < 3) return;
  
  try {
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    
    if (data.features) {
      setAddressSuggestions(data.features);
      setShowSuggestions(true);
    }
  } catch (error) {
    console.error("Erreur recherche d'adresse:", error);
  }
};
```

#### 4. **Géolocalisation et Carte Interactive**
```typescript
// src/components/Map.tsx
const Map = ({ lat, lng, onLocationSelect }) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const map = L.map('map').setView([lat, lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      
      const marker = L.marker([lat, lng]).addTo(map);
      
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      });
    }
  }, [lat, lng]);

  return <div id="map" className="h-64 w-full" />;
};
```

#### 5. **Sauvegarde dans Firestore**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const eventRef = await addDoc(collection(db, 'events'), {
      ...eventData,
      createdBy: user.uid,
      createdAt: new Date()
    });
    
    // Rediriger vers la page de l'événement
    router.push(`/event/${eventRef.id}`);
  } catch (error) {
    console.error('Erreur création événement:', error);
  }
};
```

### Validation des Données

#### Validation Côté Client
```typescript
const validateEventData = (data: EventData) => {
  const errors: string[] = [];
  
  if (!data.name.trim()) errors.push('Le nom est requis');
  if (!data.sport) errors.push('Le sport est requis');
  if (!data.city.trim()) errors.push('La ville est requise');
  if (!data.date) errors.push('La date est requise');
  if (data.maxParticipants < 2) errors.push('Minimum 2 participants');
  
  return errors;
};
```

#### Validation Côté Serveur (Firestore Rules)
```javascript
// firestore.rules
match /events/{eventId} {
  allow create: if request.auth != null 
    && request.auth.uid == resource.data.createdBy;
  allow read: if true; // Tous peuvent lire les événements
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.createdBy;
}
```

### Interface Utilisateur

#### Composants Réutilisables
```typescript
// src/components/Input.tsx
interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export default function Input({ label, type, value, onChange, required, placeholder }: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
```

#### Gestion des États
```typescript
const [loading, setLoading] = useState(false);
const [errors, setErrors] = useState<string[]>([]);
const [addressSuggestions, setAddressSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
```

### Optimisations Performance

#### Lazy Loading de la Carte
```typescript
// src/components/Map.tsx
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div>Chargement de la carte...</div>
});
```

#### Préchargement des Données
```typescript
// Précharger les sports populaires
const popularSports = useMemo(() => 
  SPORTS.filter(sport => ['Football', 'Basketball', 'Tennis'].includes(sport.name)),
  []
);
```

### Gestion des Erreurs

#### Types d'Erreurs
- Erreurs de validation
- Erreurs de géolocalisation
- Erreurs de sauvegarde Firestore
- Erreurs de recherche d'adresse

#### Traitement des Erreurs
```typescript
const handleError = (error: Error, context: string) => {
  console.error(`Erreur ${context}:`, error);
  
  switch (context) {
    case 'validation':
      setErrors([error.message]);
      break;
    case 'geolocation':
      setMessage('Erreur de géolocalisation');
      break;
    case 'save':
      setMessage('Erreur de sauvegarde');
      break;
  }
};
```

### Tests et Debugging

#### Tests Recommandés
1. Création avec tous les champs remplis
2. Validation des champs obligatoires
3. Recherche d'adresse avec suggestions
4. Sélection sur la carte interactive
5. Sauvegarde et redirection

#### Outils de Debug
- Console Firebase pour voir les données sauvegardées
- Logs de géolocalisation
- Validation des coordonnées GPS

### Améliorations Futures

#### Fonctionnalités à Ajouter
- [ ] Templates d'événements prédéfinis
- [ ] Import depuis calendrier externe
- [ ] Photos d'événements
- [ ] Catégories personnalisées
- [ ] Événements récurrents

#### Optimisations
- [ ] Cache des suggestions d'adresse
- [ ] Compression des images
- [ ] Mode hors ligne
- [ ] Synchronisation automatique
