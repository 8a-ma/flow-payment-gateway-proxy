# 1. Identificadores (Cambiarlos si cambias el nombre del servicio en el yaml)
COMPOSE_FILE=docker-compose.yml
APP_SERVICE=app-dev
REDIS_SERVICE=redis-db
IMAGE_NAME=flow-payment-proxy-app-dev # Nombre que Docker Compose asigna por defecto (directorio-servicio)

.PHONY: help dev-up clean logs ps

help:
	@echo "Comandos disponibles:"
	@echo "  make dev-up    - Construye y levanta el entorno (App + Redis)"
	@echo "  make clean     - Detiene, elimina contenedores, volúmenes e imágenes del proyecto"
	@echo "  make logs      - Muestra los logs en tiempo real"
	@echo "  make ps        - Lista los contenedores del proyecto"

# --- DESARROLLO ---
dev-up:
	@echo "🚀 Construyendo y levantando servicios con Docker Compose..."
	# --build fuerza la reconstrucción de la imagen de la app
	# -d corre en segundo plano para que el Makefile no se bloquee
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "✅ Entorno listo. Conectando a los logs..."
	docker compose -f $(COMPOSE_FILE) logs -f

# --- MONITOREO ---
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

ps:
	docker compose -f $(COMPOSE_FILE) ps

# --- LIMPIEZA QUIRÚRGICA ---
clean:
	@echo "🧹 Deteniendo y eliminando contenedores del proyecto..."
	# down elimina contenedores y la red interna creada por compose
	# -v elimina los volúmenes (limpia la data de Redis)
	# --rmi local elimina la imagen construida específicamente para este proyecto
	docker compose -f $(COMPOSE_FILE) down -v --rmi local
	@echo "✨ Limpieza completada. No se tocaron imágenes ni contenedores externos."