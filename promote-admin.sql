-- Script pour promouvoir un utilisateur en administrateur
-- Après avoir créé un compte via l'interface web, utilisez ce script

-- Option 1: Par email
-- UPDATE profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'VOTRE_EMAIL_ICI');

-- Option 2: Par téléphone
-- UPDATE profiles
-- SET is_admin = true
-- WHERE phone = 'VOTRE_TELEPHONE_ICI';

-- Pour créer rapidement les comptes de test:
-- 1. Inscrivez-vous avec ces informations:
--    - Compte Client Test:
--      * Email: client@test.com
--      * Mot de passe: Test1234!
--      * Nom: Jean Dupont
--      * Téléphone: 0612345678
--
--    - Compte Admin Test:
--      * Email: admin@test.com
--      * Mot de passe: Admin1234!
--      * Nom: Patrice Admin
--      * Téléphone: 0698765432

-- 2. Puis exécutez cette requête pour promouvoir l'admin:
UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');

-- Vérifier les comptes
SELECT u.email, p.full_name, p.phone, p.is_admin
FROM auth.users u
JOIN profiles p ON u.id = p.id
ORDER BY p.is_admin DESC, p.created_at;
