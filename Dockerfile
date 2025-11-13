# 1. Usar una imagen base ligera de Python
FROM python:3.11-slim

# 2. Variables de entorno para evitar archivos .pyc y logs en buffer
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Directorio de trabajo
WORKDIR /app

# 4. Instalar curl (necesario para el HEALTHCHECK)
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 5. Copiar y e instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copiar el código del proyecto
COPY . .

# 7. Exponer el puerto
EXPOSE 8000

# 8. Healthcheck para verificar que la app responde
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8000/ || exit 1

# 9. Comando de inicio
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]