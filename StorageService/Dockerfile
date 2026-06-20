# StorageService — FastAPI file storage microservice
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

# main.py reads HOST/PORT from settings.py (env-driven) and starts uvicorn.
CMD ["python", "main.py"]
