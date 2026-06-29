import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const PageContainer = ({ title, lastUpdated, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="md-p-4" style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '60px 24px 120px' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="md-text-3xl" style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 16, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 48, fontWeight: 500 }}>
            Last updated: {lastUpdated}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="md-p-4" style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 16, border: '1px solid var(--border-light)' }}>
    <h2 className="md-text-xl" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-main)' }}>{title}</h2>
    <div style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
    </div>
  </section>
);

export function PrivacyPolicy() {
  return (
    <PageContainer title="Privacy Policy" lastUpdated="June 2026">
      
      <Section title="1. Information Collection">
        <p>This Privacy Policy governs the manner in which TrueServe collects, uses, maintains, and discloses information collected from users. The collection of data is strictly limited to the operational requirements of the protocol. We collect:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Public cryptographic wallet addresses.</li>
          <li>On-chain transactional data and smart contract interactions.</li>
          <li>Anonymized telemetry data for functional performance monitoring.</li>
        </ul>
      </Section>

      <Section title="2. Exclusions of Collection">
        <p>TrueServe explicitly disclaims the collection or storage of personally identifiable information (PII). We do not collect names, email addresses, physical addresses, governmental identification documents, or cryptographic private keys.</p>
      </Section>

      <Section title="3. Immutable Public Ledger Data">
        <p>By engaging with the TrueServe protocol, users acknowledge that interactions are recorded on a public, immutable blockchain ledger (Celo). This data, including but not limited to task creation and fund transfers, cannot be modified, redacted, or deleted by TrueServe or any third party.</p>
      </Section>

      <Section title="4. Decentralized Storage (IPFS)">
        <p>Payloads, including task specifications and worker submissions, are stored via the InterPlanetary File System (IPFS). This data is publicly accessible to any party possessing the relevant Content Identifier (CID). Users are solely responsible for encrypting any sensitive data prior to transmission.</p>
      </Section>

      <Section title="5. Third-Party Identity Verification">
        <p>Sybil resistance is managed by the GoodDollar Identity Protocol. Biometric verification (e.g., 3D face scans) is processed exclusively by GoodDollar and FaceTec. TrueServe does not receive, process, or retain any biometric data. The protocol strictly queries the blockchain for the presence of an anonymous verified credential.</p>
      </Section>

      <Section title="6. User Rights & Data Retention">
        <p>Users maintain the right to request the deletion of any off-chain data controlled by TrueServe. However, users acknowledge that requests for deletion cannot and will not apply to data committed to the blockchain or propagated across the IPFS network.</p>
      </Section>

      <Section title="7. Contact Information">
        <p>For privacy-related inquiries or formal notices, communications must be directed to: <strong style={{ color: 'var(--accent-primary)' }}>privacy@trueserve.xyz</strong></p>
      </Section>

    </PageContainer>
  );
}

export function TermsOfService() {
  return (
    <PageContainer title="Terms of Service" lastUpdated="June 2026">

      <Section title="1. Acceptance of Agreement">
        <p>These Terms of Service constitute a legally binding agreement between you ("User") and TrueServe. By accessing the interface or executing transactions via the TrueServe smart contracts, you expressly agree to comply with and be bound by these Terms.</p>
      </Section>

      <Section title="2. Nature of the Protocol">
        <p>TrueServe operates as a decentralized, non-custodial micro-task escrow protocol. It functions strictly as autonomous software infrastructure. TrueServe exercises no control over escrowed funds, does not act as a custodian, and does not warrant or guarantee the quality, legality, or accuracy of any tasks or submissions.</p>
      </Section>

      <Section title="3. User Eligibility & Verification">
        <p>Participation as a Worker requires successful cryptographic verification of unique human identity via the GoodDollar protocol. Any attempt to circumvent, spoof, or manipulate this biometric verification constitutes a material breach of these Terms and will result in immediate termination of access.</p>
      </Section>

      <Section title="4. Worker Obligations">
        <p>Workers are contractually obligated to provide accurate and relevant submissions in accordance with Creator specifications. The submission of fraudulent, automated, or substandard work will result in rejection. Accumulation of five (5) rejections shall trigger an automated, irrevocable ban of the associated wallet address from the protocol.</p>
      </Section>

      <Section title="5. Creator Obligations">
        <p>Creators must provide unambiguous task specifications and sufficient funding. Creators are obligated to adjudicate submissions in good faith. The arbitrary or fraudulent rejection of valid submissions is strictly prohibited.</p>
      </Section>

      <Section title="6. Escrow & Fee Structure">
        <p>All financial transactions are governed by immutable smart contracts utilizing the G$ token.</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Total task budgets must be locked in escrow prior to task deployment.</li>
          <li>Creators are bound by a 48-hour adjudication period. Failure to adjudicate within this timeframe will trigger an automated release of funds to the Worker.</li>
          <li>A non-refundable 2% protocol fee is levied on all approved payouts.</li>
        </ul>
      </Section>

      <Section title="7. Prohibited Conduct">
        <p>Users are strictly prohibited from engaging in the following conduct:</p>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Deployment of automated scripts, bots, or sybil attacks.</li>
          <li>Transmission of illegal, defamatory, or malicious payloads via the protocol.</li>
          <li>Exploitation, reverse engineering, or manipulation of the smart contract architecture.</li>
        </ul>
      </Section>

      <Section title="8. Intellectual Property Rights">
        <p>Upon approval and subsequent release of escrowed funds, all intellectual property rights pertaining to the submitted data shall transfer exclusively to the Task Creator, unless expressly stipulated otherwise in the task specifications.</p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>THE PROTOCOL IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, TRUESERVE SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM SMART CONTRACT VULNERABILITIES, REGULATORY INTERVENTION, OR FINANCIAL LOSS.</p>
      </Section>

      <Section title="10. Dispute Adjudication">
        <p>Disputes regarding task rejections are subject to on-chain resolution mechanisms within a 24-hour window, provided the Creator has elected to enable the dispute module. TrueServe assumes no obligation to arbitrate or mediate disputes between Users.</p>
      </Section>

      <Section title="11. Jurisdiction & Governing Law">
        <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the core development entity is registered, excluding its conflict of law principles.</p>
      </Section>

      <Section title="12. Legal Notices">
        <p>Formal legal notices, claims of infringement, or reports of material breach must be directed to: <strong style={{ color: 'var(--accent-primary)' }}>legal@trueserve.xyz</strong></p>
      </Section>

    </PageContainer>
  );
}
