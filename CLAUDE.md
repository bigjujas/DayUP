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
- **Desktop:** > 1024px — layout completo com header e conteúdo centralizado

### Navegação no mobile
A navegação principal fica em um **header horizontal** (não sidebar). No mobile o header se mantém compacto — logo + ícones de navegação, ou menu compacto se necessário. Sem drawer complexo.

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
- **Autenticação:** Session cookies server-side com Redis (cookie HttpOnly). Logout real via remoção da sessão no Redis. Sem JWT — mais seguro e simples para um web app próprio. Login social fica para V2.

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
- **Header horizontal no topo** — navegação principal do app (não sidebar). O Day UP tem poucas seções (Hoje, Histórico, Metas, Perfil), então header é mais adequado e funciona igual em mobile e desktop, sem adaptação. Combina com a referência OP.GG/DeepLoL que também usa header.
- No mobile, a navegação pode virar ícones no header ou menu compacto — sem necessidade de drawer complexo.
- **Estilização:** Tailwind CSS + tokens custom (paleta definida no `tailwind.config`). Sem shadcn/ui ou bibliotecas de componentes prontos — eles puxam para estética genérica que o projeto quer evitar.

---

## Funcionalidades do MVP

### Metas
- Usuário cria metas personalizadas com nome e categoria
- Cada meta tem **peso**: baixa (1), média (2), alta (3)
- Metas são **recorrentes por dia da semana** (ex: toda segunda e quarta → treinar)
- Onboarding com biblioteca de metas comuns organizadas por categoria
- Categorias: 💪 Saúde, 📚 Estudo, 🧘 Bem-estar, 🍎 Alimentação, 💤 Sono

### Tela "Minhas Metas"
Biblioteca pessoal do usuário, separada da tela "Hoje". É onde se cria e edita as atividades — o usuário entra aqui com pouca frequência, só para ajustar a rotina. Mantém a tela "Hoje" limpa e focada na ação diária.

- Cada meta é configurada com: nome, categoria, peso, e **quais dias da semana está ativa** (a seleção de dias acontece na meta, não o contrário — evita repetição e inconsistência).
- Adicionar meta abre a biblioteca de metas comuns (por categoria) ou permite criar do zero.
- Nome da seção: "Minhas Metas" — direto e sem ambiguidade. Evitar "Rotina" (confunde com a visão semanal) e "Tarefas" (remete a to-do list).

### Tela "Hoje" (check-in diário)
A tela "Hoje" é o coração do app durante o dia — não é só um check-in de fim de dia, mas um companheiro que o usuário abre de manhã (ver o que tem pela frente), durante o dia (marcar conforme cumpre) e à noite (fechar o dia).

**Janela de registro/edição:** o usuário pode editar qualquer dia a qualquer momento (sem trava). A janela de 48h vale apenas para o efeito no streak — passar 48h sem registrar quebra o streak, mas o dia continua editável depois.

**Estrutura da tela:**
- **Mood do dia** — seletor de emoji no topo (1 toque): 😄 🙂 😐 😞 😫. Opcional. Gera dado para cruzar com score no futuro.
- **Barra de progresso do dia** — % de atividades avaliadas, atualiza conforme marca
- **Lista de metas do dia** — cada meta permite:
  - Avaliar o esforço (4 níveis) — gesto principal, 1-2 toques
  - **Horário em que foi realizada** — opcional, nunca obrigatório (evita atrito)
- **Nota do dia** — campo de texto livre do dia inteiro (não por atividade), tipo "como foi hoje". Funciona como mini-diário e dá motivo para reler.
- **Score parcial** — calculado em tempo real conforme avalia

**Dois botões de ação com pesos diferentes:**
- **Salvar progresso** — ação leve e repetível, guarda o estado parcial sem fechar o dia. Para uso ao longo do dia.
- **Finalizar dia** — ação definitiva, consolida o score final e manda para o histórico. Pode reabrir para editar depois (com confirmação leve: "Esse dia já foi finalizado — quer reabrir para editar?").

**Cuidado de UX (anti-overengineering):** mood, nota e horário são camadas opcionais por cima. O gesto de avaliar uma meta deve permanecer a 1-2 toques — nunca enterrado sob campos opcionais.

### 4 níveis de cumprimento por meta (nomes temporários):
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

## Autenticação

### Cadastro — só o essencial (mínimo atrito)
- Nome (primeiro nome)
- E-mail
- Senha
- Confirmar senha

### Login
- E-mail
- Senha
- Link "Esqueci minha senha"

### Recuperação de senha
- Usuário informa o e-mail → recebe link com token de expiração curta (15-30 min) → redefine senha
- **Segurança:** sempre retornar a mesma mensagem independente do e-mail existir ou não ("Se esse e-mail estiver cadastrado, você receberá um link em breve") — evita enumeração de e-mails cadastrados.

