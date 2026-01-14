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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Taxi Patrice</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                <span>{profile?.full_name}</span>
              </div>
              {profile?.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-white mb-8">Réserver une Course</h2>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
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

            <div className="mt-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <MapPin className="w-5 h-5 text-green-400" />
                <span className="font-medium">Départ:</span>
                <span>{startPoint ? `${startPoint.lat.toFixed(4)}, ${startPoint.lng.toFixed(4)}` : 'Cliquez sur la carte'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 mb-4">
                <MapPin className="w-5 h-5 text-red-400" />
                <span className="font-medium">Arrivée:</span>
                <span>{endPoint ? `${endPoint.lat.toFixed(4)}, ${endPoint.lng.toFixed(4)}` : 'Cliquez sur la carte'}</span>
              </div>
              {route && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <div className="text-slate-400 text-sm">Distance</div>
                    <div className="text-white text-lg font-semibold">{route.distance.toFixed(2)} km</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Temps estimé</div>
                    <div className="text-white text-lg font-semibold">{Math.round(route.duration)} min</div>
                  </div>
                </div>
              )}
              <button
                onClick={handleReset}
                className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Choisissez votre taxi</h3>
              <div className="space-y-3">
                {taxis.map((taxi) => (
                  <button
                    key={taxi.id}
                    onClick={() => setSelectedTaxi(taxi)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedTaxi?.id === taxi.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <div className="text-white font-semibold">{taxi.name}</div>
                        <div className="text-slate-400 text-sm">{taxi.vehicle_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-semibold">{taxi.price_per_km}€/km</div>
                        {taxi.multiplier !== 1 && (
                          <div className="text-slate-400 text-xs">x{taxi.multiplier}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Date et Heure</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-slate-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                    <label className="flex items-center gap-2 text-slate-300 mb-2">
                      <Clock className="w-4 h-4" />
                      Heure
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
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

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Récapitulatif</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-300">
                  <span>Distance</span>
                  <span className="font-semibold">{route ? `${route.distance.toFixed(2)} km` : '-'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Temps estimé</span>
                  <span className="font-semibold">{route ? `${Math.round(route.duration)} min` : '-'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxi</span>
                  <span className="font-semibold">{selectedTaxi?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Date</span>
                  <span className="font-semibold">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Heure</span>
                  <span className="font-semibold">{selectedTime || '-'}</span>
                </div>
                <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-white font-semibold text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Prix Total
                  </span>
                  <span className="text-blue-400 font-bold text-2xl">
                    {route && selectedTaxi ? `${calculatePrice()}€` : '-'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <button
                onClick={handleConfirmBooking}
                disabled={loading || !startPoint || !endPoint || !selectedTaxi || !selectedDate || !selectedTime}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Réservation en cours...' : 'Confirmer la Réservation'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
