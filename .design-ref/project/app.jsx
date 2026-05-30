/* global React, ReactDOM */
const { useState, useMemo } = React;

// ── Tier helpers ─────────────────────────────────────
const TIERS = {
  great: { name: 'EXCELENTE', threshold: 85 },
  good:  { name: 'BOM',        threshold: 65 },
  okay:  { name: 'REGULAR',    threshold: 45 },
  rough: { name: 'DIFÍCIL',    threshold: 0  },
};
const tierOf = (s) =>
  s >= 85 ? 'great' : s >= 65 ? 'good' : s >= 45 ? 'okay' : 'rough';

const HABIT_GLYPHS = {
  agua:    { glyph: '💧', label: 'Água' },
  treino:  { glyph: '🏋', label: 'Treino' },
  leitura: { glyph: '📖', label: 'Leitura' },
  sono:    { glyph: '🌙', label: 'Sono 8h' },
  estudo:  { glyph: '🧠', label: 'Estudo' },
  meditar: { glyph: '🧘', label: 'Meditar' },
  passos:  { glyph: '👟', label: '8k passos' },
  dieta:   { glyph: '🥗', label: 'Dieta' },
  social:  { glyph: '👥', label: 'Conexão' },
  diario:  { glyph: '✍', label: 'Diário' },
};

// ── Mock day data ────────────────────────────────────
const DAYS = [
  {
    date: '13 mai', weekday: 'qua', tier: 'great', score: 94, rank: 'Top 3%',
    note: 'Acordei cedo, treino pesado, fechei dois capítulos do livro novo.',
    duration: '15h ativas', fate: 'Excelente', fateGlyph: '★',
    habits: { agua: 1, treino: 2, leitura: 2, sono: 1, estudo: 2, meditar: 1, passos: 1, dieta: 1, social: 0 },
    timeline: [0,0,0,0,0,0,2,3,4,4,3,2,2,3,4,3,2,2,3,2,1,1,0,0],
    mvp: 'Treino', miss: '—', mood: '🔥', peak: 'PR pessoal',
  },
  {
    date: '12 mai', weekday: 'ter', tier: 'good', score: 78, rank: 'Top 18%',
    note: 'Tarde rendeu bem. Pulei a meditação, dormi 7h só.',
    duration: '13h ativas', fate: 'Sólido', fateGlyph: '◆',
    habits: { agua: 1, treino: 1, leitura: 1, sono: 0, estudo: 1, meditar: 0, passos: 1, dieta: 1, social: 1 },
    timeline: [0,0,0,0,0,0,1,2,3,3,2,2,2,3,3,2,2,2,1,1,1,0,0,0],
    mvp: 'Estudo', miss: 'Meditação', mood: '😌', peak: '+22 LP',
  },
  {
    date: '11 mai', weekday: 'seg', tier: 'great', score: 88, rank: 'Top 7%',
    note: 'Volta da semana com tudo. Reunião difícil mas resolvi rápido.',
    duration: '14h ativas', fate: 'Excelente', fateGlyph: '★',
    habits: { agua: 1, treino: 1, leitura: 1, sono: 1, estudo: 2, meditar: 1, passos: 1, dieta: 1, social: 1 },
    timeline: [0,0,0,0,0,0,2,3,3,3,3,2,3,3,4,3,2,2,2,2,1,1,0,0],
    mvp: 'Foco', miss: '—', mood: '🚀', peak: '5 deep works',
  },
  {
    date: '10 mai', weekday: 'dom', tier: 'okay', score: 58, rank: 'Top 41%',
    note: 'Domingo lento. Caminhada com a Bia, sem treino formal.',
    duration: '9h ativas', fate: 'Balanceado', fateGlyph: '◯',
    habits: { agua: 1, treino: 0, leitura: 1, sono: 1, estudo: 0, meditar: 1, passos: 1, dieta: 0, social: 1 },
    timeline: [0,0,0,0,0,0,0,1,2,2,1,1,2,2,1,1,1,2,1,1,0,0,0,0],
    mvp: 'Conexão', miss: 'Treino', mood: '🌤', peak: '12k passos',
  },
  {
    date: '09 mai', weekday: 'sáb', tier: 'good', score: 72, rank: 'Top 24%',
    note: 'Café com o pessoal de manhã, à tarde estudei algoritmos.',
    duration: '11h ativas', fate: 'Sólido', fateGlyph: '◆',
    habits: { agua: 1, treino: 1, leitura: 0, sono: 1, estudo: 1, meditar: 0, passos: 1, dieta: 1, social: 1 },
    timeline: [0,0,0,0,0,0,0,1,2,3,3,2,1,1,2,3,3,2,2,2,1,1,0,0],
    mvp: 'Estudo', miss: 'Leitura', mood: '☕', peak: '3h foco',
  },
  {
    date: '08 mai', weekday: 'sex', tier: 'rough', score: 38, rank: 'Top 78%',
    note: 'Dia travado no trabalho. Comi mal e dormi tarde.',
    duration: '8h ativas', fate: 'Bagunçado', fateGlyph: '✕',
    habits: { agua: 0, treino: 0, leitura: 0, sono: 0, estudo: 1, meditar: 0, passos: 0, dieta: 0, social: 1 },
    timeline: [0,0,0,0,0,0,0,1,1,1,1,2,2,2,1,1,1,0,1,1,0,0,0,0],
    mvp: '—', miss: 'Sono, dieta', mood: '😮‍💨', peak: '—',
  },
  {
    date: '07 mai', weekday: 'qui', tier: 'great', score: 91, rank: 'Top 5%',
    note: 'Dia cheio mas tudo no lugar. Energia altíssima até de noite.',
    duration: '15h ativas', fate: 'Excelente', fateGlyph: '★',
    habits: { agua: 1, treino: 2, leitura: 1, sono: 1, estudo: 2, meditar: 1, passos: 1, dieta: 1, social: 1 },
    timeline: [0,0,0,0,0,0,2,3,4,3,3,3,3,4,3,3,3,2,2,2,1,1,0,0],
    mvp: 'Leitura', miss: '—', mood: '✨', peak: 'Pent kill 🎯',
  },
  {
    date: '06 mai', weekday: 'qua', tier: 'good', score: 74, rank: 'Top 22%',
    note: 'Mantendo a rotina. Treino curto, prioridade no estudo.',
    duration: '12h ativas', fate: 'Sólido', fateGlyph: '◆',
    habits: { agua: 1, treino: 1, leitura: 1, sono: 1, estudo: 1, meditar: 0, passos: 0, dieta: 1, social: 0 },
    timeline: [0,0,0,0,0,0,1,2,3,3,2,2,2,2,3,3,2,1,1,1,0,0,0,0],
    mvp: 'Estudo', miss: 'Passos', mood: '🙂', peak: 'streak 4d',
  },
];

