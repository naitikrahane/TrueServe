import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Coins, CheckCircle, Smartphone, AlertCircle, ArrowRight, Star, Plus, Minus, Check, PlayCircle, ClipboardList, TrendingUp, Zap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, ScanFaceIcon, LockIcon, ClipboardIcon, ZapIcon, DropletsIcon, FlaskIcon, CheckIcon, ArrowRightIcon, BriefcaseIcon, CodeIcon, MicIcon, GlobeIcon, GridIcon, CoinsIcon, BarChartIcon } from './Icons';

/* ─── FAQ Component ─── */
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border-light)', padding: '16px 0' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '16px 0', textAlign: 'left' }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{question}</span>
        {isOpen ? <Minus size={20} color="var(--text-muted)" /> : <Plus size={20} color="var(--text-muted)" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{ paddingBottom: 16, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Powered-By Badge ─── */
const PoweredByBadge = () => (
  <div style={{ background: 'var(--bg-card)', padding: '24px 32px', borderRadius: 16, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 16, minWidth: 280 }}>
    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Built On</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
      {[
        { label: 'GoodDollar', sub: '9M+ verified citizens', color: '#10B981', Icon: ShieldCheck },
        { label: 'Celo', sub: 'Instant payments', color: '#8B5CF6', Icon: Zap },
      ].map((b, i) => (
        <div key={i} style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${b.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
            <b.Icon size={22} color={b.color} />
          </div>
          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{b.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.sub}</div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-dim)', background: 'var(--bg-main)', padding: '6px 14px', borderRadius: 99 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-success)', animation: 'pulse 2s infinite' }} />
      Launching on Celo Mainnet
    </div>
  </div>
);

export default function Earners() {
  const navigate = useNavigate();
  const [calcTasks, setCalcTasks] = useState(5);
  const [calcType, setCalcType] = useState('survey');

  const calcRates = {
    survey: 200,
    appTest: 1500,
    engagement: 100
  };

  const estimatedDaily = calcTasks * calcRates[calcType];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', overflow: 'hidden' }}>
      
      {/* ─── Hero Section ─── */}
      <section style={{ padding: '100px 24px 120px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="container" style={{ maxWidth: 900, position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="md-text-5xl" style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
              Earn G$ for being <span style={{ color: 'var(--accent-success)' }}>human</span>
            </h1>
            <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
              Complete verified tasks from top Web3 projects. Get paid instantly on Celo. No bank needed.
            </p>
          </motion.div>

          <motion.div className="md-flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 80 }}>
            <button onClick={() => navigate('/login')} className="btn-primary md-w-full" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Start Earning
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary md-w-full" style={{ padding: '16px 40px', fontSize: '1.1rem', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-medium)' }}>
              See Available Tasks
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <PoweredByBadge />
          </motion.div>
        </div>
      </section>

      {/* ─── How Earnings Work ─── */}
      <section style={{ padding: '100px 24px' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800 }}>How Earnings Work</h2>
          </div>
          
          <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {[
              { icon: ScanFaceIcon, color: '#3B82F6', title: '1. Verify once', desc: 'Use GoodDollar face ID to prove you are a unique human. One verification unlocks the whole network.' },
              { icon: ClipboardList, color: '#8B5CF6', title: '2. Pick tasks', desc: 'Choose from surveys, app testing, and engagement tasks. Work whenever you want.' },
              { icon: ZapIcon, color: '#10B981', title: '3. Get paid instantly', desc: 'As soon as your work is approved, the smart contract sends G$ directly to your wallet.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ background: 'var(--bg-card)', padding: 40, borderRadius: 24, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)', textAlign: 'center', backdropFilter: 'blur(16px)' }}
              >
                <div style={{ width: 64, height: 64, background: `${step.color}15`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <step.icon size={32} color={step.color} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Task Types ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 60 }}>Choose How You Earn</h2>
          <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {[
              { icon: ClipboardIcon, title: 'Survey', badge: '5-15 min', reward: 'G$ set by creator' },
              { icon: Smartphone, title: 'App Testing', badge: '20-60 min', reward: 'G$ set by creator' },
              { icon: TrendingUp, title: 'Streaming Tasks', badge: 'Ongoing', reward: 'G$ set by creator' },
              { icon: GlobeIcon, title: 'Engagement', badge: '2-5 min', reward: 'G$ set by creator' }
            ].map((task, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, borderColor: 'var(--border-glow)', boxShadow: 'var(--shadow-glow)' }}
                transition={{ duration: 0.3 }}
                style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)', transition: 'all 0.3s', backdropFilter: 'blur(16px)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div style={{ padding: 12, background: 'var(--bg-main)', borderRadius: 12 }}>
                    <task.icon size={24} color="var(--text-main)" />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', background: 'var(--bg-main)', borderRadius: 99, color: 'var(--text-muted)' }}>
                    {task.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>{task.title}</h3>
                <p style={{ color: 'var(--accent-success)', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{task.reward}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why TrueServe & Calculator ─── */}
      <section style={{ padding: '100px 24px' }}>
        <div className="container md-flex-col" style={{ maxWidth: 1200, display: 'flex', flexWrap: 'wrap', gap: 60 }}>
          
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="md-text-4xl" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 40 }}>Why earners choose TrueServe</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                'Instant smart contract payments (no 30-day waits)',
                'No bank account needed — direct to your Celo wallet',
                'Work from anywhere in the world',
                'Verified humans get priority access to premium tasks'
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={16} color="var(--accent-success)" />
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-muted)' }}>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <div style={{ background: 'var(--bg-card)', padding: 40, borderRadius: 24, border: '1px solid var(--border-light)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Earnings Calculator</h3>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Task Type</label>
                <select 
                  value={calcType} 
                  onChange={(e) => setCalcType(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border-medium)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none' }}
                >
                  <option value="survey">Surveys</option>
                  <option value="appTest">App Testing</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>
                  <span>Tasks per day</span>
                  <span>{calcTasks} tasks</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={calcTasks} 
                  onChange={(e) => setCalcTasks(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                />
              </div>

              <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Estimated Earnings</div>
                <motion.div 
                  key={estimatedDaily}
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: 16 }}
                >
                  {estimatedDaily.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>G$ / day</span>
                </motion.div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  <div>{(estimatedDaily * 7).toLocaleString()} G$ / week</div>
                  <div>{(estimatedDaily * 30).toLocaleString()} G$ / month</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 20 }}>Why GoodDollar Citizens?</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: 60, maxWidth: 600, margin: '0 auto 60px' }}>
            TrueServe is built on the GoodDollar identity layer — the largest Sybil-resistant network of verified humans in Web3.
          </p>
          <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { Icon: Users, iconColor: '#3B82F6', title: '9M+ Verified Humans', desc: 'GoodDollar has verified over 9 million unique citizens via face ID — every one of them a potential earner on TrueServe.' },
              { Icon: ShieldCheck, iconColor: '#10B981', title: '100% Sybil-Resistant', desc: 'GoodDollar\'s face verification means zero bot accounts. Creators pay only for real human responses.' },
              { Icon: Zap, iconColor: '#8B5CF6', title: 'Instant G$ Payouts', desc: 'Smart contract escrow on Celo releases your G$ reward the moment a creator approves your work — no waiting.' },
            ].map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-light)', textAlign: 'center', backdropFilter: 'blur(16px)' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${c.iconColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <c.Icon size={28} color={c.iconColor} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>{c.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: '100px 24px' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 60 }}>Frequently Asked Questions</h2>
          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <FAQItem 
              question="How do I get verified?" 
              answer="You simply connect your Celo wallet and follow the prompt to verify with GoodDollar. It takes a quick 3D face scan using your phone or webcam. It is privacy-preserving and ensures you are a unique human."
            />
            <FAQItem 
              question="When do I get paid?" 
              answer="As soon as the task creator approves your submission, the smart contract automatically releases the funds to your wallet. If the creator doesn't review it within 48 hours, the system auto-approves it."
            />
            <FAQItem 
              question="What is G$?" 
              answer="G$ (GoodDollar) is a reserve-backed crypto token on the Celo network. It is designed to be a digital basic income, but on TrueServe, it is used as the primary payment currency for tasks."
            />
            <FAQItem 
              question="Can I do multiple tasks?" 
              answer="Yes! As long as you meet the requirements (like Trust Score) for the tasks, you can complete as many available tasks as you like."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '120px 24px', background: 'var(--accent-primary)', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: 24 }}>Ready to get started?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: 48, lineHeight: 1.6 }}>
            Join the decentralized workforce. Your identity is your most valuable asset.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary btn-dark" style={{ padding: '18px 48px', fontSize: '1.2rem', background: '#fff', color: 'var(--accent-primary)' }}>
            Start Earning Today
          </button>
        </div>
      </section>
    </div>
  );
}
