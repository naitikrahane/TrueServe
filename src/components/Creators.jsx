import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, XCircle, CheckCircle, Wallet, Layout, ArrowRight, Zap, Target, Lock, FileCode, Plus, Minus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, CodeIcon } from './Icons';

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

export default function Creators() {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
      
      {/* ─── Hero Section ─── */}
      <section style={{ padding: '100px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div className="container" style={{ maxWidth: 1000, position: 'relative' }}>
          <motion.h1 
            className="md-text-5xl"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}
          >
            Research without bots.<br />Finally.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: '1.3rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 48, maxWidth: 680, margin: '0 auto 48px' }}
          >
            Post tasks to GoodDollar's network of 9M+ verified humans. G$ rewards paid instantly via Celo smart contract escrow.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: 80 }}
          >
            <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
              Launch a Campaign <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </button>
          </motion.div>

          {/* Mini UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ 
              maxWidth: 800, margin: '0 auto', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.08)'
            }}
          >
            <div style={{ padding: '16px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700 }}>New Campaign</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Escrow Balance: 50,000 G$</div>
            </div>
            <div className="md-grid-cols-1 md-p-4" style={{ padding: 32, textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Target Audience</label>
                <div style={{ padding: 12, border: '1px solid var(--border-medium)', borderRadius: 8, background: 'var(--bg-main)', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="var(--accent-success)" />
                  GoodDollar Verified Only
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Reward per human</label>
                <div style={{ padding: 12, border: '1px solid var(--border-medium)', borderRadius: 8, background: 'var(--bg-main)', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  200 G$
                </div>
              </div>
            </div>
            <div className="md-p-4" style={{ padding: '0 32px 32px' }}>
              <div style={{ width: '100%', height: 48, background: 'var(--accent-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                Deploy Campaign
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── The Problem vs TrueServe ─── */}
      <section className="md-py-10" style={{ padding: '120px 24px' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 60 }}>The Traditional Way is Broken</h2>
          
          <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
            {/* Before */}
            <div style={{ background: 'rgba(239,68,68,0.12)', padding: 40, borderRadius: 24, border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, color: '#F87171' }}>
                <XCircle size={32} />
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Traditional Platforms</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {['30-70% bot responses', 'No identity verification', 'Pay upfront, pray for results', 'Data you cannot trust'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: '1.1rem', color: '#FCA5A5' }}>
                    <XCircle size={20} style={{ flexShrink: 0, marginTop: 4 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* TrueServe */}
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: 40, borderRadius: 24, border: '1px solid rgba(16,185,129,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, color: 'var(--accent-success)' }}>
                <CheckCircle size={32} />
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>TrueServe Protocol</h3>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {['0% bot responses', 'GoodDollar face verification', 'Escrow — pay only on approval', 'On-chain verified data'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, fontSize: '1.1rem', color: '#6EE7B7' }}>
                    <CheckCircle size={20} style={{ flexShrink: 0, marginTop: 4 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Campaign Types ─── */}
      <section className="md-py-10" style={{ padding: '120px 24px', background: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 60 }}>What will you build?</h2>
          
          <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { title: 'Survey Research', desc: 'Collect verified human opinions and clean datasets for market research.', icon: Target, color: '#3B82F6' },
              { title: 'Airdrop Gating', desc: 'Whitelist only real humans for your next token drop. Eliminate sybils.', icon: ShieldCheck, color: '#8B5CF6' },
              { title: 'Beta Testing', desc: 'Hire structured testers with streaming pay using Superfluid integrations.', icon: Layout, color: '#10B981' },
              { title: 'Engagement Tasks', desc: 'Acquire real social proof and authentic growth from verified users.', icon: Users, color: '#F59E0B' }
            ].map((type, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-light)', backdropFilter: 'blur(10px)' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${type.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                  <type.icon size={28} color={type.color} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>{type.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works (Creators) ─── */}
      <section className="md-py-10" style={{ padding: '120px 24px' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 60 }}>4 Steps to Verified Data</h2>
          
          <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            {[
              { step: 1, title: 'Fund escrow with G$', desc: 'Connect your wallet and lock the total campaign reward in the TrueServe smart contract.' },
              { step: 2, title: 'Define task & requirements', desc: 'Upload your questions/instructions to IPFS. Set target criteria (e.g. Trust Score > 80).' },
              { step: 3, title: 'Verified humans complete tasks', desc: 'Only users who pass GoodDollar face verification can see and submit work.' },
              { step: 4, title: 'Approve responses, G$ auto-releases', desc: 'Review submissions. Reject bad ones (slot reopens). Approve good ones to release payment.' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="md-flex-col"
                style={{ display: 'flex', gap: 24, alignItems: 'center', background: 'var(--bg-card)', padding: 32, borderRadius: 24, border: '1px solid var(--border-light)' }}
              >
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing & Trust ─── */}
      <section className="md-py-10" style={{ padding: '120px 24px', background: 'var(--bg-card)' }}>
        <div className="container md-flex-col" style={{ maxWidth: 1200, display: 'flex', flexWrap: 'wrap', gap: 60 }}>
          
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="md-text-4xl" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Simple, transparent pricing</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.6 }}>
              You define the reward per task. We only take a tiny flat fee on approved submissions. No monthly subscriptions, no hidden costs.
            </p>
            
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 24, overflow: 'hidden' }}>
              <div style={{ padding: 32, borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent-primary)' }}>2%</div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Platform Fee</div>
                  <div style={{ color: 'var(--text-muted)' }}>Per approved response</div>
                </div>
              </div>
              <div style={{ padding: 32, background: 'var(--bg-main)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500 }}><Check size={18} color="var(--accent-success)" /> 98% goes directly to workers</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500 }}><Check size={18} color="var(--accent-success)" /> You set the reward amount</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 500 }}><Check size={18} color="var(--accent-success)" /> 2% of fees donated to GoodDollar UBI pool</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ flex: '1 1 400px' }}>
            <h2 className="md-text-4xl" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24 }}>Trust & Security</h2>
            <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[
                { icon: FileCode, title: 'Smart Contract Audited', desc: 'Secure, immutable escrow on Celo.' },
                { icon: ShieldCheck, title: 'GoodDollar Identity', desc: 'World-class biometric sybil resistance.' },
                { icon: Lock, title: 'You Control Approvals', desc: 'Funds only release when you are satisfied.' },
                { icon: CodeIcon, title: '100% Open Source', desc: 'Verify our code on GitHub.' }
              ].map((t, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)', backdropFilter: 'blur(10px)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <t.icon size={20} color="var(--accent-primary)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{t.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="md-py-10" style={{ padding: '120px 24px' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3rem', fontWeight: 800, textAlign: 'center', marginBottom: 60 }}>Creator FAQ</h2>
          <div style={{ borderTop: '1px solid var(--border-light)' }}>
            <FAQItem 
              question="How is G$ acquired?" 
              answer="You can swap for G$ on Ubeswap or Uniswap using Celo or other stablecoins. Alternatively, you can purchase it directly through fiat on-ramps connected to the Celo network."
            />
            <FAQItem 
              question="What if a worker submits bad work?" 
              answer="You have 48 hours to review submissions. If the work is poor, simply click 'Reject'. The worker's trust score will drop, and the slot will instantly reopen for another verified human to complete. The G$ remains safely in escrow."
            />
            <FAQItem 
              question="Can I cancel a campaign?" 
              answer="Yes. If you haven't approved any submissions yet, you can cancel the campaign at any time and immediately retrieve your full escrowed budget."
            />
            <FAQItem 
              question="Is my data private?" 
              answer="Your task criteria and the worker's submitted proofs (via IPFS) are public by default on the blockchain. However, you can configure your campaign to accept encrypted IPFS payloads if you require data privacy."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="md-py-10" style={{ padding: '120px 24px', background: 'var(--accent-primary)', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h2 className="md-text-4xl" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: 24 }}>Stop paying bots.</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: 48, lineHeight: 1.6 }}>
            Launch your first verified campaign today and get real insights from real humans.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary btn-dark" style={{ padding: '18px 48px', fontSize: '1.2rem', background: '#fff', color: 'var(--accent-primary)' }}>
            Create Your First Campaign
          </button>
        </div>
      </section>
    </div>
  );
}
