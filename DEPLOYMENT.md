# Transcendence - Deploiement Dev/Prod

Ce projet supporte maintenant deux modes de deploiement :

## Mode Developpement
- **Port**: 5173  
- **Serveur**: Vite avec hot-reload
- **Optimisations**: Aucune (developpement)

## Mode Production  
- **Port**: 5000
- **Serveur**: Express optimisé
- **Optimisations**: Build minifie, compression, etc.

---

## Commandes disponibles

### Via Makefile (recommandé)
```bash
# Demarrage complet en mode dveloppement
make dev

# Demarrage complet en mode production
make prod

# Front-end uniquement en dveloppement
make dev-front

# Front-end uniquement en production  
make prod-front

# Arrter tous les services
make down

# Nettoyer complètement
make fclean
```

### Via scripts bash
```bash
# Mode dveloppement
./start-dev.sh

# Mode production
./start-prod.sh
```

### Via Docker Compose direct
```bash
# Mode dveloppement
docker-compose --env-file srcs/.env.dev up --build front_end

# Mode production
docker-compose --env-file srcs/.env.prod up --build front_end
```

---

## Variables d'environnement

### Dveloppement (.env.dev)
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

## Structure des fichiers

```
├── srcs/
│   ├── .env.dev                # Config dveloppement
│   ├── .env.prod               # Config production  
│   ├── docker-compose.yml      # Configuration Docker unifie
│   └── requirements/front_end/
│       ├── Dockerfile          # Build intelligent dev/prod
│       └── server_files/
│           ├── start.sh        # Script de dmarrage intelligent
│           ├── production-server.js  # Serveur Express optimis
│           └── package.json    # Scripts npm
├── start-dev.sh                # Script de dmarrage dev
├── start-prod.sh               # Script de dmarrage prod
└── Makefile                    # Commandes Make
```

---

## Acces aux services

### Mode Développement
- **Front-end**: http://localhost:5173
- **Hot-reload**: Activé
- **Debug**: Mode verbose

### Mode Production
- **Front-end**: http://localhost:5000  
- **Optimisations**: Build minifie
- **Performance**: Optimise

---

## 🔄 Basculer entre les modes

Pour changer de mode, il suffit d'arreter le service actuel et le redemarrer dans l'autre mode :

```bash
# Arreter
make down

# Redemarrer en production
make prod
```
