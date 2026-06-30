import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, History, User, ExternalLink, ArrowUpRight, ArrowDownLeft, ShieldCheck, Trophy, Search, X, Check, Filter, PlayCircle, ClipboardList, CheckCircle, CheckCircle2, AlertTriangle, Moon, Shield, Award, Medal, Settings, Edit2 } from 'lucide-react';
import { connectWallet, getActiveTasks, getGDollarBalance, getWorkerSubmissions, getGDollarTransfers, txUrl, submitWork } from '../lib/goodDollar';
import { uploadToIPFS, ipfsToHttp } from '../lib/ipfs';
import { useNavigate } from 'react-router-dom';

// ─── Shared Premium UI Components ─────────────────────────────────────────
const PremiumCard = ({ children, style, noPadding }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
    style={{ background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)', padding: noPadding ? 0 : 32, overflow: 'hidden', backdropFilter: 'blur(16px)', ...style }}>
    {children}
  </motion.div>
);

const SectionHeader = ({ title, subtitle, rightElement }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
    <div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
    {rightElement && <div>{rightElement}</div>}
  </div>
);

function AvailableTasksView({ done, setDone, user }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [submittedTasks, setSubmittedTasks] = useState(new Set(done));

  useEffect(() => {
    getActiveTasks().then(data => { setTasks(data); setFetching(false); }).catch(console.error);
  }, []);

  const isDone = (id) => submittedTasks.has(id) || done.includes(id);
  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) && (filterType === 'All' || t.type === filterType));

  return (
    <PremiumCard>
      <SectionHeader title="Available Tasks" subtitle="Complete verified tasks to earn G$ instantly on Celo." />
      
      {/* Filters */}
      <div className="md-flex-col" style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '14px 20px 14px 48px', borderRadius: 12, border: '1px solid var(--border-medium)', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: 15 }} />
        </div>
        <div className="md-scroll-x" style={{ display: 'flex', background: 'var(--bg-main)', padding: 4, borderRadius: 12 }}>
          {['All', 'Survey', 'Airdrop', 'Beta Test'].map(f => (
            <button key={f} onClick={() => setFilterType(f)} 
              style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: filterType === f ? 'var(--accent-primary)' : 'transparent', color: filterType === f ? '#ffffff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', boxShadow: filterType === f ? 'var(--shadow-glow)' : 'none' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fetching ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading tasks...</div> : filtered.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No tasks found.</div> : filtered.map(t => {
          const completed = isDone(t.id);
          return (
            <div key={t.id} onClick={() => !completed && navigate(`/task/${t.id}`)} className="md-flex-col md-items-start md-gap-4 md-p-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)', background: completed ? 'var(--bg-main)' : 'var(--bg-card)', cursor: completed ? 'default' : 'pointer', transition: '0.3s' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 12, background: t.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={24} color={t.iconColor} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>{t.title}</h3>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 10px', background: t.typeBg || 'var(--bg-main)', borderRadius: 99, color: t.typeColor || 'var(--text-main)', fontWeight: 700 }}>{t.type.toUpperCase()}</span>
                    <span>{t.duration}</span>
                    <span>•</span>
                    <span>{t.slots} spots left</span>
                  </div>
                </div>
              </div>
              <div className="md-w-full justify-between" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reward</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{t.reward}</div>
                </div>
                <button disabled={completed} style={{ padding: '12px 24px', borderRadius: 99, border: 'none', background: completed ? 'var(--bg-main)' : 'var(--text-main)', color: completed ? 'var(--text-dim)' : 'var(--bg-main)', fontWeight: 700, cursor: completed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {completed ? <><Check size={16} /> Claimed</> : <><PlayCircle size={16} /> Start Task</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
}

// ─── 2. Earnings View ─────────────────────────────────────────────────────
function EarningsView({ user }) {
  const [balance, setBalance] = useState('—');
  const [txs, setTxs] = useState([]);
  
  useEffect(() => {
    if (user?.id) {
      getGDollarBalance(user.id).then(setBalance).catch(console.error);
      getGDollarTransfers(user.id).then(setTxs).catch(console.error);
    }
  }, [user]);

  return (
    <PremiumCard>
      <SectionHeader title="Earnings & Wallet" subtitle="Manage your G$ rewards on the Celo network." rightElement={<button style={{ padding: '10px 20px', borderRadius: 99, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><ExternalLink size={16} /> View on CeloScan</button>} />
      
      <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 24, marginBottom: 40 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', color: 'var(--text-main)', padding: 32, borderRadius: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}><Wallet size={160} /></div>
          <div style={{ color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Available Balance</div>
          <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 32 }}>{balance} <span style={{ fontSize: '1.5rem', color: '#10B981' }}>G$</span></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => window.open('https://app.ubeswap.org/', '_blank')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>Swap G$</button>
            <button onClick={() => window.open('https://app.gooddollar.org/', '_blank')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}>Get G$</button>
          </div>
        </div>
        
        <div style={{ background: 'var(--bg-main)', padding: 32, borderRadius: 24, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Pending Escrow</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>2 Tasks</div>
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>Awaiting approval from creators</div>
        </div>

        <div style={{ background: 'var(--bg-main)', padding: 32, borderRadius: 24, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Wallet Address</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10B981', wordBreak: 'break-all' }}>{user?.id ? `${user.id.slice(0,10)}...${user.id.slice(-8)}` : '0x...'}</div>
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>Connected via Celo Mainnet</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16 }}>Recent Transactions</h3>
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden' }}>
        {txs.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</div> : txs.map((tx, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: i !== txs.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: tx.positive ? '#D1FAE5' : '#FEE2E2', color: tx.positive ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tx.positive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Block #{tx.blockNumber}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: tx.positive ? '#10B981' : '#EF4444', fontSize: '1.1rem' }}>{tx.positive ? '+' : '-'}{tx.amount} G$</div>
              <a href={txUrl(tx.txHash)} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#3B82F6', textDecoration: 'none' }}>View on Explorer</a>
            </div>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}

// ─── 3. Task History View ──────────────────────────────────────────────
function TaskHistoryView({ done }) {
  const isEmpty = done.length === 0;

  return (
    <PremiumCard>
      <SectionHeader title="Task History" subtitle="Your completed tasks and on-chain proof of work." />
      {isEmpty ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ClipboardList size={32} color="var(--text-dim)" />
          </div>
          <h3 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>No tasks completed yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Be among the first verified earners on TrueServe.<br />Complete a task and it will appear here with on-chain proof.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden' }}>
          {done.map((id, i) => (
            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: i !== done.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>Task #{id}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Submitted on-chain</div>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '6px 14px', borderRadius: 99, background: '#D1FAE5', color: '#059669' }}>Submitted</span>
            </div>
          ))}
        </div>
      )}
    </PremiumCard>
  );
}

// ─── 4. Leaderboard View ───────────────────────────────────────────────
function LeaderboardView() {
  return (
    <PremiumCard>
      <SectionHeader title="Global Leaderboard" subtitle="Top verified earners — live from the Celo blockchain." />
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Trophy size={32} color="#D97706" />
        </div>
        <h3 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: 12, fontSize: '1.4rem' }}>Leaderboard Launching Soon</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 24px' }}>
          We are a new project. As verified humans complete tasks on-chain, their real wallet addresses and G$ earnings will appear here automatically — no fake numbers.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#D1FAE5', color: '#059669', padding: '10px 20px', borderRadius: 99, fontWeight: 700, fontSize: '0.9rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          Be the first verified earner
        </div>
      </div>
    </PremiumCard>
  );
}

// ─── 5. Profile & Identity View ───────────────────────────────────────────
function ProfileView({ user }) {
  if (user && user.isWhitelisted === false) {
    return (
      <PremiumCard>
        <SectionHeader title="Profile & Identity" subtitle="Manage your Proof of Humanity and platform standing." />
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#FEF2F2', borderRadius: 24, border: '1px solid #FCA5A5' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Shield size={32} color="#EF4444" />
          </div>
          <h3 style={{ fontWeight: 800, color: '#991B1B', marginBottom: 12, fontSize: '1.4rem' }}>Identity Verification Required</h3>
          <p style={{ color: '#991B1B', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 24px', opacity: 0.9 }}>
            You are currently logged in via Dev Mode. To build a Trust Score, accept tasks, and earn G$, you must verify your identity via the GoodDollar Face Verification protocol.
          </p>
          <button onClick={() => window.location.href = '/login'} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#EF4444', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}>Go to Verification</button>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard>
      <SectionHeader title="Profile & Identity" subtitle="Manage your Proof of Humanity and platform standing." />
      
      <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ background: 'var(--bg-main)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Trust Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', marginBottom: 12, lineHeight: 1 }}>New</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Your score builds as creators approve your work on-chain. Complete your first task to start your score!
          </div>
        </div>
        
        <div style={{ background: '#FFFBEB', padding: 24, borderRadius: 16, border: '1px solid #FDE68A' }}>
          <div style={{ color: '#B45309', fontWeight: 700, fontSize: '0.85rem', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Rejection Strikes</div>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#D97706', marginBottom: 16, lineHeight: 1 }}>0 <span style={{fontSize: '1.5rem', color: '#B45309'}}>/ 5</span></div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 10, background: '#FDE68A', borderRadius: 99 }} />)}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#B45309', lineHeight: 1.5 }}>
            Receiving 5 consecutive rejections from creators will result in an automated, permanent platform ban.
          </div>
        </div>
      </div>
      
      <div className="md-flex-col md-gap-4 md-items-start" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 16, padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={32} color="#10B981" />
          </div>
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 6px 0', color: 'var(--text-main)' }}>GoodDollar Identity Active</h4>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>Verified via Celo Network • Expires in 180 days</div>
          </div>
        </div>
        <button style={{ padding: '12px 24px', borderRadius: 12, border: '1px solid var(--border-light)', background: 'var(--bg-card)', fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)', fontSize: '1rem' }}>Re-verify Face</button>
      </div>
    </PremiumCard>
  );
}

// ─── 6. Settings View ──────────────────────────────────────────────────────
function SettingsView() {
  return (
    <PremiumCard>
      <SectionHeader title="Settings" subtitle="Manage notifications, theme, and preferences." />
      
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 16, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: 4 }}>Email Notifications</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Get alerted when a task is approved or rejected</div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: 'var(--accent-primary)' }} />
        </div>

        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: 4 }}>New Task Alerts</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Get notified when a task matching your criteria is posted</div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: 'var(--accent-primary)' }} />
        </div>

        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: 4 }}>Platform Updates</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Get notified about platform updates and new features</div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: 'var(--accent-primary)' }} />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 16 }}>
        <button style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: 'var(--text-main)', color: 'var(--bg-main)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Save Changes</button>
        <button style={{ padding: '14px 28px', borderRadius: 12, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
      </div>
    </PremiumCard>
  );
}

// ─── Main Worker Dashboard ────────────────────────────────────────────────
export default function TaskDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [done, setDone] = useState([]);
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem(`ipfs_profile_${user?.id}`));
  const [profileName, setProfileName] = useState(() => localStorage.getItem(`ipfs_profile_name_${user?.id}`) || `${user?.id?.substring(0, 6)}...${user?.id?.substring(38)}`);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const fileRef = useRef(null);

  const saveName = () => {
    if(tempName.trim()) {
      localStorage.setItem(`ipfs_profile_name_${user?.id}`, tempName.trim());
      setProfileName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        localStorage.setItem(`ipfs_profile_${user?.id}`, base64);
        setProfilePic(base64);
        alert('Profile picture simulated upload to IPFS successful and pinned!');
      };
      reader.readAsDataURL(file);
    }
  };

  const NAV_ITEMS = [
    { id: 'tasks', label: 'Available Tasks', Icon: LayoutDashboard },
    { id: 'earnings', label: 'Earnings & Wallet', Icon: Wallet },
    { id: 'history', label: 'Task History', Icon: History },
    { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
    { id: 'profile', label: 'Profile & Identity', Icon: User },
    { id: 'settings', label: 'Settings', Icon: Settings },
  ];

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 70px)', padding: '20px 16px' }}>
      <div className="md-flex-col md-gap-4" style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        
        {/* Premium Sidebar */}
        <div className="md-w-full md-m-0 md-relative" style={{ width: 280, flexShrink: 0, position: 'sticky', top: 110 }}>
          <div className="md-p-4" style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 16, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-card)', marginBottom: 12, backdropFilter: 'blur(16px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <div 
                  style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => fileRef.current?.click()}
                  title="Upload to IPFS"
                >
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={28} color="#ffffff" />
                  )}
                  <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
                </div>
                <div 
                  onClick={() => fileRef.current?.click()}
                  style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, background: 'var(--bg-main)', borderRadius: '50%', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  <Edit2 size={12} color="var(--text-main)" />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditingName ? (
                  <input 
                    autoFocus
                    value={tempName} 
                    onChange={e => setTempName(e.target.value)} 
                    onBlur={saveName}
                    onKeyDown={e => e.key === 'Enter' && saveName()}
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--accent-primary)', color: 'var(--text-main)', padding: '2px 8px', borderRadius: 6, fontSize: '1.1rem', fontWeight: 800, width: '100%', marginBottom: 4, outline: 'none' }}
                  />
                ) : (
                  <div 
                    onClick={() => { setTempName(profileName); setIsEditingName(true); }}
                    style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title="Click to edit name"
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{profileName}</span>
                    <Edit2 size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  </div>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user?.isWhitelisted === false ? (
                    <><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> Unverified (View Only)</>
                  ) : (
                    <><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> GoodDollar Verified</>
                  )}
                </div>
              </div>
            </div>
            
            <nav className="md-scroll-x" style={{ display: 'flex', flexDirection: window.innerWidth <= 768 ? 'row' : 'column', gap: 2 }}>
              {NAV_ITEMS.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: isActive ? 'var(--accent-primary)' : 'transparent', color: isActive ? '#ffffff' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: '0.3s', textAlign: 'left' }}>
                    <item.Icon size={16} color={isActive ? '#ffffff' : 'var(--text-muted)'} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="md-hidden" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', borderRadius: 24, padding: 24, color: '#ffffff', boxShadow: '0 10px 25px rgba(16,185,129,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Boost Your Trust Score</div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5, marginBottom: 16 }}>Maintain high quality work to retain access to premium surveys.</p>
            <button onClick={() => setActiveTab('profile')} style={{ padding: '10px 16px', width: '100%', borderRadius: 12, border: 'none', background: '#ffffff', color: '#059669', fontWeight: 700, cursor: 'pointer' }}>View Trust Stats</button>
          </div>
        </div>

        {/* Premium Content Area */}
        <div className="md-w-full" style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'tasks' && <AvailableTasksView key="tasks" done={done} setDone={setDone} user={user} />}
            {activeTab === 'earnings' && <EarningsView key="earnings" user={user} />}
            {activeTab === 'history' && <TaskHistoryView key="history" done={done} />}
            {activeTab === 'leaderboard' && <LeaderboardView key="leaderboard" />}
            {activeTab === 'profile' && <ProfileView key="profile" user={user} />}
            {activeTab === 'settings' && <SettingsView key="settings" />}
          </AnimatePresence>
        </div>
        
        {/* Mobile-only Boost card at bottom */}
        <div className="md-block md-w-full md-m-0" style={{ display: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', borderRadius: 24, padding: 24, color: '#ffffff', boxShadow: '0 10px 25px rgba(16,185,129,0.3)' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Boost Your Trust Score</div>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5, marginBottom: 16 }}>Maintain high quality work to retain access to premium surveys.</p>
            <button onClick={() => setActiveTab('profile')} style={{ padding: '10px 16px', width: '100%', borderRadius: 12, border: 'none', background: '#ffffff', color: '#059669', fontWeight: 700, cursor: 'pointer' }}>View Trust Stats</button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
