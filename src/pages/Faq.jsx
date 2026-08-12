import React, { useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';

const FAQS = [
  ['How do I place an order?', 'Create a customer account, add available products to your cart, then complete checkout with your delivery details.'],
  ['How fresh are the products?', 'Listings come directly from local farmers. Each farmer controls their stock so you only see products currently available.'],
  ['Can I buy from more than one farmer?', 'Yes. Your cart can contain products from multiple farmers and they will appear together in your order summary.'],
  ['How do I become a farmer partner?', 'Register as a farmer, open your dashboard, and add your crop listings with a price, unit, quantity, and category.'],
  ['Can I update a listing later?', 'Yes. Farmers can edit the product details, category, price, and available quantity from their dashboard.'],
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <CircleHelp size={42} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>Frequently Asked Questions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Everything you need to know about buying and selling on FarmLink.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {FAQS.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <div key={question} className="card" style={{ overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-main)', fontWeight: 700, fontSize: '1rem' }}
                >
                  {question}
                  <ChevronDown size={20} style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
                </button>
                {isOpen && <p style={{ padding: '0 1.4rem 1.3rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