const BUCKETS = [
  { label: 'Esta semana', days: '3 dias', winRate: '67%', tier: 'great', score: '88', extra: 'Tier 1 - Excelente' },
  { label: 'Semana passada', days: '5 dias', winRate: '60%', tier: 'good', score: '72', extra: 'Tier 2 - Bom' },
];

// ── Reusable bits ────────────────────────────────────
function Sparkline({ data, color = '#f5b528', area = true, height = 32 }) {
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / Math.max(max - min, 1)) * (h - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaPath = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {area && (
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {area && <path d={areaPath} fill={`url(#grad-${color.replace('#','')})`} />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ScoreChart({ data }) {
  const w = 230, h = 80;
  const min = 30, max = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 10) - 5;
    return [x, y, v];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f5b528" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f5b528" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map(y => (
        <line key={y} x1="0" x2={w} y1={(h * y) / 100} y2={(h * y) / 100} stroke="#2a1f12" strokeDasharray="2 3" />
      ))}
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#chartFill)" />
      <path d={path} fill="none" stroke="#f5b528" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 3 : 1.5}
          fill={i === pts.length - 1 ? '#f5b528' : '#c68410'} />
      ))}
    </svg>
  );
}

function DayRow({ d }) {
  const habitKeys = Object.keys(HABIT_GLYPHS);
  return (
    <div className={`day-row tier-${d.tier}`}>
      <div className="accent-bar" />
      <div className="day-meta">
        <div className="tier">{d.tier === 'great' ? 'Excelente' : d.tier === 'good' ? 'Bom dia' : d.tier === 'okay' ? 'Regular' : 'Difícil'}</div>
        <div className="date">{d.date} <span style={{ color: 'var(--muted)' }}>· {d.weekday}</span></div>
      </div>

      <div className="day-middle">
        <div className="habits">
          {habitKeys.map(k => {
            const lvl = d.habits[k] ?? 0;
            const cls = lvl >= 2 ? 'done featured' : lvl === 1 ? 'done' : 'missed';
            return (
              <div key={k} className={`habit-icon ${cls}`} title={HABIT_GLYPHS[k].label}>
                <span>{HABIT_GLYPHS[k].glyph}</span>
                {lvl >= 2 && <span className="tag">★</span>}
              </div>
            );
          })}
        </div>
        <div className="day-note">"{d.note}"</div>
      </div>

      <div className="day-score">
        <div className="label">Score</div>
        <div className="num">{d.score}</div>
        <div className="mood" title="Humor">{d.mood}</div>
      </div>
    </div>
  );
}

