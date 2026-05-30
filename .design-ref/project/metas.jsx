/* global React, ReactDOM */
const { useState, useMemo } = React;

// ── Categories ───────────────────────────────────────
const CATEGORIES = [
{ id: 'saude', name: 'Saúde', glyph: '🍎', color: '#8ad36b' },
{ id: 'exercicio', name: 'Exercício', glyph: '🏋', color: '#f5b528' },
{ id: 'estudos', name: 'Estudos', glyph: '📚', color: '#6aa7e8' },
{ id: 'mental', name: 'Mental', glyph: '🧘', color: '#c084e8' },
{ id: 'foco', name: 'Foco', glyph: '🎯', color: '#e87a6a' },
{ id: 'social', name: 'Social', glyph: '👥', color: '#f0a868' }];

const catBy = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

const ICONS = ['💧', '🏋', '📖', '🌙', '🧠', '🧘', '👟', '🥗', '👥', '✍', '☀', '💊', '🎯', '🍵', '🚶', '💤', '🎨', '🎸', '📱', '🚭', '🧹', '💼', '🏃', '🏊'];

// ── Day helpers ──────────────────────────────────────
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DAY_DATES = ['18', '19', '20', '21', '22', '23', '24']; // mock current week
const TODAY_IDX = 0; // monday

// ── Active goals (mock) ──────────────────────────────
const initialGoals = [
{ id: 1, name: 'Beber 2L de água', icon: '💧', category: 'saude', importance: 'alta', days: [0, 1, 2, 3, 4, 5, 6], streak: 28 },
{ id: 2, name: 'Treino na academia', icon: '🏋', category: 'exercicio', importance: 'alta', days: [0, 2, 4], streak: 14 },
{ id: 3, name: 'Ler 30 minutos', icon: '📖', category: 'estudos', importance: 'media', days: [0, 1, 2, 3, 4], streak: 9 },
{ id: 4, name: 'Dormir 8h', icon: '🌙', category: 'saude', importance: 'alta', days: [0, 1, 2, 3, 4, 5, 6], streak: 6 },
{ id: 5, name: 'Meditar 10min', icon: '🧘', category: 'mental', importance: 'media', days: [0, 1, 2, 3, 4, 5, 6], streak: 2 },
{ id: 6, name: 'Estudar React', icon: '🧠', category: 'estudos', importance: 'alta', days: [1, 3, 5], streak: 5 }];


// ── Preset library ───────────────────────────────────
const PRESETS = {
  saude: [
  { name: 'Beber 2L de água', icon: '💧', desc: 'A base de tudo' },
  { name: 'Dormir 8 horas', icon: '🌙', desc: 'Recuperação total' },
  { name: 'Comer 3 frutas', icon: '🍎', desc: 'Vitamina natural' },
  { name: 'Sem refrigerante', icon: '🚫', desc: 'Adeus açúcar' },
  { name: 'Tomar vitaminas', icon: '💊', desc: 'Suplementação diária' }],

  exercicio: [
  { name: 'Treino na academia', icon: '🏋', desc: '45min mínimo' },
  { name: 'Caminhada 30min', icon: '🚶', desc: 'Cardio leve' },
  { name: 'Alongamento', icon: '🤸', desc: 'Antes de dormir' },
  { name: 'Corrida 5k', icon: '🏃', desc: 'Para o pulmão' },
  { name: 'Yoga matinal', icon: '🧘', desc: 'Acordar com calma' }],

  estudos: [
  { name: 'Ler 30 minutos', icon: '📖', desc: 'Livro físico de preferência' },
  { name: 'Curso online', icon: '🎓', desc: '1 aula por dia' },
  { name: 'Estudar idioma', icon: '🗣', desc: 'Duolingo + prática' },
  { name: 'Anotar aprendizado', icon: '✍', desc: 'Diário de ideias' }],

  mental: [
  { name: 'Meditar 10min', icon: '🧘', desc: 'Foco e respiração' },
  { name: 'Diário do dia', icon: '✍', desc: '3 frases bastam' },
  { name: '3 gratidões', icon: '🙏', desc: 'Antes de dormir' },
  { name: 'Sem rede social', icon: '📱', desc: 'Por 1h depois de acordar' }],

  foco: [
  { name: 'Pomodoro 25/5', icon: '🍅', desc: '4 ciclos no mínimo' },
  { name: 'Deep work 2h', icon: '🎯', desc: 'Sem distrações' },
  { name: 'Inbox zero', icon: '📥', desc: 'Antes do almoço' },
  { name: 'Sem celular no quarto', icon: '🛌', desc: 'Dormir melhor' }],

  social: [
  { name: 'Ligar pra família', icon: '📞', desc: 'Aos finais de semana' },
  { name: 'Almoçar com alguém', icon: '🍽', desc: 'Sem o celular' },
  { name: 'Mandar uma mensagem', icon: '💬', desc: 'Pra um amigo distante' }]

};

