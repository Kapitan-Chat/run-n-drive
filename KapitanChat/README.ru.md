![kapita_chat](/../ImgBranch/ImgForBaseReadMe/Kapitan_chat.png)
# Kapitan Chat
is chat for real ♂ pirates ♂ 


## Оглавление

- [О проекте](#о-проекте)
- [Основные возможности](#основные-возможности)
- [Архитектура](#архитектура)
- [Стек технологий](#стек-технологий)
- [Модели](#модели)
- [Начало работы](#начало-работы)
  - [Предварительные требования](#предварительные-требования)
  - [Установка backend](#установка-backend)
  - [Установка frontend](#установка-frontend)
  - [Переменные окружения для фронта](#переменные-окружения-для-фронта)

- [Контакты](#контакты)

## О проекте

`Kapitan Chat` — pet-проект чата, собранный как учебный и экспериментальный стенд для:
- отработки full-stack паттернов (React + Django REST);
- работы с WebSocket-ами и real-time обновлением сообщений;
- реализации пользовательских настроек (тема, язык, локаль);
- практики Git-workflow (ветки, PR, мерджи, конфликты).


## Основные возможности

- **Регистрация и авторизация**
  - аутентификация по JWT-токенам;
  - хранение токенов на клиенте и автоматическое подставление в запросы.

- **Список чатов и переписка**
  - список диалогов;
  - просмотр истории сообщений;
  - индикаторы выбранного чата.

- **`Double-chat` режим**
  - одновременное открытие двух чатов;
  - ресайз панелей (resizable-layout);
  - удобная работа с несколькими диалогами.

- **Настройки пользователя**
  - выбор языка интерфейса (локали в JSON-файлах);
  - переключение темы (светлая / тёмная);
  - хранение настроек на backend-е.

- **Работа с сообщениями**
  - отправка текстовых сообщений;
  - редактирование и удаление сообщений;
  - поддержка вложений (файлов).

- **Real-time интерфейс**
  - обновление сообщений без перезагрузки страницы;
  - WebSocket-соединение для чатов.

## Архитектура

Репозиторий организован как монорепо:

```text
KapitanChat/
  kapitan_chat_backend/   # Django + DRF backend
  kapitan_chat_frontend/  # React frontend
  README.md
  LICENSE
  package-lock.json
```
>[!NOTE]
>СТЕК ТЕХНОЛОГИЙ
## Стек технологий

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

- Прочее
  - WebSocket / Django Channels (чат в реальном времени)
  - GitHub как основное хранилище кода

## Модели
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


                    Пользователи и чаты
┌───────────────────────────────────────────────────────────────────┐
│                              Chat                                │
├───────────────────────────────────────────────────────────────────┤
│ id          : PK                                                │
│ name        : Char(32, blank=True)                              │
│ description : Char(256, blank=True)                             │
│ type        : ChatType (enum)                                   │
│ created_at  : DateTime                                          │
│ updated_at  : DateTime                                          │
│ created_by  : FK → User                                         │
│ users       : ManyToMany → User (участники чата)                │
└───────────────────────────────────────────────────────────────────┘
             ▲                         ▲
             │                         │
             │ created_by (FK)         │ M2M (many users ↔ many chats)
             │                         │


        ┌───────────────────────┐
        │       ChatType        │
        ├───────────────────────┤
        │ DIRECT   (личный)     │
        │ GROUP    (группа)     │
        │ CHANNEL  (канал)      │
        └───────────────────────┘


                         Сообщения и файлы
┌───────────────────────────────────────────────────────────────┐
│                          Message                             │
├───────────────────────────────────────────────────────────────┤
│ id         : PK                                              │
│ content    : Text (null=True)                               │
│ is_edited  : bool                                           │
│ created_at : DateTime                                       │
│ user       : FK → User (автор)                              │
│ chat       : FK → Chat (в каком чате сообщение)             │
│ reply_to   : FK → Message (null=True, related_name="replies")│
│             (ответ на другое сообщение)                     │
└───────────────────────────────────────────────────────────────┘
             ▲
             │ 1─many (одно сообщение → много вложений)
             │
┌───────────────────────────────────────────────────────────────┐
│                         Attachment                           │
├───────────────────────────────────────────────────────────────┤
│ id         : PK                                              │
│ name       : Char (имя файла)                                │
│ storage_id : Char (ID файла во внешнем хранилище, null=True) │
│ type       : Char (MIME / тип файла)                         │
│ message    : FK → Message (null=True, on_delete=SET_NULL)    │
└───────────────────────────────────────────────────────────────┘

```


>[!WARNING]
>НАЧАЛО РОБОТЫ
## Начало работы 
 ### Предварительные требования
 - Git
 - Python ≥ 3.12
 - Node.js ≥ 18
 - npm
### Установка backend
```
cd kapitan_chat_backend

# виртуальное окружение
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# зависимости
pip install -r requirements.txt

#создать миграцию
py manage.py makemigrations

# миграции
python manage.py migrate

# запуск
uvicorn kapitan_chat_backend.asgi:application --reload
```
>[!Warning]
>перед вписыванием команд открыть второй терминал

### Установка frontend 
```
cd kapitan_chat_frontend

# установка npm-зависимостей
npm install

#запуск
npm run dev

```
### Переменные окружения для фронта
>[!Warning]
>для `VITE_BASE_FMS_URL` для файлов
>надо качать дополнительный микросервис
>с https://github.com/Kapitan-Chat/StorageService

>[!note]
>создайте .env в корне фронтенд-проекта и запишите туда переменные среды
```env
VITE_BASEAPI="http://127.0.0.1:8000/api"
VITE_BASE_WS_URL="ws://127.0.0.1:8000/api"
VITE_BASE_FMS_URL="http://127.0.0.1:8000/"
```



Apache 2.0 License