function Sidebar({ scoreSeries }) {
  return (
    <aside className="side">
      <div className="profile-card">
        <div className="profile-head">
          <div className="profile-tier-row">
            <div className="tier-badge">🔥</div>
            <div className="tier-info">
              <div className="tier-name">Ouro II</div>
              <div className="tier-xp">2,184 XP <span style={{ color: 'var(--dim)' }}>/ 2,500</span></div>
              <div className="progress-line"><span style={{ width: '74%' }} /></div>
            </div>
          </div>

          <div className="win-loss">
            <span className="wl-num w">21D</span>
            <span style={{ color: 'var(--muted)' }}>bons</span>
            <span className="wl-num l" style={{ marginLeft: 10 }}>9D</span>
            <span style={{ color: 'var(--muted)' }}>difíceis</span>
            <span className="rate">WR <b>70%</b></span>
          </div>

          <div className="tier-track">
            <div className="tier-dot done">B</div>
            <div className="tier-dot done">P</div>
            <div className="tier-dot current">O2</div>
            <div className="tier-dot">O1</div>
            <div className="tier-dot">D</div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-head">
            <span className="chart-label">Score · últimos 30d</span>
            <span className="chart-delta">+18</span>
          </div>
          <div className="chart">
            <ScoreChart data={scoreSeries} />
          </div>
          <div className="chart-axis">
            <span>30d</span><span>20d</span><span>10d</span><span>hoje</span>
          </div>
        </div>

        <div className="mini-stats">
          <div className="mini-stat">
            <div className="label">Pico</div>
            <div className="val">94</div>
            <div className="sub">há 0 dias</div>
          </div>
          <div className="mini-stat">
            <div className="label">Média</div>
            <div className="val">76</div>
            <div className="sub">+4 vs mês</div>
          </div>
        </div>
      </div>

      <div className="side-section">
        <h4>Hábitos ativos <span>10</span></h4>
        <div className="habit-pill-row">
          {[
            ['agua', 28], ['treino', 14], ['leitura', 9], ['estudo', 22], ['sono', 6],
          ].map(([k, streak]) => (
            <div key={k} className={`habit-pill ${streak > 10 ? 'active' : ''}`}>
              <div className="glyph">{HABIT_GLYPHS[k].glyph}</div>
              <div className="name">{HABIT_GLYPHS[k].label}</div>
              <div className="streak">{streak}d</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Kpis() {
  return (
    <div className="kpis">
      <div className="best-worst">
        <div className="bw-side bw-best">
          <div className="bw-label">
            <span className="bw-tag bw-tag-best">Melhor</span>
            <span className="bw-meta">14/14</span>
          </div>
          <div className="bw-body">
            <div className="bw-glyph bw-glyph-best">{HABIT_GLYPHS.agua.glyph}</div>
            <div className="bw-info">
              <div className="bw-name">{HABIT_GLYPHS.agua.label}</div>
              <div className="bw-stat">
                <b>100%</b><span>perfeito</span>
              </div>
            </div>
          </div>
          <div className="bw-bar"><span style={{ width: '100%' }} /></div>
        </div>

        <div className="bw-divider" />

        <div className="bw-side bw-worst">
          <div className="bw-label">
            <span className="bw-tag bw-tag-worst">Pior</span>
            <span className="bw-meta">3/14</span>
          </div>
          <div className="bw-body">
            <div className="bw-glyph bw-glyph-worst">{HABIT_GLYPHS.meditar.glyph}</div>
            <div className="bw-info">
              <div className="bw-name">{HABIT_GLYPHS.meditar.label}</div>
              <div className="bw-stat">
                <b>21%</b><span>11 falhas</span>
              </div>
            </div>
          </div>
          <div className="bw-bar"><span style={{ width: '21%', background: 'var(--rough)' }} /></div>
        </div>
      </div>

      <div className="kpi featured">
        <div className="kpi-label">
          <span>Streak</span><span>🔥</span>
        </div>
        <div className="kpi-val">8<span className="unit">dias</span></div>
        <div className="kpi-sub">
          <span>Recorde 14</span><span className="up">+2 ontem</span>
        </div>
        <div className="kpi-spark">
          <Sparkline data={[3,4,5,6,5,6,7,8]} />
        </div>
      </div>

      <div className="kpi">
        <div className="kpi-label"><span>Consistência</span><span>📅</span></div>
        <div className="kpi-val">86<span className="unit">%</span></div>
        <div className="kpi-sub">
          <span>Desde o início</span><span className="up">+3%</span>
        </div>
        <div className="kpi-spark">
          <Sparkline data={[70,72,75,78,80,82,84,86]} color="#8ad36b" />
        </div>
      </div>

      <div className="kpi">
        <div className="kpi-label"><span>Score médio</span><span>★</span></div>
        <div className="kpi-val">76</div>
        <div className="kpi-sub">
          <span>Geral · 14d</span><span className="up">+8</span>
        </div>
        <div className="kpi-spark">
          <Sparkline data={[60,65,68,72,70,74,75,76]} color="#6aa7e8" />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tab, setTab] = useState('Página principal');
  const [scope, setScope] = useState('Total');
  const scoreSeries = [58, 62, 55, 70, 65, 72, 68, 76, 74, 78, 72, 82, 80, 85, 88, 91, 78, 88, 94];

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="flame">▲</div>
          <span><span className="day">DAY</span> <span className="up">UP</span></span>
        </div>

        <div className="tabs">
          {[
            { name: 'Página principal', href: 'DayUP.html' },
            { name: 'Minhas Metas',     href: 'Minhas Metas.html' },
          ].map(t => (
            <a key={t.name} href={t.href}
               className={`tab ${tab === t.name ? 'active' : ''}`}
               style={{ textDecoration: 'none' }}
               onClick={(e) => { if (t.name === 'Página principal') { e.preventDefault(); setTab(t.name); } }}>
              {t.name}
            </a>
          ))}
        </div>

        <div className="topbar-right">
          <button className="icon-btn" title="Notificações">🔔</button>
          <div className="user-chip">
            <div className="avatar">JP</div>
            <div className="name">jpsx.silva</div>
          </div>
        </div>
      </header>

      <main className="app">
        <section className="main">
          <div className="greet">
            <div>
              <div className="hello">Olá, jpsx.silva</div>
              <h1>Como foi seu <span className="accent">dia</span>?</h1>
            </div>
            <div className="quick-actions">
              <button className="btn">Ver semana</button>
              <button className="btn primary">+ Check-in de hoje</button>
            </div>
          </div>

          <Kpis />

          <div className="section-head">
            <h2>Histórico</h2>
            <span className="meta">Últimos 8 dias</span>
          </div>

          <div className="day-list">
            {DAYS.map(d => <DayRow key={d.date} d={d} />)}

            <div className="load-more">Carregar mais dias ↓</div>
          </div>
        </section>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
