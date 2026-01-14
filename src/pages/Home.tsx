import { Link } from 'react-router-dom';
import { Car, Clock, Shield, Phone } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Taxi Patrice</h1>
            </div>
            <Link
              to="/auth"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Connexion
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Votre Transport de Confiance
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Service de taxi professionnel disponible 24h/24 et 7j/7.
            Réservez votre course en quelques clics et profitez d'un trajet confortable et sécurisé.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg"
          >
            Réserver un Taxi
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Disponible 24/7</h3>
            <p className="text-slate-300">
              Nos taxis sont disponibles à toute heure, jour et nuit, pour vous servir quand vous en avez besoin.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Sécurisé & Fiable</h3>
            <p className="text-slate-300">
              Tous nos chauffeurs sont professionnels, expérimentés et nos véhicules sont régulièrement entretenus.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Réservation Facile</h3>
            <p className="text-slate-300">
              Interface simple et intuitive pour réserver votre course en quelques secondes seulement.
            </p>
          </div>
        </div>

        <div className="mt-20 bg-slate-800/50 backdrop-blur-sm p-12 rounded-xl border border-slate-700 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Prêt à partir ?</h3>
          <p className="text-slate-300 mb-6 text-lg">
            Créez votre compte gratuitement et réservez votre premier trajet dès maintenant.
          </p>
          <Link
            to="/auth"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Commencer
          </Link>
        </div>
      </main>

      <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-700 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400">
          <p>&copy; 2024 Taxi Patrice. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
