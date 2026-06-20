![kapita_chat](/../ImgBranch/ImgForBaseReadMe/Kapitan_chat.png)
# Kapitan Chat
is chat for real ♂ pirates ♂ 


## Зміст

- [Про проєкт](#про-проєкт)
- [Основні можливості](#основні-можливості)
- [Архітектура](#архітектура)
- [Стек технологій](#стек-технологій)
- [Моделі](#моделі)
- [Початок роботи](#початок-роботи)
  - [Початкові вимоги](#початкові-вимоги)
  - [Встановлення backend](#встановлення-backend)
  - [Встановлення frontend](#встановлення-frontend)
  - [Змінні середовища](#змінні-середовища-для-фронтенду)

- [Контакти](#контакти)

## Про проєкт

`Kapitan Chat` — pet-проєкт чату, зібраний як навчальний та експериментальний стенд для:
- відпрацювання full-stack патернів (React + Django REST);
- роботи з WebSocket-ами та real-time оновленням повідомлень;
- реалізації користувацьких налаштувань (тема, мова, локаль);
- практики Git-workflow (гілки, PR, merge, конфлікти).


## Основні можливості

- **Реєстрація та авторизація**
  - автентифікація за допомогою JWT-токенів;
  - зберігання токенів на клієнті та автоматичне підставлення в запити.

- **Список чатів і переписка**
  - список діалогів;
  - перегляд історії повідомлень;
  - індикатори вибраного чату.

- **Режим `Double-chat`**
  - одночасне відкриття двох чатів;
  - зміна розміру панелей (resizable-layout);
  - зручна робота з кількома діалогами.

- **Налаштування користувача**
  - вибір мови інтерфейсу (локалі в JSON-файлах);
  - перемикання теми (світла / темна);
  - зберігання налаштувань на backend-і.

- **Робота з повідомленнями**
  - надсилання текстових повідомлень;
  - редагування та видалення повідомлень;
  - підтримка вкладень (файлів).

- **Real-time інтерфейс**
  - оновлення повідомлень без перезавантаження сторінки;
  - WebSocket-з’єднання для чатів.

## Архітектура

Репозиторій організований як монорепозиторій:

```text
KapitanChat/
  kapitan_chat_backend/   # Django + DRF backend
  kapitan_chat_frontend/  # React frontend
  README.md
  LICENSE
  package-lock.json
```
>[!Note]
>СТЕК ТЕХНОЛОГІЙ
## Стек технологій
- Backend
  - Python 3.x
  - Django
  - Django REST Framework
  - djangorestframework-simplejwt (JWT-аутентификация)
  - django-cors-headers

- Frontend
  - React
  - Vite (dev-сервер и сборка)
  - react-router-dom
  - axios
  - [emoji-mart](https://github.com/missive/emoji-mart?tab=readme-ov-file)
  - [resizable-panel](https://react-resizable-panels.vercel.app/)

- Інше
  - WebSocket / Django Channels (чат в реальном часі)
  - GitHub як сховище
## Моделі
```
                ┌────────────────────────────────────┐
                │              User                  │
                │  (django.contrib.auth.models.User) │
                └────────────────────────────────────┘
                   │1                              1│
                   │ OneToOne                       │
                   ▼                                ▼
   ┌───────────────────────────┐      ┌───────────────────────────┐
   │         Profile           │      │       UserSettings        │
   ├───────────────────────────┤      ├───────────────────────────┤
   │ user : OneToOne → User    │      │ user    : OneToOne → User │
   │ bio  : Text               │      │ language: Lang (enum)     │
   │ phone_number : Char(16)   │      │ theme   : bool (dark?)    │
   │ profile_picture_id : str  │      └───────────────────────────┘
   └───────────────────────────┘
                                         ▲
                                         │
                                         │ uses
                                         │
                             ┌───────────────────────┐
                             │         Lang          │
                             ├───────────────────────┤
                             │ another               │
                             │ en-US                 │
                             │ ru-RU                 │
                             │ uk-UA                 │
                             └───────────────────────┘


                    Користувачі та чати
┌───────────────────────────────────────────────────────────────────┐
│                              Chat                                │
├───────────────────────────────────────────────────────────────────┤
│ id          : PK                                                 │
│ name        : Char(32, blank=True)                               │
│ description : Char(256, blank=True)                              │
│ type        : ChatType (enum)                                    │
│ created_at  : DateTime                                           │
│ updated_at  : DateTime                                           │
│ created_by  : FK → User                                          │
│ users       : ManyToMany → User (учасники чату)                  │
└───────────────────────────────────────────────────────────────────┘
             ▲                         ▲
             │                         │
             │ created_by (FK)         │ M2M (many users ↔ many chats)
             │                         │


        ┌───────────────────────┐
        │       ChatType        │
        ├───────────────────────┤
        │ DIRECT   (особистий)  │
        │ GROUP    (група)      │
        │ CHANNEL  (канал)      │
        └───────────────────────┘


                    Повідомлення та файли
┌───────────────────────────────────────────────────────────────┐
│                          Message                             │
├───────────────────────────────────────────────────────────────┤
│ id         : PK                                              │
│ content    : Text (null=True)                               │
│ is_edited  : bool                                           │
│ created_at : DateTime                                       │
│ user       : FK → User (автор)                              │
│ chat       : FK → Chat (у якому чаті повідомлення)          │
│ reply_to   : FK → Message (null=True, related_name="replies")│
│             (відповідь на інше повідомлення)                │
└───────────────────────────────────────────────────────────────┘
             ▲
             │ 1─many (одне повідомлення → багато вкладень)
             │
┌───────────────────────────────────────────────────────────────┐
│                         Attachment                           │
├───────────────────────────────────────────────────────────────┤
│ id         : PK                                              │
│ name       : Char (назва файлу)                             │
│ storage_id : Char (ID файлу у зовнішньому сховищі, null=True)│
│ type       : Char (MIME / тип файлу)                        │
│ message    : FK → Message (null=True, on_delete=SET_NULL)   │
└───────────────────────────────────────────────────────────────┘


```
>[!WARNING]
>ПОЧАТОК РОБОТИ
## Початок роботи
### Початкові вимоги 
- Git
- Python ≥ 3.12
- Node.js ≥ 18
- npm
### Встановлення backend
```sh
cd kapitan_chat_backend

# віртуальне оточення
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# залежності
pip install -r requirements.txt

# створити міграцію
py manage.py makemigrations

# застосувати міграції
python manage.py migrate

# запуск backend
uvicorn kapitan_chat_backend.asgi:application --reload
```
>[!Warning]
>Перед вписуванням команд, відкрійте другий термінал

### Встановлення frontend
```sh
cd kapitan_chat_frontend

# встановлення npm-залежностей
npm install

# запуск dev-сервера
npm run dev

```
## Змінні середовища для фронтенду
>[!Warning]
>для `VITE_BASE_FMS_URL` (файли)
>потрібно запустити додатковий мікросервіс
>з https://github.com/Kapitan-Chat/StorageService

>[!note]
>створіть файл `.env` у корені фронтенд-проєкту та запишіть туди змінні середовища

```env
VITE_BASEAPI="http://127.0.0.1:8000/api"
VITE_BASE_WS_URL="ws://127.0.0.1:8000/api"
VITE_BASE_FMS_URL="http://127.0.0.1:8000/"
```

Ліцензія Apache 2.0
