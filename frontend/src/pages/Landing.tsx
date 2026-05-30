import { Link } from "react-router-dom";
import { Plus, Minus } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <Compare />
      <Testimonials />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

// ───────────────── NAV ─────────────────

function Nav() {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 flex items-center gap-4 lg:gap-7 px-5 lg:px-10 py-4 lg:py-4.5 backdrop-blur-md border-b border-transparent"
      style={{ background: "rgba(11,9,7,0.7)" }}
    >
      <Link to="/" className="brand text-[20px] lg:text-[22px]">
        <span className="brand-flame">▲</span>
        <span>
          <span className="text-text">DAY</span>{" "}
          <span className="text-primary">UP</span>
        </span>
      </Link>
      <div className="hidden lg:flex gap-7 ml-2">
        {["Como funciona", "Recursos", "Depoimentos", "FAQ"].map((l) => (
          <a
            key={l}
            href={`#${l.toLowerCase().replace(/\s+/g, "-").replace("ã", "a")}`}
            className="text-[14px] font-medium text-text-2 hover:text-text"
          >
            {l}
          </a>
        ))}
      </div>
      <div className="ml-auto flex gap-2.5 items-center">
        <Link to="/login" className="btn-ghost text-[14px]">
          Entrar
        </Link>
        <Link to="/cadastro" className="btn-primary text-[14px]">
          Criar conta grátis
        </Link>
      </div>
    </nav>
  );
}

// ───────────────── HERO ─────────────────

