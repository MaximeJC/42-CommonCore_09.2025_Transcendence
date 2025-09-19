import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const sqlite = sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
console.log(`Chemin de la DB : ${dbPath}`);

let db = new sqlite3.Database(dbPath);

// creer table d'utilisateurs, table de parties et table d'amities
db.serialize(()=>{
	db.run(`CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				login TEXT UNIQUE NOT NULL,
				email TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				connected INTEGER DEFAULT 0 NOT NULL,

				nb_games INTEGER DEFAULT 0 NOT NULL,
				nb_won_games INTEGER DEFAULT 0 NOT NULL,
				nb_lost_games INTEGER DEFAULT 0 NOT NULL,
				winning_ratio FLOAT DEFAULT 0.0 NOT NULL,
				scoring REAL DEFAULT 0 NOT NULL, 
				rank INTEGER DEFAULT 0 NOT NULL,

				avatar_url TEXT,
				level INTEGER DEFAULT 0 NOT NULL,
				CHECK (level IN (0, 1))
			)`);

	db.run(`CREATE TABLE IF NOT EXISTS games (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				login_winner TEXT NOT NULL,
				login_loser TEXT NOT NULL,
				score_winner INTEGER NOT NULL,
				score_loser INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (login_winner) REFERENCES users(login) ON DELETE CASCADE,
				FOREIGN KEY (login_loser) REFERENCES users(login) ON DELETE CASCADE
			)`);

	db.run(`CREATE TABLE IF NOT EXISTS friends (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				login1 TEXT NOT NULL,
				login2 TEXT NOT NULL,
				FOREIGN KEY (login1) REFERENCES users(login) ON DELETE CASCADE,
				FOREIGN KEY (login2) REFERENCES users(login) ON DELETE CASCADE
			)`);
});

// maj des nb de parties, parties gagnees/perdues et pourcentage de reussite
db.serialize(()=>{
	db.run(` CREATE TRIGGER IF NOT EXISTS update_winner_stats
				AFTER INSERT ON games
				FOR EACH ROW
				BEGIN
					UPDATE users
					SET
						nb_games = nb_games + 1,
						nb_won_games = nb_won_games + 1,
						winning_ratio = (nb_won_games + 1.0) / (nb_games + 1.0)
					WHERE login = NEW.login_winner;
				END;
			`);
	db.run(` CREATE TRIGGER IF NOT EXISTS update_loser_stat
				AFTER INSERT ON games
				FOR EACH ROW
				BEGIN
					UPDATE users
					SET
						nb_games = nb_games + 1,
						nb_lost_games = nb_lost_games + 1,
						winning_ratio = (nb_won_games * 1.0) / (nb_games + 1.0)
					WHERE login = NEW.login_loser;
				END;
			`);
});

export async function getUserByEmail(email) {
	db = await open({
			filename: dbPath,
			driver: sqlite3.Database,
		});
		console.log('Base de données ouverte');
	try {
		const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
		console.log('UserMail trouvé en base:', user);
		return (user);
	} catch (err) {
		console.error('Erreur dans getUserByEmail:', err);
		throw err;
	}
}

// export async function getUsers() {
// 	return db.all("SELECT login, email FROM users");
// }

export default { db, getUserByEmail }; // exporter la dase de donnee pour pouvoir l'importer dans db_server.js

//todo salt_key ? cle de cryptage des mdp

/* Fermeture de la base de donnee:
db.close((err)=>{
	if (err) console.error("Erreur de fermeture de la base de donnees: ", err.message);
	else console.log("Connexion a la base de donnees fermee.");
}); */
