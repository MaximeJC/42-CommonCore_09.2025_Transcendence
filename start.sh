#!/bin/bash

# ==============================================================================
# SCRIPT DE GESTION
# ==============================================================================

# --- CONFIGURATION DES COULEURS (syntaxe amelioree) ---
RED=$'\e[0;31m'
NC=$'\e[0m' # No Color

# --- FONCTION DE NETTOYAGE ---
# Cette fonction sera appelee a la fin du script, quoi qu'il arrive.
cleanup() {
    echo "" # Saut de ligne pour la clarte
    echo "Nettoyage des processus en arriere-plan..."
    # La commande 'jobs -p' liste les PIDs de tous les processus lances en arriere-plan
    # On les tue tous. 2>/dev/null evite les messages d'erreur si un processus est deja mort.
    local pids_to_kill=$(jobs -p)
    if [ -n "$pids_to_kill" ]; then
        kill $pids_to_kill 2>/dev/null
    fi
    echo "Script arrete proprement."
}

# On dit au script d'executer la fonction 'cleanup' quand il recoit un de ces signaux :
# EXIT: fin du script (normale ou sur erreur)
# INT:  Interruption (Ctrl+C)
# TERM: Demande de terminaison
trap cleanup EXIT INT TERM


# Fonction pour executer une commande et colorer sa sortie d'erreur (stderr)
run_with_colored_errors() {
    eval "$1" 2> >(sed "s/^/${RED}ERROR: &${NC}/" >&2)
}

# Fonction pour forcer la version de Node.js
force_node_version() {
  # Definit le chemin standard pour NVM et essaie de le charger s'il existe
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

  # Verifie si la commande 'nvm' est disponible
  if ! command -v nvm &> /dev/null; then
    echo "NVM n'est pas installe. Lancement de l'installation..."
    
    # Telecharge et execute le script d'installation de NVM
    if curl -s -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash; then
      echo "NVM a ete installe avec succes."
      # Ligne cruciale : on doit recharger le script nvm.sh pour l'utiliser
      # dans cette session de script actuelle.
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
      echo -e "${RED}ERREUR: L'installation de NVM a echoue.${NC}"
      return 1
    fi
    
    # Verification finale apres l'installation
    if ! command -v nvm &> /dev/null; then
      echo -e "${RED}ERREUR: NVM installe, mais non charge. Veuillez relancer le script.${NC}"
      return 1
    fi
  fi
  
  echo "Verification de la version de Node.js..."
  # Installe la version 22 si elle n'est pas la. Ne fait rien si elle est deja installee.
  nvm install 22
  # Active la version 22 pour ce script
  nvm use 22
  
  # Verification finale que node est bien la
  if ! command -v node &> /dev/null; then
    echo -e "${RED}ERREUR: Node.js n'a pas ete installe correctement par NVM.${NC}"
    return 1
  fi

  echo "Utilisation de Node.js version $(node -v)"
}

# Fonction pour installer toutes les dependances
install_all_dependencies() {
  echo "--- Verification et installation des dependances ---"
  
  PROJECT_DIRS=("./" "./front-end/ft_transcendence_front" "./pong-server" "./ia-server")

  for dir in "${PROJECT_DIRS[@]}"; do
    if [ -f "${dir}/package.json" ]; then
      echo "Installation des dependances pour : ${dir}"
      (cd "$dir" && npm install)
    fi
  done
  echo "--- Toutes les dependances sont a jour. ---"
  echo ""
}

# Fonction pour afficher le menu
show_menu() {
    echo "========================================="
    echo "         MENU DE GESTION DU PROJET       "
    echo "========================================="
    echo "1) Start Front       (seul)"
    echo "2) Start DB          (seul)"
    echo "3) Lancer Front + DB (logs melanges, erreurs en rouge)"
    echo "4) Start Pong Server (seul)"
    echo "5) Start Server IA   (seul)"
    echo "6) Lancer Pong + IA  (logs melanges, erreurs en rouge)"
    echo "7) TOUT LANCER       (logs melanges, erreurs en rouge)"
    echo "q) Quitter"
    echo "-----------------------------------------"
}

# --- DEBUT DU SCRIPT ---

force_node_version || exit 1
install_all_dependencies

show_menu
read -p "Faites votre choix : " choice

# La logique pour les lancements multiples
case $choice in
    1)
      echo "Lancement du front-end..."
      run_with_colored_errors "cd ./front-end/ft_transcendence_front && npm run dev"
      ;;
    2)
      echo "Lancement du serveur de base de donnees..."
      run_with_colored_errors "node ./back-end/database/db_server.js"
      ;;
    3)
      echo "Lancement du front-end et de la DB..."
      run_with_colored_errors "cd ./front-end/ft_transcendence_front && npm run dev" &
      run_with_colored_errors "node ./back-end/database/db_server.js" &
      ;;
    4)
      echo "Lancement du serveur Pong..."
      run_with_colored_errors "cd ./pong-server && node server.js"
      ;;
    5)
      echo "Lancement du serveur IA..."
      run_with_colored_errors "cd ./ia-server && node serverIA.js"
      ;;
    6)
      echo "Lancement des serveurs Pong et IA..."
      run_with_colored_errors "cd ./pong-server && node server.js" &
      run_with_colored_errors "cd ./ia-server && node serverIA.js" &
      ;;
    7)
      echo "Lancement de TOUS les services..."
      run_with_colored_errors "cd ./front-end/ft_transcendence_front && npm run dev" &
      run_with_colored_errors "node ./back-end/database/db_server.js" &
      run_with_colored_errors "cd ./pong-server && node server.js" &
      run_with_colored_errors "cd ./ia-server && node serverIA.js" &
      ;;
    [qQ])
      # Le trap 'cleanup' s'occupera de tout arreter a la sortie.
      exit 0
      ;;
    *)
      echo "Choix invalide."
      exit 1
      ;;
esac

# Si une des options multiples a ete choisie, on attend ici.
if [[ "$choice" =~ ^[367]$ ]]; then
    echo ""
    echo -e "${RED}Tous les services sont lances. Appuyez sur Ctrl+C pour tout arreter proprement.${NC}"
    # 'wait' attend que tous les processus en arriere-plan se terminent,
    # ou il peut etre interrompu par Ctrl+C.
    wait
fi