function Hero() {
  return (
    <header className="relative pt-[120px] lg:pt-[140px] pb-16 lg:pb-24 px-5 lg:px-10 overflow-hidden isolate">
      {/* background gradients */}
      <div
        aria-hidden
        className="absolute inset-[-100px] -z-10"
        style={{
          background:
            "radial-gradient(ellipse 1100px 700px at 50% 0%, rgba(245,181,40,0.12), transparent 60%), radial-gradient(ellipse 700px 500px at 90% 30%, rgba(245,181,40,0.05), transparent 60%)",
        }}
      />
      {/* grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,181,40,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,181,40,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 800px 600px at 50% 0%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 800px 600px at 50% 0%, black 30%, transparent 80%)",
        }}
      />

      <div className="max-w-[1180px] mx-auto text-center relative">
        <div
          className="inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 bg-surface border border-border-2 rounded-full text-[12px] text-text-2 mb-7"
        >
          <span className="bg-primary text-ink font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
            Novo
          </span>
          <span>
            Mobile-first com check-in em <b className="text-text">30 segundos</b>
          </span>
        </div>

        <h1
          className="display uppercase text-[44px] sm:text-[64px] lg:text-[96px] leading-[0.95] m-0 mb-6"
          style={{ letterSpacing: "-0.01em" }}
        >
          Cada dia
          <br />é uma{" "}
          <span className="text-primary relative inline-block">
            partida
            <span
              aria-hidden
              className="absolute left-[-4%] right-[-4%] bottom-1 rounded-full -z-10"
              style={{ height: "14%", background: "#f5b528", opacity: 0.15 }}
            />
          </span>
          .
          <br />
          Quer vencer?
        </h1>

        <p className="text-[16px] lg:text-[19px] text-text-2 max-w-[620px] mx-auto mb-10 leading-relaxed">
          O Day UP transforma sua rotina num placar diário. Marque hábitos, veja o score do seu
          dia e acompanhe sua evolução como se fosse o histórico de partidas do seu jogo favorito.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-7">
          <Link to="/cadastro" className="btn-primary btn-lg">
            Começar grátis →
          </Link>
          <Link to="/login" className="btn btn-lg">
            Já tenho conta
          </Link>
        </div>

        <div className="inline-flex items-center gap-4 text-[13px] text-muted">
          <div className="flex">
            {["JP", "MR", "BC", "AL"].map((s, i) => (
              <span
                key={s}
                className="w-[26px] h-[26px] rounded-full border-2 border-bg grid place-items-center text-[11px] font-bold text-ink"
                style={{
                  background: "linear-gradient(135deg, #c68410, #f5b528)",
                  marginLeft: i === 0 ? 0 : -8,
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <div>
            <span className="text-primary tracking-widest">★★★★★</span>{" "}
            <b className="text-text">4.9</b> · mais de{" "}
            <b className="text-text">12 mil</b> dias registrados
          </div>
        </div>

        <HeroPreview />
      </div>
    </header>
  );
}

function HeroPreview() {
  return (
    <div className="relative max-w-[1100px] mx-auto mt-12 lg:mt-16">
      <div
        aria-hidden
        className="absolute -z-10 -inset-x-12 -inset-y-10 blur-[40px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,181,40,0.25), transparent 60%)",
        }}
      />
      {/* floating chips — desktop only */}
      <div
        className="hidden md:flex absolute left-[-40px] top-[28%] items-center gap-2.5 p-3 rounded-xl border border-border-2 z-10"
        style={{
          background: "linear-gradient(180deg, #1e170e, #16110a)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
        }}
      >
        <span
          className="w-9 h-9 rounded-lg grid place-items-center text-[18px]"
          style={{ background: "rgba(245,181,40,0.18)", color: "#f5b528" }}
        >
          🔥
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
            Streak atual
          </div>
          <div className="display text-[18px] text-primary leading-none mt-0.5">8 dias</div>
        </div>
      </div>
      <div
        className="hidden md:flex absolute right-[-30px] top-[55%] items-center gap-2.5 p-3 rounded-xl border border-border-2 z-10"
        style={{
          background: "linear-gradient(180deg, #1e170e, #16110a)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
        }}
      >
        <span
          className="w-9 h-9 rounded-lg grid place-items-center text-[18px]"
          style={{ background: "rgba(138,211,107,0.15)", color: "#8ad36b" }}
        >
          ★
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-muted font-semibold">
            Score hoje
          </div>
          <div className="display text-[18px] text-good leading-none mt-0.5">94</div>
        </div>
      </div>

      {/* Browser frame */}
      <div
        className="bg-surface border border-border-2 rounded-[14px] p-1 overflow-hidden"
        style={{
          boxShadow:
            "0 50px 100px -20px rgba(0,0,0,0.8), 0 30px 60px -30px rgba(245,181,40,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex gap-1.5 px-3.5 py-2.5 border-b border-border">
          <span className="w-2.5 h-2.5 rounded-full bg-rough" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="w-2.5 h-2.5 rounded-full bg-good" />
        </div>
        <div
          className="px-5 py-5 lg:px-6"
          style={{
            background:
              "radial-gradient(ellipse 600px 300px at 50% 0%, rgba(245,181,40,0.05), transparent 70%), #0b0907",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="display text-[22px]">
              Como foi seu <span className="text-primary">dia</span>?
            </div>
            <div className="hidden sm:flex gap-1.5">
              <span className="px-3 py-1 text-[11px] font-semibold bg-primary text-ink rounded-full">
                Página principal
              </span>
              <span className="px-3 py-1 text-[11px] font-semibold bg-surface border border-border rounded-full text-text-2">
                Minhas Metas
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <PreviewKpi label="Streak 🔥" value={<>8<span className="ml-1 text-xs text-muted font-sans font-medium">dias</span></>} featured />
            <PreviewKpi label="Consistência" value={<>86<span className="ml-1 text-xs text-muted font-sans font-medium">%</span></>} />
            <PreviewKpi label="Score médio" value={<>76</>} />
            <PreviewKpi label="Score 14d" value={<>82</>} />
          </div>

          <div className="flex flex-col gap-1.5">
            <PreviewRow tier="great" label="Excelente" date="13 mai · qua" score={94} />
            <PreviewRow tier="good" label="Bom dia" date="12 mai · ter" score={78} />
            <PreviewRow tier="rough" label="Difícil" date="08 mai · sex" score={38} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewKpi({
  label,
  value,
  featured,
}: {
  label: string;
  value: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className="bg-surface border border-border rounded-[10px] p-3"
      style={
        featured
          ? {
              background: "linear-gradient(180deg, rgba(245,181,40,0.1), #16110a)",
              borderColor: "rgba(245,181,40,0.3)",
            }
          : undefined
      }
    >
      <div className="text-[9px] uppercase tracking-[0.1em] text-muted font-semibold">
        {label}
      </div>
      <div
        className="display text-[24px] leading-none mt-1.5 nums"
        style={{ color: featured ? "#f5b528" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}

const TIER_COLORS = {
  great: { bar: "#f5b528", color: "#f5b528", bg: "rgba(245,181,40,0.1)", scoreBg: "#f5b528", scoreColor: "#1a1408" },
  good: { bar: "#8ad36b", color: "#8ad36b", bg: "rgba(138,211,107,0.06)", scoreBg: "rgba(138,211,107,0.12)", scoreColor: "#8ad36b" },
  rough: { bar: "#e87a6a", color: "#e87a6a", bg: "rgba(232,122,106,0.06)", scoreBg: "rgba(232,122,106,0.12)", scoreColor: "#e87a6a" },
};

function PreviewRow({
  tier,
  label,
  date,
  score,
}: {
  tier: keyof typeof TIER_COLORS;
  label: string;
  date: string;
  score: number;
}) {
  const t = TIER_COLORS[tier];
  return (
    <div
      className="grid grid-cols-[4px_1fr_auto] bg-surface border border-border rounded-lg overflow-hidden h-14"
      style={{ background: `linear-gradient(90deg, ${t.bg}, transparent 50%), #16110a` }}
    >
      <span className="h-full" style={{ background: t.bar }} />
      <div className="px-3 py-2 flex flex-col justify-center">
        <span
          className="display text-[13px] uppercase leading-none"
          style={{ color: t.color }}
        >
          {label}
        </span>
        <span className="text-[10px] text-muted mt-0.5">{date}</span>
      </div>
      <span
        className="display text-[20px] text-center px-2.5 py-1 rounded-md self-center mr-2.5 nums"
        style={{ background: t.scoreBg, color: t.scoreColor }}
      >
        {score}
      </span>
    </div>
  );
}

// ───────────────── STATS ─────────────────

function Stats() {
  const items = [
    { num: "12k+", lbl: "dias registrados pelos usuários" },
    { num: "87%", lbl: "mantêm a streak após 30 dias" },
    { num: "2.4×", lbl: "mais consistência vs. checklist comum" },
    { num: "4.9★", lbl: "avaliação média na comunidade" },
  ];
  return (
    <section
      className="py-12 lg:py-16 px-5 lg:px-10 border-y border-border"
      style={{ background: "linear-gradient(180deg, transparent, rgba(245,181,40,0.02))" }}
    >
      <div className="max-w-[1180px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {items.map((s) => (
          <div key={s.num}>
            <div
              className="display text-[44px] lg:text-[56px] text-primary leading-none nums"
              style={{ letterSpacing: "-0.01em" }}
            >
              {s.num}
            </div>
            <div className="text-[13px] text-text-2 mt-2">{s.lbl}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ───────────────── HOW IT WORKS ─────────────────

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "✦",
      title: "Escolha suas metas",
      body: "Recorrentes por dia da semana, com peso e categoria. Só o que importa pra você esta semana.",
    },
    {
      num: "02",
      icon: "◉",
      title: "Faça check-in todo dia",
      body: "Em 30 segundos você bate seu dia, marca o nível de cada meta e o app calcula o score.",
    },
    {
      num: "03",
      icon: "▲",
      title: "Veja sua jornada",
      body: "Histórico estilo match history, com streak inteligente que entende Day Off e tendência de 14 dias.",
    },
  ];

  return (
    <Section id="como-funciona">
      <SectionHead
        eyebrow="Como funciona"
        title={
          <>
            Três passos.<br />
            <span className="text-primary">Uma rotina inteira</span> visualizada.
          </>
        }
        sub="Day UP é simples por fora e poderoso por dentro. Você só precisa marcar — a gente faz o resto."
      />
      <div className="grid lg:grid-cols-3 gap-4">
        {steps.map((s) => (
          <article
            key={s.num}
            className="relative overflow-hidden rounded-2xl border border-border p-7 lg:p-8 hover:-translate-y-1 transition-transform"
            style={{ background: "linear-gradient(180deg, #1e170e, #16110a)" }}
          >
            <span
              className="absolute top-4 right-5 display font-bold text-[80px] leading-none text-primary nums"
              style={{ opacity: 0.08 }}
            >
              {s.num}
            </span>
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center text-[26px] mb-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(245,181,40,0.2), rgba(245,181,40,0.05))",
                border: "1px solid rgba(245,181,40,0.3)",
                color: "#f5b528",
              }}
              aria-hidden
            >
              {s.icon}
            </div>
            <h3 className="display text-[22px] uppercase leading-tight mb-3">{s.title}</h3>
            <p className="text-[14px] text-text-2 leading-relaxed">{s.body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

// ───────────────── FEATURES ─────────────────

function Features() {
  return (
    <Section id="recursos">
      <SectionHead
        eyebrow="Recursos"
        title={
          <>
            Tudo que faltava num<br />
            <span className="text-primary">tracker de verdade</span>
          </>
        }
      />
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Big card */}
        <article
          className="lg:col-span-2 rounded-2xl border p-7 min-h-[280px] flex flex-col"
          style={{
            background:
              "radial-gradient(ellipse at 100% 0%, rgba(245,181,40,0.12), transparent 60%), #1e170e",
            borderColor: "rgba(245,181,40,0.25)",
          }}
        >
          <div className="text-[10px] text-primary uppercase tracking-[0.12em] font-bold mb-3">
            Carro-chefe
          </div>
          <h3 className="display text-[22px] lg:text-[24px] uppercase mb-3">
            Histórico estilo match&nbsp;history
          </h3>
          <p className="text-[14px] text-text-2 leading-relaxed">
            Cada dia vira uma "partida" com tier de qualidade, score e metas completadas. Veja
            sua evolução de forma viciante — não como uma planilha.
          </p>
          <div
            className="mt-auto pt-6 grid gap-1.5"
            style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
          >
            {[3, 2, 3, 1, 2, 3, 0, 1, 3, 3, 2, 3, 2, 3].map((lvl, i) => (
              <span
                key={i}
                className="aspect-square rounded"
                style={{
                  background:
                    lvl === 0
                      ? "#281e12"
                      : lvl === 1
                        ? "rgba(245,181,40,0.25)"
                        : lvl === 2
                          ? "rgba(245,181,40,0.55)"
                          : "#f5b528",
                }}
              />
            ))}
          </div>
        </article>

        {/* Tier ladder */}
        <article
          className="rounded-2xl border border-border p-7 min-h-[280px] flex flex-col bg-surface"
        >
          <div className="text-[10px] text-primary uppercase tracking-[0.12em] font-bold mb-3">
            Gamificação
          </div>
          <h3 className="display text-[22px] lg:text-[24px] uppercase mb-3">Score por dia</h3>
          <p className="text-[14px] text-text-2 leading-relaxed">
            Cada meta tem peso. Combine isso com o nível de cumprimento e tenha uma nota de 0 a
            100 — simples de ler, difícil de fingir.
          </p>
          <div className="mt-auto pt-6 flex justify-center">
            <ScoreRingViz score={88} />
          </div>
        </article>

        {/* Streak */}
        <article
          className="rounded-2xl border border-border p-7 min-h-[280px] flex flex-col bg-surface"
        >
          <div className="text-[10px] text-primary uppercase tracking-[0.12em] font-bold mb-3">
            Foco no longo prazo
          </div>
          <h3 className="display text-[22px] lg:text-[24px] uppercase mb-3">
            Streak inteligente
          </h3>
          <p className="text-[14px] text-text-2 leading-relaxed">
            Day Off não quebra streak. Faltar passa de 48h, quebra. Pressão saudável, sem
            martírio.
          </p>
          <div className="mt-auto pt-6 flex items-end gap-1.5 h-[100px]">
            {[30, 45, 50, 65, 60, 78, 90, 100].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${h}%`,
                  background:
                    i < 2
                      ? "linear-gradient(180deg, #3a2c1a, #2a1f12)"
                      : "linear-gradient(180deg, #f5b528, #c68410)",
                }}
              />
            ))}
          </div>
        </article>

        {/* Tendência */}
        <article
          className="lg:col-span-2 rounded-2xl border border-border p-7 min-h-[280px] flex flex-col bg-surface"
        >
          <div className="text-[10px] text-primary uppercase tracking-[0.12em] font-bold mb-3">
            Insights
          </div>
          <h3 className="display text-[22px] lg:text-[24px] uppercase mb-3">
            Tendência de 14 dias
          </h3>
          <p className="text-[14px] text-text-2 leading-relaxed">
            Compare a média dos últimos 14 dias com o período anterior. Saiba na hora se está
            subindo, estável ou caindo — antes do hábito virar buraco.
          </p>
          <div className="mt-auto pt-6">
            <div className="surface flex items-center justify-between p-5 rounded-[10px]">
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted font-bold">
                  Score 14d
                </div>
                <div className="display text-[36px] text-primary leading-none mt-2 nums">82</div>
              </div>
              <div
                className="text-[14px] font-semibold flex items-center gap-1.5"
                style={{ color: "#8ad36b" }}
              >
                ↑ 6.4 <span className="text-muted font-normal text-[12px]">vs anterior</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </Section>
  );
}

function ScoreRingViz({ score }: { score: number }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative w-[180px] h-[180px]">
      <svg viewBox="0 0 180 180" width={180} height={180} className="-rotate-90">
        <circle cx="90" cy="90" r={r} stroke="#281e12" strokeWidth="12" fill="none" />
        <circle
          cx="90"
          cy="90"
          r={r}
          stroke="#f5b528"
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center display text-[44px] text-primary nums">
        {score}
      </div>
    </div>
  );
}

// ───────────────── COMPARE ─────────────────

function Compare() {
  return (
    <Section>
      <SectionHead
        eyebrow="Por que Day UP"
        title={
          <>
            Outros apps te fazem sentir<br />
            <span className="text-primary">como uma planilha.</span>
          </>
        }
        sub="A gente quer que você sinta como um jogador subindo de elo."
      />
      <div className="grid lg:grid-cols-2 gap-4">
        <CompareCol
          tone="bad"
          title="Tracker comum"
          items={[
            "Listas de checkbox sem fim",
            "Gráficos chatos que ninguém olha",
            "Sem feedback visual quando você acerta",
            "Falhou um dia? Quebrou tudo.",
            "Dados sem narrativa",
          ]}
        />
        <CompareCol
          tone="good"
          title="Day UP"
          items={[
            "Cada dia vira uma 'partida' com tier",
            "Histórico viciante, fácil de revisitar",
            "Score visual com peso por meta",
            "Day Off mantém streak — vida acontece",
            "Sua jornada, contada como narrativa",
          ]}
        />
      </div>
    </Section>
  );
}

function CompareCol({
  tone,
  title,
  items,
}: {
  tone: "bad" | "good";
  title: string;
  items: string[];
}) {
  const isGood = tone === "good";
  return (
    <div
      className="rounded-2xl p-7 lg:p-8 border"
      style={
        isGood
          ? {
              background:
                "radial-gradient(ellipse at top, rgba(245,181,40,0.1), transparent 60%), #1e170e",
              borderColor: "rgba(245,181,40,0.3)",
            }
          : { background: "#16110a", borderColor: "#2a1f12" }
      }
    >
      <h4
        className="display text-[22px] uppercase mb-5"
        style={{ color: isGood ? "#f5b528" : "#c9bd9f" }}
      >
        {title}
      </h4>
      <ul className="m-0 p-0 list-none">
        {items.map((t, i) => (
          <li
            key={t}
            className={[
              "flex items-start gap-3 py-2.5 text-[14px]",
              i < items.length - 1 ? "border-b border-border" : "",
              isGood ? "text-text" : "text-text-2",
            ].join(" ")}
          >
            <span
              className="shrink-0 w-[22px] h-[22px] rounded-full grid place-items-center text-[10px] font-bold"
              style={
                isGood
                  ? { background: "#f5b528", color: "#1a1408" }
                  : { background: "#281e12", color: "#e87a6a" }
              }
            >
              {isGood ? "✓" : "✕"}
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ───────────────── TESTIMONIALS ─────────────────

function Testimonials() {
  const items = [
    {
      quote:
        "Já tentei uns 5 apps de hábito. Esse foi o primeiro que eu abri todo dia espontaneamente — porque parece que eu tô subindo no LoL, só que da minha vida.",
      name: "Rafael Furtado",
      sub: "Streak 47 dias",
      av: "RF",
    },
    {
      quote:
        "Os pesos por meta mudam tudo. Saber que pular o treino vale mais que pular a leitura me ajuda a priorizar de verdade.",
      name: "Bia Cardoso",
      sub: "Streak 22 dias",
      av: "BC",
    },
    {
      quote:
        "Day Off é o feature que faltava em todo outro app. Não me sinto culpado por descansar — me sinto produtivo por ter descansado certo.",
      name: "Mateus Lins",
      sub: "Streak 14 dias",
      av: "ML",
    },
  ];

  return (
    <Section id="depoimentos">
      <SectionHead
        eyebrow="Depoimentos"
        title={
          <>
            Pessoas que <span className="text-primary">subiram de elo</span>
            <br />
            na vida real
          </>
        }
      />
      <div className="grid lg:grid-cols-3 gap-4">
        {items.map((t) => (
          <article
            key={t.name}
            className="bg-surface border border-border rounded-[14px] p-6 flex flex-col gap-4"
          >
            <div className="text-primary tracking-widest text-[14px]">★★★★★</div>
            <p className="text-[15px] text-text leading-relaxed m-0">"{t.quote}"</p>
            <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border">
              <span
                className="w-[38px] h-[38px] rounded-full grid place-items-center font-bold text-ink text-[14px]"
                style={{ background: "linear-gradient(135deg, #c68410, #f5b528)" }}
              >
                {t.av}
              </span>
              <div>
                <div className="font-semibold text-[14px]">{t.name}</div>
                <div className="text-[12px] text-muted">{t.sub}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

// ───────────────── FAQ ─────────────────

function Faq() {
  const items = [
    {
      q: "É grátis?",
      a: "Sim. O Day UP tem versão gratuita completa com metas ilimitadas, histórico ilimitado e todas as métricas. Plano Pro virá com insights extras no futuro.",
    },
    {
      q: "Como o score é calculado?",
      a: "Cada meta tem um peso (baixa=1, média=2, alta=3). O nível de cumprimento (0 / 40 / 70 / 100%) multiplica esse peso. A soma ponderada vira uma nota de 0 a 100.",
    },
    {
      q: "E se eu falhar um dia?",
      a: "Você tem até 48h após o dia pra registrar. Se passar disso, conta como 'não registrado' e quebra streak. Mas Day Off declarado a qualquer momento mantém streak intacto.",
    },
    {
      q: "Funciona no celular?",
      a: "Sim — Day UP é mobile-first. A experiência foi desenhada primeiro pro browser do celular e adaptada pra desktop, não o contrário.",
    },
    {
      q: "Meus dados são privados?",
      a: "Totalmente. Tudo armazenado de forma segura, nada compartilhado, e você pode exportar ou apagar tudo a qualquer momento.",
    },
  ];

  return (
    <Section id="faq">
      <SectionHead
        eyebrow="Dúvidas"
        title={
          <>
            Perguntas <span className="text-primary">frequentes</span>
          </>
        }
      />
      <div className="max-w-[780px] mx-auto flex flex-col gap-2.5">
        {items.map((it, i) => (
          <FaqItem key={it.q} q={it.q} a={it.a} openByDefault={i === 0} />
        ))}
      </div>
    </Section>
  );
}

function FaqItem({ q, a, openByDefault }: { q: string; a: string; openByDefault?: boolean }) {
  return (
    <details
      className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-border-2 transition-colors"
      open={openByDefault}
    >
      <summary className="list-none cursor-pointer px-6 py-4 flex items-center justify-between font-medium text-[15px] [&::-webkit-details-marker]:hidden">
        <span>{q}</span>
        <span className="text-primary group-open:hidden">
          <Plus size={20} />
        </span>
        <span className="text-primary hidden group-open:inline">
          <Minus size={20} />
        </span>
      </summary>
      <div className="px-6 pb-5 text-[14px] text-text-2 leading-relaxed">{a}</div>
    </details>
  );
}

// ───────────────── FINAL CTA ─────────────────

function FinalCta() {
  return (
    <section
      className="my-12 lg:my-16 mx-5 max-w-[1180px] lg:mx-auto px-5 lg:px-10 py-16 lg:py-20 rounded-3xl border border-primary/30 text-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(245,181,40,0.25), transparent 60%), radial-gradient(ellipse at bottom right, rgba(245,181,40,0.1), transparent 60%), linear-gradient(180deg, #1e170e, #16110a)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,181,40,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(245,181,40,0.06) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(ellipse 600px 400px at 50% 50%, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 600px 400px at 50% 50%, black 30%, transparent 70%)",
        }}
      />
      <div className="relative">
        <h2 className="display text-[36px] lg:text-[56px] uppercase leading-none m-0 mb-4">
          Pronto pra <span className="text-primary">subir de elo</span>
          <br />
          na vida real?
        </h2>
        <p className="text-text-2 text-[16px] lg:text-[17px] max-w-[520px] mx-auto mb-9">
          Comece grátis em 30 segundos. Sem cartão, sem trial chato — só o seu primeiro dia.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/cadastro" className="btn-primary btn-lg">
            Criar conta grátis →
          </Link>
          <Link to="/login" className="btn btn-lg">
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  );
}

// ───────────────── FOOTER ─────────────────

function Footer() {
  return (
    <footer className="border-t border-border py-12 px-5 lg:px-10 bg-bg-2">
      <div className="max-w-[1180px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="brand text-[22px]">
            <span className="brand-flame">▲</span>
            <span>
              <span className="text-text">DAY</span>{" "}
              <span className="text-primary">UP</span>
            </span>
          </Link>
          <p className="text-text-2 text-[13px] mt-3 max-w-[280px]">
            Suba de nível, um dia por vez. O tracker que parece um jogo — porque vida é o melhor
            jogo que tem.
          </p>
        </div>
        <FooterCol title="Produto" links={["Como funciona", "Recursos", "Preços", "Mudanças"]} />
        <FooterCol title="Empresa" links={["Sobre", "Blog", "Contato"]} />
        <FooterCol title="Legal" links={["Privacidade", "Termos", "Cookies"]} />
      </div>
      <div className="max-w-[1180px] mx-auto pt-6 border-t border-border flex items-center justify-between text-[12px] text-muted">
        <span>© {new Date().getFullYear()} Day UP. Feito por quem também precisava.</span>
        <div className="flex gap-2">
          {["𝕏", "◉", "◇"].map((s) => (
            <a
              key={s}
              href="#"
              className="w-8 h-8 grid place-items-center border border-border rounded-lg text-text-2 hover:border-primary hover:text-primary transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h5 className="text-[11px] uppercase tracking-[0.1em] text-muted font-semibold mb-3">
        {title}
      </h5>
      {links.map((l) => (
        <a key={l} href="#" className="block text-text-2 text-[13px] py-1.5 hover:text-primary">
          {l}
        </a>
      ))}
    </div>
  );
}

// ───────────────── shared ─────────────────

function Section({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-16 lg:py-24 px-5 lg:px-10">
      <div className="max-w-[1180px] mx-auto">{children}</div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="text-center mb-12 lg:mb-14">
      <div className="eyebrow mb-4">{eyebrow}</div>
      <h2 className="display text-[32px] lg:text-[56px] uppercase leading-[1.05] m-0 mb-4">
        {title}
      </h2>
      {sub && (
        <p className="text-[15px] lg:text-[17px] text-text-2 max-w-[580px] mx-auto leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  );
}

