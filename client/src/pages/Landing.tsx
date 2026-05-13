import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const timelineItems = [
  { date: 'Day 1 - 9:00 AM', label: 'Registration & Kick-off', desc: 'Register, form teams, meet your mentors.' },
  { date: 'Day 1 - 2:00 PM', label: 'Check-In 1', desc: 'Share your tech stack, workflow and approach.' },
  { date: 'Day 2 - 9:00 AM', label: 'Check-In 2', desc: 'Submit GitHub link and progress update.' },
  { date: 'Day 2 - 3:00 PM', label: 'Final Submission', desc: 'Lock in your final project and GitHub repo.' },
  { date: 'Day 2 - 5:00 PM', label: 'Results & Awards', desc: 'Judges evaluate and winners are announced.' },
];

const rules = [
  'Teams must have 2 to 5 members.',
  'Each member can belong to exactly one team.',
  'Problem statements must focus on real-world Gen-AI applications.',
  'All code must be original and developed during the event.',
  'Final submissions are locked — no edits after submission.',
  'Judges score each project on four criteria (max 400 points).',
  'Ties are broken by the Technicality score.',
];

const criteria = [
  { name: 'Technicality', icon: '⚙️', desc: 'Quality of the technical implementation and architecture.' },
  { name: 'Wow Factor', icon: '✨', desc: 'Overall impressiveness and polish of the solution.' },
  { name: 'Creativity', icon: '💡', desc: 'Novelty and originality of the idea.' },
  { name: 'Use Case', icon: '🎯', desc: 'Practical applicability and real-world impact.' },
];

export default function Landing() {
  const { user } = useAuth();

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
    <div className="min-h-screen bg-[#0a0614]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-purple-900/60 to-[#0a0614]" />
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-brand-500/10 animate-float"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 4 + 4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-sm font-medium mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Applications Open · 2024
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight animate-slide-up">
            Gen-AI{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Ideathon
            </span>
            <br />
            2024
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Build the future with Generative AI. Innovate, collaborate, and solve real-world problems
            in a 48-hour hackathon that celebrates creativity and technical excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              to={getDashboardLink()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-bold text-lg hover:from-brand-500 hover:to-purple-500 transition-all shadow-lg shadow-brand-900/50 hover:shadow-xl hover:-translate-y-0.5"
            >
              {user ? 'Go to Dashboard' : 'Register Now'}
            </Link>
            <a
              href="#about"
              className="px-8 py-4 rounded-xl border border-gray-600 text-gray-200 font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Learn More
            </a>
          </div>

          <div className="flex items-center justify-center gap-8 mt-16 text-center">
            {[['48h', 'Hackathon'], ['∞', 'Creativity'], ['4', 'Evaluation Criteria']].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl font-black text-white">{val}</div>
                <div className="text-sm text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">What is Gen-AI Ideathon?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              A 48-hour innovation challenge where participants build cutting-edge solutions
              powered by Generative Artificial Intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🤝', title: 'Collaborate', desc: 'Form diverse teams of 2–5 people. Different backgrounds bring breakthrough ideas.' },
              { icon: '🚀', title: 'Build', desc: 'Create real applications using LLMs, diffusion models, RAG, agents, and more.' },
              { icon: '🏆', title: 'Win', desc: 'Get evaluated by expert judges and earn recognition for your innovative solution.' },
            ].map((item) => (
              <div key={item.title} className="p-8 rounded-2xl bg-gray-900 border border-gray-800 hover:border-brand-700/50 transition-colors group">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-24 bg-[#0a0614]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Evaluation Criteria</h2>
            <p className="text-gray-400 text-lg">Projects are scored on 4 dimensions, max 100 points each (400 total).</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {criteria.map((c) => (
              <div key={c.name} className="p-6 rounded-2xl bg-gradient-to-br from-brand-900/60 to-purple-900/40 border border-brand-800/50 text-center">
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3 className="font-bold text-white text-lg mb-2">{c.name}</h3>
                <p className="text-gray-400 text-sm">{c.desc}</p>
                <div className="mt-4 text-brand-400 font-bold">/ 100</div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Tiebreaker: Technicality score takes precedence in case of equal total scores.
          </p>
        </div>
      </section>

      {/* Rules */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Event Rules</h2>
          </div>
          <div className="space-y-4">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-gray-900 border border-gray-800">
                <span className="flex-shrink-0 h-7 w-7 rounded-full bg-brand-600 text-white text-sm flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                <p className="text-gray-300 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-[#0a0614]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Event Timeline</h2>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-600 to-purple-600" />
            <div className="space-y-8">
              {timelineItems.map((item, i) => (
                <div key={i} className="relative flex items-start gap-6">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center z-10">
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-brand-400 text-sm font-medium mb-1">{item.date}</p>
                    <h3 className="text-white font-bold text-lg">{item.label}</h3>
                    <p className="text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-900 to-purple-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Innovate?</h2>
          <p className="text-gray-300 text-lg mb-10">Join hundreds of developers building the future of AI. Registration is free.</p>
          <Link
            to={user ? getDashboardLink() : '/register'}
            className="px-10 py-4 rounded-xl bg-white text-brand-700 font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-0.5 inline-block"
          >
            {user ? 'Open Dashboard' : 'Get Started Free'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-950 border-t border-gray-900 text-center text-gray-500 text-sm">
        <p>© 2024 Gen-AI Ideathon. All rights reserved.</p>
      </footer>
    </div>
  );
}
