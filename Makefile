# Cargamos las variables del .env para usarlas en el Makefile si es necesario
ifneq ("$(wildcard .env)","")
    include .env
    export $(shell sed 's/=.*//' .env)
endif

# Variables de configuración
IMAGE_NAME=flow-payment-proxy
CONTAINER_NAME=flow-proxy-instance
REDIS_CONTAINER=redis-flow-proxy
PORT=8080

# Comando para leer el .env y transformarlo en flags de Docker --env KEY=VAL
ENV_FLAGS=$(shell [ -f .env ] && grep -v '^\#' .env | xargs -I {} echo "--env {}")

.PHONY: help redis-up dev-up prod-up clean

help:
	@echo "Comandos disponibles:"
	@echo "  make redis-up  - Levanta solo el contenedor de Redis"
	@echo "  make dev-up    - Levanta Redis + App en modo Desarrollo"
	@echo "  make prod-up   - Levanta Redis + App en modo Producción"
	@echo "  make clean     - Elimina TODO (App, Redis e Imágenes)"

# --- INFRAESTRUCTURA (REDIS) ---
redis-up:
	@echo "🗄️  Levantando Redis..."
	@docker stop $(REDIS_CONTAINER) 2>/dev/null || true
	@docker rm $(REDIS_CONTAINER) 2>/dev/null || true
	docker run -d \
		--name $(REDIS_CONTAINER) \
		-p $(REDIS_PORT):6379 \
		--network bridge \
		redis:7-alpine redis-server --requirepass $(REDIS_PASSWORD)
	@echo "✅ Redis escuchando en el puerto $(REDIS_PORT)"

# --- ENTORNO DE DESARROLLO ---
dev-up: redis-up
	@echo "🚀 Iniciando App en DESARROLLO..."
	docker build -f deployment/Dockerfile.dev -t $(IMAGE_NAME):dev .
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		--network bridge \
		$(ENV_FLAGS) \
		$(IMAGE_NAME):dev
	docker logs -f $(CONTAINER_NAME)

# --- ENTORNO DE PRODUCCIÓN ---
prod-up: redis-up
	@echo "📦 Iniciando App en PRODUCCIÓN..."
	docker build -f deployment/Dockerfile.prod -t $(IMAGE_NAME):prod .
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		--network bridge \
		$(ENV_FLAGS) \
		$(IMAGE_NAME):prod
	docker logs -f $(CONTAINER_NAME)

# --- LIMPIEZA TOTAL ---
clean:
	@echo "🧹 Limpiando todo el entorno..."
	@docker stop $(CONTAINER_NAME) $(REDIS_CONTAINER) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) $(REDIS_CONTAINER) 2>/dev/null || true
	@docker rmi $(IMAGE_NAME):dev $(IMAGE_NAME):prod 2>/dev/null || true
	@echo "✨ Sistema limpio."