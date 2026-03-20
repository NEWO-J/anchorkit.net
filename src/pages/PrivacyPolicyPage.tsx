import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#030028] text-white/80 font-['DM_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto px-8 py-24">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-12">Effective Date: March 20, 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">1. Who We Are</h2>
          <p className="leading-relaxed">
            AnchorKit ("we," "us," or "our") is a media authenticity service operated by Jonah Owen.
            You can reach us at{' '}
            <a href="mailto:support@anchorkit.net" className="text-[#e07a2f] hover:underline">
              support@anchorkit.net
            </a>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">2. What We Collect</h2>
          <p className="leading-relaxed mb-3">
            <strong className="text-white">Account information:</strong> When you create an account, we collect your email address
            and a hashed password. We do not store plain-text passwords.
          </p>
          <p className="leading-relaxed mb-3">
            <strong className="text-white">API usage data:</strong> We log API requests associated with your API key, including
            timestamps and request counts, for rate limiting and abuse prevention.
          </p>
          <p className="leading-relaxed mb-3">
            <strong className="text-white">File hashes:</strong> When you anchor or verify media, we compute and store a SHA-256
            hash of your file. We never receive, store, or transmit the actual file content — only its hash.
          </p>
          <p className="leading-relaxed mb-3">
            <strong className="text-white">Blockchain data:</strong> Hashes anchored to the Solana blockchain are permanently
            public by the nature of the blockchain. This is intentional and disclosed at the time of anchoring.
          </p>
          <p className="leading-relaxed">
            <strong className="text-white">Usage data:</strong> We may collect standard server logs (IP address, browser/OS type,
            pages visited) for security and debugging purposes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">3. What We Don't Collect</h2>
          <p className="leading-relaxed">
            We do not collect, upload, or store any photo or video files. All hashing occurs on your
            device or in your browser before any data is sent to our servers.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-2 leading-relaxed">
            <li>To provide, operate, and maintain the AnchorKit service</li>
            <li>To send transactional emails (account verification, password resets, optional anchor batch notifications)</li>
            <li>To prevent fraud and abuse</li>
            <li>To respond to support requests</li>
          </ul>
          <p className="leading-relaxed mt-3">We do not sell your data. We do not use your data for advertising.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">5. Data Sharing</h2>
          <p className="leading-relaxed mb-3">We do not share your personal information with third parties except:</p>
          <ul className="list-disc list-inside space-y-2 leading-relaxed">
            <li>
              <strong className="text-white">Solana blockchain:</strong> Merkle roots of anchor batches are published publicly
              on-chain. Individual hashes within a batch are not published on-chain.
            </li>
            <li>
              <strong className="text-white">Legal compliance:</strong> If required by law or valid legal process.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
          <p className="leading-relaxed">
            You may delete your account at any time from the Dashboard. Upon deletion, your email and API
            key are removed from our systems. Blockchain records are permanent and cannot be deleted by
            their nature.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
          <p className="leading-relaxed">
            You may request a copy of your data or deletion of your account by emailing{' '}
            <a href="mailto:support@anchorkit.net" className="text-[#e07a2f] hover:underline">
              support@anchorkit.net
            </a>{' '}
            or using the Dashboard.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">8. Security</h2>
          <p className="leading-relaxed">
            We use industry-standard practices including HTTPS, hashed passwords, and hardware-attested
            API key validation.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
          <p className="leading-relaxed">
            AnchorKit is not directed to children under 13. We do not knowingly collect data from
            children under 13.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">10. Changes</h2>
          <p className="leading-relaxed">
            We may update this policy. We will notify registered users by email of material changes.
          </p>
        </section>
      </div>
    </div>
  );
}
