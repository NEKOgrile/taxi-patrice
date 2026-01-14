# Guide Rapide - Taxi Patrice

## Connexion à la Base de Données

La base de données Supabase est déjà configurée et connectée. Toutes les tables sont en place avec des données de démo.

## Créer vos Comptes de Test

### 1. Créer un Compte Client

1. Allez sur le site
2. Cliquez sur "Connexion" puis "Inscription"
3. Remplissez le formulaire:
   - **Nom**: Jean Dupont
   - **Téléphone**: 0612345678
   - **Email**: client@test.com
   - **Mot de passe**: Test1234!
4. Connectez-vous et testez une réservation

### 2. Créer un Compte Admin

1. Inscrivez-vous avec ces informations:
   - **Nom**: Patrice Admin
   - **Téléphone**: 0698765432
   - **Email**: admin@test.com
   - **Mot de passe**: Admin1234!

2. Allez sur Supabase:
   - Ouvrez votre projet: https://supabase.com/dashboard
   - Cliquez sur "SQL Editor"
   - Copiez et exécutez ce code:

```sql
UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');
```

3. Déconnectez-vous et reconnectez-vous
4. Le bouton "Admin" apparaîtra maintenant dans la navigation

## Nouveau Design

Le site a été complètement redessiné avec:

- **Thème Taxi/Voyage**: Couleurs ambre et jaune évoquant les taxis traditionnels
- **Animations**: Effets de survol, transitions fluides, animations de boutons
- **Glassmorphism**: Effets de flou et transparence pour un look moderne
- **Dégradés Dynamiques**: Arrière-plans animés avec effets de lumière
- **Micro-interactions**: Rotations, échelles et effets sur tous les éléments interactifs
- **Typographie Forte**: Titres bold et contrastes marqués
- **Effets de Profondeur**: Ombres colorées et bordures lumineuses

## Fonctionnalités Disponibles

### Pour les Clients
- Page d'accueil dynamique avec présentation des services
- Inscription/Connexion sécurisée
- Réservation de courses avec carte interactive
- Sélection de taxi avec prix en temps réel
- Choix de date et heure
- Confirmation instantanée

### Pour l'Admin
- Dashboard complet de gestion des courses
- Vue détaillée de chaque réservation avec carte
- Gestion des statuts (accepter, refuser, en route, terminée)
- Gestion des taxis (ajouter, modifier, supprimer)
- Gestion des disponibilités horaires
- Filtres par statut et période

## Taxis Disponibles

4 taxis sont déjà configurés:
1. **Taxi Économique** - Citadine - 1.50€/km
2. **Taxi Confort** - Berline - 2.00€/km
3. **Taxi Premium** - Berline Luxe - 3.00€/km
4. **Van Familial** - Minivan 7 places - 2.50€/km x1.2

## Disponibilités

Des créneaux horaires sont déjà créés pour les 7 prochains jours (8h-20h).
Vous pouvez en ajouter plus depuis le dashboard admin.

## Testez le Site

1. Créez les deux comptes (client et admin)
2. Testez une réservation en tant que client
3. Acceptez la course en tant qu'admin
4. Explorez toutes les fonctionnalités

**Le site est prêt à l'emploi avec son nouveau design premium !**
