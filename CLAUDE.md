# Prompt — Day UP (Claude Code)

## Contexto

Estou construindo a **Day UP**, uma plataforma web de acompanhamento de rotinas diárias. O visual de referência é o estilo "match history" de sites como OP.GG e DeepLoL — histórico de dias com cards compactos, métricas em destaque e leitura rápida de performance.

É um **web app no navegador**, mas a grande maioria dos usuários vai acessar pelo **celular**. O design deve ser **mobile-first** — construir primeiro para telas pequenas e adaptar para desktop, nunca o contrário. Não há planos de app nativo (iOS/Android) por enquanto, mas a experiência mobile no navegador é prioridade desde o primeiro componente.

---

## Responsividade — Mobile First

O app será acessado majoritariamente pelo celular no navegador. **Mobile-first é inegociável** — todo componente e tela começa pelo mobile e escala para desktop, nunca o contrário.

### Breakpoints
- **Mobile:** < 640px — layout de coluna única, touch-friendly
- **Tablet:** 640px–1024px — adaptações intermediárias onde necessário
- **Desktop:** > 1024px — layout completo com sidebar

### Sidebar no mobile
A sidebar fixa à esquerda não cabe em mobile. No mobile ela vira:
- **Bottom navigation bar** fixa no rodapé (padrão mobile nativo) — ícones + label curto
- Ou **drawer** que abre por swipe/botão hamburguer — a definir

### Regras de design mobile
- Todos os alvos de toque com no mínimo **44x44px**
- Fontes legíveis sem zoom — mínimo 16px para texto corrido
- Scroll vertical como padrão — evitar scroll horizontal
- Cards do histórico ocupam a largura total em mobile
- Check-in diário deve ser fluido e rápido no touch — é o gesto mais frequente do app
- Índices do topo em grid 2x2 no mobile (em vez de linha horizontal)
- Evitar hovers como única forma de revelar informação — hover não existe no touch

### Referências de tela para testar
- iPhone SE (375px) — menor tela relevante
- iPhone 14 (390px) — referência principal
- Android médio (360px)
- iPad (768px)

---

## Stack

- **Backend:** FastAPI + PostgreSQL (hospedado no Neon — free tier) + SQLAlchemy + Alembic + Celery + Redis
- **Frontend:** React + Vite + TanStack Query
- **Autenticação:** a definir (JWT simples por enquanto)

**Princípios de desenvolvimento:**
- Segurança em primeiro lugar — validação no backend, nunca confiar no frontend
- Evitar overengineering — manter o código simples, legível e direto
- Sem abstrações prematuras — só criar camadas quando houver necessidade real
- Nomear as coisas de forma clara e consistente

---

## Design

### Skills de design — leitura obrigatória antes de qualquer código de interface

Antes de escrever qualquer componente, página ou estilo, leia as três skills de design do projeto:

```
.claude/skills/frontend-design/SKILL.md
.claude/skills/ui-ux-pro/SKILL.md
.claude/skills/web-design-guidelines/SKILL.md
```

Essas skills definem padrões, tokens, convenções e decisões de design do projeto. Elas têm prioridade sobre qualquer suposição ou padrão genérico. Sempre consulte antes de tomar decisões visuais ou de componentes.

### Referência visual
Estilo "match history" — OP.GG, DeepLoL. Cada dia é um card com métricas visíveis, histórico denso mas legível.

### Diretrizes gerais de design
- Evitar estética genérica de IA — sem Inter, Roboto, paletas roxas, layouts previsíveis
- Tipografia com personalidade — escolher fontes que combinem com o tom do produto
- Motion com intenção — micro-interações nos momentos certos, não em tudo
- Layouts com composição — assimetria, espaço negativo intencional, hierarquia visual clara
- Profundidade visual — sombras, gradientes sutis, texturas leves onde cabem

### Paleta de cores (temporária — pode evoluir)
- **Background/base:** preto-cinza levemente quente/marrom (ex: `#1C1917`, `#292524`, `#44403C`)
- **Superfícies:** tons um pouco mais claros que o base (`#3C3835`, `#57534E`)
- **Texto principal:** off-white quente (`#FAFAF9`, `#E7E5E4`)
- **Texto secundário:** cinza quente médio (`#A8A29E`, `#78716C`)
- **Ação / botões / destaques:** gradiente amarelo-laranja (`#F59E0B` → `#EA580C`)
- **Estados do dia:**
  - Registrado: verde (`#22C55E`)
  - Day Off: azul suave (`#60A5FA`)
  - Não registrado: vermelho/alerta (`#EF4444`) com ícone ⚠️

