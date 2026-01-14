/*
  # Taxi Patrice - Schéma de base de données complet

  ## Tables créées
  
  ### 1. profiles
  Stocke les informations des utilisateurs (clients et admin)
  - id (uuid, lié à auth.users)
  - full_name (texte, nom complet)
  - phone (texte, numéro de téléphone)
  - is_admin (booléen, false par défaut)
  - created_at (timestamp)
  
  ### 2. taxis
  Liste des véhicules disponibles
  - id (uuid)
  - name (texte, ex: "Taxi Confort")
  - vehicle_type (texte, ex: "Berline")
  - price_per_km (decimal, prix au kilomètre)
  - multiplier (decimal, multiplicateur de prix, défaut 1.0)
  - is_available (booléen, disponibilité)
  - created_at (timestamp)
  
  ### 3. availabilities
  Créneaux horaires disponibles pour réservation
  - id (uuid)
  - date (date)
  - time_slot (texte, ex: "09:00")
  - is_available (booléen)
  - created_at (timestamp)
  
  ### 4. rides
  Courses réservées
  - id (uuid)
  - user_id (uuid, référence profiles)
  - taxi_id (uuid, référence taxis)
  - start_location (texte, adresse de départ)
  - start_lat (decimal, latitude départ)
  - start_lng (decimal, longitude départ)
  - end_location (texte, adresse d'arrivée)
  - end_lat (decimal, latitude arrivée)
  - end_lng (decimal, longitude arrivée)
  - distance_km (decimal, distance en km)
  - estimated_time (integer, temps estimé en minutes)
  - price (decimal, prix total)
  - ride_date (date, date de la course)
  - ride_time (texte, heure de la course)
  - status (texte, statut: pending/accepted/en_route/finished/cancelled)
  - created_at (timestamp)
  
  ### 5. notifications
  Notifications pour l'admin
  - id (uuid)
  - ride_id (uuid, référence rides)
  - message (texte)
  - is_read (booléen)
  - created_at (timestamp)

  ## Sécurité
  - RLS activé sur toutes les tables
  - Policies pour authentification et autorisation
*/

-- Table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Table taxis
CREATE TABLE IF NOT EXISTS taxis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vehicle_type text NOT NULL,
  price_per_km decimal(10,2) NOT NULL,
  multiplier decimal(5,2) DEFAULT 1.0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE taxis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available taxis"
  ON taxis FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins can manage taxis"
  ON taxis FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Table availabilities
CREATE TABLE IF NOT EXISTS availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time_slot text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, time_slot)
);

ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view availabilities"
  ON availabilities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage availabilities"
  ON availabilities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Table rides
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  taxi_id uuid NOT NULL REFERENCES taxis(id) ON DELETE RESTRICT,
  start_location text NOT NULL,
  start_lat decimal(10,7) NOT NULL,
  start_lng decimal(10,7) NOT NULL,
  end_location text NOT NULL,
  end_lat decimal(10,7) NOT NULL,
  end_lng decimal(10,7) NOT NULL,
  distance_km decimal(10,2) NOT NULL,
  estimated_time integer NOT NULL,
  price decimal(10,2) NOT NULL,
  ride_date date NOT NULL,
  ride_time text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'en_route', 'finished', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rides"
  ON rides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own rides"
  ON rides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all rides"
  ON rides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update rides"
  ON rides FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insérer quelques taxis par défaut
INSERT INTO taxis (name, vehicle_type, price_per_km, multiplier, is_available)
VALUES 
  ('Taxi Économique', 'Citadine', 1.50, 1.0, true),
  ('Taxi Confort', 'Berline', 2.00, 1.0, true),
  ('Taxi Premium', 'Berline Luxe', 3.00, 1.0, true),
  ('Van Familial', 'Minivan 7 places', 2.50, 1.2, true)
ON CONFLICT DO NOTHING;

-- Insérer des créneaux horaires par défaut (prochains 7 jours)
DO $$
DECLARE
  target_date date;
  time_slots text[] := ARRAY['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  slot text;
  i integer;
BEGIN
  FOR i IN 0..6 LOOP
    target_date := CURRENT_DATE + i;
    FOREACH slot IN ARRAY time_slots
    LOOP
      INSERT INTO availabilities (date, time_slot, is_available)
      VALUES (target_date, slot, true)
      ON CONFLICT (date, time_slot) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
