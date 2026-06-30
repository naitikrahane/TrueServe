import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, X, FileText, ListChecks, Wallet, CheckCircle, XCircle,
  ChevronLeft, Plus, BarChart2, Check, ArrowRight, LayoutDashboard,
  ExternalLink, Image as ImageIcon, Camera, Trash2, GripVertical, Target
} from 'lucide-react';
import {
  connectWallet, getGDollarBalance, getCreatorTasks,
  getTaskSubmissions, approveWork, rejectWork, createTask, formatGD,
  cancelTask, expireTask
} from '../lib/goodDollar';
import { uploadToIPFS, uploadFileToIPFS, ipfsToHttp } from '../lib/ipfs';

// ─── Reusable Input ───────────────────────────────────────────────────────
const Field = ({ label, children, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', letterSpacing: 0.3 }}>
      {label}{required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  border: '1.5px solid var(--border-light)', fontSize: '0.95rem',
  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit', background: 'var(--bg-card)', color: 'var(--text-main)'
};

// ─── Campaign Analytics & Review ─────────────────────────────────────────
function CampaignAnalytics({ campaign, onBack }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (campaign?.id) {
      setLoadingSubs(true);
      getTaskSubmissions(campaign.id).then(setSubmissions).catch(console.error).finally(() => setLoadingSubs(false));
    }
  }, [campaign?.id]);

  const handleApprove = async (workerAddress) => {
    setActionLoading(workerAddress);
    setActionMsg({ text: 'Approving & releasing escrow…', type: 'info' });
    try {
      const { signer } = await connectWallet();
      await approveWork(signer, campaign.id, workerAddress);
      setActionMsg({ text: 'Approved! Funds sent.', type: 'success' });
      setSubmissions(prev => prev.map(s => s.worker === workerAddress ? { ...s, status: 1, statusLabel: 'Claimed' } : s));
    } catch (err) { setActionMsg({ text: err.message || 'Failed', type: 'error' }); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (workerAddress) => {
    setActionLoading(`r_${workerAddress}`);
    setActionMsg({ text: 'Rejecting submission…', type: 'info' });
    try {
      const { signer } = await connectWallet();
      await rejectWork(signer, campaign.id, workerAddress);
      setActionMsg({ text: 'Submission rejected.', type: 'success' });
      setSubmissions(prev => prev.map(s => s.worker === workerAddress ? { ...s, status: 2, statusLabel: 'Rejected' } : s));
    } catch (err) { setActionMsg({ text: err.message || 'Failed', type: 'error' }); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    setActionMsg({ text: 'Cancelling campaign & claiming refund…', type: 'info' });
    try {
      const { signer } = await connectWallet();
      await cancelTask(signer, campaign.id);
      setActionMsg({ text: 'Campaign cancelled! Refund claimed.', type: 'success' });
    } catch (err) { setActionMsg({ text: err.message || 'Failed', type: 'error' }); }
    finally { setActionLoading(null); }
  };

  const handleExpire = async () => {
    setActionLoading('expire');
    setActionMsg({ text: 'Expiring campaign & claiming refund…', type: 'info' });
    try {
      const { signer } = await connectWallet();
      await expireTask(signer, campaign.id);
      setActionMsg({ text: 'Campaign expired! Remaining budget refunded.', type: 'success' });
    } catch (err) { setActionMsg({ text: err.message || 'Failed', type: 'error' }); }
    finally { setActionLoading(null); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', marginBottom: 20, padding: 0 }}>
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        {/* Campaign header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>{campaign.title}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: 'var(--bg-main)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: 99, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>{campaign.type || 'Survey'}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{campaign.submissionCount} / {campaign.maxSubmissions} completed</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {campaign.filledSlots === 0 && campaign.state !== 3 && campaign.state !== 4 && (
              <button disabled={!!actionLoading} onClick={handleCancel} style={{ padding: '8px 16px', borderRadius: 12, border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                Cancel & Refund
              </button>
            )}
            {campaign.state !== 3 && campaign.state !== 4 && (
              <button disabled={!!actionLoading} onClick={handleExpire} style={{ padding: '8px 16px', borderRadius: 12, border: '1px solid #FEF3C7', background: '#FFFBEB', color: '#D97706', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                Expire & Refund
              </button>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
          {[['analytics', 'Analytics'], ['review', `Review (${submissions.filter(s => s.status === 0).length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{ flex: 1, padding: '14px 20px', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s', background: activeTab === id ? 'var(--bg-card)' : 'transparent', color: activeTab === id ? 'var(--text-main)' : 'var(--text-dim)', borderBottom: activeTab === id ? '2px solid #10B981' : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px 28px' }}>
          {activeTab === 'analytics' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Submissions', val: campaign.submissionCount, color: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Approved', val: submissions.filter(s => s.status === 1).length, color: '#10B981', bg: '#D1FAE5' },
                { label: 'Pending', val: submissions.filter(s => s.status === 0).length, color: '#F59E0B', bg: '#FEF3C7' },
                { label: 'Budget Left', val: `${campaign.remainingGD} G$`, color: '#10B981', bg: '#D1FAE5' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 16, padding: '20px', border: `1px solid ${s.color}20` }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loadingSubs && <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-dim)' }}>Loading…</div>}
              {!loadingSubs && submissions.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No submissions yet.</div>}
              {submissions.map((sub, r) => (
                <div key={r} style={{ background: 'var(--bg-main)', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.95rem', marginBottom: 4 }}>
                        {sub.workerShort}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                        {sub.submittedAtDate}
                        {sub.proofIPFS && (
                          <> · <a href={`https://ipfs.io/ipfs/${sub.proofIPFS.replace('ipfs://', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>View Proof</a></>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, background: sub.status === 1 ? '#D1FAE5' : sub.status === 2 ? '#FEE2E2' : '#FEF3C7', color: sub.status === 1 ? '#059669' : sub.status === 2 ? '#DC2626' : '#D97706' }}>
                        {sub.statusLabel}
                      </span>
                      {sub.status === 0 && (
                        <>
                          <button disabled={!!actionLoading} onClick={() => handleReject(sub.worker)}
                            style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid #FEE2E2', background: 'var(--bg-card)', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <XCircle size={14} /> Reject
                          </button>
                          <button disabled={!!actionLoading} onClick={() => handleApprove(sub.worker)}
                            style={{ padding: '7px 14px', borderRadius: 10, border: 'none', background: '#10B981', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle size={14} /> Approve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {actionMsg.text && (
                <div style={{ padding: '14px 18px', borderRadius: 12, fontWeight: 600, fontSize: '0.9rem', background: actionMsg.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: actionMsg.type === 'error' ? '#EF4444' : '#10B981' }}>
                  {actionMsg.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Dashboard View ───────────────────────────────────────────────────────
function DashboardView({ stats, campaigns, loadingCampaigns, onSelectCampaign, onCreateNew }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Stats */}
      <div className="md-grid-cols-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'G$ Escrowed', val: stats.escrowed, icon: Wallet, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Responses', val: stats.responses, icon: CheckCircle, color: '#10B981', bg: '#D1FAE5' },
          { label: 'UBI Contributed', val: stats.ubiContributed, icon: Target, color: '#8B5CF6', bg: '#EDE9FE' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 18, padding: '20px 24px', border: '1px solid var(--border-light)', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{loadingCampaigns ? '—' : s.val}</div>
          </div>
        ))}
      </div>

      {/* Campaigns */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="md-flex-col md-items-start md-gap-4" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: 2 }}>Active Campaigns</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Monitor and review your live surveys</p>
          </div>
          <button onClick={onCreateNew}
            style={{ padding: '10px 18px', background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
            <Plus size={16} /> New
          </button>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loadingCampaigns ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Syncing with Celo…</div>
          ) : campaigns.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'var(--bg-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <LayoutDashboard size={28} color="var(--text-dim)" />
              </div>
              <p style={{ color: 'var(--text-dim)', fontWeight: 600 }}>No campaigns yet.</p>
              <button onClick={onCreateNew} style={{ marginTop: 16, padding: '10px 24px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 99, fontWeight: 700, cursor: 'pointer' }}>
                Launch First Campaign
              </button>
            </div>
          ) : campaigns.map((c, i) => (
            <div key={i} className="md-flex-col" style={{ padding: '20px 24px', border: '1px solid var(--border-light)', borderRadius: 16, background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: 8 }}>{c.title}</h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{c.type || 'Survey'}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{c.remainingGD} G$ Left</span>
                </div>
                <div style={{ maxWidth: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                    <span>Progress</span><span>{c.filledSlots || 0} / {c.maxSlots}</span>
                  </div>
                  <div style={{ height: 6, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#10B981', width: `${Math.min(100, ((c.filledSlots || 0) / c.maxSlots) * 100)}%`, borderRadius: 99 }} />
                  </div>
                </div>
              </div>
              <button className="md-w-full" onClick={() => onSelectCampaign(c)}
                style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'var(--text-main)', color: 'var(--bg-main)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
                <BarChart2 size={16} /> Manage
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Question Card in Builder ─────────────────────────────────────────────
function QuestionCard({ q, i, total, onUpdate, onDelete }) {
  const fileRef = useRef();
  const [imgUploading, setImgUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const uri = await uploadFileToIPFS(file);
      onUpdate({ ...q, imageUrl: uri, imagePreview: URL.createObjectURL(file) });
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally { setImgUploading(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1.5px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}
    >
      {/* Card header */}
      <div className="md-wrap" style={{ padding: '14px 18px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <GripVertical size={16} color="#D1D5DB" />
        <div style={{ background: '#D1FAE5', color: '#10B981', padding: '4px 10px', borderRadius: 8, fontWeight: 800, fontSize: '0.85rem' }}>Q{i + 1}</div>
        <select
          value={q.type}
          onChange={e => onUpdate({ ...q, type: e.target.value })}
          style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem', flex: 1, maxWidth: 200 }}
        >
          <option value="text">Short Answer</option>
          <option value="long_text">Long Answer</option>
          <option value="choice">Multiple Choice</option>
          <option value="photo_upload">Photo Upload</option>
        </select>
        <div className="md-hidden" style={{ flex: 1 }} />
        <button onClick={onDelete}
          style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', padding: '7px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={15} />
        </button>
      </div>

      {/* Card body */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Question text */}
        <input
          type="text"
          placeholder={`Question ${i + 1}…`}
          value={q.text}
          onChange={e => onUpdate({ ...q, text: e.target.value })}
          style={{ ...inputStyle }}
        />

        {/* Image attachment */}
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          {q.imagePreview || q.imageUrl ? (
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              <img src={q.imagePreview || ipfsToHttp(q.imageUrl)} alt="Q media"
                style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
              <button
                onClick={() => onUpdate({ ...q, imageUrl: null, imagePreview: null })}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current.click()}
              disabled={imgUploading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px dashed var(--border-medium)', color: 'var(--text-dim)', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}>
              {imgUploading ? <><span style={{ animation: 'spin 1s linear infinite' }}>⟳</span> Uploading…</> : <><Camera size={15} /> Attach Image (optional)</>}
            </button>
          )}
        </div>

        {/* MC Options */}
        {q.type === 'choice' && (
          <div style={{ paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #D1D5DB', flexShrink: 0 }} />
                <input
                  type="text" placeholder={`Option ${oIdx + 1}`} value={opt}
                  onChange={e => {
                    const opts = [...q.options]; opts[oIdx] = e.target.value;
                    onUpdate({ ...q, options: opts });
                  }}
                  style={{ ...inputStyle, padding: '10px 14px', fontSize: '0.9rem' }}
                />
                {q.options.length > 1 && (
                  <button onClick={() => onUpdate({ ...q, options: q.options.filter((_, j) => j !== oIdx) })}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => onUpdate({ ...q, options: [...q.options, ''] })}
              style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#3B82F6', fontWeight: 700, cursor: 'pointer', padding: '6px 0', fontSize: '0.9rem' }}>
              + Add Option
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Create Campaign View ─────────────────────────────────────────────────
function CreateCampaignView({ onCampaignCreated }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1=Details, 2=Questions, 3=Review
  const [campaignData, setCampaignData] = useState({ title: '', type: 'survey', reward: '', participants: '', description: '' });
  const [questions, setQuestions] = useState([{ id: 1, type: 'text', text: '', options: [''], imageUrl: null, imagePreview: null }]);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const addQ = () => setQuestions(qs => [...qs, { id: Date.now(), type: 'text', text: '', options: [''], imageUrl: null, imagePreview: null }]);
  const updateQ = (id, data) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...data } : q));
  const deleteQ = (id) => setQuestions(qs => qs.filter(q => q.id !== id));

  const handleLaunch = async () => {
    if (!campaignData.title || !campaignData.reward || !campaignData.participants) return setMsg({ text: 'Please fill all required fields', type: 'error' });
    
    // Parse reward safely, handling comma decimal separators for different locales
    const safeRewardStr = String(campaignData.reward).replace(/,/g, '.');
    const rewardNum = parseFloat(safeRewardStr);
    
    if (isNaN(rewardNum) || rewardNum <= 0) {
      return setMsg({ text: `Invalid reward amount: ${campaignData.reward}. Must be > 0.`, type: 'error' });
    }
    
    const participantsNum = parseInt(campaignData.participants, 10);
    const totalBudget = rewardNum * participantsNum;

    setLoading(true);
    setMsg({ text: 'Uploading metadata to IPFS…', type: 'info' });
    try {
      // Sanitize questions — remove blob previews
      const cleanQuestions = questions.map(({ imagePreview, ...q }) => q);
      const metadataIPFS = await uploadToIPFS({ ...campaignData, questions: cleanQuestions, totalBudget, createdAt: new Date().toISOString() });
      setMsg({ text: 'Approve G$ transaction in your wallet…', type: 'info' });
      const { signer } = await connectWallet();
      const typeMap = { survey: 0, app_testing: 1, streaming: 2 };
      const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
      setMsg({ text: 'Deploying on Celo…', type: 'info' });
      await createTask(signer, { title: campaignData.title, metadataIPFS, rewardPerUser: rewardNum, maxSlots: participantsNum, taskType: typeMap[campaignData.type] ?? 0, deadline }, (_, p) => setMsg({ text: p, type: 'info' }));
      setMsg({ text: `Campaign launched! ${totalBudget} G$ escrowed.`, type: 'success' });
      setTimeout(() => onCampaignCreated(), 3000);
    } catch (err) {
      setMsg({ text: err.message || 'Failed to create campaign', type: 'error' });
    } finally { setLoading(false); }
  };

  const budget = parseFloat(String(campaignData.reward || 0).replace(/,/g, '.')) * parseInt(campaignData.participants || 0, 10);

  const stepTitles = ['Campaign Details', 'Build Questions', 'Review & Launch'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28, gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
        {stepTitles.map((title, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <React.Fragment key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? '#10B981' : active ? 'var(--text-main)' : '#E5E7EB',
                  color: done || active ? '#fff' : 'var(--text-dim)', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0
                }}>
                  {done ? <Check size={14} /> : n}
                </div>
                <span style={{ fontWeight: active ? 700 : 500, color: active ? 'var(--text-main)' : 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{title}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: done ? '#10B981' : '#E5E7EB', margin: '0 8px', minWidth: 20 }} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="md-p-4" style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="md-p-4" style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: 4 }}>{stepTitles[step - 1]}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            {step === 1 && 'Set the basics for your campaign.'}
            {step === 2 && 'Add questions that participants will answer.'}
            {step === 3 && 'Review everything before deploying on Celo.'}
          </p>
        </div>

        <div className="md-p-4" style={{ padding: '24px 28px' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                  <Field label="Campaign Title" required>
                    <input type="text" placeholder="e.g. UX Research for DeFi Wallet" value={campaignData.title} onChange={e => setCampaignData(d => ({ ...d, title: e.target.value }))} style={inputStyle} />
                  </Field>
                  <Field label="Task Type" required>
                    <select value={campaignData.type} onChange={e => setCampaignData(d => ({ ...d, type: e.target.value }))} style={inputStyle}>
                      <option value="survey">Survey / Questionnaire</option>
                      <option value="app_testing">App / Beta Testing</option>
                      <option value="streaming">Livestream Watch</option>
                    </select>
                  </Field>
                  <Field label="Reward per User (G$)" required>
                    <input type="number" min="0" step="any" placeholder="e.g. 500" value={campaignData.reward} onChange={e => setCampaignData(d => ({ ...d, reward: Math.max(0, e.target.value) }))} style={inputStyle} />
                  </Field>
                  <Field label="Max Participants" required>
                    <input type="number" min="1" step="1" placeholder="e.g. 100" value={campaignData.participants} onChange={e => setCampaignData(d => ({ ...d, participants: Math.max(1, e.target.value) }))} style={inputStyle} />
                  </Field>
                </div>
                <Field label="Description (shown to participants)">
                  <textarea placeholder="Describe the task, goals, and what you are looking to learn…" value={campaignData.description} onChange={e => setCampaignData(d => ({ ...d, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
                {budget > 0 && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#10B981', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Total to Escrow</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Includes 2% protocol fee → UBI pool</div>
                    </div>
                    <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981' }}>{(budget * 1.02).toLocaleString(undefined, { maximumFractionDigits: 2 })} G$</span>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <AnimatePresence>
                  {questions.map((q, i) => (
                    <QuestionCard key={q.id} q={q} i={i} total={questions.length}
                      onUpdate={(data) => updateQ(q.id, data)}
                      onDelete={() => deleteQ(q.id)} />
                  ))}
                </AnimatePresence>
                <button onClick={addQ}
                  style={{ padding: '14px', borderRadius: 14, border: '2px dashed var(--border-medium)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.95rem', transition: '0.2s' }}
                  onMouseEnter={e => { e.target.style.borderColor = '#10B981'; e.target.style.color = '#10B981'; }}
                  onMouseLeave={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.color = 'var(--text-muted)'; }}>
                  <Plus size={18} /> Add Question
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Summary */}
                {[
                  { label: 'Title', val: campaignData.title || '—' },
                  { label: 'Type', val: campaignData.type },
                  { label: 'Reward per User', val: `${campaignData.reward || 0} G$` },
                  { label: 'Max Participants', val: campaignData.participants || '—' },
                  { label: 'Total Questions', val: questions.length },
                  { label: 'Total Budget', val: `${(budget * 1.02).toFixed(2)} G$` },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem' }}>{r.label}</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%' }}>{r.val}</span>
                  </div>
                ))}
                <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 12, padding: '14px 18px', color: '#92400E', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.6 }}>
                  ⚠️ Once launched, G$ will be locked in the smart contract escrow. This cannot be undone.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} disabled={loading}
              style={{ padding: '13px 24px', borderRadius: 12, border: '1.5px solid var(--border-light)', background: 'var(--bg-card)', fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button onClick={() => {
              if (step === 1 && (!campaignData.title || !campaignData.reward || !campaignData.participants)) return setMsg({ text: 'Fill all required fields first', type: 'error' });
              setMsg({ text: '', type: '' });
              setStep(s => s + 1);
            }}
              style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: 'var(--text-main)', color: 'var(--bg-main)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleLaunch} disabled={loading}
              style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: loading ? 'var(--text-muted)' : '#10B981', color: '#fff', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 10, boxShadow: loading ? 'none' : '0 4px 20px rgba(16,185,129,0.3)' }}>
              {loading ? 'Processing…' : <><UploadCloud size={18} /> Launch & Escrow</>}
            </button>
          )}
        </div>

        {msg.text && (
          <div style={{ margin: '0 28px 20px', padding: '13px 18px', borderRadius: 12, fontWeight: 600, fontSize: '0.9rem', background: msg.type === 'error' ? '#FEE2E2' : msg.type === 'success' ? '#D1FAE5' : '#EFF6FF', color: msg.type === 'error' ? '#EF4444' : msg.type === 'success' ? '#10B981' : '#3B82F6' }}>
            {msg.text}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Escrow / Wallet View ─────────────────────────────────────────────────
function EscrowView({ user, realBalance, stats }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--text-main) 0%, #1F2937 100%)', borderRadius: 20, padding: '28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.06 }}><Wallet size={160} /></div>
        <div style={{ color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1, marginBottom: 6 }}>Available Treasury</div>
        <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, marginBottom: 24, lineHeight: 1 }}>{realBalance} <span style={{ fontSize: '1.5rem', color: '#10B981' }}>G$</span></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={() => window.open('https://app.gooddollar.org/', '_blank')}
            style={{ flex: 1, minWidth: 120, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
            Get G$
          </button>
          <button onClick={() => window.open('https://app.ubeswap.org/', '_blank')} style={{ flex: 1, minWidth: 120, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}>
            Swap G$
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[
          { label: 'Escrowed', val: stats.escrowed, sub: 'Active contracts' },
          { label: 'UBI Contributed', val: stats.ubiContributed, sub: 'Protocol fee' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: 4 }}>{s.val}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Wallet Address</div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.9rem', wordBreak: 'break-all' }}>{user?.id || user?.address || '0x…'}</div>
        </div>
        <a href={`https://celoscan.io/address/${user?.id || ''}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: '1px solid var(--border-light)', borderRadius: 10, color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
          <ExternalLink size={14} /> CeloScan
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main Creator Panel ───────────────────────────────────────────────────
export default function CreatorPanel({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [stats, setStats] = useState({ escrowed: '—', responses: '—', ubiContributed: '—' });
  const [realBalance, setRealBalance] = useState('0');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const address = user?.id || user?.address;

  const fetchData = () => {
    if (!address) return;
    setLoadingCampaigns(true);
    getCreatorTasks(address).then(tasks => {
      setCampaigns(tasks);
      const parseGD = (val) => parseFloat(String(val).replace(/,/g, '')) || 0;
      const totalEscrowed = tasks.reduce((acc, t) => acc + parseGD(formatGD(t.remainingBudget)), 0);
      let approved = 0, ubi = 0;
      for (const t of tasks) {
        approved += (t.filledSlots || 0);
        ubi += (t.filledSlots || 0) * parseGD(formatGD(t.rewardPerUser)) * 0.02;
      }
      setStats({
        escrowed: `${totalEscrowed.toLocaleString(undefined, { maximumFractionDigits: 0 })} G$`,
        responses: approved.toString(),
        ubiContributed: `${ubi.toLocaleString(undefined, { maximumFractionDigits: 0 })} G$`,
      });
    }).catch(console.error).finally(() => setLoadingCampaigns(false));
    
    getGDollarBalance(address).then(b => {
      const num = parseFloat(String(b).replace(/,/g, '')) || 0;
      setRealBalance(num.toLocaleString(undefined, { maximumFractionDigits: 0 }));
    });
  };

  useEffect(() => { fetchData(); }, [address]);

  const NAV = [
    { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { id: 'create', label: 'Create Campaign', Icon: Plus },
    { id: 'escrow', label: 'Wallet & Escrow', Icon: Wallet },
  ];

  if (selectedCampaign) return (
    <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 70px)', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <CampaignAnalytics campaign={selectedCampaign} onBack={() => { setSelectedCampaign(null); fetchData(); }} />
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: 'calc(100vh - 70px)' }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, display: 'none' }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      <div className="md-flex-col md-gap-4" style={{ maxWidth: 1300, margin: '0 auto', padding: 'clamp(16px, 4vw, 40px) clamp(12px, 3vw, 24px)', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div className="md-w-full md-m-0 md-relative" style={{ width: 260, flexShrink: 0, position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile card */}
          <div className="md-p-4" style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 20, border: '1px solid var(--border-light)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wallet size={20} color="var(--bg-main)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>Creator Account</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {address ? `${address.slice(0, 8)}…${address.slice(-4)}` : '0x…'}
                </div>
              </div>
            </div>
            <nav className="md-scroll-x" style={{ display: 'flex', flexDirection: window.innerWidth <= 768 ? 'row' : 'column', gap: 4 }}>
              {NAV.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: 'none', background: active ? 'var(--text-main)' : 'transparent', color: active ? 'var(--bg-main)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: '0.15s', textAlign: 'left' }}>
                    <Icon size={18} color={active ? 'var(--bg-main)' : 'var(--text-dim)'} />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Upsell */}
          <div className="md-hidden" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', borderRadius: 20, padding: 20, color: '#fff', boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6 }}>Need more reach?</div>
            <p style={{ fontSize: '0.82rem', opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>Get featured on the homepage to reach more verified humans.</p>
            <button onClick={() => { setActiveTab('create'); if(window.innerWidth <= 768) setSidebarOpen(false); }} style={{ padding: '10px', width: '100%', borderRadius: 10, border: 'none', background: 'var(--bg-card)', color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              Upgrade Campaign
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="md-w-full" style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView key="d" stats={stats} campaigns={campaigns} loadingCampaigns={loadingCampaigns} onSelectCampaign={setSelectedCampaign} onCreateNew={() => setActiveTab('create')} />}
            {activeTab === 'create' && <CreateCampaignView key="c" onCampaignCreated={() => { setActiveTab('dashboard'); fetchData(); }} />}
            {activeTab === 'escrow' && <EscrowView key="e" user={user} realBalance={realBalance} stats={stats} />}
          </AnimatePresence>
        </div>

        {/* Mobile-only Upsell at bottom */}
        <div className="md-block md-w-full md-m-0" style={{ display: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', borderRadius: 20, padding: 20, color: '#fff', boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6 }}>Need more reach?</div>
            <p style={{ fontSize: '0.82rem', opacity: 0.85, lineHeight: 1.6, marginBottom: 14 }}>Get featured on the homepage to reach more verified humans.</p>
            <button onClick={() => { setActiveTab('create'); if(window.innerWidth <= 768) setSidebarOpen(false); }} style={{ padding: '10px', width: '100%', borderRadius: 10, border: 'none', background: 'var(--bg-card)', color: '#1D4ED8', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              Upgrade Campaign
            </button>
          </div>
        </div>

      </div>

      {/* Mobile bottom nav */}
      <style>{`
        @media (max-width: 768px) {
          .creator-sidebar { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