### Layout principal
- **Sidebar fixa à esquerda** — navegação principal do app
- **Conteúdo à direita** — área principal com home, metas, perfil etc.

---

## Funcionalidades do MVP

### Metas
- Usuário cria metas personalizadas com nome e categoria
- Cada meta tem **peso**: baixa (1), média (2), alta (3)
- Metas são **recorrentes por dia da semana** (ex: toda segunda e quarta → treinar)
- Onboarding com biblioteca de metas comuns organizadas por categoria
- Categorias: 💪 Saúde, 📚 Estudo, 🧘 Bem-estar, 🍎 Alimentação, 💤 Sono

### Check-in diário
- Janela de registro: **até 48 horas após o dia**
- 4 níveis de cumprimento por meta (nomes temporários):
  - ❌ Não feito → multiplicador 0.0
  - 🟡 Intensidade fraca → 0.4
  - 🟠 Intensidade média → 0.7
  - 🟢 Perfeição → 1.0

### Cálculo do score
```
Score = (Σ peso × nível) / (Σ todos os pesos) × 100
```
Resultado: 0 a 100.

### Estados do dia
| Estado | Score médio | Consistência | Streak |
|---|---|---|---|
| ✅ Registrado | Afeta | Positivo | Mantém |
| 🏖️ Day Off | Não afeta | Neutro | Mantém |
| ⚠️ Não registrado (>48h) | Não afeta | Negativo | Quebra |

**Day Off:** pode ser declarado a qualquer momento, sem janela de tempo.

---

## Tela Principal (Home)

### Topo — 4 índices

**Streak:**
- Streak atual < recorde → recorde em destaque, atual menor e discreto abaixo
- Streak atual = recorde → badge comemorativa
- Streak atual > recorde → apenas o atual em destaque total

**3 métricas:**
- 📊 Consistência — % de dias registrados desde o início
- ⭐ Score médio geral — média de todos os dias registrados
- 📅 Score últimos 14 dias — com seta de variação vs. período anterior (↑ ↓)

### Histórico
- Últimos **14 dias** visíveis por padrão
- Paginação para carregar dias anteriores
- Cada dia = card com score em destaque + indicador de estado
- Estilo visual: compacto e denso como match history

---

## Notificações (backend)
- Push no final do dia lembrando o check-in
- Alerta quando faltam menos de 24h para o prazo de um dia expirar

---

## Landing Page

Página única separada do app, com:
- **Hero** — headline forte + CTA de cadastro
- **Como funciona** — 3 a 4 passos do loop principal
- **Funcionalidades** — metas, score, Day Off, streak
- **Mockup visual** — estilo OP.GG aplicado à rotina
- **CTA final** — cadastro

Design elegante, claro e direto. Mesma identidade visual do app.

---

## Modelo de Dados (rascunho)

```
User
  id, email, password_hash, created_at

Goal (meta recorrente)
  id, user_id, name, category, weight (1|2|3), days_of_week (array)

DayLog (registro de um dia)
  id, user_id, date, status (registered|day_off|missed), score (0-100), created_at

GoalEntry (avaliação de uma meta dentro de um DayLog)
  id, day_log_id, goal_id, level (0.0|0.4|0.7|1.0)
```

---

## O que NÃO fazer no MVP

- Sem metas únicas (data específica) — V2
- Sem integração com IA — V3
- Sem ranking ou funcionalidades sociais
- Sem integração com wearables
- Sem app mobile
- Sem abstrações desnecessárias no backend

---

## Por onde começar

Sugiro a seguinte ordem:

1. Estrutura do projeto (monorepo ou pastas separadas `backend/` e `frontend/`)
2. Modelos de dados + migrações (Alembic)
3. Rotas do backend (FastAPI) — auth, metas, check-in, score
4. Frontend base — layout com sidebar + roteamento
5. Home com histórico e índices
6. Tela de check-in diário
7. Tela de metas (CRUD)
8. Landing page
9. Notificações (Celery + Redis)

---

Pode começar pela estrutura do projeto e me perguntar o que precisar ao longo do caminho.
