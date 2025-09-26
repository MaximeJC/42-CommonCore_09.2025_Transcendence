# 🚀 Transcendence - Déploiement Dev/Prod

Ce projet supporte maintenant deux modes de déploiement :

## 🛠️ Mode Développement
- **Port**: 5173  
- **Serveur**: Vite avec hot-reload
- **Optimisations**: Aucune (développement)

## 🚀 Mode Production  
- **Port**: 5000
- **Serveur**: Express optimisé
- **Optimisations**: Build minifié, compression, etc.

---

## 📋 Commandes disponibles

### Via Makefile (recommandé)
```bash
# Démarrage complet en mode développement
make dev

# Démarrage complet en mode production
make prod

# Front-end uniquement en développement
make dev-front

# Front-end uniquement en production  
make prod-front

# Arrêter tous les services
make down

# Nettoyer complètement
make fclean
```

### Via scripts bash
```bash
# Mode développement
./start-dev.sh

# Mode production
./start-prod.sh
```

### Via Docker Compose direct
```bash
# Mode développement
docker-compose --env-file srcs/.env.dev up --build front_end

# Mode production
docker-compose --env-file srcs/.env.prod up --build front_end
```

---

## 🔧 Variables d'environnement

### Développement (.env.dev)
```env
NODE_ENV=development
FRONT_PORT=5173
```

### Production (.env.prod)  
```env
NODE_ENV=production
FRONT_PORT=5000
```

---

## 📁 Structure des fichiers

```
├── srcs/
│   ├── .env.dev                 # Config développement
│   ├── .env.prod               # Config production  
│   ├── docker-compose.yml      # Configuration Docker unifiée
│   └── requirements/front_end/
│       ├── Dockerfile           # Build intelligent dev/prod
│       └── server_files/
│           ├── start.sh         # Script de démarrage intelligent
│           ├── production-server.js  # Serveur Express optimisé
│           └── package.json     # Scripts npm
├── start-dev.sh                # Script de démarrage dev
├── start-prod.sh               # Script de démarrage prod
└── Makefile                    # Commandes Make
```

---

## 🌐 Accès aux services

### Mode Développement
- **Front-end**: http://localhost:5173
- **Hot-reload**: ✅ Activé
- **Debug**: ✅ Mode verbose

### Mode Production
- **Front-end**: http://localhost:5000  
- **Optimisations**: ✅ Build minifié
- **Performance**: ✅ Optimisé

---

## 🔄 Basculer entre les modes

Pour changer de mode, il suffit d'arrêter le service actuel et le redémarrer dans l'autre mode :

```bash
# Arrêter
make down

# Redémarrer en production
make prod
```
