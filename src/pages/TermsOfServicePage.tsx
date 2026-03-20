import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#030028] text-white/80 font-['DM_Sans',sans-serif]">
      <div className="max-w-3xl mx-auto px-8 py-24">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-12">Effective Date: March 20, 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance</h2>
          <p className="leading-relaxed">
            By accessing or using AnchorKit (anchorkit.net), you agree to these Terms. If you do not
            agree, do not use the service.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">2. What AnchorKit Does</h2>
          <p className="leading-relaxed">
            AnchorKit provides cryptographic media authenticity verification. It computes SHA-256 hashes
            of photos and videos, anchors them on the Solana blockchain, and allows third parties to
            verify those anchors. AnchorKit does not guarantee any specific legal outcome or admissibility
            in any jurisdiction.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">3. Your Account</h2>
          <ul className="list-disc list-inside space-y-2 leading-relaxed">
            <li>You must provide accurate information when registering.</li>
            <li>You are responsible for keeping your API key confidential. Do not share it.</li>
            <li>You must be 13 years of age or older to create an account.</li>
            <li>You may not create accounts for the purpose of abuse, spam, or automated scraping.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
          <p className="leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc list-inside space-y-2 leading-relaxed">
            <li>Submit content that is illegal, harmful, or violates third-party rights</li>
            <li>Attempt to reverse-engineer, disrupt, or abuse the service or its API</li>
            <li>Use the service to create false or misleading authenticity records</li>
            <li>Circumvent rate limits or access controls</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">5. No Warranty</h2>
          <p className="leading-relaxed">
            AnchorKit is provided "as is" without warranties of any kind. We do not warrant that the
            service will be uninterrupted, error-free, or legally sufficient for any particular purpose.
            Blockchain anchoring is subject to network availability and third-party infrastructure (Solana).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the maximum extent permitted by law, AnchorKit and its operators shall not be liable for
            any indirect, incidental, or consequential damages arising from your use of the service,
            including reliance on anchor records in legal or evidentiary contexts.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
          <p className="leading-relaxed">
            The AnchorKit SDK, website, and documentation are the property of Jonah Owen. You may not
            reproduce or redistribute them without written permission, except as permitted by the
            open-source license if applicable.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">8. Termination</h2>
          <p className="leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these Terms, with or
            without notice.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">9. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms are governed by the laws of the United States. Disputes shall be resolved in
            the jurisdiction where the operator resides.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">10. Changes</h2>
          <p className="leading-relaxed">
            We may modify these Terms at any time. Continued use of the service after changes constitutes
            acceptance.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
          <p className="leading-relaxed">
            For questions, contact{' '}
            <a href="mailto:support@anchorkit.net" className="text-[#e07a2f] hover:underline">
              support@anchorkit.net
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
