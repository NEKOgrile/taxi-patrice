import { Link } from 'react-router-dom';
import { Car, Clock, Shield, Phone, MapPin, Navigation, Gauge } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0yMCA0MGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <nav className="relative bg-slate-900/70 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-amber-500/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Car className="w-9 h-9 text-amber-400 relative transform group-hover:scale-110 transition-transform" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-transparent bg-clip-text">
                Taxi Patrice
              </h1>
            </div>
            <Link
              to="/auth"
              className="group px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-amber-500/50 relative overflow-hidden"
            >
              <span className="relative z-10">Connexion</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-16 relative">
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm font-semibold mb-6 backdrop-blur-sm">
            <Navigation className="w-4 h-4" />
            <span>Service Premium 24h/24</span>
          </div>

          <h2 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            Voyagez en
            <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-transparent bg-clip-text animate-pulse">
              Toute Confiance
            </span>
          </h2>

          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Découvrez un service de taxi d'excellence disponible jour et nuit.
            Réservation instantanée, trajets sécurisés et confort absolu pour tous vos déplacements.
          </p>

          <Link
            to="/auth"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 text-lg font-bold rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 relative overflow-hidden"
          >
            <span className="relative z-10">Réserver Maintenant</span>
            <Car className="w-6 h-6 relative z-10 transform group-hover:translate-x-2 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform shadow-lg shadow-amber-500/30">
                <Clock className="w-10 h-10 text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Disponible 24/7</h3>
              <p className="text-slate-300 leading-relaxed">
                Service non-stop pour tous vos trajets, de jour comme de nuit. Nous sommes toujours là pour vous.
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform shadow-lg shadow-green-500/30">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">100% Sécurisé</h3>
              <p className="text-slate-300 leading-relaxed">
                Chauffeurs professionnels certifiés, véhicules premium et assurance complète pour votre tranquillité.
              </p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md p-8 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform shadow-lg shadow-blue-500/30">
                <Gauge className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Réservation Express</h3>
              <p className="text-slate-300 leading-relaxed">
                Interface ultra-rapide et intuitive. Réservez votre course en moins de 30 secondes chrono.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md p-16 rounded-3xl border border-amber-500/30 text-center shadow-2xl shadow-amber-500/20">
            <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-6 animate-bounce" />
            <h3 className="text-4xl font-black text-white mb-6">
              Prêt pour l'Aventure ?
            </h3>
            <p className="text-slate-300 mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
              Rejoignez des milliers de voyageurs satisfaits. Créez votre compte gratuitement et découvrez une nouvelle façon de vous déplacer.
            </p>
            <Link
              to="/auth"
              className="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 text-xl font-bold rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 relative overflow-hidden"
            >
              <span className="relative z-10">Commencer Maintenant</span>
              <Navigation className="w-6 h-6 relative z-10 transform group-hover:rotate-45 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative bg-slate-900/70 backdrop-blur-md border-t border-amber-500/20 mt-32">
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
            <Car className="w-5 h-5 text-amber-400" />
            <span className="font-semibold">Taxi Patrice</span>
          </div>
          <p className="text-slate-500">&copy; 2024 Taxi Patrice. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
