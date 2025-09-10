import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo et nom */}
          <div className="flex items-center space-x-2">
            <Image
              src="/favicon-32x32.webp"
              alt="TeamUp Logo"
              width={32}
              height={32}
              className="rounded-lg"
              priority
            />
            <span className="text-gray-900 font-semibold">TeamUp</span>
          </div>

          {/* Liens légaux */}
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <Link 
              href="/privacy" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Politique de Confidentialité
            </Link>
            <Link 
              href="/legal" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mentions Légales
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} TeamUp. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
