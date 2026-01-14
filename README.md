# Taxi Patrice - Plateforme de Réservation de Taxi

Application web complète pour la gestion de réservations de taxi avec interface client et dashboard administrateur.

## Fonctionnalités

### Pour les Clients
- Inscription et connexion sécurisées
- Carte interactive pour sélectionner départ et destination
- Calcul automatique de distance, temps et prix
- Choix du type de taxi
- Sélection de date et heure
- Confirmation de réservation en temps réel

### Pour l'Administrateur
- Dashboard complet pour gérer toutes les courses
- Filtres par statut et période
- Accepter/refuser/suivre les courses
- Gestion des taxis (ajouter/modifier/supprimer)
- Gestion des disponibilités
- Vue carte pour chaque course

## Technologies Utilisées

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Carte**: Leaflet + OpenStreetMap
- **Routing**: OSRM
- **Backend**: Supabase (Authentication + Database)
- **Icons**: Lucide React

## Installation

1. Les dépendances sont déjà installées
2. Les variables d'environnement sont configurées dans `.env`
3. La base de données est déjà créée avec toutes les tables

## Structure de la Base de Données

### Tables
- `profiles` - Profils utilisateurs (clients et admin)
- `taxis` - Véhicules disponibles
- `availabilities` - Créneaux horaires
- `rides` - Réservations de courses
- `notifications` - Notifications pour l'admin

### Données Initiales
- 4 taxis prédéfinis (Économique, Confort, Premium, Van Familial)
- Créneaux horaires pour les 7 prochains jours (8h-20h)

## Créer un Compte Administrateur

Pour accéder au dashboard admin, vous devez créer un compte admin:

1. Inscrivez-vous normalement via l'interface web
2. Ensuite, exécutez cette requête SQL dans Supabase pour définir votre compte comme admin:

```sql
UPDATE profiles
SET is_admin = true
WHERE phone = 'VOTRE_NUMERO_DE_TELEPHONE';
```

Ou par email:

```sql
UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'votre@email.com');
```

3. Déconnectez-vous et reconnectez-vous pour que les changements prennent effet

## Utilisation

### Client
1. Créez un compte depuis la page d'accueil
2. Cliquez sur la carte pour définir le départ (marqueur vert)
3. Cliquez à nouveau pour définir la destination (marqueur rouge)
4. Le trajet et le prix se calculent automatiquement
5. Choisissez un taxi dans la liste
6. Sélectionnez une date et une heure disponibles
7. Confirmez votre réservation

### Administrateur
1. Connectez-vous avec un compte admin
2. Accédez au dashboard via le bouton "Admin"
3. **Onglet Courses**:
   - Filtrez par statut et période
   - Cliquez sur une course pour voir les détails
   - Changez le statut (accepter, refuser, en route, terminée)
   - Visualisez le trajet sur la carte
4. **Onglet Taxis**:
   - Ajoutez de nouveaux taxis
   - Modifiez les prix et disponibilités
   - Supprimez des taxis
5. **Onglet Disponibilités**:
   - Ajoutez des créneaux horaires
   - Bloquez/débloquez des créneaux
   - Supprimez des disponibilités

## Statuts des Courses

- **pending** (En attente) - Nouvelle réservation
- **accepted** (Acceptée) - Confirmée par l'admin
- **en_route** (En route) - Le taxi est en chemin
- **finished** (Terminée) - Course terminée
- **cancelled** (Annulée) - Refusée par l'admin

## Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) activé sur toutes les tables
- Les clients ne voient que leurs propres courses
- Seuls les admins peuvent voir et gérer toutes les courses
- Les mots de passe sont hashés automatiquement

## API Externe

Le projet utilise l'API OSRM (Open Source Routing Machine) pour calculer les itinéraires:
- Service public gratuit
- Pas de clé API nécessaire
- Calcul en temps réel

## Personnalisation

### Modifier les Prix
Les prix sont dans la table `taxis`. Le prix final est calculé ainsi:
```
Prix = Distance (km) × Prix/km × Multiplicateur
```

### Ajouter des Créneaux
Les créneaux sont dans la table `availabilities`. Vous pouvez:
- Les ajouter via le dashboard admin
- Les générer en masse via SQL

### Modifier les Couleurs
Le projet utilise Tailwind CSS. Les couleurs principales sont:
- Bleu (`blue-600`) pour les actions client
- Violet (`purple-600`) pour les actions admin
- Ardoise (`slate-800`) pour les fonds

## Support

Pour toute question ou problème:
1. Vérifiez que Supabase est bien configuré
2. Vérifiez les logs dans la console du navigateur
3. Vérifiez les tables dans Supabase

## Prochaines Améliorations Possibles

- Intégration Stripe pour les paiements
- Notifications en temps réel via Supabase Realtime
- Historique complet des courses
- Statistiques et analytics
- Application mobile
- Géolocalisation en temps réel
- Chat entre client et chauffeur
