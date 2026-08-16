'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-bold text-base text-black border-l-4 border-black pl-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed pl-4">{children}</div>
    </div>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <div className="w-full max-w-[860px] mx-auto px-4 py-12 font-['Satoshi'] flex flex-col gap-8">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium">Terms & Conditions</span>
      </nav>

      <div>
        <h1 className="text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>TERMS & CONDITIONS</h1>
        <p className="text-xs text-gray-400 mt-2">Last updated: August 2025</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-7">
        <Section title="1. Acceptance of Terms">
          By accessing or using SHOP.CO, you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
        </Section>

        <Section title="2. Products & Pricing">
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>All prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes.</li>
            <li>We reserve the right to modify prices at any time without prior notice.</li>
            <li>Product images are for illustration purposes only. Actual colours may vary slightly due to screen settings.</li>
            <li>Stock availability is not guaranteed. In case of unavailability, you will be notified and fully refunded.</li>
          </ul>
        </Section>

        <Section title="3. Orders & Payment">
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>Orders are confirmed only after successful payment verification.</li>
            <li>We accept Cash on Delivery (COD), bank transfer, and major debit/credit cards.</li>
            <li>SHOP.CO reserves the right to cancel any order suspected of fraud.</li>
            <li>You will receive an email confirmation upon successful order placement.</li>
          </ul>
        </Section>

        <Section title="4. Shipping & Delivery">
          Delivery timelines are estimates and may vary. SHOP.CO is not responsible for delays caused by courier partners, natural disasters, or government restrictions. See our <Link href="/help/delivery-details" className="underline font-semibold text-black">Delivery Details</Link> page for full information.
        </Section>

        <Section title="5. Returns & Refunds">
          Products may be returned within 7 days of delivery if they are unused, unwashed, and in original packaging. Sale items are non-refundable. Refer to our <Link href="/faq/returns-and-refunds" className="underline font-semibold text-black">Returns & Refunds</Link> page for the complete policy.
        </Section>

        <Section title="6. Intellectual Property">
          All content on SHOP.CO including text, images, logos, and design is the intellectual property of SHOP.CO and may not be copied, reproduced, or distributed without written permission.
        </Section>

        <Section title="7. User Conduct">
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li>You must not use this site for any unlawful purpose.</li>
            <li>You must not transmit any spam, viruses, or malicious code.</li>
            <li>You must not attempt to gain unauthorised access to any part of the platform.</li>
          </ul>
        </Section>

        <Section title="8. Limitation of Liability">
          SHOP.CO shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use our services. Our maximum liability is limited to the amount paid for the specific order in question.
        </Section>

        <Section title="9. Governing Law">
          These Terms shall be governed by and construed in accordance with the laws of Pakistan. Any disputes shall be resolved through arbitration in Karachi, Pakistan.
        </Section>

        <Section title="10. Contact">
          For any questions regarding these Terms, contact us at{' '}
          <a href="mailto:sadiqshoaibbilal9140@gmail.com" className="underline font-semibold text-black">sadiqshoaibbilal9140@gmail.com</a>{' '}
          or call <a href="tel:+923281298871" className="underline font-semibold text-black">0328-1298871</a>.
        </Section>
      </div>
    </div>
  );
}