// ── UI helpers ───────────────────────────────────────
function ImportancePill({ level }) {
  const labels = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  return (
    <span className={`importance ${level}`}>
      <span className="importance-dots">
        <i /><i /><i />
      </span>
      {labels[level]}
    </span>);

}

function DaysRow({ days }) {
  return (
    <div className="weekday-row">
      {DAYS.map((d, i) =>
      <div key={i} className={`wd ${days.includes(i) ? 'on' : ''} ${i === TODAY_IDX && days.includes(i) ? 'today' : ''}`}>{d.charAt(0)}</div>
      )}
    </div>);

}

function GoalCard({ g, onDelete, onEdit }) {
  const cat = catBy(g.category);
  return (
    <div className="goal-card" style={{ '--cat-color': cat.color }}>
      <div className="goal-icon">{g.icon}</div>
      <div className="goal-main">
        <div className="goal-name">
          {g.name}
          <span className="goal-cat-tag">{cat.name}</span>
        </div>
        <DaysRow days={g.days} />
      </div>
      <div className="goal-meta">
        <ImportancePill level={g.importance} />
        <div className="goal-streak">🔥 <b>{g.streak}</b> dias</div>
      </div>
      <div className="goal-actions">
        <button className="gicon-btn" title="Editar" onClick={() => onEdit(g)}>✎</button>
        <button className="gicon-btn danger" title="Remover" onClick={() => onDelete(g.id)}>×</button>
      </div>
    </div>);

}

// ── New goal modal ───────────────────────────────────
const DAY_SHORTCUTS = [
{ label: 'Todos os dias', days: [0, 1, 2, 3, 4, 5, 6] },
{ label: 'Dias úteis', days: [0, 1, 2, 3, 4] },
{ label: 'Fim de semana', days: [5, 6] },
{ label: 'Seg · Qua · Sex', days: [0, 2, 4] }];


function GoalModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [icon, setIcon] = useState(initial?.icon || ICONS[0]);
  const [category, setCategory] = useState(initial?.category || 'saude');
  const [importance, setImportance] = useState(initial?.importance || 'media');
  const [days, setDays] = useState(initial?.days || [0, 1, 2, 3, 4]);

  const toggleDay = (i) =>
  setDays((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort());

  const cat = catBy(category);
  const valid = name.trim() && days.length > 0;

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="goal-modal" style={{ '--cat-color': cat.color }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="goal-modal-head">
          <div>
            <h2>{initial ? 'Editar' : 'Nova'} <span className="a">meta</span></h2>
            <div className="sub">Defina sua próxima missão diária</div>
          </div>
        </div>

        <div className="goal-modal-body">
          <div className="mfield">
            <label>Nome da meta <span className="req">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Treinar 45min, Ler antes de dormir…" autoFocus />
            <div className="icon-picker-row">
              {ICONS.slice(0, 12).map((g) =>
              <button key={g} className={`ic-pick ${icon === g ? 'active' : ''}`} onClick={() => setIcon(g)}>{g}</button>
              )}
            </div>
            <div className="helper">Escolha um ícone que represente a meta</div>
          </div>

          <div className="mfield">
            <label>Categoria <span className="req">*</span></label>
            <div className="cat-grid">
              {CATEGORIES.map((c) =>
              <button
                key={c.id}
                className={`cat-tile ${category === c.id ? 'active' : ''}`}
                style={{ '--cat-color': c.color }}
                onClick={() => setCategory(c.id)}>
                
                  <span className="swatch">{c.glyph}</span>
                  <span className="nm">{c.name}</span>
                </button>
              )}
            </div>
          </div>

          <div className="mfield">
            <label>Importância <span className="req">*</span></label>
            <div className="imp-seg">
              {['baixa', 'media', 'alta'].map((lvl) =>
              <button
                key={lvl}
                className={`imp-btn ${lvl} ${importance === lvl ? 'on' : ''}`}
                onClick={() => setImportance(lvl)}>
                
                  <div className="top">
                    <span className="name">{lvl === 'media' ? 'Média' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}</span>
                    <span className="imp-pips"><i /><i /><i /></span>
                  </div>
                  <span className="desc">
                    {lvl === 'baixa' && 'Bom de ter, não essencial'}
                    {lvl === 'media' && 'Importante, peso médio'}
                    {lvl === 'alta' && 'Prioridade máxima'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mfield">
            <label>Dias da semana <span className="req">*</span></label>
            <div className="day-shortcuts">
              {DAY_SHORTCUTS.map((s) =>
              <button key={s.label} className="day-short" onClick={() => setDays(s.days)}>{s.label}</button>
              )}
            </div>
            <div className="days-picker">
              {DAYS.map((d, i) =>
              <button
                key={i}
                className={`day-btn ${days.includes(i) ? 'on' : ''}`}
                onClick={() => toggleDay(i)}>
                
                  <span className="lbl">{d}</span>
                  <span className="dt">{DAY_DATES[i]}</span>
                </button>
              )}
            </div>
            <div className="helper">{days.length}/7 dias selecionados</div>
          </div>
        </div>

        <div className="goal-modal-foot">
          <span className="preview-hint">
            {valid ?
            <>Você fará <b style={{ color: 'var(--text)' }}>{name}</b> em <b style={{ color: 'var(--text)' }}>{days.length}</b> dias da semana</> :
            'Preencha o nome e os dias'}
          </span>
          <div className="actions">
            <button className="btn" onClick={onClose}>Cancelar</button>
            <button
              className="btn primary"
              disabled={!valid}
              style={{ opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
              onClick={() => onSave({ name: name.trim(), icon, category, importance, days })}>
              
              {initial ? 'Salvar alterações' : 'Adicionar meta →'}
            </button>
          </div>
        </div>
      </div>
    </div>);

}

// ── Library sidebar ──────────────────────────────────
function Library({ activeNames, onAddPreset }) {
  const [search, setSearch] = useState('');
  const lowSearch = search.toLowerCase();
  return (
    <aside className="library">
      <div className="library-head">
        <div className="library-eyebrow">BIBLIOTECA DE METAS</div>
        <h3>METAS RECOMENDADAS</h3>
        <p className="sub">Adicione com um clique e personalize depois. Mais de 25 metas curadas.</p>
      </div>
      <div className="lib-search">
        <span>🔍</span>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar meta…" />
      </div>

      {CATEGORIES.map((cat) => {
        const items = (PRESETS[cat.id] || []).filter((p) => p.name.toLowerCase().includes(lowSearch));
        if (items.length === 0) return null;
        return (
          <div key={cat.id} className="lib-category" style={{ '--cat-color': cat.color }}>
            <div className="lib-cat-head">
              <span className="swatch" />
              <span className="title">{cat.name}</span>
              <span className="count">{items.length}</span>
            </div>
            {items.map((p, i) => {
              const added = activeNames.has(p.name);
              return (
                <button
                  key={i}
                  className={`preset ${added ? 'added' : ''}`}
                  onClick={() => !added && onAddPreset(p, cat.id)}>
                  
                  <div className="glyph">{p.icon}</div>
                  <div className="info">
                    <div className="name">{p.name}</div>
                    <div className="desc">{p.desc}</div>
                  </div>
                  <span className="add">{added ? '' : '+'}</span>
                </button>);

            })}
          </div>);

      })}
    </aside>);

}

// ── App ──────────────────────────────────────────────
function App() {
  const [tab] = useState('Minhas Metas');
  const [goals, setGoals] = useState(initialGoals);
  const [modal, setModal] = useState(null); // null | { initial }
  const [filter, setFilter] = useState('todas');

  const filtered = useMemo(
    () => filter === 'todas' ? goals : goals.filter((g) => g.category === filter),
    [goals, filter]
  );

  const counts = useMemo(() => {
    const c = { todas: goals.length };
    CATEGORIES.forEach((cat) => {c[cat.id] = goals.filter((g) => g.category === cat.id).length;});
    return c;
  }, [goals]);

  const activeNames = useMemo(() => new Set(goals.map((g) => g.name)), [goals]);

  const todayCount = goals.filter((g) => g.days.includes(TODAY_IDX)).length;
  const bestStreak = Math.max(...goals.map((g) => g.streak), 0);

  function handleSave(data) {
    if (modal.initial) {
      setGoals((prev) => prev.map((g) => g.id === modal.initial.id ? { ...g, ...data } : g));
    } else {
      setGoals((prev) => [...prev, { id: Date.now(), streak: 0, ...data }]);
    }
    setModal(null);
  }
  function handleDelete(id) {setGoals((prev) => prev.filter((g) => g.id !== id));}
  function handleAddPreset(p, catId) {
    setGoals((prev) => [...prev, {
      id: Date.now(),
      name: p.name, icon: p.icon, category: catId,
      importance: 'media',
      days: [0, 1, 2, 3, 4, 5, 6],
      streak: 0
    }]);
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="flame">▲</div>
          <span><span className="day">DAY</span> <span className="up">UP</span></span>
        </div>
        <div className="tabs">
          {['Página principal', 'Minhas Metas'].map((t) =>
          <a key={t}
          href={t === 'Página principal' ? 'DayUP.html' : '#'}
          className={`tab ${tab === t ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}>
              {t}
            </a>
          )}
        </div>
        <div className="topbar-right">
          <button className="icon-btn" title="Notificações">🔔</button>
          <div className="user-chip">
            <div className="avatar">JP</div>
            <div className="name">jpsx.silva</div>
          </div>
        </div>
      </header>

      <main className="metas-app">
        <section>
          <div className="metas-head">
            <div>
              <div className="hello">Suas metas</div>
              <h1>O que você quer <span className="accent">conquistar</span>?</h1>
            </div>
            <div className="quick-actions">
              <button className="btn primary" onClick={() => setModal({ initial: null })}>+ Nova meta</button>
            </div>
          </div>

          <div className="metas-summary">
            <div className="summary-chip feat">
              <div className="ic">🎯</div>
              <div className="info">
                <div className="l">Metas ativas</div>
                <div className="v">{goals.length}</div>
              </div>
            </div>
            <div className="summary-chip">
              <div className="ic">📅</div>
              <div className="info">
                <div className="l">Pra hoje</div>
                <div className="v">{todayCount}</div>
              </div>
            </div>
            <div className="summary-chip">
              <div className="ic">🔥</div>
              <div className="info">
                <div className="l">Melhor streak</div>
                <div className="v">{bestStreak}d</div>
              </div>
            </div>
            <div className="summary-chip">
              <div className="ic">★</div>
              <div className="info">
                <div className="l">ALTA PRIORIDADE</div>
                <div className="v">{goals.filter((g) => g.importance === 'alta').length}</div>
              </div>
            </div>
          </div>

          <div className="category-row">
            <button className={`cat-pill ${filter === 'todas' ? 'active' : ''}`} onClick={() => setFilter('todas')}>
              Todas <span className="count">{counts.todas}</span>
            </button>
            {CATEGORIES.map((c) =>
            <button
              key={c.id}
              className={`cat-pill ${filter === c.id ? 'active' : ''}`}
              style={{ color: c.color }}
              onClick={() => setFilter(c.id)}>
              
                <span className="dot" />
                <span style={{ color: filter === c.id ? '#1a1408' : 'var(--text)' }}>{c.name}</span>
                <span className="count">{counts[c.id]}</span>
              </button>
            )}
          </div>

          <div className="goals-section">
            <h2>
              {filter === 'todas' ? 'Todas as metas' : catBy(filter).name}
              <span>{filtered.length} {filtered.length === 1 ? 'meta' : 'metas'}</span>
            </h2>
            <div className="goals-list">
              {filtered.map((g) =>
              <GoalCard key={g.id} g={g} onDelete={handleDelete} onEdit={(g) => setModal({ initial: g })} />
              )}
              <button className="new-goal-card" onClick={() => setModal({ initial: null })}>
                <span className="plus">+</span>
                <span>Adicionar nova meta</span>
              </button>
            </div>
          </div>
        </section>

        <Library activeNames={activeNames} onAddPreset={handleAddPreset} />
      </main>

      {modal &&
      <GoalModal
        initial={modal.initial}
        onClose={() => setModal(null)}
        onSave={handleSave} />

      }
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);