import React from 'react';
import { useCampaign } from './CampaignBuilderContext';
import { Type, CheckSquare, Image as ImageIcon, Video, Mic, Camera, Hash, AlignLeft, ShieldCheck, ArrowRight, MessageCircle, Link } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'text_input', label: 'Short Text', icon: Type, defaultProps: { question: 'New Question', required: true } },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft, defaultProps: { question: 'New Question', required: true } },
  { type: 'multiple_choice', label: 'Multiple Choice', icon: CheckSquare, defaultProps: { question: 'Select an option', options: [{ label: 'Option 1', nextBlockId: null }], required: true } },
  { type: 'number', label: 'Number', icon: Hash, defaultProps: { question: 'Enter a number', required: true } },
  { type: 'image_upload', label: 'Upload Image', icon: ImageIcon, defaultProps: { question: 'Please upload an image', required: true } },
  { type: 'video_upload', label: 'Upload Video', icon: Video, defaultProps: { question: 'Please upload a video', required: true } },
  { type: 'audio_upload', label: 'Upload Audio', icon: Mic, defaultProps: { question: 'Record or upload audio', required: true } },
  { type: 'screenshot_verify', label: 'Screenshot Proof', icon: Camera, defaultProps: { question: 'Submit screenshot of task completion', required: true } },
  { type: 'social_comment', label: 'Social Comment', icon: MessageCircle, defaultProps: { question: 'Comment on this post and provide proof', required: true } },
  { type: 'visit_link', label: 'Visit Link', icon: Link, defaultProps: { question: 'Visit this website for 30 seconds', required: true } },
  { type: 'info', label: 'Information Display', icon: ArrowRight, defaultProps: { title: 'Information', description: 'Read this carefully.' } },
];

export default function Sidebar() {
  const { dispatch } = useCampaign();

  const handleAddBlock = (blockDef) => {
    dispatch({
      type: 'ADD_BLOCK',
      payload: {
        id: 'block_' + Date.now(),
        type: blockDef.type,
        ...blockDef.defaultProps
      }
    });
  };

  return (
    <div className="cb-sidebar" style={{ width: 280, background: 'var(--bg-main)', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', height: '100%', color: 'white' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Add Elements</h3>
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Click to add to your campaign flow.</p>
      </div>
      
      <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Questions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BLOCK_TYPES.slice(0, 4).map(b => (
            <button key={b.type} className="cb-tool-btn" onClick={() => handleAddBlock(b)}>
              <b.icon size={20} />
              <span>{b.label}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16 }}>Media & Proofs</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BLOCK_TYPES.slice(4).map(b => (
            <button key={b.type} className="cb-tool-btn" onClick={() => handleAddBlock(b)}>
              <b.icon size={20} />
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <style>{`
        .cb-tool-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--radius-sm);
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          transition: all 0.2s;
        }
        .cb-tool-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          color: white;
          transform: translateY(-2px);
        }
        .cb-tool-btn span {
          font-size: .75rem;
          font-weight: 600;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
