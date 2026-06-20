# KapitanChat backend — Django + DRF + Channels, served over ASGI with uvicorn
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Apply migrations on start, then launch the ASGI app (HTTP + WebSocket).
CMD ["sh", "-c", "python manage.py migrate --noinput && uvicorn kapitan_chat_backend.asgi:application --host 0.0.0.0 --port 8000"]
