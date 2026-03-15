# megawood Chatbot Dashboard

A simple React + TypeScript dashboard to inspect active chatbot conversations.

## 🚀 Setup

1. Copy `.env.example` to `.env` and set the backend URL + API token:

```bash
cp .env.example .env
# edit .env
```

2. Install dependencies:

```bash
npm install
```

3. Start dev server:

```bash
npm run dev
```

4. Open the URL shown in the terminal (standard: http://localhost:5173)

## 🧠 Features

- List recent conversations (`GET /conversations`)
- View full conversation history for a selected ID (`GET /conversation/{id}`)

## 🔒 API Requirements

The dashboard uses bearer token authentication. Make sure the backend has `API_TOKEN` set and the same token is configured in `.env`.

## 🧩 Backend enhancements

This dashboard requires the backend to expose two endpoints:

- `GET /conversations` — list recent conversation IDs + last update
- `GET /conversation/{id}` — get full stored history for a conversation

If these endpoints are missing, add them to `api/mw-chatbot-backend.py`.
