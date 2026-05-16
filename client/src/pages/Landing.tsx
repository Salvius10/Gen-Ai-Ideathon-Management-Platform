import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const timelineItems = [
  { date: '15 May – 19 May', label: 'Registration (Week-0.5)', desc: 'Register your team and get mentors assigned.' },
  { date: '19 May – 22 May', label: 'Use Case Submission (Week-1)', desc: 'Ideate, create and finalize your use case with your mentor.' },
  { date: '25 May – 29 May', label: 'MVP1 (Week-2)', desc: '50% build completion.' },
  { date: '01 June – 05 June', label: 'Final (Week-3)', desc: '100% build completion.' },
  { date: '06 June – 07 June', label: 'Shortlisting (Week-3.5)', desc: 'Present to jury of Practice Heads.' },
  { date: '12 June', label: 'Finals (Week-4)', desc: 'Present to Founders and Special Jury. (Top 10 shortlisted teams only)' },
];

const dos = [
  'Adherence to timelines are extremely important.',
  'Use of Open-source codes as a starting point.',
  'Use of free or paid license GenAI/Agentic AI tools for development.',
  'Use of Open source or host LLM models for development.',
  'Use of open-source data or synthetic data for solution development, training or as sample data.',
  'Use of additional hardware such as Raspberry Pi for development.',
  'Create a dummy email id and connect for solution development and demo.',
];

const donts = [
  'No Ganit cloud infra or client provided infra to be used for development.',
  'No Ganit or client provided tool licenses to be used for development.',
  'No client data to be used for development, training models or as sample data.',
  'No Ganit accelerator codes to be used as base for development.',
  'No client code to be used as base for development.',
  "No integration with company outlook/teams/any other software's.",
];

const criteria = [
  { name: 'Technicality', icon: '⚙️', desc: 'Quality of the technical implementation and architecture.', accent: false },
  { name: 'Wow Factor', icon: '✨', desc: 'Overall impressiveness and polish of the solution.', accent: true },
  { name: 'Creativity', icon: '💡', desc: 'Novelty and originality of the idea.', accent: false },
  { name: 'Use Case', icon: '🎯', desc: 'Practical applicability and real-world impact.', accent: true },
];

const aboutCards = [
  { icon: '🤝', title: 'Collaborate', desc: 'Form teams of exactly 5 people. Different backgrounds bring breakthrough ideas.', accent: false },
  { icon: '🚀', title: 'Build', desc: 'Create real applications using LLMs, diffusion models, RAG, agents, and more.', accent: true },
  { icon: '🏆', title: 'Win', desc: 'Get evaluated by expert judges and earn recognition for your innovative solution.', accent: false },
];

