'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-base text-black border-l-4 border-black pl-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed pl-4">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-[860px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Privacy Policy</span>
      </nav>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>PRIVACY POLICY</h1>
          <p className="text-xs text-gray-400">Last updated: August 2025</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl p-5">
        At SHOP.CO, your privacy matters to us. This policy explains what personal information we collect, how we use it, and how we protect it. By using our services, you agree to the collection and use of information in accordance with this policy.
      </p>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-7">
        <Section title="1. Information We Collect">
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and delivery address when you place an order.</li>
            <li><strong>Payment Information:</strong> We do not store card details. Payments are processed by secure third-party gateways.</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, and device information.</li>
            <li><strong>Cookies:</strong> We use cookies to improve your browsing experience and remember preferences.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>To process and fulfil your orders.</li>
            <li>To send order confirmations and shipping updates.</li>
            <li>To send promotional emails (you can opt-out at any time).</li>
            <li>To improve our website, products, and customer experience.</li>
            <li>To prevent fraud and ensure account security.</li>
          </ul>
        </Section>

        <Section title="3. Data Sharing">
          We do not sell or rent your personal data to third parties. We share data only with:
          <ul className="list-disc pl-4 flex flex-col gap-1.5 mt-2">
            <li>Courier partners (for order delivery).</li>
            <li>Payment processors (for secure transactions).</li>
            <li>Government authorities (if legally required).</li>
          </ul>
        </Section>

        <Section title="4. Data Security">
          We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information from unauthorised access, alteration, or disclosure.
        </Section>

        <Section title="5. Cookies Policy">
          We use essential, analytical, and marketing cookies. You may disable cookies in your browser settings, however this may affect some features of our website. By continuing to use SHOP.CO, you consent to our use of cookies.
        </Section>

        <Section title="6. Your Rights">
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>Right to access the personal data we hold about you.</li>
            <li>Right to correct inaccurate data.</li>
            <li>Right to request deletion of your data.</li>
            <li>Right to opt out of marketing communications at any time.</li>
          </ul>
        </Section>

        <Section title="7. Data Retention">
          We retain your personal data for as long as your account is active or as required to provide services. After account closure, data is deleted within 90 days unless required by law.
        </Section>

        <Section title="8. Children's Privacy">
          SHOP.CO is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
        </Section>

        <Section title="9. Contact Us">
          For any privacy-related queries or to exercise your rights, contact our Privacy Officer at{' '}
          <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="underline font-semibold text-black">sadiqshoaibbilal9140@gmail.com</a>{' '}
          or call <a href="tel:+923281298871" className="underline font-semibold text-black">0328-1298871</a>.
        </Section>
      </div>
    </div>
  );
}
