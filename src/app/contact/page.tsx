import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '@/components/Button';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact - TeamUp</title>
        <meta name="description" content="Contactez l&apos;équipe TeamUp pour toute question ou assistance." />
      </Head>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Contactez-nous
          </h1>
          <p className="text-gray-700 mb-8 text-center">
            Nous sommes là pour vous aider ! N&apos;hésitez pas à nous contacter pour toute question.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Informations de Contact */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Informations de Contact
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">digital.campus@outlook.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Adresse</h3>
                    <p className="text-gray-600">8 bis Rue de la Fontaine au Roi<br />75011 Paris, France</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Horaires de Réponse</h3>
                    <p className="text-gray-600">Lundi - Vendredi : 9h - 18h<br />Réponse sous 24h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de Contact */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Envoyez-nous un Message
              </h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="bug">Signaler un bug</option>
                    <option value="feature">Demande de fonctionnalité</option>
                    <option value="account">Problème de compte</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez votre question ou problème..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Envoyer le Message
                </Button>
              </form>
            </div>
          </div>

          {/* FAQ Rapide */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Questions Fréquentes
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Comment créer un événement ?</h3>
                <p className="text-gray-600 text-sm">
                  Allez dans votre profil, cliquez sur &quot;Créer un événement&quot; et remplissez les informations.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Comment rejoindre un événement ?</h3>
                <p className="text-gray-600 text-sm">
                  Consultez la page de réservation pour voir les événements disponibles près de chez vous.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Problème de connexion ?</h3>
                <p className="text-gray-600 text-sm">
                  Vérifiez votre email et mot de passe, ou utilisez la réinitialisation de mot de passe.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Supprimer mon compte ?</h3>
                <p className="text-gray-600 text-sm">
                  Allez dans votre profil, section &quot;Réglages&quot; et cliquez sur &quot;Supprimer mon compte&quot;.
                </p>
              </div>
            </div>
          </div>

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
