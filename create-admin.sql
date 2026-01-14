-- Script pour créer un compte administrateur
-- Exécutez ce script dans l'éditeur SQL de Supabase après avoir créé votre compte

-- Option 1: Mettre à jour par email
-- Remplacez 'patrice@taxipatrice.fr' par votre email
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'patrice@taxipatrice.fr'
);

-- Option 2: Mettre à jour par numéro de téléphone
-- Remplacez '0612345678' par votre numéro
-- UPDATE profiles
-- SET is_admin = true
-- WHERE phone = '0612345678';

-- Vérifier que l'utilisateur est bien admin
SELECT
  p.full_name,
  p.phone,
  p.is_admin,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = true;
