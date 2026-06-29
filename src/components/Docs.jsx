import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldIcon } from './Icons';
import { ChevronRight, Plus, Minus, Check, Code, BookOpen, Key, Link as LinkIcon, Zap } from 'lucide-react';

/* ─── Code Snippet Component ─── */
const CodeBlock = ({ code }) => (
  <div style={{ background: '#1e293b', borderRadius: 12, padding: '20px', overflowX: 'auto', marginBottom: 24, border: '1px solid #334155' }}>
    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>
      <code>{code}</code>
    </pre>
  </div>
);

/* ─── FAQ Accordion ─── */
const DocFAQ = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border-light)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '20px 0', textAlign: 'left' }}
      >
        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>{question}</span>
        {isOpen ? <Minus size={18} color="var(--text-muted)" /> : <Plus size={18} color="var(--text-muted)" />}
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
            <p style={{ paddingBottom: 20, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Docs() {
  const [activeTab, setActiveTab] = useState('getting-started');

  const scrollTo = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'smart-contracts', label: 'Smart Contracts', icon: Code },
    { id: 'identity-sdk', label: 'Identity SDK', icon: ShieldIcon },
    { id: 'task-types', label: 'Task Types', icon: Check },
    { id: 'payment-flow', label: 'Payment Flow', icon: Zap },
    { id: 'api-reference', label: 'API Reference', icon: LinkIcon },
    { id: 'faq', label: 'FAQ', icon: Key }
  ];

  return (
    <div className="md-flex-col" style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', alignItems: 'flex-start' }}>
      
      {/* ─── Sidebar ─── */}
      <aside className="md-hidden" style={{ width: 280, background: 'var(--bg-card)', borderRight: '1px solid var(--border-light)', height: 'calc(100vh - 70px)', position: 'sticky', top: 70, overflowY: 'auto', padding: '32px 0' }}>
        <div style={{ padding: '0 24px', marginBottom: 16, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Documentation</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', background: activeTab === item.id ? 'rgba(16,185,129,0.1)' : 'transparent', border: 'none', borderRight: activeTab === item.id ? '3px solid var(--accent-success)' : '3px solid transparent', color: activeTab === item.id ? 'var(--accent-success)' : 'var(--text-muted)', fontWeight: activeTab === item.id ? 700 : 500, fontSize: '0.95rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="md-p-4 md-w-full" style={{ flex: 1, padding: '40px 60px 100px', maxWidth: 900, minWidth: 0 }}>
        
        {/* GETTING STARTED */}
        <section id="getting-started" style={{ marginBottom: 80 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 24, letterSpacing: '-0.02em' }}>Getting Started</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
            TrueServe is a decentralized micro-task escrow protocol built on the Celo blockchain. It leverages the GoodDollar Identity SDK to guarantee that 100% of tasks are completed by verified, unique humans.
          </p>
          
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Prerequisites</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Check size={18} color="var(--accent-success)" /> A Web3 wallet connected to Celo Mainnet.</li>
            <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Check size={18} color="var(--accent-success)" /> GoodDollar (G$) tokens for escrow funding.</li>
            <li style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Check size={18} color="var(--accent-success)" /> Celo (CELO) for gas fees (less than $0.01 per tx).</li>
          </ul>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Quick Start Guide</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>1. Connect & Verify</div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Login with your Celo wallet. If you are an earner, complete the GoodDollar 3D face scan.</p>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>2. Escrow Funds (Creators)</div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Call `createTask()` on the smart contract to define your task and lock the G$ reward.</p>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>3. Approve & Release</div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Review the IPFS proofs submitted by workers. Calling `approveWork()` instantly routes 98% to the worker and 2% to the UBI pool.</p>
            </div>
          </div>
        </section>

        {/* SMART CONTRACTS */}
        <section id="smart-contracts" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>Smart Contracts</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            The TrueServe protocol is entirely non-custodial. Funds are held in a smart contract escrow until the creator approves the work or the 48-hour auto-approve window expires.
          </p>
          
          <div style={{ background: 'var(--bg-card)', padding: '16px 24px', borderRadius: 12, border: '1px solid var(--border-light)', display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Code size={20} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Celo Mainnet:</span>
            <a href="https://celoscan.io/address/0x451c96B6aB4FBb4f87654ef6a60a504C7322AbB8" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>
              0x451c96B6aB4FBb4f87654ef6a60a504C7322AbB8
            </a>
          </div>

          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 16 }}>Key Functions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Function</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Caller</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>createTask()</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>Creator</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Locks G$ in escrow and sets task requirements.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>submitWork()</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>Worker (Verified)</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Submits IPFS hash of completed work. Takes 1 slot.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>approveWork()</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>Creator</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Releases funds to the worker. Slot is permanently filled.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>rejectWork()</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>Creator</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rejects work. Lowers worker trust score. Slot reopens.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>autoApprove()</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>Public</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Can be called by anyone if 48hrs pass without creator review.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>cancelTask()</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>Creator</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Refunds unspent escrow. Only possible if 0 slots approved.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* IDENTITY SDK */}
        <section id="identity-sdk" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>Identity SDK</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            TrueServe natively integrates the GoodDollar Identity Protocol. Before a worker can call `submitWork()`, the contract checks the GoodDollar Identity Contract to ensure the address belongs to a verified human.
          </p>
          
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Verification Flow</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            1. User connects wallet to TrueServe.<br/>
            2. If unverified, user is redirected to the GoodDollar dApp.<br/>
            3. User completes a 3D Face-scan (FaceTec).<br/>
            4. GoodDollar mints a soulbound Identity token to their address.<br/>
            5. TrueServe contract allows them to submit work.
          </p>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Frontend Integration</h3>
          <CodeBlock code={`import { verifyIdentity } from './lib/goodDollar';

// Check if current connected wallet is human
const checkHumanity = async (walletAddress) => {
  const isVerified = await verifyIdentity(walletAddress);
  
  if (!isVerified) {
    promptUserToCompleteFaceScan();
  } else {
    unlockTaskSubmissions();
  }
};`} />
        </section>

        {/* TASK TYPES */}
        <section id="task-types" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>Task Types</h2>
          
          <div style={{ display: 'grid', gap: 24 }}>
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>1. Survey Research</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>One-time submission. Workers fill out a form, data is uploaded to IPFS. The IPFS hash is submitted on-chain. Best for market research and polling.</p>
            </div>
            
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>2. App Testing & Beta</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>Structured feedback over time. Can utilize Superfluid streaming for continuous payouts as long as the user retains the beta app and provides weekly reports.</p>
            </div>
            
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>3. Engagement & Social Proof</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>Airdrop whitelisting or social tasks. Instant validation via API or manual creator review. Highest volume, lowest reward per task.</p>
            </div>
          </div>
        </section>

        {/* PAYMENT FLOW */}
        <section id="payment-flow" style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>Payment Flow</h2>
          
          <div style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 16, border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-main)' }}>The 48-Hour Auto-Approve Mechanism</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              To protect workers from malicious creators who never review work, TrueServe enforces a strict SLA. 
              Once a worker submits proof, the creator has exactly 48 hours to `approveWork()` or `rejectWork()`. 
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              If 48 hours pass, the `autoApprove()` function becomes available. This can be called by a decentralized keeper bot, the worker, or anyone else, and it will forcefully release the escrowed funds to the worker.
            </p>
            
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-main)' }}>Fee Structure</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 700, color: 'var(--text-main)' }}>98%</span> - Goes directly to the worker.</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 700, color: 'var(--text-main)' }}>2%</span> - TrueServe platform fee.</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontStyle: 'italic', marginTop: 8 }}>* 100% of TrueServe fees are periodically donated back to the GoodDollar UBI reserve.</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 16 }}>Frequently Asked Questions</h2>
          
          <DocFAQ 
            question="Is TrueServe decentralized?" 
            answer="Yes. The core logic runs entirely on the Celo blockchain. If the frontend goes down, you can still interact with the TrueServe contract directly via CeloScan to retrieve your funds or submit work."
          />
          <DocFAQ 
            question="What happens if a worker submits fake data?" 
            answer="Creators should review submissions before approving. If a worker submits fake data, the creator rejects it. The worker's Trust Score drops, and if they get 5 consecutive rejections, they are banned from the protocol."
          />
          <DocFAQ 
            question="How do I get G$ tokens?" 
            answer="You can claim free G$ daily via the GoodDollar wallet if you are a verified human. For creators needing large amounts to fund escrow, G$ can be swapped on decentralized exchanges like Ubeswap on Celo."
          />
          <DocFAQ 
            question="Can a worker use multiple wallets?" 
            answer="No. The GoodDollar Identity protocol ensures that one face can only be tied to one wallet address. This guarantees 100% sybil resistance."
          />
          <DocFAQ 
            question="What is the maximum number of slots per task?" 
            answer="Currently, the contract supports up to 10,000 slots per task to prevent out-of-gas errors during bulk operations. If you need more, you can create multiple tasks."
          />
          <DocFAQ 
            question="Who pays the gas fees?" 
            answer="The caller of the transaction pays the gas. Creators pay to deploy tasks and approve work. Workers pay to submit work. Since TrueServe is on Celo, gas fees are typically a fraction of a cent."
          />
          <DocFAQ 
            question="Can I upgrade my task after creating it?" 
            answer="You can add budget (increase slots), extend the deadline, or pause/resume the task. You cannot reduce the reward per user or cancel the task if slots have already been approved."
          />
          <DocFAQ 
            question="Where is the survey data stored?" 
            answer="Survey responses are encrypted (optional) and uploaded to IPFS via Pinata. The IPFS content identifier (CID) is then stored on-chain as the 'proofIPFS' string."
          />
          <DocFAQ 
            question="Can I integrate TrueServe into my own app?" 
            answer="Absolutely. TrueServe is a permissionless protocol. You can build your own frontends, keeper bots, or specialized dApps on top of our smart contracts."
          />
          <DocFAQ 
            question="Is there an API?" 
            answer="We rely primarily on The Graph to index blockchain events for fast querying. You can also read the contract state directly using any standard Web3 provider (ethers.js, viem)."
          />
        </section>

      </main>
    </div>
  );
}
