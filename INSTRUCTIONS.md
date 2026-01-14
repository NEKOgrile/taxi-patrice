# Guide d'Utilisation - Taxi Patrice

## Démarrage Rapide

### 1. Créer un Compte Administrateur (Patrice)

**Étape 1**: Inscrivez-vous sur le site
- Allez sur la page d'accueil
- Cliquez sur "Connexion" puis "Inscription"
- Remplissez le formulaire avec vos informations:
  - Nom: Patrice
  - Téléphone: Votre numéro
  - Email: patrice@taxipatrice.fr (ou autre)
  - Mot de passe: Votre mot de passe sécurisé

**Étape 2**: Activez les droits admin
- Allez sur [Supabase](https://supabase.com)
- Ouvrez votre projet
- Cliquez sur "SQL Editor" dans le menu
- Collez et exécutez ce code (remplacez l'email):

```sql
UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'patrice@taxipatrice.fr'
);
```

**Étape 3**: Reconnectez-vous
- Déconnectez-vous du site
- Reconnectez-vous avec vos identifiants
- Vous verrez maintenant le bouton "Admin" dans la barre de navigation

---

## Utilisation Client

### Réserver un Taxi

1. **Connexion**
   - Créez un compte ou connectez-vous
   - Vous arrivez sur la page de réservation

2. **Choisir le Trajet**
   - Cliquez sur la carte pour placer le point de départ (marqueur vert)
   - Cliquez à nouveau pour placer la destination (marqueur rouge)
   - Le trajet s'affiche en bleu
   - La distance, le temps et le prix se calculent automatiquement

3. **Choisir le Taxi**
   - Sélectionnez un taxi dans la liste à droite
   - Le prix se met à jour selon votre choix

4. **Choisir Date et Heure**
   - Sélectionnez une date dans la liste déroulante
   - Puis choisissez une heure disponible
   - Seuls les créneaux libres sont affichés

5. **Confirmer**
   - Vérifiez le récapitulatif
   - Cliquez sur "Confirmer la Réservation"
   - Un message de confirmation s'affiche

6. **Recommencer**
   - Cliquez sur "Réinitialiser" pour faire une nouvelle réservation

---

## Utilisation Administrateur

### Accéder au Dashboard

- Connectez-vous avec votre compte admin
- Cliquez sur le bouton "Admin" en haut à droite
- Vous accédez au tableau de bord

### Gérer les Courses

**Voir les Courses**
- Toutes les courses sont listées à gauche
- Utilisez les filtres pour affiner:
  - Par statut (en attente, acceptée, etc.)
  - Par période (aujourd'hui, semaine, mois, année)

**Traiter une Course**
1. Cliquez sur une course dans la liste
2. Les détails s'affichent à droite avec:
   - Infos client (nom, téléphone)
   - Détails du trajet
   - Carte interactive
   - Prix et durée
3. Changez le statut avec les boutons:
   - **En attente** → Accepter ou Refuser
   - **Acceptée** → Marquer "En route"
   - **En route** → Marquer "Terminée"

**Statuts Disponibles**
- En attente (jaune) - Nouvelle demande
- Acceptée (bleu) - Confirmée
- En route (violet) - Trajet en cours
- Terminée (vert) - Course finie
- Annulée (rouge) - Refusée

### Gérer les Taxis

**Ajouter un Taxi**
1. Allez dans l'onglet "Taxis"
2. Remplissez le formulaire:
   - Nom (ex: "Taxi VIP")
   - Type de véhicule (ex: "Mercedes Classe E")
   - Prix/km (ex: 2.50)
   - Multiplicateur (ex: 1.0 pour normal, 1.5 pour rush hour)
3. Cliquez sur "Ajouter"

**Modifier un Taxi**
1. Cliquez sur l'icône crayon (Edit)
2. Modifiez les informations
3. Cochez/décochez "Disponible" pour activer/désactiver
4. Cliquez sur "Sauvegarder"

**Supprimer un Taxi**
- Cliquez sur l'icône poubelle
- Confirmez la suppression

### Gérer les Disponibilités

**Ajouter un Créneau**
1. Allez dans l'onglet "Disponibilités"
2. Sélectionnez une date
3. Entrez une heure (format 24h, ex: 14:30)
4. Cliquez sur "Ajouter"

**Bloquer/Débloquer un Créneau**
- Cliquez sur le badge "Disponible" ou "Bloqué"
- Le statut change instantanément
- Les créneaux bloqués n'apparaissent plus côté client

**Supprimer un Créneau**
- Cliquez sur l'icône poubelle
- Confirmez la suppression

---

## Conseils d'Utilisation

### Pour les Clients

- **Précision GPS**: Autorisez la géolocalisation pour un centrage automatique
- **Zoom**: Utilisez la molette ou les boutons +/- pour zoomer sur la carte
- **Réinitialiser**: Si vous vous trompez, cliquez sur "Réinitialiser"
- **Prix variables**: Les prix changent selon le taxi et la distance

### Pour l'Administrateur

- **Réactivité**: Traitez rapidement les nouvelles réservations
- **Disponibilités**: Ajoutez des créneaux à l'avance (au moins une semaine)
- **Taxis**: Désactivez les taxis en maintenance plutôt que de les supprimer
- **Filtres**: Utilisez les filtres pour trouver rapidement une course

---

## Tarification

### Comment est Calculé le Prix?

```
Prix Total = Distance (km) × Prix/km × Multiplicateur
```

**Exemple**:
- Distance: 10 km
- Taxi Confort: 2.00€/km
- Multiplicateur: 1.0
- **Prix**: 10 × 2.00 × 1.0 = **20.00€**

### Taxis par Défaut

1. **Taxi Économique**
   - Citadine
   - 1.50€/km
   - Idéal pour courtes distances

2. **Taxi Confort**
   - Berline
   - 2.00€/km
   - Bon rapport qualité/prix

3. **Taxi Premium**
   - Berline Luxe
   - 3.00€/km
   - Pour occasions spéciales

4. **Van Familial**
   - Minivan 7 places
   - 2.50€/km × 1.2
   - Pour groupes ou familles

---

## Dépannage

### Je ne peux pas me connecter
- Vérifiez votre email et mot de passe
- Le mot de passe est sensible à la casse
- Vérifiez votre connexion internet

### La carte ne s'affiche pas
- Vérifiez votre connexion internet
- Actualisez la page (F5)
- Autorisez la géolocalisation

### Le trajet ne se calcule pas
- Vérifiez que vous avez bien cliqué deux fois
- Les deux points doivent être distants d'au moins 100m
- Réessayez en cliquant sur "Réinitialiser"

### Je ne vois pas le bouton Admin
- Vérifiez que vous êtes bien admin dans la base de données
- Déconnectez-vous et reconnectez-vous
- Videz le cache de votre navigateur

### Aucun créneau disponible
- L'admin doit ajouter des disponibilités
- Vérifiez que la date choisie n'est pas dans le passé
- Contactez l'administrateur

---

## Support Technique

Pour toute assistance:
1. Consultez ce guide en premier
2. Vérifiez les logs de la console (F12 dans le navigateur)
3. Consultez le README.md pour les détails techniques

## Prochaines Étapes

1. ✅ Créez votre compte admin
2. ✅ Ajoutez des créneaux horaires pour le mois
3. ✅ Vérifiez que les taxis sont bien configurés
4. ✅ Testez une réservation en tant que client
5. ✅ Familiarisez-vous avec le dashboard admin

**Le site est prêt à l'emploi !**
