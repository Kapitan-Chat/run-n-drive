# KapitanChat Backend
Бекенд частина чату KapitanChat.
## Технології використані
- Django
- Django Rest Framework
- Django Channels
- Redis (для Django channels)

## Функціонал
- Створення користувача
- Авторизація (JWT)
- Створення приватного чату (1 на 1)
- Створення групового чату (1+)
- Надсилання повідомлень (WS)

# Схема API
## REST API
Усі REST ендпоінти опісані у `http(s)://<your_backend_instance_endpoint>/swagger`

## Websocket
Усі запити відправляються на `ws(s)://<your_backend_instance_endpoint>/ws/chat?token=<user_access_token>`

Усі запити мають таку структуру:
```py
type: str
data: dict[str, Any]
```
Приклад:
```json
{
  "type": "ping",
  "data": {}
}
```

### Список запитів
1. **Відправка повідомлення**
```py
type: "message"
data: Message
```

2. **Змінення повідомлення**
```py
type: "message_edit"
data: Message
```

3. **Видалення повідомлення**
```py
type: "message_delete"
data: { "id": int, "chat": Chat }
```
`chat_id` з'являється тільки при полученні пакету, його відправляти не треба

# Запуск та тестування
*При запуску у продакшені змінити `DEBUG` на `False` у settings.py

1. Встановити усі залежності
```
pip install -r requirements.txt
```
2. Налаштувати CORS у settings.py
3. Змінити данні Redis у settings.py
4. Запустити проект командою
```
uvicorn kapitan_chat_backend.asgi:application
```
