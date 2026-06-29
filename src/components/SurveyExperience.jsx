import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, CheckCircle, Check, Shield, AlertTriangle,
  ArrowRight, Loader2, Image as ImageIcon, X, ZoomIn
} from 'lucide-react';
import { getTask, submitWork, connectWallet, formatGD } from '../lib/goodDollar';
import { uploadToIPFS, uploadFileToIPFS, fetchFromIPFS, ipfsToHttp } from '../lib/ipfs';

/* ─── Spinner ─── */
function Spinner({ color = '#10B981' }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <motion.circle cx="12" cy="12" r="10"
        animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center', strokeDasharray: '50 30' }}
      />
    </svg>
  );
}

/* ─── Image viewer modal ─── */
function ImageModal({ src, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999, padding: 16, cursor: 'zoom-out'
      }}
    >
      <img src={src} alt="Full view"
        style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
      <button onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'rgba(255,255,255,0.15)', border: 'none',
          color: '#fff', width: 44, height: 44, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
        <X size={20} />
      </button>
    </motion.div>
  );
}

/* ─── Question renders ─── */
function MultipleChoice({ block, answer, onChange }) {
  const options = block.options || [];
  const isMulti = block.type === 'multiple_choice';
  const selectedList = isMulti ? (Array.isArray(answer) ? answer : []) : (answer ? [answer] : []);

  const toggle = (val) => {
    if (isMulti) {
      if (selectedList.includes(val)) onChange(selectedList.filter(v => v !== val));
      else onChange([...selectedList, val]);
    } else {
      onChange(val);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {options.map((opt, i) => {
        const val = typeof opt === 'object' ? opt.label : opt;
        const selected = selectedList.includes(val);
        return (
          <motion.button
            key={i}
            onClick={() => toggle(val)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            style={{
              width: '100%', padding: '16px 20px', borderRadius: 14,
              border: `2px solid ${selected ? '#10B981' : 'rgba(255,255,255,0.25)'}`,
              background: selected ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
              color: '#fff', fontSize: '1.05rem', fontWeight: selected ? 700 : 500,
              textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: 14, transition: 'all 0.2s',
              boxShadow: selected ? '0 0 0 4px rgba(16,185,129,0.2)' : 'none'
            }}
          >
            <div style={{
              minWidth: 32, height: 32, borderRadius: 8,
              background: selected ? '#10B981' : 'rgba(255,255,255,0.12)',
              color: selected ? '#fff' : 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.85rem', flexShrink: 0
            }}>
              {selected ? <CheckCircle size={16} /> : (isMulti ? <Check size={16}/> : String.fromCharCode(65 + i))}
            </div>
            <span>{val}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function TextInput({ block, answer, onChange }) {
  const isLong = block.type === 'long_text';
  return (
    <div style={{ position: 'relative' }}>
      <textarea
        autoFocus
        placeholder={block.placeholder || 'Type your answer here…'}
        value={answer || ''}
        onChange={e => onChange(e.target.value)}
        rows={isLong ? 5 : 2}
        style={{
          width: '100%', padding: '18px 20px', borderRadius: 14,
          border: '2px solid rgba(255,255,255,0.25)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: '1.1rem', lineHeight: 1.6,
          outline: 'none', resize: 'none', fontFamily: 'inherit',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = '#10B981'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
      />
      <style>{`::placeholder { color: rgba(255,255,255,0.4); }`}</style>
    </div>
  );
}

function PhotoUpload({ block, answer, onChange }) {
  const [preview, setPreview] = useState(answer?.preview || null);
  const [uploading, setUploading] = useState(false);
  const [imgModal, setImgModal] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const ipfsUri = await uploadFileToIPFS(file);
      onChange({ ipfsUri, preview: localPreview });
    } catch (err) {
      onChange({ error: err.message, preview: localPreview });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {!preview ? (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => fileRef.current.click()}
          style={{
            width: '100%', padding: '40px 20px', borderRadius: 16,
            border: '2px dashed rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12, fontSize: '1rem', fontWeight: 600
          }}
        >
          <ImageIcon size={40} style={{ opacity: 0.6 }} />
          <span>Tap to upload photo</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>JPG, PNG, WebP supported</span>
        </motion.button>
      ) : (
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
          <img src={preview} alt="Upload"
            onClick={() => setImgModal(true)}
            style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block', cursor: 'zoom-in', borderRadius: 16 }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            padding: '20px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              {uploading ? <><Spinner color="#fff" /><span>Uploading…</span></> : <><CheckCircle size={16} /><span>Uploaded</span></>}
            </div>
            <button onClick={() => { setPreview(null); onChange(null); fileRef.current.click(); }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 99, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
              Change
            </button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {imgModal && <ImageModal src={preview} onClose={() => setImgModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Intro & Finish screens ─── */
function IntroScreen({ task, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto', padding: '0 16px' }}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: 'rgba(16,185,129,0.2)',
        border: '1px solid rgba(16,185,129,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', backdropFilter: 'blur(8px)'
      }}>
        <Shield size={32} color="#10B981" />
      </div>
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
        {task.metadata?.title || task.title}
      </h1>
      {task.metadata?.description && (
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32 }}>
          {task.metadata.description}
        </p>
      )}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
        {[
          { label: 'Reward', val: `${formatGD(task.rewardPerUser)} G$`, color: '#10B981' },
          { label: 'Questions', val: task._blockCount || '—' },
          { label: 'Verified', val: 'Human Only' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
            padding: '12px 20px', textAlign: 'center'
          }}>
            <div style={{ color: s.color || 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
            <div style={{ color: s.color || '#fff', fontWeight: 800, fontSize: '1rem' }}>{s.val}</div>
          </div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        onClick={onStart}
        style={{
          padding: '18px 48px', background: '#10B981', color: '#fff',
          border: 'none', borderRadius: 16, fontSize: '1.15rem',
          fontWeight: 800, cursor: 'pointer', display: 'inline-flex',
          alignItems: 'center', gap: 12,
          boxShadow: '0 8px 32px rgba(16,185,129,0.35)'
        }}
      >
        Start Survey <ArrowRight size={20} />
      </motion.button>
      <div style={{ marginTop: 20, color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
        ~{task._blockCount || '?'} questions · Powered by Celo + GoodDollar
      </div>
    </motion.div>
  );
}

function FinishScreen({ task, submitting, submitMsg, onSubmit }) {
  const isSuccess = submitMsg.type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      style={{
        maxWidth: 520, margin: '0 auto', width: '100%',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28,
        padding: 'clamp(24px, 6vw, 56px)', textAlign: 'center'
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
        border: `2px solid ${isSuccess ? '#10B981' : 'rgba(16,185,129,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px'
      }}>
        <CheckCircle size={40} color="#10B981" />
      </div>
      <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
        {isSuccess ? 'Reward Claimed!' : "You're all done!"}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 36 }}>
        {isSuccess
          ? 'Your G$ reward has been released from escrow. Check your wallet!'
          : <>Submit your response to claim your <span style={{ color: '#10B981', fontWeight: 800 }}>{formatGD(task.rewardPerUser)} G$</span> reward on Celo.</>}
      </p>

      {!isSuccess && (
        <motion.button
          onClick={onSubmit} disabled={submitting}
          whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.98 } : {}}
          style={{
            width: '100%', padding: '18px', background: submitting ? '#065F46' : '#10B981',
            color: '#fff', border: 'none', borderRadius: 14, fontSize: '1.1rem',
            fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(16,185,129,0.3)', transition: 'all 0.2s'
          }}
        >
          {submitting ? <><Spinner color="#fff" /> {submitMsg.text || 'Processing…'}</> : 'Submit & Claim Reward'}
        </motion.button>
      )}

      {submitMsg.text && !submitting && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20, padding: '14px 18px', borderRadius: 12, fontSize: '0.9rem',
            fontWeight: 600,
            background: submitMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            color: submitMsg.type === 'error' ? '#F87171' : '#6EE7B7',
            border: `1px solid ${submitMsg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
          }}
        >
          {submitMsg.text}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function SurveyExperience({ user }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [screen, setScreen] = useState('intro'); // 'intro' | 'question' | 'finish'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    async function loadTask() {
      try {
        const id = parseInt(taskId, 10);
        const t = await getTask(id);
        if (!t) throw new Error('Task not found');
        let meta = null;
        if (t.metadataIPFS) meta = await fetchFromIPFS(t.metadataIPFS).catch(() => null);
        t.metadata = meta || {};
        let taskBlocks = t.metadata?.blocks || [];
        if (taskBlocks.length === 0 && t.metadata?.questions) {
          taskBlocks = t.metadata.questions.map(q => ({
            id: String(q.id),
            question: q.text,
            type: q.type || 'text_input',
            options: q.options,
            imageUrl: q.imageUrl || null,
            required: true,
          }));
        }
        t._blockCount = taskBlocks.length;
        setBlocks(taskBlocks);
        setTask(t);
      } catch (err) {
        setError(err.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    }
    loadTask();
  }, [taskId]);

  const goNext = () => {
    setDirection(1);
    if (currentIndex < blocks.length - 1) setCurrentIndex(c => c + 1);
    else setScreen('finish');
  };

  const goPrev = () => {
    setDirection(-1);
    if (screen === 'finish') { setScreen('question'); return; }
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
    else setScreen('intro');
  };

  const activeBlock = blocks[currentIndex];
  const currentAnswer = activeBlock ? answers[activeBlock.id] : null;
  const isAnswered = () => {
    if (!activeBlock) return false;
    if (!activeBlock.required) return true;
    const ans = answers[activeBlock.id];
    if (['choice', 'multiple_choice', 'single_choice'].includes(activeBlock.type)) return Array.isArray(ans) ? ans.length > 0 : !!ans;
    if (['photo_upload', 'image_upload'].includes(activeBlock.type)) return !!ans?.ipfsUri;
    return typeof ans === 'string' && ans.trim().length > 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (screen !== 'question') return;
      if (e.key === 'Enter' && !(activeBlock?.type === 'text_input' && e.shiftKey === false)) {
        if (activeBlock?.type !== 'text_input' && isAnswered()) { e.preventDefault(); goNext(); }
      }
      if (e.key === 'ArrowRight' && isAnswered()) goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen, currentIndex, answers]);

  const handleSubmit = async () => {
    if (user?.id?.toLowerCase() === task?.creator?.toLowerCase()) {
      setSubmitMsg({ text: 'You cannot submit your own task. Use a different wallet.', type: 'error' });
      return;
    }
    setSubmitting(true);
    setSubmitMsg({ text: 'Uploading responses to IPFS…', type: 'info' });
    try {
      const { signer, address } = await connectWallet();
      // Sanitize answers (remove blob: URLs, keep ipfsUris)
      const sanitized = {};
      for (const [k, v] of Object.entries(answers)) {
        if (v && typeof v === 'object' && v.ipfsUri) sanitized[k] = v.ipfsUri;
        else sanitized[k] = v;
      }
      const ipfsHash = await uploadToIPFS({ taskId: task.id, worker: address, answers: sanitized, time: Date.now() });
      setSubmitMsg({ text: 'Confirm transaction in your wallet…', type: 'info' });
      await submitWork(signer, task.id, ipfsHash);
      setSubmitMsg({ text: 'Reward released! Redirecting…', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      const msg = err.message?.includes('AlreadySubmitted')
        ? 'You have already submitted this task.'
        : err.message || 'Submission failed';
      setSubmitMsg({ text: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─ Loading/Error states ─ */
  const bgGrad = 'linear-gradient(135deg, #0A1628 0%, #0D2137 50%, #0A2818 100%)';

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <Spinner color="#10B981" /><br />
        <div style={{ marginTop: 16, opacity: 0.6 }}>Loading survey…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100dvh', background: bgGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 40, textAlign: 'center', maxWidth: 400, color: '#fff' }}>
        <AlertTriangle size={48} color="#F87171" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Oops!</h2>
        <p style={{ opacity: 0.6, marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding: '12px 28px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 99, fontWeight: 700, cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    </div>
  );

  const progress = screen === 'intro' ? 0 : screen === 'finish' ? 100 : Math.round(((currentIndex + 1) / blocks.length) * 100);

  const variants = {
    enter: (dir) => ({ opacity: 0, y: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, y: 0 },
    exit: (dir) => ({ opacity: 0, y: dir > 0 ? -40 : 40 }),
  };

  return (
    <div style={{ minHeight: '100dvh', background: bgGrad, display: 'flex', flexDirection: 'column', position: 'relative', fontFamily: 'inherit' }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.08)', zIndex: 100 }}>
        <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #10B981, #3B82F6)', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={14} color="#fff" />
          </div>
          TrueServe
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {screen === 'question' && (
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
              {currentIndex + 1} / {blocks.length}
            </span>
          )}
          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: 99, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
            Exit
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px 100px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {screen === 'intro' && task && (
              <motion.div key="intro" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeOut' }}>
                <IntroScreen task={task} onStart={() => { setScreen('question'); setCurrentIndex(0); }} />
              </motion.div>
            )}

            {screen === 'question' && activeBlock && (
              <motion.div key={`q-${currentIndex}`} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeOut' }}>
                {/* Question number */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#10B981', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                    {currentIndex + 1}
                  </div>
                  <ArrowRight size={14} color="rgba(255,255,255,0.3)" />
                  {activeBlock.required && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>Required</span>}
                </div>

                {/* Question text */}
                <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 28, lineHeight: 1.35 }}>
                  {activeBlock.question}
                </h2>

                {/* Optional question image */}
                {activeBlock.imageUrl && (
                  <div style={{ marginBottom: 24, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={ipfsToHttp(activeBlock.imageUrl)} alt="Question" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                {/* Answer input */}
                {['choice', 'multiple_choice', 'single_choice'].includes(activeBlock.type) && (
                  <MultipleChoice
                    block={activeBlock}
                    answer={currentAnswer}
                    onChange={(val) => {
                      setAnswers(prev => ({ ...prev, [activeBlock.id]: val }));
                      if (activeBlock.type === 'single_choice' || activeBlock.type === 'choice') setTimeout(goNext, 350);
                    }}
                  />
                )}
                {['text', 'text_input', 'long_text'].includes(activeBlock.type) && (
                  <TextInput block={activeBlock} answer={currentAnswer} onChange={(val) => setAnswers(prev => ({ ...prev, [activeBlock.id]: val }))} />
                )}
                {['photo_upload', 'image_upload'].includes(activeBlock.type) && (
                  <PhotoUpload block={activeBlock} answer={currentAnswer} onChange={(val) => setAnswers(prev => ({ ...prev, [activeBlock.id]: val }))} />
                )}

                {/* OK Button for non-MC */}
                {!['choice', 'single_choice'].includes(activeBlock.type) && (
                  <motion.div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.button
                      onClick={goNext} disabled={!isAnswered()}
                      whileHover={isAnswered() ? { scale: 1.03 } : {}} whileTap={isAnswered() ? { scale: 0.97 } : {}}
                      style={{
                        padding: '14px 32px', background: isAnswered() ? '#10B981' : 'rgba(255,255,255,0.1)',
                        color: '#fff', border: 'none', borderRadius: 12, fontSize: '1rem',
                        fontWeight: 700, cursor: isAnswered() ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', gap: 10,
                        boxShadow: isAnswered() ? '0 6px 24px rgba(16,185,129,0.3)' : 'none', transition: 'all 0.2s'
                      }}
                    >
                      OK <CheckCircle size={18} />
                    </motion.button>
                    {['text', 'text_input', 'long_text'].includes(activeBlock.type) && (
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
                        press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>Enter ↵</kbd>
                      </span>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {screen === 'finish' && task && (
              <motion.div key="finish" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: 'easeOut' }}>
                <FinishScreen task={task} submitting={submitting} submitMsg={submitMsg} onSubmit={handleSubmit} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 24px', background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', zIndex: 50
      }}>
        <button
          onClick={goPrev}
          disabled={screen === 'intro'}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
            background: screen === 'intro' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
            color: screen === 'intro' ? 'rgba(255,255,255,0.2)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: screen === 'intro' ? 'not-allowed' : 'pointer', flexShrink: 0
          }}
        >
          <ChevronLeft size={20} />
        </button>

        {/* Progress dots */}
        {blocks.length > 0 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', flex: 1, padding: '0 12px' }}>
            {blocks.map((_, i) => (
              <div key={i} style={{
                width: i === currentIndex && screen === 'question' ? 20 : 6,
                height: 6, borderRadius: 3,
                background: i < currentIndex || screen === 'finish' ? '#10B981' :
                  i === currentIndex && screen === 'question' ? '#10B981' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s'
              }} />
            ))}
          </div>
        )}

        <button
          onClick={goNext}
          disabled={screen === 'finish' || (screen === 'question' && !isAnswered())}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: (screen === 'finish' || !isAnswered()) ? 'rgba(255,255,255,0.08)' : '#10B981',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: (screen === 'finish' || !isAnswered()) ? 'not-allowed' : 'pointer',
            flexShrink: 0, boxShadow: isAnswered() && screen !== 'finish' ? '0 4px 16px rgba(16,185,129,0.4)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
