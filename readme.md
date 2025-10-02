## :warning: Disclaimer

[ :uk: ] Please do not copy-paste this code. In this way, you won't learn a lot. Instead, you can use it to understand how to do some tricky part, but try to redo it by your own.
Just to let you know, some files may be incorrect. Some bugs may have passed through, or subject may have changed since I did this project.

[ :fr: ] S'il vous plait, ne copier-coller pas ce code. De cette manière, vous n'apprendrez pas grand chose. A la place, vous pouvez l'utiliser pour comprendre certaines parties plus complexes du sujet, mais essayez de le refaire par vos propres moyens.
Pour information, certains exercices pourraient être incorrects. Quelques bugs pourraient avoir réussi à passer au travers les mailles du filet, ou le sujet a peut-être changé depuis que j'ai complété le projet.

---
# 42-CommonCore_09.2025_Transcendence

## :fire: Hell's Gate Pong :fire: - Deploiement Dev/Prod

Ce projet supporte maintenant deux modes de deploiement :

### Mode Developpement
- **Port**: 5173
- **Serveur**: Vite avec hot-reload
- **Optimisations**: Aucune (developpement)

### Mode Production
- **Port**: 5000
- **Serveur**: Express optimisé
- **Optimisations**: Build minifie, compression, etc.

---

## Commandes disponibles

### Via Makefile
```bash
# Demarrage complet en mode production
make
make prod

# Demarrage complet en mode developpement
make dev

# Arrete tous les services
make down

# Nettoyer complètement
make fclean

# Arrete proprement et redemarre les services en prod
make restart

# Arrete proprement et redemarre les services en dev
make restart-dev
```

---

## Variables d'environnement

Il vous faut ajouter les variables d'environnement (.prod.env ou .dev.env) a la racine du dossier '/srcs'.

Les fichiers sont sur le Drive du groupe.

---

## Structure des fichiers

```
srcs/
├─ .dev.env					# Variables d'environnement en mode dev
├─ .prod.env				# Variables d'environnement en mode prod
├─ docker-compose.dev.yml	# Docker-compose en mode dev
├─ docker-compose.prod.yml	# Docker-compose en mode prod
├─ requirements/
│  ├─ ai_server/			# Serveur IA
│  │  ├─ server_files/
│  │  ├─ Dockerfile
│  ├─ caddy/				# Serveur proxy sous Caddy
│  │  ├─ server_files/
│  │  ├─ Dockerfile
│  ├─ front_end/			# Serveur front-end
│  │  ├─ server_files/
│  │  ├─ Dockerfile			# Dockerfile en mode dev
│  │  ├─ Dockerfile.prod	# Dockerfile en mode prod
│  ├─ game_management/		# Serveur game-management
│  │  ├─ server_files/
│  │  ├─ Dockerfile
│  ├─ user_management/		# Serveur user-management avec la base de donnees
│  │  ├─ server_files/
│  │  ├─ Dockerfile
Makefile					# Makefile du projet
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

_Common Core Rank 06 - Completed in September 2025_  
_Code by [ahoizai](https://github.com/axelhoizai), [lcollong](https://github.com/louisecollonge), [mdemare](https://github.com/KaliStudio), [mgouraud](https://github.com/MaximeJC) and [nicolmar](https://github.com/Nico-Mar42)_
