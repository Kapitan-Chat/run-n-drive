# StorageService
Мікросервіс для збереження файлів по хешу

## Використані технології
- FastAPI
- sqlite3

## API
Документація доступна за адресою `http://localhost:8001/docs`
### POST /api/file - Завантаження файлу
Запит закодований у `multipart/form-data`

Поля:
- file: file
- hash: string

### GET /api/file - Завантаження файлу
Параметри:
- id: string?
- hash: string?
- file_name: string?
- 
`id` або `hash` мають бути зазначені

## Запуск і використання
1. Встановити залежності
    ```bash
    pip install -r requirements.txt
    ```
2. Налаштувати settings.py
3. Запустити сервіс
    ```bash
    py main.py
    ```