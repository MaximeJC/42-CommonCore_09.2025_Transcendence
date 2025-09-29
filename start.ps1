# ==============================================================================
# SCRIPT DE GESTION (PowerShell)
# ==============================================================================

# --- CONFIGURATION DES COULEURS ---
# PowerShell gère les couleurs différemment. On utilise ici les séquences d'échappement ANSI.
$RED = "$([char]0x1b)[91m"
$NC = "$([char]0x1b)[0m" # No Color

# --- FONCTION DE NETTOYAGE ---
# Cette fonction sera appelée à la fin du script.
function cleanup {
    Write-Host "" # Saut de ligne
    Write-Host "Nettoyage des processus en arrière-plan..."
    # Récupère tous les processus enfants du processus PowerShell actuel
    $jobsToKill = Get-Job
    if ($jobsToKill) {
        $jobsToKill | Stop-Job -PassThru | Remove-Job -Force
    }
    Write-Host "Script arrêté proprement."
}

# Équivalent du 'trap' de Bash. S'exécute à la sortie du script.
$global:PSExit = { cleanup }

# Fonction pour exécuter une commande et afficher les erreurs en rouge.
function Run-WithColoredErrors {
    param($command)
    # L'opérateur '&' exécute la commande. La redirection '2>&1' fusionne les flux d'erreur et de sortie.
    & $command 2>&1 | ForEach-Object {
        if ($_ -is [System.Management.Automation.ErrorRecord]) {
            Write-Host "${RED}ERREUR: $($_.Exception.Message)${NC}"
        } else {
            Write-Host $_
        }
    }
}

# Fonction pour forcer la version de Node.js avec NVM pour Windows.
function Force-NodeVersion {
    # NVM-Windows est différent de NVM pour Linux/macOS
    if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
        Write-Host "NVM for Windows n'est pas installé. Veuillez l'installer depuis https://github.com/coreybutler/nvm-windows"
        return 1
    }

    Write-Host "Vérification de la version de Node.js..."
    # Installe la version 22 si elle n'est pas disponible.
    nvm install 22
    # Active la version 22.
    nvm use 22

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "${RED}ERREUR: Node.js n'a pas été installé correctement par NVM.${NC}"
        return 1
    }

    Write-Host "Utilisation de Node.js version $(node -v)"
}

# Fonction pour installer toutes les dépendances.
function Install-AllDependencies {
    Write-Host "--- Vérification et installation des dépendances ---"
    
    $projectDirs = @("./srcs/requirements/front_end/server_files", "./srcs/requirements/game_management/server_files", "./srcs/requirements/ai_server/server_files", "./srcs/requirements/user_management/server_files")

    foreach ($dir in $projectDirs) {
        if (Test-Path -Path "$dir/package.json") {
            Write-Host "Installation des dépendances pour : $dir"
            Push-Location -Path $dir
            npm install
            Pop-Location
        }
    }
    Write-Host "--- Toutes les dépendances sont à jour. ---"
    Write-Host ""
}

# Fonction pour afficher le menu.
function Show-Menu {
    Write-Host "========================================="
    Write-Host "         MENU DE GESTION DU PROJET       "
    Write-Host "========================================="
    Write-Host "1) Start Front       (seul)"
    Write-Host "2) Start DB          (seul)"
    Write-Host "3) Lancer Front + DB (logs séparés)"
    Write-Host "4) Start Pong Server (seul)"
    Write-Host "5) Start Server IA   (seul)"
    Write-Host "6) Lancer Pong + IA  (logs séparés)"
    Write-Host "7) TOUT LANCER       (logs séparés)"
    Write-Host "q) Quitter"
    Write-Host "-----------------------------------------"
}

# --- DÉBUT DU SCRIPT ---

# Assurez-vous que la politique d'exécution des scripts autorise leur exécution.
# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Force-NodeVersion
if ($LASTEXITCODE -ne 0) { exit 1 }
Install-AllDependencies

Show-Menu
$choice = Read-Host "Faites votre choix"

# Logique pour les lancements multiples.
switch ($choice) {
    "1" {
        Write-Host "Lancement du front-end..."
        Push-Location -Path "./srcs/requirements/front_end/server_files"
        npm run dev
        Pop-Location
    }
    "2" {
        Write-Host "Lancement du serveur de base de données..."
        node "./srcs/requirements/user_management/server_files/db_server.js"
    }
    "3" {
        Write-Host "Lancement du front-end et de la DB..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/front_end/server_files; npm run dev"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/user_management/server_files; node db_server.js"
    }
    "4" {
        Write-Host "Lancement du serveur Pong..."
        Push-Location -Path "./srcs/requirements/game_management/server_files"
        node server.js
        Pop-Location
    }
    "5" {
        Write-Host "Lancement du serveur IA..."
        Push-Location -Path "./srcs/requirements/ai_server/server_files"
        node serverIA.js
        Pop-Location
    }
    "6" {
        Write-Host "Lancement des serveurs Pong et IA..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/game_management/server_files; node server.js"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/ai_server/server_files; node serverIA.js"
    }
    "7" {
        Write-Host "Lancement de TOUS les services..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/front_end/server_files; npm run dev"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/user_management/server_files; node db_server.js"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/game_management/server_files; node server.js"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ./srcs/requirements/ai_server/server_files; node serverIA.js"
    }
    "q" {
        exit 0
    }
    default {
        Write-Host "Choix invalide."
        exit 1
    }
}

# Attente pour les options multiples.
if ("3", "6", "7" -contains $choice) {
    Write-Host ""
    Write-Host "${RED}Tous les services sont lancés dans des fenêtres séparées. Fermez les fenêtres pour arrêter les services.${NC}"
    # Le script se termine ici, mais les nouveaux processus continuent de s'exécuter.
}