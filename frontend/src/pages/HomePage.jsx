import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Filter,
  KanbanSquare,
  Layers,
  Lock,
  Menu,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';


const Reveal = ({ children, className = '' }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${shown ? 'is-visible' : ''} ${className}`}>{children}</div>;
};

const btnBase =
  'inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-xl font-semibold transition-colors duration-200 cursor-pointer';
const btnPrimary = `${btnBase} bg-teal-700 text-white hover:bg-teal-800`;
const btnSecondary = `${btnBase} bg-white text-teal-900 border border-teal-200 hover:bg-teal-50`;

const PRIORITY = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-800 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
};
const Badge = ({ level }) => (
  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY[level]}`}>{level}</span>
);
const Avatar = ({ children, tone = 'bg-teal-100 text-teal-900' }) => (
  <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${tone}`}>{children}</span>
);

const BOARD = [
  ['To Do', [['Set up CI/CD', 'Medium'], ['Customer interviews', 'Low']]],
  ['In Progress', [['Design onboarding', 'High'], ['Launch email campaign', 'High']]],
  ['Completed', [['API documentation', 'Low'], ['Brand refresh', 'Medium']]],
];
const ProductMockup = () => (
  <div className="mx-auto max-w-5xl rounded-2xl border border-teal-200 bg-white shadow-xl shadow-teal-900/10" role="img"
    aria-label="Preview of the Team Task Manager dashboard and Kanban board">
    <div className="flex items-center gap-2 border-b border-teal-100 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-red-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      <span className="ml-3 rounded-md bg-teal-50 px-3 py-1 text-xs text-slate-600">app / dashboard</span>
    </div>
    <div className="p-4 sm:p-6 text-left">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['Total teams', '2', 'text-teal-800'], ['Active tasks', '6', 'text-teal-800'], ['Completed', '2', 'text-emerald-700'], ['Overdue', '1', 'text-red-700']].map(([l, v, c]) => (
          <div key={l} className="rounded-xl border border-teal-100 bg-teal-50/60 p-4">
            <p className="text-xs font-medium text-slate-600">{l}</p>
            <p className={`mt-1 text-2xl font-extrabold ${c}`}>{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {BOARD.map(([name, cards]) => (
          <div key={name} className="rounded-xl bg-slate-50 p-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">{name} <span className="text-slate-500">· {cards.length}</span></p>
            <div className="space-y-2">
              {cards.map(([t, p]) => (
                <div key={t} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">{t}</p>
                  <div className="mt-2"><Badge level={p} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TeamsVisual = () => (
  <div className="space-y-3">
    {[['UI', 'Usman Iqbal', 'Owner', 'bg-teal-700 text-white'], ['AK', 'Ayesha Khan', 'Member', 'bg-teal-100 text-teal-900'], ['BA', 'Bilal Ahmed', 'Member', 'bg-orange-100 text-orange-900']].map(([i, n, r, tone]) => (
      <div key={n} className="flex items-center gap-3 rounded-xl border border-teal-100 bg-white p-3">
        <Avatar tone={tone}>{i}</Avatar>
        <p className="flex-1 text-sm font-semibold text-slate-900">{n}</p>
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">{r}</span>
      </div>
    ))}
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 p-3 text-sm text-slate-600">
      <UserPlus size={16} aria-hidden="true" className="text-teal-700" /> Invite a teammate by email
    </div>
  </div>
);
const TasksVisual = () => (
  <div>
    <div className="mb-3 flex flex-wrap gap-2">
      {['All teams', 'In Progress', 'High priority'].map((f, i) => (
        <span key={f} className={`rounded-full border px-3 py-1 text-xs font-semibold ${i ? 'border-teal-200 bg-white text-teal-900' : 'border-teal-700 bg-teal-700 text-white'}`}>{f}</span>
      ))}
    </div>
    <div className="space-y-2">
      {[['Design onboarding flow', 'Ayesha', 'High'], ['Fix login redirect bug', 'Usman', 'High'], ['Update brand guidelines', 'Usman', 'Low']].map(([t, a, p]) => (
        <div key={t} className="flex items-center justify-between gap-3 rounded-xl border border-teal-100 bg-white p-3">
          <div><p className="text-sm font-semibold text-slate-900">{t}</p><p className="text-xs text-slate-600">Assigned to {a}</p></div>
          <Badge level={p} />
        </div>
      ))}
    </div>
  </div>
);
const InsightsVisual = () => (
  <div className="space-y-3">
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
      <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-red-700" />
      <p className="text-sm text-red-900"><strong>1 task is overdue.</strong> Fix login redirect bug was due 2 days ago.</p>
    </div>
    <div className="rounded-xl border border-teal-100 bg-white p-4">
      {[['To Do', 4, 'bg-slate-400'], ['In Progress', 2, 'bg-teal-600'], ['Completed', 2, 'bg-emerald-600']].map(([l, n, c]) => (
        <div key={l} className="mb-3 last:mb-0">
          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700"><span>{l}</span><span>{n}</span></div>
          <div className="h-2 rounded-full bg-slate-100"><div className={`h-2 rounded-full ${c}`} style={{ width: `${n * 12.5}%` }} /></div>
        </div>
      ))}
    </div>
  </div>
);

const FEATURES = [
  { icon: Users, title: 'Teams that stay organised', text: 'Give every project its own workspace. Add members by email and keep ownership and access clear from day one.',
    points: ['Owner and member roles', 'Invite by email in seconds', 'Each team keeps its own tasks'], visual: <TeamsVisual /> },
  { icon: KanbanSquare, title: 'Tasks you can actually find', text: 'Move work across a Kanban board or scan it in a table. Filter by team, assignee, status or priority and search instantly.',
    points: ['Kanban and table views', 'Priorities and due dates', 'Search and multi-filter'], visual: <TasksVisual /> },
  { icon: BarChart3, title: 'Know where everything stands', text: 'A live dashboard shows completion, workload and anything past its deadline, so nothing slips quietly.',
    points: ['Completion rate at a glance', 'Overdue alerts', 'Recent activity feed'], visual: <InsightsVisual /> },
];

const STEPS = [
  { icon: Users, title: 'Create a team', text: 'Start a workspace and become its owner.' },
  { icon: UserPlus, title: 'Add people and tasks', text: 'Invite teammates, then assign work with priorities and due dates.' },
  { icon: CheckCircle2, title: 'Track it to done', text: 'Move cards across the board and watch the dashboard update.' },
];
const STACK = ['React 19', 'Vite', 'Tailwind CSS 4', 'Express', 'MongoDB', 'Passport.js', 'Joi'];

export const HomePage = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const cta = user ? { to: '/dashboard', label: 'Open Dashboard' } : { to: '/register', label: 'Get started free' };
  const links = [['Features', '#features'], ['How it works', '#how'], ['Tech stack', '#stack']];

  return (
    <div className="home min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-teal-900">
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-teal-100 bg-white/90 backdrop-blur">
        <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-extrabold text-teal-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white"><Layers size={18} aria-hidden="true" /></span>
            Team Task Manager
          </Link>
          <ul className="hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex">
            {links.map(([l, h]) => <li key={l}><a href={h} className="transition-colors duration-200 hover:text-teal-700">{l}</a></li>)}
          </ul>
          <div className="hidden items-center gap-2 md:flex">
            {!user && <Link to="/login" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50">Sign in</Link>}
            <Link to={cta.to} className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-teal-800">
              {user ? 'Dashboard' : 'Sign up'}
            </Link>
          </div>
          <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)} className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-teal-900 hover:bg-teal-50 md:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
        {open && (
          <div id="mobile-menu" className="border-t border-teal-100 bg-white px-4 pb-4 md:hidden">
            <ul className="py-2">
              {links.map(([l, h]) => <li key={l}><a href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 font-semibold text-slate-800 hover:bg-teal-50">{l}</a></li>)}
            </ul>
            <div className="flex flex-col gap-2">
              {!user && <Link to="/login" className={btnSecondary}>Sign in</Link>}
              <Link to={cta.to} className={btnPrimary}>{cta.label}</Link>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <section className="relative overflow-hidden px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <div aria-hidden="true" className="hero-grid absolute inset-0 -z-0" />
          <div className="relative mx-auto max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-1.5 text-sm font-semibold text-teal-800">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-orange-500" /> Team planning, made simple
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-teal-950 sm:text-6xl sm:leading-[1.08]">
              Plan, assign and ship work{' '}
              <span className="underline decoration-orange-500 decoration-4 underline-offset-[6px]">as one team</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
              Team Task Manager brings your teams, tasks and progress into one calm workspace, with Kanban boards,
              role-based access and a live dashboard.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link to={cta.to} className={btnPrimary}>{cta.label} <ArrowRight size={18} aria-hidden="true" /></Link>
              {!user && <Link to="/login" className={btnSecondary}>Sign in</Link>}
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-2"><Check size={16} aria-hidden="true" className="text-teal-700" /> Free to start</li>
              <li className="flex items-center gap-2"><Lock size={16} aria-hidden="true" className="text-teal-700" /> Secure sessions</li>
              <li className="flex items-center gap-2"><Filter size={16} aria-hidden="true" className="text-teal-700" /> Powerful filters</li>
            </ul>
          </div>
          <div className="relative mt-14"><ProductMockup /></div>
        </section>

        <section id="features" className="bg-white px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-teal-700">Features</p>
              <h2 className="mt-3 text-3xl font-extrabold text-teal-950 sm:text-4xl">Everything your team needs, nothing it doesn’t</h2>
            </Reveal>
            <div className="mt-16 space-y-20">
              {FEATURES.map(({ icon: Icon, title, text, points, visual }, i) => (
                <Reveal key={title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                  <div className={i % 2 ? 'lg:order-2' : ''}>
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-100 text-teal-800"><Icon size={24} aria-hidden="true" /></span>
                    <h3 className="mt-5 text-2xl font-extrabold text-teal-950">{title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-700">{text}</p>
                    <ul className="mt-5 space-y-2.5">
                      {points.map((p) => (
                        <li key={p} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-teal-700 text-white"><Check size={12} aria-hidden="true" /></span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`rounded-2xl border border-teal-100 bg-teal-50/60 p-5 sm:p-6 ${i % 2 ? 'lg:order-1' : ''}`}>{visual}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-teal-700">How it works</p>
              <h2 className="mt-3 text-3xl font-extrabold text-teal-950 sm:text-4xl">From idea to done in three steps</h2>
            </Reveal>
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title}>
                  <Reveal className="h-full rounded-2xl border border-teal-100 bg-white p-7">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-700 text-white"><Icon size={22} aria-hidden="true" /></span>
                      <span className="text-4xl font-extrabold text-teal-100" aria-hidden="true">0{i + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold text-teal-950"><span className="sr-only">Step {i + 1}: </span>{title}</h3>
                    <p className="mt-2 text-slate-700">{text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="stack" className="border-y border-teal-100 bg-white px-4 py-16 sm:px-6">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-extrabold text-teal-950">Built on a modern, dependable stack</h2>
            <ul className="mt-8 flex flex-wrap justify-center gap-3">
              {STACK.map((s) => <li key={s} className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900">{s}</li>)}
            </ul>
          </Reveal>
        </section>

        <section className="px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-4xl rounded-3xl bg-teal-800 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to organise your team?</h2>
            <p className="mx-auto mt-4 max-w-xl text-teal-50">Create a free workspace and plan your first project in minutes.</p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link to={cta.to} className={`${btnBase} bg-white text-teal-900 hover:bg-teal-50`}>{cta.label} <ArrowRight size={18} aria-hidden="true" /></Link>
              {!user && <Link to="/login" className={`${btnBase} border border-teal-300 text-white hover:bg-teal-700`}>I already have an account</Link>}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-teal-100 bg-white px-4 py-8 text-center text-sm text-slate-600">
        © {new Date().getFullYear()} Team Task Manager. Built with React, Express and MongoDB.
      </footer>
    </div>
  );
};
