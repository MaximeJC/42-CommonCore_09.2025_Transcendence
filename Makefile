COMPOSE_PROJECT_NAME = transcendence
COMPOSE_FILE = srcs/docker-compose.yml
COMPOSE_PROD_FILE = srcs/docker-compose.prod.yml

#! RULES

.PHONY: all up build start down stop restart clean re logs fclean mkdir dev prod

all: up

# Développement - arrete la prod si necessaire et lance la dev
dev: mkdir
	@echo "Switching to DEVELOPMENT mode..."
	@echo "Stopping production containers..."
	@docker compose -f $(COMPOSE_PROD_FILE) --project-name $(COMPOSE_PROJECT_NAME) down 2>/dev/null || true
	@echo "Starting development services..."
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) up --build -d --remove-orphans

# Production - arrete la dev si necessaire et lance la prod
prod: mkdir
	@echo "Switching to PRODUCTION mode..."
	@echo "Stopping development containers..."
	@docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) down 2>/dev/null || true
	@echo "Starting production services..."
	docker compose -f $(COMPOSE_PROD_FILE) --project-name $(COMPOSE_PROJECT_NAME) up --build -d --remove-orphans

up: mkdir
	@echo "Starting $(COMPOSE_PROJECT_NAME) services..."
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) up --build -d --remove-orphans

build: up

start: up

down:
	@echo "Stopping $(COMPOSE_PROJECT_NAME) services..."
	@docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) down 2>/dev/null || true
	@docker compose -f $(COMPOSE_PROD_FILE) --project-name $(COMPOSE_PROJECT_NAME) down 2>/dev/null || true

stop: down

restart: down up

# Stops the containers and removes volumes
clean:
	@echo "Cleaning up all containers and volumes..."
	@docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) down -v 2>/dev/null || true
	@docker compose -f $(COMPOSE_PROD_FILE) --project-name $(COMPOSE_PROJECT_NAME) down -v 2>/dev/null || true

# Full cleanup: containers, volumes, networks, and images
fclean: clean
	@echo "Performing full Docker system cleanup..."
	@docker volume rm transcendence_user_management_db transcendence_prod_front_avatars transcendence_user_avatars transcendence_front_avatars 2>/dev/null || true
	@docker system prune -af --volumes

re: fclean prod

logs:
	@docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) logs -f -t 2>/dev/null || docker compose -f $(COMPOSE_PROD_FILE) --project-name $(COMPOSE_PROJECT_NAME) logs -f -t

ps:
	@docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) ps 2>/dev/null || true
	@docker compose -f $(COMPOSE_PROD_FILE) --project-name $(COMPOSE_PROJECT_NAME) ps 2>/dev/null || true

mkdir:
	cd ${HOME} && mkdir -p hgp_data
	cd ${HOME}/hgp_data && mkdir -p database avatars
