COMPOSE_PROJECT_NAME = transcendence
COMPOSE_FILE = srcs/docker-compose.yml

#! RULES

.PHONY: all up build start down stop restart clean re logs fclean

all: up

up:
	@echo "Starting $(COMPOSE_PROJECT_NAME) services..."
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) up --build -d --remove-orphans

build: up

start: up

down:
	@echo "Stopping $(COMPOSE_PROJECT_NAME)  services..."
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) down

stop: down

restart: down up

# Stops the containers and removes volumes
clean:
	@echo "Cleaning up containers and volumes..."
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) down -v

# Full cleanup: containers, volumes, networks, and images
fclean: clean
	@echo "Performing full Docker system cleanup..."
	docker system prune -af --volumes

re: fclean all

logs:
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) logs -f -t

ps:
	docker compose -f $(COMPOSE_FILE) --project-name $(COMPOSE_PROJECT_NAME) ps
