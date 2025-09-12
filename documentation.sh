# Ce fichier contient des exemples de commandes pour manipuler la base de donnees. 
# Il ne faut pas executer ce fichier, il ne sert que de documentation pour se rappeler de ces commandes. 


# installer node.js et fastify:
npm init -y
npm install fastify fastify-plugin sqlite3


# lancer le serveur:
node db_server.js


# Dans un autre terminal:

	# ajouter un user:
	curl -X POST http://localhost:3000/users \
		-H "Content-Type: application/json" \
		-d '{"login": "Louise", "email": "louise@example.com", "password": "bimo"}' \

	curl -X POST http://localhost:3000/users \
		-H "Content-Type: application/json" \
		-d '{"login": "Alice", "email": "alice@example.com", "password": "bimo"}' \

	curl -X POST http://localhost:3000/users \
		-H "Content-Type: application/json" \
		-d '{"login": "Cocotte", "email": "cocotte@example.com", "password": "zoom"}' \


	curl -X POST http://localhost:3000/users \
		-H "Content-Type: application/json" \
		-d '{"login": "Nul", "email": "nul@example.com", "password": "pourri"}' \

	curl -X POST http://localhost:3000/users \
		-H "Content-Type: application/json" \
		-d '{"login": "Mauvais", "email": "mauvais@example.com", "password": "rate"}'

	# afficher tous les users:
	curl http://localhost:3000/users

	# ajouter une partie:
	curl -X POST http://localhost:3000/games \
		-H "Content-Type: application/json" \
		-d '{"login_winner": "Louise", "login_loser": "Alice", "score_winner": "6", "score_loser": "4"}' \

	curl -X POST http://localhost:3000/games \
		-H "Content-Type: application/json" \
		-d '{"login_winner": "Cocotte", "login_loser": "Alice", "score_winner": "3", "score_loser": "0"}' \

	curl -X POST http://localhost:3000/games \
		-H "Content-Type: application/json" \
		-d '{"login_winner": "Cocotte", "login_loser": "Louise", "score_winner": "5", "score_loser": "4"}'

	# afficher toutes les parties:
	curl http://localhost:3000/games

	# afficher le leaderboard:
	curl http://localhost:3000/leaderboard

	# afficher les amis:
	curl http://localhost:3000/friends

	# ajouter un ami a qqn:
	curl -X POST http://localhost:3000/friends \
		-H "Content-Type: application/json" \
		-d '{"login1": "Alice", "login2": "Cocotte"}' \

	curl -X POST http://localhost:3000/friends \
		-H "Content-Type: application/json" \
		-d '{"login1": "Cocotte", "login2": "Louise"}'

	# supprimer une amitie:
	curl -X POST http://localhost:3000/friends/delete \
		-H "Content-Type: application/json" \
		-d '{"login1": "Cocotte", "login2": "Louise"}'

	# tester la recuperation d'infos sur l'utilisateur connecte:
		npm install node-fetch # si besoin
		# creer un fichier test.js a l'interieur duquel:
		fetch('http://localhost:3000/users/current?login=Louise')    
			.then(response => response.json())
			.then(data => console.log('Données utilisateur:', data))
			.catch(error => console.error('Erreur:', error));
		# puis dans un terminal:
		node test.js

	# tester /login avec POST:
	curl -X POST http://localhost:3000/login \
		-H "Content-Type: application/json" \
		-d '{"email": "nul@example.com", "password": "pourri"}'

	# Supprimer un utilisateur:
	curl -X POST http://localhost:3000/deleteuser \
		-H "Content-Type: application/json" \
		-d '{"login": "Louise", "email": "louise@example.com", "password": "bimo"}'
