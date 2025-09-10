import Link from 'next/link';
import Button from '@/components/Button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          
          {/* 1. Informations sur l'Éditeur */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Informations sur l'Éditeur
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Nom :</strong> TeamUp</p>
              <p><strong>Adresse :</strong> 8 bis Rue de la Fontaine au Roi, 75011 Paris</p>
              <p><strong>Email de contact :</strong> digital.campus@outlook.com</p>
            </div>
          </section>

          {/* 2. Données Collectées */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Données Collectées
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Nous collectons les données suivantes lorsque vous utilisez notre application :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Données de profil :</strong> nom, adresse email, sport préféré</li>
                <li><strong>Données de localisation :</strong> position géographique pour la recherche d'événements</li>
                <li><strong>Données d'activité :</strong> participations aux événements, événements créés</li>
                <li><strong>Données de navigation :</strong> cookies analytiques pour améliorer le service</li>
              </ul>
            </div>
          </section>

          {/* 3. Finalités du Traitement */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Finalités du Traitement
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gérer votre compte utilisateur et votre profil</li>
                <li>Vous permettre de créer et participer à des événements sportifs</li>
                <li>Vous proposer des événements à proximité de votre localisation</li>
                <li>Améliorer notre service et analyser l'utilisation de l'application</li>
                <li>Vous contacter concernant votre compte ou les événements</li>
              </ul>
            </div>
          </section>

          {/* 4. Base Légale */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Base Légale du Traitement
            </h2>
            <div className="text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Exécution du contrat :</strong> Gestion de votre compte et des événements</li>
                <li><strong>Intérêt légitime :</strong> Amélioration du service et analyse d'utilisation</li>
                <li><strong>Consentement :</strong> Cookies analytiques et communications marketing</li>
              </ul>
            </div>
          </section>

          {/* 5. Durée de Conservation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Durée de Conservation
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Vos données sont conservées pendant <strong>1 an</strong> après la dernière activité sur votre compte.
              </p>
              <p>
                Les données sont automatiquement supprimées après cette période, sauf obligation légale de conservation.
              </p>
            </div>
          </section>

          {/* 6. Destinataires */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Destinataires des Données
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Vos données ne sont <strong>pas partagées</strong> avec des tiers externes.
              </p>
              <p>
                Elles sont uniquement accessibles à notre équipe pour la gestion du service.
              </p>
            </div>
          </section>

          {/* 7. Droits des Utilisateurs */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Vos Droits
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d'accès :</strong> Consulter vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger vos données</li>
                <li><strong>Droit à l'effacement :</strong> Supprimer votre compte et vos données</li>
                <li><strong>Droit à la portabilité :</strong> Récupérer vos données dans un format lisible</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
              </ul>
              <p className="mt-4">
                Pour exercer ces droits, contactez-nous à : <strong>digital.campus@outlook.com</strong>
              </p>
            </div>
          </section>

          {/* 8. Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Cookies et Technologies Similaires
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Notre application utilise des cookies pour :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Analyser l'utilisation de l'application (Google Analytics)</li>
                <li>Mémoriser vos préférences de connexion</li>
                <li>Améliorer les performances de l'application</li>
              </ul>
              <p className="mt-4">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          {/* 9. Sécurité */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Sécurité des Données
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chiffrement des données sensibles</li>
                <li>Accès sécurisé aux serveurs</li>
                <li>Surveillance des accès</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </div>
          </section>

          {/* 10. Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Pour toute question concernant cette politique de confidentialité ou le traitement de vos données :
              </p>
              <p>
                <strong>Email :</strong> digital.campus@outlook.com<br />
                <strong>Adresse :</strong> 8 bis Rue de la Fontaine au Roi, 75011 Paris
              </p>
            </div>
          </section>

          {/* Bouton Retour */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button className="bg-blue-500 hover:bg-blue-600">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
