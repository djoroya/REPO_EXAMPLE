# Instalación y ejecución

## Requisitos
- Python 3.9+
- Node.js 18+

## Instalación
Ejecuta el script que instala dependencias de backend y frontend:

```bash
./scripts/install.sh
```

## Inicio del proyecto
Inicia la API de Flask y el frontend en modo desarrollo:

```bash
./scripts/start.sh
```

La API quedará en `http://localhost:5000` y el frontend en `http://localhost:5173`.

## Variables de entorno
Si necesitas apuntar el frontend a otra API, configura:

```bash
VITE_API_URL="http://localhost:5000"
```