### Verificação de e-mail
- Após cadastro, envia e-mail de confirmação
- Não bloquear o uso — banner suave pedindo verificação, sem travar o app

---

## Modelo de Dados (rascunho)

```
User
  id, email, password_hash, created_at

Goal (meta recorrente)
  id, user_id, name, category, weight (1|2|3), days_of_week (array)

DayLog (registro de um dia)
  id, user_id, date, status (registered|day_off|missed), score (0-100),
  mood (nullable — emoji do dia), note (nullable — nota do dia),
  finalized (bool — se o dia foi finalizado), created_at

GoalEntry (avaliação de uma meta dentro de um DayLog)
  id, day_log_id, goal_id, level (0.0|0.4|0.7|1.0),
  done_at (nullable — horário em que foi realizada)
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

1. Estrutura do projeto (pastas separadas `backend/` e `frontend/`)
2. `docker-compose` com Postgres + Redis para desenvolvimento local (espelha o Neon de produção)
3. Modelos de dados + migrações (Alembic)
4. Autenticação (session cookies + Redis) — cadastro, login, logout, recuperação de senha
5. Rotas do backend (FastAPI) — metas, check-in, score
6. Frontend base — layout com header + roteamento
7. Tela "Hoje" (check-in progressivo — mood, metas, nota, salvar/finalizar)
8. Home com histórico e índices
9. Tela "Minhas Metas" (CRUD + biblioteca)
10. Landing page
11. Notificações (Celery + Redis)

---

## Convenções de Código e Regras de Trabalho

### Comportamento do agente
- **Questionar ambiguidade** — se uma decisão de produto ou técnica não estiver clara, perguntar antes de assumir. Não inventar comportamento.
- **Não fazer mais do que foi pedido** — implementar o escopo da tarefa atual, sem adicionar features "por garantia". Anti-overengineering é regra, não sugestão.
- **Explicar decisões não óbvias** — quando escolher uma abordagem entre várias, dizer rapidamente o porquê.
- **Avisar antes de mudanças grandes** — refatorações amplas, troca de dependência ou mudança de estrutura devem ser propostas antes de executadas.
- **Não introduzir dependências novas sem necessidade clara** — preferir o que já está na stack.

### Estrutura de pastas
**Backend (`backend/`):**
```
app/
├── routers/      # endpoints FastAPI por domínio (auth, goals, days)
├── models/       # modelos SQLAlchemy
├── schemas/      # schemas Pydantic (request/response)
├── services/     # lógica de negócio (ex: score.py)
├── core/         # config, segurança, dependências
└── main.py
```
**Frontend (`frontend/src/`):**
```
src/
├── pages/        # telas (Hoje, Home, Metas...)
├── components/   # componentes reutilizáveis
├── hooks/        # hooks customizados (incl. queries do TanStack)
├── lib/          # helpers, cliente de API
└── styles/
```

### Convenções de nomes
- **Python:** snake_case para variáveis/funções, PascalCase para classes
- **JavaScript/React:** camelCase para variáveis/funções, PascalCase para componentes
- **Endpoints:** REST, plural, kebab ou snake consistente (ex: `/api/days/{date}`)
- **Nomes descritivos** — evitar abreviações obscuras

### Backend — regras
- **Validação sempre via Pydantic** — nunca confiar em dados do cliente
- **Autorização sempre verificada** — todo recurso acessado deve pertencer ao usuário logado (validar ownership, nunca confiar em IDs do request)
- **Lógica de negócio em `services/`** — routers ficam finos, só orquestram
- **Funções de cálculo puras e testáveis** — ex: cálculo de score isolado do banco
- **Erros padronizados** — usar HTTPException com status codes corretos e mensagens claras
- **Segredos só via variáveis de ambiente** — nunca hardcoded, nunca commitados

### Frontend — regras
- **TanStack Query para todo estado de servidor** — não duplicar com useState
- **Mobile-first sempre** — começar pelo mobile, escalar com breakpoints do Tailwind
- **Tokens de cor via `tailwind.config`** — não usar valores de cor soltos no código
- **Componentes pequenos e focados** — uma responsabilidade por componente

### Segurança (recorrente)
- Nunca logar senhas, tokens ou dados sensíveis
- Cookies de sessão como HttpOnly
- Mensagens de erro de auth que não revelam se um e-mail existe
- Validar e sanitizar toda entrada do usuário no backend

### Testes — o que sempre testar
- Função de cálculo de score (casos diversos)
- Autorização dos endpoints (impedir acesso a dados de outros usuários)
- Fluxos críticos de autenticação

### Git
- Mensagens de commit claras e no presente (ex: "adiciona endpoint de finalizar dia")
- Commits pequenos e focados em uma mudança lógica
- `.gitignore` sempre atualizado — nunca commitar `.env`, `node_modules`, `__pycache__`

---

Pode começar pela estrutura do projeto e me perguntar o que precisar ao longo do caminho.