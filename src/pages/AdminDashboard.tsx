import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { LatLngExpression, Icon } from 'leaflet';
import {
  Car,
  Calendar,
  Clock,
  User,
  LogOut,
  Filter,
  Check,
  X,
  Navigation,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, RideWithDetails, Taxi, Availability } from '../lib/supabase';

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

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'rides' | 'taxis' | 'availabilities'>('rides');
  const [rides, setRides] = useState<RideWithDetails[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideWithDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const [taxis, setTaxis] = useState<Taxi[]>([]);
  const [editingTaxi, setEditingTaxi] = useState<Taxi | null>(null);
  const [newTaxi, setNewTaxi] = useState({
    name: '',
    vehicle_type: '',
    price_per_km: 0,
    multiplier: 1.0,
    is_available: true,
  });

  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [newAvailability, setNewAvailability] = useState({
    date: '',
    time_slot: '',
  });

  useEffect(() => {
    if (!user || !profile?.is_admin) {
      navigate('/booking');
      return;
    }
    loadRides();
    loadTaxis();
    loadAvailabilities();
  }, [user, profile, navigate]);

  const loadRides = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        profiles!rides_user_id_fkey (
          id,
          full_name,
          phone,
          is_admin,
          created_at
        ),
        taxis (
          id,
          name,
          vehicle_type,
          price_per_km,
          multiplier,
          is_available,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading rides:', error);
    } else {
      setRides(data || []);
    }
    setLoading(false);
  };

  const loadTaxis = async () => {
    const { data, error } = await supabase
      .from('taxis')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading taxis:', error);
    } else {
      setTaxis(data || []);
    }
  };

  const loadAvailabilities = async () => {
    const { data, error } = await supabase
      .from('availabilities')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date')
      .order('time_slot');

    if (error) {
      console.error('Error loading availabilities:', error);
    } else {
      setAvailabilities(data || []);
    }
  };

  const updateRideStatus = async (rideId: string, status: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status })
      .eq('id', rideId);

    if (error) {
      console.error('Error updating ride:', error);
    } else {
      loadRides();
      if (selectedRide?.id === rideId) {
        setSelectedRide({ ...selectedRide, status: status as any });
      }
    }
  };

  const filteredRides = rides.filter((ride) => {
    if (statusFilter !== 'all' && ride.status !== statusFilter) return false;

    if (dateFilter !== 'all') {
      const rideDate = new Date(ride.ride_date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case 'today':
          return rideDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return rideDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return rideDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return rideDate >= yearAgo;
      }
    }

    return true;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddTaxi = async () => {
    if (!newTaxi.name || !newTaxi.vehicle_type || !newTaxi.price_per_km) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const { error } = await supabase.from('taxis').insert(newTaxi);

    if (error) {
      console.error('Error adding taxi:', error);
      alert('Erreur lors de l\'ajout du taxi');
    } else {
      setNewTaxi({
        name: '',
        vehicle_type: '',
        price_per_km: 0,
        multiplier: 1.0,
        is_available: true,
      });
      loadTaxis();
    }
  };

  const handleUpdateTaxi = async () => {
    if (!editingTaxi) return;

    const { error } = await supabase
      .from('taxis')
      .update({
        name: editingTaxi.name,
        vehicle_type: editingTaxi.vehicle_type,
        price_per_km: editingTaxi.price_per_km,
        multiplier: editingTaxi.multiplier,
        is_available: editingTaxi.is_available,
      })
      .eq('id', editingTaxi.id);

    if (error) {
      console.error('Error updating taxi:', error);
      alert('Erreur lors de la mise à jour du taxi');
    } else {
      setEditingTaxi(null);
      loadTaxis();
    }
  };

  const handleDeleteTaxi = async (taxiId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce taxi ?')) return;

    const { error } = await supabase.from('taxis').delete().eq('id', taxiId);

    if (error) {
      console.error('Error deleting taxi:', error);
      alert('Erreur lors de la suppression du taxi');
    } else {
      loadTaxis();
    }
  };

  const handleAddAvailability = async () => {
    if (!newAvailability.date || !newAvailability.time_slot) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const { error } = await supabase.from('availabilities').insert({
      date: newAvailability.date,
      time_slot: newAvailability.time_slot,
      is_available: true,
    });

    if (error) {
      console.error('Error adding availability:', error);
      alert('Erreur lors de l\'ajout de la disponibilité');
    } else {
      setNewAvailability({ date: '', time_slot: '' });
      loadAvailabilities();
    }
  };

  const handleToggleAvailability = async (availId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('availabilities')
      .update({ is_available: !currentStatus })
      .eq('id', availId);

    if (error) {
      console.error('Error updating availability:', error);
    } else {
      loadAvailabilities();
    }
  };

  const handleDeleteAvailability = async (availId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) return;

    const { error } = await supabase.from('availabilities').delete().eq('id', availId);

    if (error) {
      console.error('Error deleting availability:', error);
    } else {
      loadAvailabilities();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'accepted':
        return 'bg-blue-900/50 text-blue-300 border-blue-700';
      case 'en_route':
        return 'bg-purple-900/50 text-purple-300 border-purple-700';
      case 'finished':
        return 'bg-green-900/50 text-green-300 border-green-700';
      case 'cancelled':
        return 'bg-red-900/50 text-red-300 border-red-700';
      default:
        return 'bg-slate-900/50 text-slate-300 border-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'accepted':
        return 'Acceptée';
      case 'en_route':
        return 'En route';
      case 'finished':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <User className="w-5 h-5" />
                <span>{profile?.full_name}</span>
              </div>
              <button
                onClick={() => navigate('/booking')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Réservation
              </button>
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
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('rides')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'rides'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('taxis')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'taxis'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Taxis
          </button>
          <button
            onClick={() => setActiveTab('availabilities')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'availabilities'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Disponibilités
          </button>
        </div>

        {activeTab === 'rides' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Filtres</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Statut</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">Tous</option>
                      <option value="pending">En attente</option>
                      <option value="accepted">Acceptée</option>
                      <option value="en_route">En route</option>
                      <option value="finished">Terminée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Période</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="all">Toutes</option>
                      <option value="today">Aujourd'hui</option>
                      <option value="week">Cette semaine</option>
                      <option value="month">Ce mois</option>
                      <option value="year">Cette année</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center text-slate-400 py-8">Chargement...</div>
                ) : filteredRides.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">Aucune course trouvée</div>
                ) : (
                  filteredRides.map((ride) => (
                    <button
                      key={ride.id}
                      onClick={() => setSelectedRide(ride)}
                      className={`w-full bg-slate-800/50 backdrop-blur-sm rounded-xl border p-4 text-left transition-all ${
                        selectedRide?.id === ride.id
                          ? 'border-purple-500'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-semibold">{ride.profiles.full_name}</div>
                          <div className="text-slate-400 text-sm">{ride.profiles.phone}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ride.status)}`}>
                          {getStatusLabel(ride.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ride.ride_date).toLocaleDateString('fr-FR')} à {ride.ride_time}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Car className="w-4 h-4" />
                        {ride.taxis.name} - {ride.distance_km.toFixed(2)} km - {ride.price}€
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              {selectedRide ? (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Détails de la course</h3>

                    <div className="space-y-3 mb-6">
                      <div>
                        <div className="text-slate-400 text-sm">Client</div>
                        <div className="text-white font-semibold">{selectedRide.profiles.full_name}</div>
                        <div className="text-slate-300 text-sm">{selectedRide.profiles.phone}</div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-sm">Taxi</div>
                        <div className="text-white font-semibold">{selectedRide.taxis.name}</div>
                        <div className="text-slate-300 text-sm">{selectedRide.taxis.vehicle_type}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-400 text-sm">Distance</div>
                          <div className="text-white font-semibold">{selectedRide.distance_km.toFixed(2)} km</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">Temps estimé</div>
                          <div className="text-white font-semibold">{selectedRide.estimated_time} min</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-400 text-sm">Date</div>
                          <div className="text-white font-semibold">
                            {new Date(selectedRide.ride_date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">Heure</div>
                          <div className="text-white font-semibold">{selectedRide.ride_time}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-sm">Prix total</div>
                        <div className="text-purple-400 font-bold text-2xl">{selectedRide.price}€</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedRide.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateRideStatus(selectedRide.id, 'accepted')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Accepter
                          </button>
                          <button
                            onClick={() => updateRideStatus(selectedRide.id, 'cancelled')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Refuser
                          </button>
                        </>
                      )}

                      {selectedRide.status === 'accepted' && (
                        <button
                          onClick={() => updateRideStatus(selectedRide.id, 'en_route')}
                          className="col-span-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Navigation className="w-4 h-4" />
                          En route
                        </button>
                      )}

                      {selectedRide.status === 'en_route' && (
                        <button
                          onClick={() => updateRideStatus(selectedRide.id, 'finished')}
                          className="col-span-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Terminée
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                    <MapContainer
                      center={[selectedRide.start_lat, selectedRide.start_lng]}
                      zoom={13}
                      style={{ height: '400px', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker
                        position={[selectedRide.start_lat, selectedRide.start_lng]}
                        icon={startIcon}
                      />
                      <Marker
                        position={[selectedRide.end_lat, selectedRide.end_lng]}
                        icon={endIcon}
                      />
                      <Polyline
                        positions={[
                          [selectedRide.start_lat, selectedRide.start_lng],
                          [selectedRide.end_lat, selectedRide.end_lng],
                        ]}
                        color="purple"
                        weight={4}
                      />
                    </MapContainer>
                  </div>

                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
                    <div className="flex items-center gap-2 text-slate-300 mb-2">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <span className="font-medium">Départ:</span>
                      <span className="text-sm">{selectedRide.start_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-5 h-5 text-red-400" />
                      <span className="font-medium">Arrivée:</span>
                      <span className="text-sm">{selectedRide.end_location}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-12 text-center">
                  <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Sélectionnez une course pour voir les détails</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'taxis' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter un taxi
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Nom</label>
                    <input
                      type="text"
                      value={newTaxi.name}
                      onChange={(e) => setNewTaxi({ ...newTaxi, name: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Type de véhicule</label>
                    <input
                      type="text"
                      value={newTaxi.vehicle_type}
                      onChange={(e) => setNewTaxi({ ...newTaxi, vehicle_type: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm mb-2">Prix/km (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newTaxi.price_per_km}
                        onChange={(e) => setNewTaxi({ ...newTaxi, price_per_km: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm mb-2">Multiplicateur</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newTaxi.multiplier}
                        onChange={(e) => setNewTaxi({ ...newTaxi, multiplier: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddTaxi}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {taxis.map((taxi) => (
                  <div
                    key={taxi.id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4"
                  >
                    {editingTaxi?.id === taxi.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTaxi.name}
                          onChange={(e) => setEditingTaxi({ ...editingTaxi, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <input
                          type="text"
                          value={editingTaxi.vehicle_type}
                          onChange={(e) => setEditingTaxi({ ...editingTaxi, vehicle_type: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={editingTaxi.price_per_km}
                            onChange={(e) => setEditingTaxi({ ...editingTaxi, price_per_km: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={editingTaxi.multiplier}
                            onChange={(e) => setEditingTaxi({ ...editingTaxi, multiplier: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingTaxi.is_available}
                            onChange={(e) => setEditingTaxi({ ...editingTaxi, is_available: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label className="text-slate-300 text-sm">Disponible</label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateTaxi}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => setEditingTaxi(null)}
                            className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-white font-semibold">{taxi.name}</div>
                            <div className="text-slate-400 text-sm">{taxi.vehicle_type}</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingTaxi(taxi)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTaxi(taxi.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300">{taxi.price_per_km}€/km x{taxi.multiplier}</span>
                          <span className={`px-2 py-1 rounded text-xs ${taxi.is_available ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {taxi.is_available ? 'Disponible' : 'Indisponible'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availabilities' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Ajouter une disponibilité
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Date</label>
                    <input
                      type="date"
                      value={newAvailability.date}
                      onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Heure</label>
                    <input
                      type="time"
                      value={newAvailability.time_slot}
                      onChange={(e) => setNewAvailability({ ...newAvailability, time_slot: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleAddAvailability}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {availabilities.map((avail) => (
                  <div
                    key={avail.id}
                    className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(avail.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {avail.time_slot}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAvailability(avail.id, avail.is_available)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            avail.is_available
                              ? 'bg-green-900/50 text-green-300 hover:bg-green-900'
                              : 'bg-red-900/50 text-red-300 hover:bg-red-900'
                          }`}
                        >
                          {avail.is_available ? 'Disponible' : 'Bloqué'}
                        </button>
                        <button
                          onClick={() => handleDeleteAvailability(avail.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
