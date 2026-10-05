import React, { useState } from 'react';
import { MessageSquare, X, Send, User, CheckCheck, Sparkles, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const INITIAL_FARMER_REPLIES = {
  organic: 'Hello! Yes, all our crops are 100% certified organic (NPOP & PGS-India). We only use aged vermicompost and neem-garlic biological sprays.',
  harvest: 'We harvest every morning at 5:30 AM before sunrise so the produce retains natural dew, sugars, and crunch before dispatch.',
  bulk: 'Yes, we do support bulk orders for farm shares and catering! For orders over 20kg, we offer an additional 12% grower discount.',
  default: 'Thank you for reaching out! I am currently working in the fields but will review your request and get back to you shortly.'
};

export default function FarmerChatModal({ farmerName, productName, onClose }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'farmer',
      text: `Hello ${currentUser?.name || 'there'}! I am ${farmerName || 'the grower'}. How can I help you with your inquiry regarding ${productName || 'our fresh harvest'}?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  const quickQuestions = [
    'Are these 100% pesticide-free?',
    'When was this batch harvested?',
    'Can I place a bulk pre-order (20kg+)?',
    'Do you support farm visits?'
  ];

  const handleSend = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // Simulate farmer reply
    setTimeout(() => {
      let replyText = INITIAL_FARMER_REPLIES.default;
      const lower = text.toLowerCase();
      if (lower.includes('pesticide') || lower.includes('organic') || lower.includes('chemical')) {
        replyText = INITIAL_FARMER_REPLIES.organic;
      } else if (lower.includes('harvest') || lower.includes('when') || lower.includes('fresh')) {
        replyText = INITIAL_FARMER_REPLIES.harvest;
      } else if (lower.includes('bulk') || lower.includes('kg') || lower.includes('discount')) {
        replyText = INITIAL_FARMER_REPLIES.bulk;
      }

      const farmerMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'farmer',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, farmerMsg]);
    }, 700);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '580px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#ffffff' }}>{farmerName || 'Verified Farmer'}</h3>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                Direct Farm Message Channel
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--gray-50)',
            borderBottom: '1px solid var(--gray-200)',
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--gray-200)',
                backgroundColor: 'var(--card-bg)',
                color: 'var(--primary)',
                fontSize: '0.72rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: isMe ? 'var(--primary)' : 'var(--gray-100)',
                    color: isMe ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {m.text}
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {m.time} {isMe && <CheckCheck size={12} color="var(--primary)" />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '0.75rem',
            borderTop: '1px solid var(--gray-200)',
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'var(--card-bg)'
          }}
        >
          <input
            type="text"
            placeholder="Type your question for the farmer..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '20px',
              border: '1px solid var(--gray-300)',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: inputText.trim() ? 'var(--primary)' : 'var(--gray-300)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
