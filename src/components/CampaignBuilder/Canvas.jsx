import React from 'react';
import { useCampaign } from './CampaignBuilderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2 } from 'lucide-react';

export default function Canvas() {
  const { state, dispatch } = useCampaign();

  return (
    <div className="cb-canvas" style={{ flex: 1, background: 'var(--bg-card)', padding: 40, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: 700 }}>
        
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'white' }}>{state.title || 'Untitled Campaign'}</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>{state.description || 'Add a description in the settings panel.'}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {state.blocks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 60, textAlign: 'center', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
                Drag and drop elements from the sidebar to start building your campaign.
              </motion.div>
            )}
            {state.blocks.map((block, index) => (
              <motion.div
                key={block.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`cb-block-node ${state.selectedBlockId === block.id ? 'selected' : ''}`}
                onClick={() => dispatch({ type: 'SELECT_BLOCK', payload: block.id })}
                style={{ 
                  background: 'var(--bg-main)', 
                  padding: 24, 
                  borderRadius: 'var(--radius-lg)', 
                  border: `1px solid ${state.selectedBlockId === block.id ? 'var(--indigo-500)' : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: state.selectedBlockId === block.id ? '0 10px 25px rgba(99, 102, 241, 0.1)' : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  gap: 16,
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}
              >
                <div style={{ color: 'var(--text-muted)', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                  <GripVertical size={20} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--indigo-600)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 }}>
                    {index + 1}. {block.type.replace('_', ' ')}
                    {block.required && <span style={{ color: 'var(--danger-600)' }}> *</span>}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>
                    {block.question || block.title || 'Untitled'}
                  </div>
                  
                  {block.type === 'multiple_choice' && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {block.options?.map((opt, i) => (
                        <div key={i} style={{ padding: '8px 12px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '.9rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'inline-block', width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--border-light)', marginRight: 12, verticalAlign: 'middle' }} />
                          {opt || `Option ${i + 1}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {['text_input', 'long_text', 'number'].includes(block.type) && (
                    <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-main)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '.9rem' }}>
                      User input will appear here...
                    </div>
                  )}

                  {['image_upload', 'video_upload', 'audio_upload', 'screenshot_verify', 'social_comment'].includes(block.type) && (
                    <div style={{ marginTop: 16, padding: '24px', background: 'var(--bg-main)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '.9rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                      {block.type === 'audio_upload' ? 'Upload or Record Audio' : block.type === 'social_comment' ? 'Upload Proof of Comment' : 'Upload Dropzone'}
                    </div>
                  )}

                  {block.type === 'visit_link' && (
                    <div style={{ marginTop: 16, padding: '16px', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-sm)', color: 'var(--indigo-400)', fontSize: '.9rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ padding: '4px 12px', background: 'var(--bg-main)', borderRadius: 16, fontWeight: 600, fontSize: '.8rem', color: 'white' }}>Verify Link</span>
                      User will be directed to external URL and tracked for 30s.
                    </div>
                  )}
                </div>

                <button 
                  style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                  onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_BLOCK', payload: block.id }); }}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
