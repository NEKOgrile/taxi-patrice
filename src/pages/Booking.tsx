import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import { Car, Calendar, Clock, MapPin, DollarSign, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Taxi, Availability } from '../lib/supabase';

const defaultCenter: LatLngExpression = [48.8566, 2.3522];

const startIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RouteData {
  distance: number;
  duration: number;
  coordinates: LatLngExpression[];
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Booking() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [taxis, setTaxis] = useState<Taxi[]>([]);
  const [selectedTaxi, setSelectedTaxi] = useState<Taxi | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadTaxis();
    loadAvailabilities();
  }, [user, navigate]);

  useEffect(() => {
    if (startPoint && endPoint) {
      calculateRoute();
    }
  }, [startPoint, endPoint]);

  const loadTaxis = async () => {
    const { data, error } = await supabase
      .from('taxis')
      .select('*')
      .eq('is_available', true)
      .order('price_per_km');

    if (error) {
      console.error('Error loading taxis:', error);
    } else {
      setTaxis(data || []);
      if (data && data.length > 0) {
        setSelectedTaxi(data[0]);
      }
    }
  };

  const loadAvailabilities = async () => {
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .eq('is_available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('time_slot');

    if (error) {
      console.error('Error loading availabilities:', error);
    } else {
      setAvailabilities(data || []);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!startPoint) {
      setStartPoint({ lat, lng });
      setRoute(null);
    } else if (!endPoint) {
      setEndPoint({ lat, lng });
    } else {
      setStartPoint({ lat, lng });
      setEndPoint(null);
      setRoute(null);
    }
  };

  const calculateRoute = async () => {
    if (!startPoint || !endPoint) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: LatLngExpression[] = route.geometry.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]] as LatLngExpression
        );

        setRoute({
          distance: route.distance / 1000,
          duration: route.duration / 60,
          coordinates,
        });
      }
    } catch (err) {
      console.error('Error calculating route:', err);
      setError('Erreur lors du calcul de l\'itinéraire');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!route || !selectedTaxi) return 0;
    return (route.distance * selectedTaxi.price_per_km * selectedTaxi.multiplier).toFixed(2);
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
    setSelectedDate('');
    setSelectedTime('');
    setError('');
    setSuccess('');
  };

  const handleConfirmBooking = async () => {
    if (!startPoint || !endPoint || !route || !selectedTaxi || !selectedDate || !selectedTime || !user) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: rideError } = await supabase.from('rides').insert({
        user_id: user.id,
        taxi_id: selectedTaxi.id,
        start_location: `${startPoint.lat}, ${startPoint.lng}`,
        start_lat: startPoint.lat,
        start_lng: startPoint.lng,
        end_location: `${endPoint.lat}, ${endPoint.lng}`,
        end_lat: endPoint.lat,
        end_lng: endPoint.lng,
        distance_km: route.distance,
        estimated_time: Math.round(route.duration),
        price: parseFloat(calculatePrice()),
        ride_date: selectedDate,
        ride_time: selectedTime,
        status: 'pending',
      });

      if (rideError) throw rideError;

      const { error: availError } = await supabase
        .from('availabilities')
        .update({ is_available: false })
        .eq('date', selectedDate)
        .eq('time_slot', selectedTime);

      if (availError) console.error('Error updating availability:', availError);

      setSuccess('Réservation confirmée ! Vous recevrez une confirmation par email.');
      setTimeout(() => {
        handleReset();
        setSuccess('');
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la réservation');
      }
    } finally {
      setLoading(false);
    }
  };

  const uniqueDates = [...new Set(availabilities.map(a => a.date))];
  const availableTimesForDate = selectedDate
    ? availabilities.filter(a => a.date === selectedDate && a.is_available)
    : [];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0yMCA0MGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-amber-300 bg-slate-800/50 px-4 py-2 rounded-xl border border-amber-500/20">
                <User className="w-5 h-5" />
                <span className="font-semibold">{profile?.full_name}</span>
              </div>
              {profile?.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="group px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/50 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2 border border-slate-600/50"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 relative">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-white mb-2">Réserver une Course</h2>
          <p className="text-slate-400 text-lg">Sélectionnez votre trajet sur la carte et choisissez vos options</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl shadow-amber-500/10">
              <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '500px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {startPoint && <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />}
                {endPoint && <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon} />}
                {route && <Polyline positions={route.coordinates} color="blue" weight={4} />}
              </MapContainer>
            </div>

            <div className="mt-4 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/20 p-6 shadow-xl shadow-amber-500/10">
              <div className="flex items-center gap-2 text-slate-300 mb-3 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                <MapPin className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-300">Départ:</span>
                <span className="text-sm">{startPoint ? `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}` : 'Cliquez sur la carte'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                <MapPin className="w-5 h-5 text-red-400" />
                <span className="font-bold text-red-300">Arrivée:</span>
                <span className="text-sm">{endPoint ? `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}` : 'Cliquez sur la carte'}</span>
              </div>
              {route && (
                <div className="grid grid-cols-2 gap-4 pt-4 mb-4 border-t border-amber-500/20">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-amber-500/10">
                    <div className="text-amber-400 text-sm font-semibold">Distance</div>
                    <div className="text-white text-2xl font-black">{route.distance.toFixed(2)} km</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-amber-500/10">
                    <div className="text-amber-400 text-sm font-semibold">Temps estimé</div>
                    <div className="text-white text-2xl font-black">{Math.round(route.duration)} min</div>
                  </div>
                </div>
              )}
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 bg-slate-800/80 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-600/50 hover:border-amber-500/30"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/20 p-6 shadow-xl shadow-amber-500/10">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <Car className="w-6 h-6 text-amber-400" />
                Choisissez votre taxi
              </h3>
              <div className="space-y-3">
                {taxis.map((taxi) => (
                  <button
                    key={taxi.id}
                    onClick={() => setSelectedTaxi(taxi)}
                    className={`group w-full p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedTaxi?.id === taxi.id
                        ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 shadow-lg shadow-amber-500/30'
                        : 'border-slate-600/50 bg-slate-800/50 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <div className="text-white font-bold text-lg">{taxi.name}</div>
                        <div className="text-slate-400 text-sm">{taxi.vehicle_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-amber-400 font-black text-lg">{taxi.price_per_km}€/km</div>
                        {taxi.multiplier !== 1 && (
                          <div className="text-amber-300 text-xs font-semibold">x{taxi.multiplier}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/20 p-6 shadow-xl shadow-amber-500/10">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-400" />
                Date et Heure
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-slate-300 mb-3 font-bold">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-amber-500/20 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  >
                    <option value="">Sélectionnez une date</option>
                    {uniqueDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div>
                    <label className="flex items-center gap-2 text-slate-300 mb-3 font-bold">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Heure
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-amber-500/20 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    >
                      <option value="">Sélectionnez une heure</option>
                      {availableTimesForDate.map((avail) => (
                        <option key={avail.id} value={avail.time_slot}>
                          {avail.time_slot}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/20 p-6 shadow-xl shadow-amber-500/10">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-amber-400" />
                Récapitulatif
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-3 rounded-xl">
                  <span className="font-semibold">Distance</span>
                  <span className="font-black text-white">{route ? `${route.distance.toFixed(2)} km` : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-3 rounded-xl">
                  <span className="font-semibold">Temps estimé</span>
                  <span className="font-black text-white">{route ? `${Math.round(route.duration)} min` : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-3 rounded-xl">
                  <span className="font-semibold">Taxi</span>
                  <span className="font-black text-white">{selectedTaxi?.name || '-'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-3 rounded-xl">
                  <span className="font-semibold">Date</span>
                  <span className="font-black text-white">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300 bg-slate-800/50 p-3 rounded-xl">
                  <span className="font-semibold">Heure</span>
                  <span className="font-black text-white">{selectedTime || '-'}</span>
                </div>
                <div className="pt-4 mt-4 border-t-2 border-amber-500/30 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-yellow-500/10 p-4 rounded-xl">
                  <span className="text-white font-black text-xl flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                    Prix Total
                  </span>
                  <span className="text-amber-400 font-black text-3xl">
                    {route && selectedTaxi ? `${calculatePrice()}€` : '-'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-6 bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-sm font-semibold">
                  {success}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={loading || !startPoint || !endPoint || !selectedTaxi || !selectedDate || !selectedTime}
                className="group mt-6 w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-slate-900 disabled:text-slate-500 font-black rounded-xl transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/50 text-lg relative overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? 'Réservation en cours...' : 'Confirmer la Réservation'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
