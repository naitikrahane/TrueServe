import React, { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Link } from 'react-router-dom';
import { TrueServeLogoIcon, ShieldIcon, ScanFaceIcon, CheckIcon, BriefcaseIcon } from './Icons';
import { verifyIdentity, startFaceVerification } from '../lib/goodDollar';
import { ethers } from 'ethers';

export default function IdentityLogin({ onLogin, onBack }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unverifiedAddress, setUnverifiedAddress] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { address, isConnected } = useAccount();

  const handleWorkerLogin = async () => {
    if (!isConnected) return;
    
    setErrorMsg('');
    setUnverifiedAddress(null);
    setLoading(true);
    try {
      // Temporary override for demo purposes if needed, otherwise rely on actual Celo check
      const isVerified = await verifyIdentity(address);
      
      if (isVerified) {
        onLogin({ id: address, role: 'user' });
      } else {
        setErrorMsg('No verified GoodDollar Identity found for this wallet. Please complete face verification first.');
        setUnverifiedAddress(address);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify identity.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartFaceVerification = async () => {
    try {
      setLoading(true);
      if (window.ethereum) {
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         await startFaceVerification(provider);
      } else {
         throw new Error("Web3 provider not found. Face verification requires a browser wallet.");
      }
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
    }
  };

  const handleCreatorLogin = () => {
    if (!isConnected) return;
    onLogin({ id: address, role: 'creator' });
  };

  return (
    <div className="login-container">
      <div className="login-card md-p-6 card-panel" style={{ maxWidth: 500, margin: '0 auto', backdropFilter: 'blur(24px)' }}>
        <div style={{ width: 80, height: 80, margin: '0 auto 24px', background: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <TrueServeLogoIcon size={48} color="#ffffff" bgColor="var(--accent-primary)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Connect & Authenticate</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>
          Connect your Web3 wallet using Reown AppKit to access TrueServe. You can login as a Creator to launch surveys, or as a Worker to earn G$.
        </p>

        {/* Reown Wallet Connect Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <appkit-button />
        </div>

        {errorMsg && (
          <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', color: 'var(--accent-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', marginBottom: 24, border: '1px solid rgba(239,68,68,0.2)' }}>
            {errorMsg}
            {unverifiedAddress && (
              <div className="flex-col gap-2" style={{ marginTop: 16 }}>
                <button className="btn-primary" style={{ background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.4)', color: 'var(--accent-danger)' }} onClick={handleStartFaceVerification}>
                  Start Face Verification
                </button>
              </div>
            )}
          </div>
        )}

        {isConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 20 }}>
            
            {/* Terms and Conditions Checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: 4, cursor: 'pointer', width: 16, height: 16 }}
              />
              <label htmlFor="terms" style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, cursor: 'pointer', textAlign: 'left' }}>
                I have read and agree to the <Link to="/terms" target="_blank" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Privacy Policy</Link>.
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--border-medium)', margin: '8px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Choose Role</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            </div>

            <button
              className="btn-primary btn-dark"
              onClick={handleWorkerLogin}
              disabled={loading || !acceptedTerms}
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: (!acceptedTerms) ? 0.5 : 1, cursor: (!acceptedTerms) ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <><span className="spin">◌</span> Verifying...</>
              ) : (
                <><ScanFaceIcon size={20} /> Login as Worker (KYC)</>
              )}
            </button>

            <button
              className="btn-primary"
              onClick={handleCreatorLogin}
              disabled={loading || !acceptedTerms}
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', background: 'var(--bg-card)', color: 'var(--text-main)', borderColor: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: (!acceptedTerms) ? 0.5 : 1, cursor: (!acceptedTerms) ? 'not-allowed' : 'pointer' }}
            >
              <BriefcaseIcon size={20} /> Login as Creator
            </button>

            {/* Dev Mode Bypass */}
            <button
              className="btn-primary"
              onClick={() => onLogin({ id: address, role: 'user' })}
              disabled={loading || !acceptedTerms}
              style={{ width: '100%', padding: '16px', fontSize: '1rem', background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px dashed var(--border-medium)', marginTop: 8, opacity: (!acceptedTerms) ? 0.5 : 1, cursor: (!acceptedTerms) ? 'not-allowed' : 'pointer' }}
            >
              [Dev Mode] Bypass KYC (View Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
