# Day UP

Plataforma web mobile-first para acompanhamento de rotinas diárias, no estilo "match history" (OP.GG, DeepLoL).

## Estrutura

```
DayUP/
├── backend/           FastAPI + SQLAlchemy + Alembic
├── frontend/          React + Vite + TanStack Query + Tailwind
├── docker-compose.yml Postgres + Redis para desenvolvimento
└── CLAUDE.md          Briefing do produto
```

## Pré-requisitos

- Docker Desktop
- Python 3.11+
- Node 20+ e npm

## Subindo o ambiente de desenvolvimento

### 1. Banco de dados e Redis

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -e ".[dev]"
copy .env.example .env          # Windows
# cp .env.example .env          # macOS/Linux
alembic upgrade head
uvicorn app.main:app --reload
```

API em http://localhost:8000 — docs em http://localhost:8000/docs.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App em http://localhost:5173.
