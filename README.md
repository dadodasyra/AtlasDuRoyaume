<img src="webapp/public/icons/logo.png" width=50% alt="App logo">

# Atlas Du Royaume

Atlas du Royaume a pour but de rendre facile la navigation et facilité le travail des équipes techniques lors de l'évènement [Rallye Nationale 2025](https://www.flambeaux.org/rallye-2025/) du [Mouvement des Flambeaux et des Claires flammes](https://www.flambeaux.org/).
L'application est prévue pour un usage mobile (IOS/Android) et web standalone pour PC bien que Tauri permette de l'utiliser sur toutes plateformes.

## Fonctionnalités
- [x] Une carte satellite avec position de l'utilisateur
- [x] Une légende interactive avec tout les POI et zones d'intérêt du Rallye
- [x] Un système de groupe à rejoindre depuis les paramètres
- [x] Un système de compte sans mot de passe avec troupe FLBX/PF/Pios/Autres
- [ ] Partage de sa position avec les groupes
- [ ] Compte super admin/interface admin de gestion des groupes
- [ ] Système de signalement de problème in app (à voir les besoins)
- [ ] Un onglet de todolist pour les équipes/amis

D'autres fonctionnalités sont prévues et ne font pas partie de cette liste.

## Contenu de la repo
Cette repo contient une application Tauri 2 avec un frontend React et un backend (client) Rust, le backend serveur est en JavaScript.
- Le dossier `webapp` héberge l'application Tauri destinée aux plateformes mobile et desktop.
- Le dossier `backend` contient un serveur REST simplifié utilisé pour servir les données de carte et les ressources nécessaires à l'application.

Pour compiler le frontend, voir `webapp/README.md`.

La géolocalisation utilise le plugin Tauri `@tauri-apps/plugin-geolocation`.

## Roadmap/améliorations
- [ ] Mieux gérer la récolte de position (via l'API interne d'Android)
- [ ] Paramètre d'activation de la géolocalisation haute précision (avec avetissement batterie)
- [ ] Pouvoir voir la liste des membres d'un groupe
- [ ] Supprimer un groupe lorsque la dernière personne le quitte
- [ ] Amélioration barre de recherche légende
- [ ] Données de la légende à insérer en backend, actuellement dummy data
- [ ] Meilleure gestion du fond de carte/caching de la map autour du lieu de camp ?
- [ ] Carte hors ligne (voir faisabilité)
- [x] Une interface potable
- [x] Une interface mobile friendly

## Lancer l'application

1. Démarrer l'API REST serveur :

```bash
cd backend
npm install
npm run start
```

2. Dans un autre terminal, installer les dépendances JavaScript puis lancer Tauri :

```bash
cd webapp
npm install
npm run dev
```

Les données de carte sont définies dans `backend/backend.js` et peuvent être adaptées à vos besoins.