export default function Landing() {
  const { user } = useAuth();

  const blueOrbs = useMemo(() => Array.from({ length: 14 }).map(() => ({
    w: Math.random() * 200 + 50, h: Math.random() * 200 + 50,
    l: Math.random() * 100, t: Math.random() * 100,
    delay: Math.random() * 6, dur: Math.random() * 4 + 4,
  })), []);
  const orangeOrbs = useMemo(() => Array.from({ length: 6 }).map(() => ({
    w: Math.random() * 150 + 40, h: Math.random() * 150 + 40,
    l: Math.random() * 100, t: Math.random() * 100,
    delay: Math.random() * 6, dur: Math.random() * 4 + 5,
  })), []);

  const getDashboardLink = () => {
    if (!user) return '/register';
    const map: Record<string, string> = {
      PARTICIPANT: '/dashboard',
      MENTOR: '/mentor',
      JUDGE: '/judge',
      ADMIN: '/admin',
    };
    return map[user.role] || '/dashboard';
  };

  return (
    <div className="min-h-screen bg-brand-900">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-brand-800/60 to-brand-900" />
        {/* Blue floating orbs */}
        <div className="absolute inset-0">
          {blueOrbs.map((o, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-brand-500/10 animate-float"
              style={{ width: `${o.w}px`, height: `${o.h}px`, left: `${o.l}%`, top: `${o.t}%`, animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s` }}
            />
          ))}
          {/* Orange floating orbs */}
          {orangeOrbs.map((o, i) => (
            <div
              key={`o-${i}`}
              className="absolute rounded-full bg-accent-500/10 animate-float"
              style={{ width: `${o.w}px`, height: `${o.h}px`, left: `${o.l}%`, top: `${o.t}%`, animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s` }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/20 border border-accent-400/40 text-accent-300 text-sm font-medium mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
            Applications Open · 2026
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Gen-AI{' '}
            <span className="bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Ideathon
            </span>
            <br />
            2026
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Build the future with Generative AI. Innovate, collaborate, and solve real-world problems
            that celebrates creativity and technical excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            {/* Primary CTA — orange */}
            <Link
              to={getDashboardLink()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-accent-400 text-white font-bold text-lg hover:from-accent-600 hover:to-accent-500 transition-all shadow-lg shadow-accent-900/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              {user ? 'Go to Dashboard' : 'Register Now'}
            </Link>
            <a
              href="#about"
              className="px-8 py-4 rounded-xl border border-accent-500/50 text-accent-200 font-semibold text-lg hover:bg-accent-500/10 transition-all"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 mt-16 text-center">
            {[
              { val: '4 weeks', label: 'Hackathon', orange: true },
              { val: '5', label: 'Members per Team', orange: false },
              { val: '4', label: 'Evaluation Criteria', orange: true },
            ].map(({ val, label, orange }) => (
              <div key={label}>
                <div className={`text-3xl font-black ${orange ? 'text-accent-400' : 'text-white'}`}>{val}</div>
                <div className="text-sm text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-3">What is Gen-AI Ideathon?</h2>
            <div className="w-16 h-1 bg-accent-500 rounded-full mx-auto mb-4" />
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              A 48-hour innovation challenge where participants build cutting-edge solutions
              powered by Generative Artificial Intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aboutCards.map((item) => (
              <div
                key={item.title}
                className={`p-8 rounded-2xl border transition-all group ${
                  item.accent
                    ? 'bg-accent-500/10 border-accent-500/30 hover:border-accent-400/60'
                    : 'bg-brand-800/30 border-brand-700/50 hover:border-brand-500/50'
                }`}
              >
                <div className={`text-4xl mb-4 w-14 h-14 rounded-2xl flex items-center justify-center ${
                  item.accent ? 'bg-accent-500/20' : 'bg-brand-700/40'
                }`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-24 bg-brand-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-3">Evaluation Criteria</h2>
            <div className="w-16 h-1 bg-accent-500 rounded-full mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Projects are scored on 4 dimensions, max 100 points each (400 total).</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {criteria.map((c) => (
              <div
                key={c.name}
                className={`p-6 rounded-2xl border text-center transition-all hover:-translate-y-1 ${
                  c.accent
                    ? 'bg-gradient-to-br from-accent-500/15 to-accent-600/5 border-accent-500/30'
                    : 'bg-gradient-to-br from-brand-800/40 to-brand-900/40 border-brand-700/50'
                }`}
              >
                <div className={`text-4xl mb-3 w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                  c.accent ? 'bg-accent-500/20' : 'bg-brand-700/40'
                }`}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{c.name}</h3>
                <p className="text-gray-400 text-sm">{c.desc}</p>
                <div className={`mt-4 font-bold text-lg ${c.accent ? 'text-accent-400' : 'text-brand-400'}`}>/ 100</div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Tiebreaker: Technicality score takes precedence in case of equal total scores.
          </p>
        </div>
      </section>

      {/* Dos and Don'ts */}
      <section className="py-24 bg-brand-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-3">Dos & Don'ts</h2>
            <div className="w-16 h-1 bg-accent-500 rounded-full mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Dos */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-5 flex items-center gap-2">
                <span className="text-2xl">✅</span> Dos
              </h3>
              <div className="space-y-3">
                {dos.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-400/40 transition-colors">
                    <span className="flex-shrink-0 text-green-400 font-bold mt-0.5">✓</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Don'ts */}
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-5 flex items-center gap-2">
                <span className="text-2xl">❌</span> Don'ts
              </h3>
              <div className="space-y-3">
                {donts.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-400/40 transition-colors">
                    <span className="flex-shrink-0 text-red-400 font-bold mt-0.5">✗</span>
                    <p className="text-gray-300 text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-brand-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-3">Event Timeline</h2>
            <div className="w-16 h-1 bg-accent-500 rounded-full mx-auto" />
          </div>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-600 via-accent-500 to-accent-400" />
            <div className="space-y-8">
              {timelineItems.map((item, i) => (
                <div key={i} className="relative flex items-start gap-6">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center z-10 font-bold text-sm text-white ${
                    i % 2 === 0
                      ? 'bg-gradient-to-br from-brand-600 to-brand-400'
                      : 'bg-gradient-to-br from-accent-500 to-accent-400'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-accent-400 text-sm font-semibold mb-1">{item.date}</p>
                    <h3 className="text-white font-bold text-lg">{item.label}</h3>
                    <p className="text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — orange */}
      <section className="py-24 bg-gradient-to-br from-accent-600 to-accent-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Innovate?</h2>
          <p className="text-accent-100 text-lg mb-10">Join developers building the future of AI.</p>
          <Link
            to={user ? getDashboardLink() : '/register'}
            className="px-10 py-4 rounded-xl bg-brand-900 text-white font-bold text-lg hover:bg-brand-800 transition-all shadow-xl hover:-translate-y-0.5 inline-block border border-brand-700"
          >
            {user ? 'Open Dashboard' : 'Register'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-brand-900 border-t border-brand-800 text-center text-brand-300 text-sm">
        <p>© 2026 Gen-AI Ideathon. All rights reserved.</p>
      </footer>
    </div>
  );
}
