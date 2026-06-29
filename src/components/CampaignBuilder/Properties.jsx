import React, { useState } from 'react';
import { useCampaign } from './CampaignBuilderContext';
import { Settings2, Plus, X, UploadCloud, Loader2 } from 'lucide-react';
import { uploadFileToIPFS, ipfsToHttp } from '../../lib/ipfs';

export default function Properties() {
  const { state, dispatch } = useCampaign();
  const [isUploading, setIsUploading] = useState(false);
  
  const block = state.blocks.find(b => b.id === state.selectedBlockId);

  const updateBlock = (updates) => {
    dispatch({ type: 'UPDATE_BLOCK', payload: { id: block.id, updates } });
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const ipfsUrl = await uploadFileToIPFS(file);
      updateBlock({ mediaUrl: ipfsUrl, mediaType: file.type.startsWith('video') ? 'video' : 'image' });
    } catch (err) {
      console.error(err);
      alert('Upload failed. Did you add VITE_PINATA_JWT to .env?');
    }
    setIsUploading(false);
  };

  if (!block) {
    return (
      <div className="cb-properties" style={{ width: 320, background: 'var(--bg-main)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>
        <Settings2 size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
        <p>Select an element on the canvas to configure its properties.</p>
      </div>
    );
  }

  return (
    <div className="cb-properties" style={{ width: 320, background: 'var(--bg-main)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', height: '100%', color: 'white' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Block Settings</h3>
        <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', margin: '4px 0 0', textTransform: 'capitalize' }}>{block.type.replace('_', ' ')}</p>
      </div>
      
      <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        <div className="form-group full">
          <label className="form-label">Question / Title</label>
          <textarea 
            className="form-input" 
            rows="3"
            value={block.question || ''}
            onChange={e => updateBlock({ question: e.target.value })}
            placeholder="Enter the question text..."
          />
        </div>

        <div className="form-group full">
          <label className="form-label">Attach Media (Optional)</label>
          {block.mediaUrl ? (
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
              {block.mediaType === 'video' ? (
                <video src={ipfsToHttp(block.mediaUrl)} controls style={{ width: '100%', display: 'block' }} />
              ) : (
                <img src={ipfsToHttp(block.mediaUrl)} style={{ width: '100%', display: 'block' }} alt="Media" />
              )}
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: 6 }}
                onClick={() => updateBlock({ mediaUrl: null, mediaType: null })}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <input type="file" id={`media-upload-${block.id}`} style={{ display: 'none' }} accept="image/*,video/*" onChange={handleMediaUpload} />
              <label htmlFor={`media-upload-${block.id}`} className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                {isUploading ? <Loader2 size={16} className="spin" /> : <UploadCloud size={16} />}
                {isUploading ? 'Uploading to IPFS...' : 'Upload Image / Video'}
              </label>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label className="form-label" style={{ margin: 0 }}>Required Response</label>
          <input 
            type="checkbox" 
            checked={block.required || false} 
            onChange={e => updateBlock({ required: e.target.checked })} 
          />
        </div>

        {block.type === 'multiple_choice' && (
          <div>
            <label className="form-label">Options & Branching</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {block.options?.map((opt, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 8, borderRadius: 4 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      className="form-input" 
                      style={{ flex: 1, padding: '6px 10px', fontSize: '.9rem' }}
                      value={opt.label || ''}
                      onChange={e => {
                        const newOpts = [...block.options];
                        newOpts[i] = { ...newOpts[i], label: e.target.value };
                        updateBlock({ options: newOpts });
                      }}
                      placeholder="Option label"
                    />
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px' }}
                      onClick={() => {
                        const newOpts = block.options.filter((_, idx) => idx !== i);
                        updateBlock({ options: newOpts });
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>Jump to:</span>
                    <select 
                      className="form-input" 
                      style={{ flex: 1, padding: '4px 8px', fontSize: '.8rem' }}
                      value={opt.nextBlockId || ''}
                      onChange={e => {
                        const newOpts = [...block.options];
                        newOpts[i] = { ...newOpts[i], nextBlockId: e.target.value };
                        updateBlock({ options: newOpts });
                      }}
                    >
                      <option value="">Next block (Default)</option>
                      <option value="end">End Campaign</option>
                      {state.blocks.filter(b => b.id !== block.id).map(b => (
                        <option key={b.id} value={b.id}>{b.question?.substring(0, 20) || b.type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: 8 }}
                onClick={() => updateBlock({ options: [...(block.options || []), { label: '', nextBlockId: null }] })}
              >
                <Plus size={14} /> Add Option
              </button>
            </div>
          </div>
        )}

        {['text_input', 'long_text'].includes(block.type) && (
          <>
            <div className="form-group full">
              <label className="form-label">Min Characters</label>
              <input type="number" className="form-input" placeholder="0" />
            </div>
            <div className="form-group full">
              <label className="form-label">Max Characters</label>
              <input type="number" className="form-input" placeholder="1000" />
            </div>
          </>
        )}

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 24 }}>
          <label className="form-label">Block Logic (If not selected above)</label>
          <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Advanced targeting and jumps based on user response.</p>
          <select 
            className="form-input" 
            style={{ width: '100%' }}
            value={block.nextBlockId || ''}
            onChange={e => updateBlock({ nextBlockId: e.target.value })}
          >
            <option value="">Always jump to next block</option>
            <option value="end">End campaign</option>
            {state.blocks.filter(b => b.id !== block.id).map(b => (
              <option key={b.id} value={b.id}>Jump to: {b.question?.substring(0, 20) || b.type}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
