import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '@/components/Button';

export default function LegalPage() {
  return (
    <>
      <Head>
        <title>Mentions Légales - TeamUp</title>
        <meta name="description" content="Mentions légales de TeamUp, informations sur l&apos;éditeur et conditions d&apos;utilisation." />
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Mentions Légales
          </h1>
          <p className="text-gray-700 mb-8 text-center">
            Dernière mise à jour : 10 septembre 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Informations sur l&apos;Éditeur
            </h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>Nom de l&apos;application :</strong> TeamUp</p>
              <p><strong>Forme juridique :</strong> Application web</p>
              <p><strong>Adresse :</strong> 8 bis Rue de la Fontaine au Roi, 75011 Paris, France</p>
              <p><strong>Email de contact :</strong> digital.campus@outlook.com</p>
              <p><strong>Directeur de publication :</strong> Équipe TeamUp</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Hébergement
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Cette application est hébergée par :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Vercel Inc.</strong></p>
                <p>340 S Lemon Ave #4133</p>
                <p>Walnut, CA 91789, États-Unis</p>
                <p>Site web : <a href="https://vercel.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. Conditions d&apos;Utilisation
            </h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 Acceptation des Conditions</h3>
                <p>
                  L&apos;utilisation de TeamUp implique l&apos;acceptation pleine et entière des présentes conditions d&apos;utilisation.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Utilisation de l&apos;Application</h3>
                <p>
                  TeamUp est une plateforme permettant aux utilisateurs de créer et participer à des événements sportifs.
                  L&apos;utilisation doit être conforme aux lois en vigueur et respecter les droits des autres utilisateurs.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Responsabilités de l&apos;Utilisateur</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Respecter les autres utilisateurs et les règles de bonne conduite</li>
                  <li>Ne pas utiliser l&apos;application à des fins illégales</li>
                  <li>Maintenir la confidentialité de son compte</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Propriété Intellectuelle
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Tous les éléments de l&apos;application TeamUp (textes, images, logos, design, code source) 
                sont protégés par le droit d&apos;auteur et appartiennent à TeamUp ou à ses partenaires.
              </p>
              <p>
                Toute reproduction, distribution ou utilisation sans autorisation expresse est interdite.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Limitation de Responsabilité
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                TeamUp s&apos;efforce de fournir des informations exactes et à jour, mais ne peut garantir 
                l&apos;exactitude, la complétude ou l&apos;actualité des informations diffusées.
              </p>
              <p>
                L&apos;utilisateur reconnaît utiliser les informations sous sa responsabilité exclusive.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Protection des Données Personnelles
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Le traitement des données personnelles est régi par notre 
                <Link href="/privacy" className="text-blue-600 hover:underline"> Politique de Confidentialité</Link>.
              </p>
              <p>
                Conformément au RGPD, vous disposez de droits sur vos données personnelles 
                (accès, rectification, suppression, portabilité, opposition).
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Cookies et Technologies Similaires
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                L&apos;application utilise des cookies pour améliorer l&apos;expérience utilisateur 
                et analyser l&apos;utilisation du service.
              </p>
              <p>
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Droit Applicable et Juridiction
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Les présentes conditions sont régies par le droit français.
              </p>
              <p>
                En cas de litige, les tribunaux français seront seuls compétents.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Modifications des Conditions
            </h2>
            <div className="text-gray-700">
              <p>
                TeamUp se réserve le droit de modifier les présentes conditions à tout moment. 
                Les modifications entrent en vigueur dès leur publication sur cette page.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact
            </h2>
            <div className="text-gray-700">
              <p className="mb-4">
                Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email :</strong> digital.campus@outlook.com</p>
                <p><strong>Adresse :</strong> 8 bis Rue de la Fontaine au Roi, 75011 Paris, France</p>
              </div>
            </div>
          </section>

          {/* Bouton Retour */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button className="bg-gray-500 hover:bg-gray-600 text-white">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
