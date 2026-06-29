import React, { useState } from 'react';
import { CampaignProvider, useCampaign } from './CampaignBuilderContext';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import Properties from './Properties';
import { ChevronLeft, Play, ShieldCheck, Settings } from 'lucide-react';

function BuilderLayout({ onBack }) {
  const { state } = useCampaign();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-card)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <div style={{ height: 60, background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}><ChevronLeft size={16} /> Exit</button>
          <div style={{ fontWeight: 700 }}>Campaign Drafter Pro</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'var(--border-medium)' }}><Play size={14} /> Preview</button>
          <button className="btn btn-outline btn-sm" style={{ color: 'white', borderColor: 'var(--border-medium)' }} onClick={() => setShowSettings(!showSettings)}><Settings size={14} /> Target & Escrow</button>
          <button className="btn btn-primary btn-sm" style={{ background: 'white', color: 'var(--text-main)', border: 'none' }}><ShieldCheck size={14} /> Launch Campaign</button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <Canvas />
        <Properties />
      </div>

      {/* Campaign Settings Modal (Mock) */}
      {showSettings && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ background: 'var(--bg-main)', padding: 32, borderRadius: 'var(--radius-lg)', width: 600, border: '1px solid var(--border-light)', color: 'white' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24, color: 'white' }}>Targeting & Escrow Settings</h2>
            
            <div className="form-group full">
              <label className="form-label">Campaign Title</label>
              <input className="form-input" defaultValue={state.title} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Reward (G$)</label>
                <input className="form-input" type="number" defaultValue="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Participants</label>
                <input className="form-input" type="number" defaultValue="100" />
              </div>
            </div>

            <div className="form-group full">
              <label className="form-label">Minimum Human Trust Score</label>
              <select className="form-input"><option>80%</option><option>90%</option><option>99%</option></select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
              <button className="btn btn-secondary" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowSettings(false)}>Save Settings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignBuilder({ onBack }) {
  return (
    <CampaignProvider>
      <BuilderLayout onBack={onBack} />
    </CampaignProvider>
  );
}
