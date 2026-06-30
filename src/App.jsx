import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import './index.css';
import IdentityLogin from './components/IdentityLogin';
import TaskDashboard from './components/TaskDashboard';
import CreatorPanel from './components/CreatorPanel';
import Docs from './components/Docs';
import Earners from './components/Earners';
import Creators from './components/Creators';
import { PrivacyPolicy, TermsOfService } from './components/StaticPages';
import { TrueServeLogoIcon, ShieldIcon, ScanFaceIcon, LockIcon, ClipboardIcon, ZapIcon, DropletsIcon, FlaskIcon, CheckIcon, ArrowRightIcon, BriefcaseIcon, CodeIcon, MicIcon, GlobeIcon, GridIcon, CoinsIcon, BarChartIcon } from './components/Icons';
import { LogOut, Bell, Flame, X, Users, Ban as BanIcon } from 'lucide-react';
import SurveyExperience from './components/SurveyExperience';

/* ─── Animated Counter ─── */
function AnimatedCounter({ from = 0, to, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * (to - from) + from));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [to, from, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}



/* ─── Navbar ─── */
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? 'var(--text-main)' : 'var(--text-muted)',
    fontWeight: location.pathname === path ? 700 : 500,
    position: 'relative',
    padding: '8px 12px'
  });

  return (
    <nav 
      className="glass-navbar"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        zIndex: 99, 
        background: scrolled ? 'rgba(6, 9, 19, 0.95)' : 'rgba(6, 9, 19, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        borderRadius: 0,
        margin: 0,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: 12
      }}
    >
      <Link to="/" onClick={() => window.scrollTo(0, 0)} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.5px', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, background: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <TrueServeLogoIcon size={18} color="#ffffff" bgColor="var(--accent-primary)" />
        </div>
        TrueServe
      </Link>

      {/* Nav links — hidden on mobile */}
      <div className="md-hidden" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/earners" style={navLinkStyle('/earners')}>For Earners</Link>
        <Link to="/creators" style={navLinkStyle('/creators')}>For Creators</Link>
        <Link to="/docs" style={navLinkStyle('/docs')}>Docs</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button className="nav-pill md-hidden" onClick={() => navigate('/login')}>Sign In</button>
        <button className="btn-primary btn-dark" onClick={() => navigate('/login')} style={{ padding: '8px 18px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
          Get Started <ArrowRightIcon size={13} />
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero Section with Detailed Mockup ─── */
function Hero() {
  const navigate = useNavigate();

  return (
    <section className="md-hero-sec" style={{ padding: '120px 20px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, rgba(244,245,247,0) 70%)', zIndex: -1 }} />

      <div className="container" style={{ maxWidth: 1000, position: 'relative' }}>
        
        <motion.h1 
          className="md-text-hero"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ fontSize: '5.5rem', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24, color: 'var(--text-main)' }}
        >
          The sovereign engine<br />
          for <span style={{ color: 'var(--text-muted)' }}>human insights</span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: 680, margin: '0 auto 48px', lineHeight: 1.6, fontWeight: 500 }}
        >
          TrueServe eliminates bots and Sybil attacks from Web3 research. Connect directly with your community using token-gated surveys, zero-knowledge proofs, and instant Celo micropayments.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="flex-row justify-center gap-4 md-flex-col" 
          style={{ marginBottom: 80 }}
        >
          <button className="btn-primary btn-dark md-w-full" style={{ padding: '18px 40px', fontSize: '1.15rem' }} onClick={() => navigate('/login')}>
            Launch Dashboard
          </button>
          <button className="btn-primary md-w-full" style={{ padding: '18px 40px', fontSize: '1.15rem', background: 'var(--bg-card)', borderColor: 'var(--border-medium)' }} onClick={() => navigate('/docs')}>
            Read Documentation
          </button>
        </motion.div>

        {/* High Fidelity UI Mockup */}
        <motion.div 
          className="md-hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          style={{ position: 'relative', width: '100%', maxWidth: 1100, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: '24px 24px 0 0', padding: 12, boxShadow: '0 40px 80px rgba(16,185,129,0.1)', borderBottom: 'none' }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: '8px 12px' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          
          <div style={{ background: 'var(--bg-main)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex' }}>
            {/* Mockup Sidebar */}
            <div style={{ width: 220, padding: 24, borderRight: '1px solid var(--border-light)', background: 'var(--bg-card)', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{ width: 32, height: 32, background: 'var(--accent-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrueServeLogoIcon size={20} color="#ffffff" bgColor="var(--accent-primary)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>Project Zeus</div>
              </div>
              <div className="flex-col gap-2">
                <div style={{ padding: '8px 12px', background: 'var(--accent-primary)', color: 'white', borderRadius: 8, fontSize: '.85rem', fontWeight: 600 }}>Active Campaigns</div>
                <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '.85rem', fontWeight: 500 }}>Audience Data</div>
                <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '.85rem', fontWeight: 500 }}>Escrow Funding</div>
              </div>
            </div>
            
            {/* Mockup Content */}
            <div className="md-p-4" style={{ flex: 1, padding: 32, textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Campaign Analytics</h3>
              <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { l: 'Campaign Budget', v: 'Any G$' },
                  { l: 'Verified Workers', v: 'GoodDollar ID' },
                  { l: 'Bot Rate', v: '0%' },
                ].map((s,i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 12, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{s.l}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{s.v}</div>
                  </div>
                ))}
              </div>
              
              <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: '.9rem' }}>Recent Submissions</div>
                {[
                  { n: '0x3F4...9A21', t: '5 mins ago', s: 'Approved' },
                  { n: '0x88C...4B12', t: '12 mins ago', s: 'Approved' },
                  { n: '0x1A2...9C33', t: '1 hour ago', s: 'Pending Review' },
                ].map((r,i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderBottom: i !== 2 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 24, height: 24, background: 'var(--accent-secondary)', borderRadius: '50%' }} />
                      <span style={{ fontSize: '.9rem', fontWeight: 600 }}>{r.n}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>{r.t}</span>
                      <span style={{ fontSize: '.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: r.s === 'Approved' ? 'rgba(16,185,129,0.1)' : 'var(--accent-secondary)', color: r.s === 'Approved' ? 'var(--accent-success)' : 'var(--text-muted)' }}>{r.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



/* ─── Detailed Features ─── */
function Features() {
  const items = [
    { Icon: ShieldIcon, color: '#3b82f6', title: 'Data Sovereignty', desc: 'Participants own their response data, cryptographically secured on-chain with selective disclosure controls. Enterprise-grade privacy built on Celo.' },
    { Icon: CoinsIcon, color: '#10b981', title: 'Token Gating', desc: 'Target specific NFT holders or DAO members with instant wallet validation and weighted voting mechanics. Filter by portfolio balance or on-chain history.' },
    { Icon: BarChartIcon, color: '#8b5cf6', title: 'Live Synthesis', desc: 'Automated sentiment analysis and thematic grouping that updates in real-time as responses are finalized. Export clean, verified datasets.' },
    { Icon: ScanFaceIcon, color: '#f59e0b', title: 'Proof of Humanity', desc: 'Integration with GoodDollar ensures 1 wallet = 1 human. Prevent airdrop farming and survey manipulation completely.' },
  ];

  return (
    <section id="features" style={{ padding: '120px 0', background: 'var(--bg-card)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 80px' }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20 }}>Built for precision.</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            TrueServe provides a robust infrastructure for incentivized human participation, completely eliminating fraudulent engagement.
          </p>
        </div>
        
        <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40 }}>
          {items.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: `0 20px 40px ${f.color}20, 0 0 0 1px ${f.color}40` }}
              className="card-panel" 
              style={{ 
                padding: 40, 
                border: '1px solid var(--border-light)', 
                borderTop: `4px solid ${f.color}`,
                background: 'var(--bg-card)',
                transition: 'box-shadow 0.3s ease'
              }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '16px', background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <f.Icon size={32} color={f.color} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-main)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works (Timeline) ─── */
function HowItWorks() {
  const steps = [
    { num: '1', title: 'Connect & Verify', desc: "Connect your Celo wallet and pass GoodDollar's face verification. Proves you are a unique human." },
    { num: '2', title: 'Browse Tasks', desc: 'View surveys, airdrop claims, and beta tests — all funded and escrowed by verified companies.' },
    { num: '3', title: 'Complete & Submit', desc: 'Do the task. Your response is submitted on-chain with your verified human proof of identity attached.' },
    { num: '4', title: 'Receive G$', desc: 'The smart contract releases your GoodDollar reward automatically upon verified completion. No waiting.' },
  ];
  
  return (
    <section id="how-it-works" className="md-py-10" style={{ padding: '120px 0', background: 'var(--bg-main)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', overflow: 'hidden' }}>
      <div className="container">
        <div className="md-flex-col" style={{ display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 400px' }}>
            <motion.h2 
              className="md-text-4xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24 }}
            >
              Transparent execution from start to finish.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 40 }}
            >
              Our smart contract architecture ensures that workers are always paid for approved work, and creators only pay for verified human engagement.
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="btn-primary" 
              style={{ padding: '14px 28px' }}
            >
              View Smart Contracts
            </motion.button>
          </div>
          
          <div style={{ flex: '1 1 400px', position: 'relative' }}>
            {/* Vertical connecting line */}
            <div style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, background: 'var(--border-medium)', zIndex: 0 }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40, position: 'relative', zIndex: 1 }}>
              {steps.map((s, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  style={{ display: 'flex', gap: 24 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 800, flexShrink: 0, border: '4px solid var(--bg-main)' }}>
                    {s.num}
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>{s.title}</h4>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Audience Focus ─── */
function Solutions() {
  const cards = [
    { Icon: CodeIcon, title: 'Web3 Developers', desc: 'Stop losing your airdrop budget to bots. Guarantee that every claim goes to a real, verified human on Celo.' },
    { Icon: GlobeIcon, title: 'Researchers', desc: 'Collect survey data you can actually trust. Export clean, bot-free datasets directly from on-chain submissions.' },
    { Icon: BriefcaseIcon, title: 'DApp Builders', desc: 'Commission real human testers before you launch. Escrow rewards that release upon structured feedback submission.' },
  ];
  return (
    <section id="solutions" style={{ padding: '120px 0', background: 'var(--bg-card)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20 }}>One protocol. Multiple solutions.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          {cards.map((c, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ borderColor: 'var(--accent-primary)' }}
              className="card-panel" 
              style={{ padding: 40, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'border-color 0.3s ease' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-main)', border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <c.Icon size={24} color="var(--text-main)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 12 }}>{c.title}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTA() {
  const navigate = useNavigate();
  return (
    <section style={{ position: 'relative', padding: '120px 0', borderTop: '1px solid var(--border-light)', overflow: 'hidden' }}>
      {/* Animated Gradient Background */}
      <motion.div 
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(270deg, #f0fdf4, #eff6ff, #f0fdf4)',
          backgroundSize: '200% 200%',
          zIndex: -1
        }}
      />
      
      <div className="container" style={{ textAlign: 'center', maxWidth: 800, position: 'relative', zIndex: 1 }}>
        <h2 className="md-text-5xl" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.03em' }}>Ready to join the network?</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Join the <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>GoodDollar network of 9M+ verified humans</span> and launch your first bot-proof campaign on Celo today.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <CheckIcon size={16} color="var(--accent-success)" /> Powered by Celo
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            <CheckIcon size={16} color="var(--accent-success)" /> GoodDollar Identity
          </div>
        </div>

        <div className="flex-row justify-center gap-4 md-flex-col">
          <button className="btn-primary btn-dark md-w-full" style={{ padding: '18px 48px', fontSize: '1.15rem' }} onClick={() => navigate('/login')}>
            Sign In / Register
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const navigate = useNavigate();
  const SOCIALS = [
    { href: 'https://x.com/True_serve', label: 'Twitter / X', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.262 5.638L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117z"/></svg> },
    { href: 'https://t.me/true_serve', label: 'Telegram', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg> },
    { href: 'https://discord.gg/98mm3pRty', label: 'Discord', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.1.12 18.14.143 18.16a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> },
    { href: 'https://github.com/naitikrahane/trueserve', label: 'GitHub', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
  ];
  return (
    <footer className="md-py-10" style={{ padding: '80px 0 40px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <div className="md-flex-col" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 80, flexWrap: 'wrap', gap: 40 }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.2rem', marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: 'var(--accent-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrueServeLogoIcon size={20} color="#ffffff" bgColor="var(--accent-primary)" />
              </div> TrueServe
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '.9rem', marginBottom: 24 }}>
              A 100% bot-proof micro-service platform powered by GoodDollar Identity on Celo.
            </p>
            {/* Social icons row */}
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIALS.map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
            <div className="flex-col gap-3">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Platform</div>
              <Link to="/earners" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none' }}>For Earners</Link>
              <Link to="/creators" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none' }}>For Creators</Link>
              <Link to="/docs" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none' }}>Documentation</Link>
            </div>
            <div className="flex-col gap-3">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Ecosystem</div>
              <a href="https://celo.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none' }}>Celo Network</a>
              <a href="https://gooddollar.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none' }}>GoodDollar Protocol</a>
              <a href="https://github.com/naitikrahane/trueserve" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none' }}>GitHub</a>
            </div>
            <div className="flex-col gap-3">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Community</div>
              {SOCIALS.map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {s.icon} {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '.85rem', flexWrap: 'wrap', gap: 16 }}>
          <div>© 2026 TrueServe. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link to="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Landing Page Layout ─── */
function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-main)' }}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Solutions />
      <CTA />
      <Footer />
    </div>
  );
}

/* ─── App Shell with Routing ─── */
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trueserve_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem('trueserve_user', JSON.stringify(user));
    else localStorage.removeItem('trueserve_user');
  }, [user]);

  const location = useLocation();
  const navigate = useNavigate();

  // Simple layout wrapper for pages that need Navbar + Footer
  const PageLayout = ({ children }) => (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div className="mobile-pt-nav" style={{ flex: 1, paddingTop: 80 }}>{children}</div>
      <Footer />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/docs" element={<PageLayout><Docs /></PageLayout>} />
      <Route path="/privacy" element={<PageLayout><PrivacyPolicy /></PageLayout>} />
      <Route path="/terms" element={<PageLayout><TermsOfService /></PageLayout>} />
      <Route path="/earners" element={<PageLayout><Earners /></PageLayout>} />
      <Route path="/creators" element={<PageLayout><Creators /></PageLayout>} />
      
      <Route path="/login" element={
        <IdentityLogin 
          onLogin={u => { setUser(u); navigate('/dashboard'); }} 
          onBack={() => navigate('/')} 
        />
      } />

      <Route path="/dashboard" element={
        user ? (
          <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
            <nav style={{ borderRadius: 0, margin: 0, top: 0, left: 0, right: 0, zIndex: 99, borderBottom: '1px solid var(--border-light)', position: 'fixed', background: 'rgba(6, 9, 19, 0.95)', backdropFilter: 'blur(20px)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', flexWrap: 'nowrap', gap: 8 }}>
              <Link to="/" style={{ background: 'none', border: 'none', color: 'inherit', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: 26, height: 26, background: 'var(--accent-primary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrueServeLogoIcon size={16} color="#ffffff" bgColor="var(--accent-primary)" />
                </div>
                TrueServe
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-pill)', background: 'var(--bg-main)', border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                  {user.role === 'creator' ? 'Creator' : 'Verified'}
                </span>
                <button className="nav-pill" style={{ padding: '4px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => { setUser(null); navigate('/'); }}>
                  Sign Out
                </button>
              </div>
            </nav>
            <div style={{ flex: 1, paddingTop: 70, background: 'var(--bg-main)', minHeight: 'calc(100vh - 70px)' }}>
              {user.role === 'creator' ? <CreatorPanel user={user} /> : <TaskDashboard user={user} />}
            </div>
          </div>
        ) : (
          <div style={{ padding: 100, textAlign: 'center' }}>
            <h2>Please log in first.</h2>
            <Link to="/login" className="btn-primary" style={{ marginTop: 20 }}>Go to Login</Link>
          </div>
        )
      } />

      <Route path="/task/:taskId" element={
        user ? <SurveyExperience user={user} /> : <IdentityLogin onLogin={u => { setUser(u); navigate('/dashboard'); }} onBack={() => navigate('/')} />
      } />
    </Routes>
  );
}
