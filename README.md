# AtlasDuRoyaume

Ce dépôt contient une application Tauri 2 avec un frontend React et un backend Rust. Le dossier `webapp` héberge l'application Tauri destinée aux plateformes mobile et desktop. Le dossier `backend` contient un serveur REST simplifié utilisé pour servir les données de carte et les ressources nécessaires à l'application.

Pour compiler le frontend, voir `webapp/README.md`.

La géolocalisation utilise le plugin Tauri `@tauri-apps/plugin-geolocation`.

## Lancer l'application

1. Démarrer l'API REST locale :

```bash
cargo run --manifest-path backend/Cargo.toml
```

2. Dans un autre terminal, installer les dépendances JavaScript puis lancer Tauri :

```bash
cd webapp
npm install
npm run dev
```

Les données de carte sont définies dans `backend/src/main.rs` et peuvent être
adaptées à vos besoins.
