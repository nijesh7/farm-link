import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Leaf,
  Utensils,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRESET_QUERIES = {
  farmer: [
    { label: '🌿 Crop Disease Check', prompt: 'How do I identify and treat leaf curl and yellow spot on tomato crops organically?' },
    { label: '💧 NPK & Soil Health', prompt: 'What is the ideal organic fertilizer ratio (NPK) and compost schedule for leafy greens?' },
    { label: '📈 Optimal Market Price', prompt: 'What is the recommended selling price for organic strawberries this harvest season?' },
    { label: '🐛 Natural Pest Control', prompt: 'How can I make an organic neem oil and garlic spray to combat aphids and whiteflies?' },
    { label: '🌦️ Weather Advisory', prompt: 'What precautions should I take for irrigation before the upcoming humid monsoon spell?' }
  ],
  customer: [
    { label: '🥗 Recipe from Cart', prompt: 'Give me a quick 20-minute healthy recipe using organic spinach, tomatoes, and red beans.' },
    { label: '🥑 Freshness Storage Tips', prompt: 'How can I store fresh strawberries and leafy greens so they stay crisp for 10+ days?' },
    { label: '🛡️ Organic vs Normal', prompt: 'What does FarmLink direct organic certification mean compared to supermarket produce?' },
    { label: '⚡ Superfood Nutrition', prompt: 'What are the antioxidant and vitamin benefits of farm-fresh heirloom tomatoes?' }
  ]
};

const KNOWLEDGE_BASE = [
  {
    keywords: ['leaf curl', 'yellow spot', 'disease', 'tomato'],
    response: `**Tomato Leaf Disease & Organic Treatment Advisory:**
1. **Diagnosis**: Yellow spots and leaf curling typically indicate early fungal blight (*Alternaria solani*) or whitefly-transmitted leaf curl virus.
2. **Organic Remedy**:
   - Spray **Cold-Pressed Neem Oil (5ml/L)** mixed with mild organic soap solution every 5 days in the early morning.
   - Apply a **Bordeaux Mixture (1%)** or bio-fungicide containing *Trichoderma viride* to root zones.
3. **Preventative Action**: Avoid overhead sprinkler watering; ensure 18-inch row spacing for optimal airflow.`
  },
  {
    keywords: ['npk', 'soil', 'fertilizer', 'compost', 'greens'],
    response: `**NPK & Soil Enrichment Recommendation for Leafy Greens:**
- **Target Ratio**: High Nitrogen (N) formula like **4-2-2** or **3-1-2** during vegetative growth.
- **Organic Mix**: Apply well-rotted vermicompost (2 tons/acre) combined with bone meal and neem cake powder (200kg/acre).
- **Foliar Nutrition**: Spray diluted fermented Panchagavya or seaweed liquid extract (3ml/L) every 12-14 days for vibrant chlorophyll development.`
  },
  {
    keywords: ['price', 'pricing', 'strawberries', 'market', 'rate'],
    response: `**Smart Pricing & Margin Analysis:**
- **Wholesale Mandi Average**: ₹160 - ₹180 / lb
- **Supermarket Retail Price**: ₹320 - ₹360 / lb
- **FarmLink Recommended Direct Price**: **₹240 - ₹260 / lb**
- **Advantage**: At ₹249/lb, you earn **38% higher margin** than wholesale brokers while offering consumers a **25% discount** over retail stores!`
  },
  {
    keywords: ['pest', 'neem', 'aphid', 'whitefly', 'spray'],
    response: `**Organic Pest Defense Recipe (Neem & Botanical Shield):**
- **Ingredients**: 15ml pure neem oil + 5g mild herbal liquid soap + 20ml crushed garlic-chili extract per 1 Litre of water.
- **Application**: Emulsify thoroughly in warm water. Spray at dusk on the undersides of leaves where pests colonize.
- **Efficacy**: Eliminates aphids, mites, caterpillars, and thrips without harming beneficial pollinators like honeybees.`
  },
  {
    keywords: ['recipe', 'spinach', 'tomato', 'beans', 'cook'],
    response: `**Chef's 20-Min Tuscan Farmhouse Medley:**
- **Ingredients**: 1 bunch FarmLink Spinach, 2 Heirloom Tomatoes (diced), 1 cup boiled Red Kidney Beans, 2 cloves garlic, cold-pressed olive oil.
- **Preparation**:
  1. Sauté sliced garlic in 1 tbsp olive oil until aromatic (1 min).
  2. Add chopped tomatoes and simmer for 4 mins until soft and juicy.
  3. Toss in kidney beans and seasoning (sea salt, oregano, black pepper).
  4. Fold in fresh spinach for 90 seconds until vibrant green and tender.
- **Nutrition**: 24g Plant Protein, 12g Dietary Fiber, Rich in Vitamin A & Iron!`
  },
  {
    keywords: ['store', 'storage', 'freshness', 'crisp', 'days'],
    response: `**Zero-Waste Produce Preservation Guide:**
- **Leafy Greens (Spinach/Kale)**: Wash, spin-dry completely, wrap loosely in a clean cotton tea towel inside a breathable container. Stays crisp for 12-14 days.
- **Berries (Strawberries)**: Do NOT wash before storing! Dip briefly in a 1:3 vinegar-water bath, dry thoroughly, and store lined with paper towels in the crisper drawer.
- **Tomatoes**: Keep stem-side down at room temperature away from direct sunlight for maximum flavor and lycopene retention.`
  },
  {
    keywords: ['organic', 'certification', 'middlemen', 'direct'],
    response: `**FarmLink Direct Provenance Promise:**
- **0 Intermediaries**: Harvested within 24 hours of dispatch.
- **Full Traceability**: Every lot is linked to geo-located farms with soil pH & chemical residue lab tests accessible via QR Batch ID.
- **Fair Trade Guarantee**: 88% of your payment goes directly into the farmer's bank account (compared to only 30% in conventional wholesale chains).`
  }
];

export default function AiAgriCopilot() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(currentUser?.role === 'farmer' ? 'farmer' : 'customer');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${currentUser?.name || 'there'}! 👋 I am **FarmLink AI Copilot**, your 24/7 smart farming advisor and organic produce companion. How can I assist you today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser?.role) {
      setActiveTab(currentUser.role === 'farmer' ? 'farmer' : 'customer');
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech Recognition setup (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text-to-Speech function
  const speakText = (text) => {
    if (!('speechSynthesis' in window) || !voiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // AI Response generation algorithm matching keywords
    setTimeout(() => {
      const lowerQ = query.toLowerCase();
      let matched = KNOWLEDGE_BASE.find((item) =>
        item.keywords.some((kw) => lowerQ.includes(kw))
      );

      let responseContent = '';
      if (matched) {
        responseContent = matched.response;
      } else if (lowerQ.includes('hello') || lowerQ.includes('hi')) {
        responseContent = `Hello! How can I assist your farming or produce needs today? You can ask about crop diseases, organic fertilizers, market price trends, recipes, or storage tips.`;
      } else if (lowerQ.includes('weather') || lowerQ.includes('rain') || lowerQ.includes('irrigation')) {
        responseContent = `**Agri-Climatic Advisory:**
- Current regional forecasts indicate moderate humidity with optimal soil temperature (24°C - 28°C).
- Recommendation: Ensure furrow drainage is clear to prevent water stagnation. Switch to drip irrigation during mornings to minimize fungal risk.`;
      } else {
        responseContent = `**FarmLink Smart Intelligence:**
Thank you for your question regarding "${query}".
- **Best Practice**: For organic farm yields, maintain high soil organic matter (>2.5%) and rotate legumes with heavy-feeder crops like nightshades or brassicas.
- **Market Edge**: Ensure consistent grading by size and firmness before packing.
- Would you like specific guidance on disease management, direct pricing, or crop recipes?`;
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: responseContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      if (voiceEnabled) {
        speakText(responseContent);
      }
    }, 650);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `Chat cleared! How can I help you next? Select a preset topic or ask any question.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-main)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              animation: 'bounceIn 1s ease-in-out'
            }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>AI AgriCopilot</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                display: 'inline-block'
              }}
            />
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI AgriCopilot"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(30, 86, 49, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s',
            position: 'relative'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isOpen ? <X size={26} /> : <Bot size={28} />}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: 'var(--warning)',
                color: '#000',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--card-bg)'
              }}
            >
              AI
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-hover)',
            border: '1px solid var(--card-border)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                    FarmLink AI Copilot
                  </h3>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}
                  >
                    PRO
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                  Agronomic Advisory & Produce Assistant
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title={voiceEnabled ? 'Mute AI Voice' : 'Enable AI Voice Output'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  opacity: voiceEnabled ? 1 : 0.7
                }}
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button
                onClick={handleClearChat}
                title="Reset Conversation"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  opacity: 0.8
                }}
              >
                <RotateCcw size={17} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              padding: '0.5rem',
              backgroundColor: 'var(--gray-50)',
              borderBottom: '1px solid var(--gray-200)',
              gap: '0.5rem'
            }}
          >
            <button
              onClick={() => setActiveTab('farmer')}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'farmer' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'farmer' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'farmer' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Leaf size={14} />
              <span>Farmer Advisory</span>
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              style={{
                flex: 1,
                padding: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: activeTab === 'customer' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'customer' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'customer' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Utensils size={14} />
              <span>Consumer & Chef</span>
            </button>
          </div>

          {/* Preset Quick Chips */}
          <div
            style={{
              padding: '0.6rem 0.8rem',
              backgroundColor: 'var(--card-bg)',
              borderBottom: '1px solid var(--gray-100)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {PRESET_QUERIES[activeTab].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: '1px solid var(--gray-200)',
                  backgroundColor: 'var(--primary-bg)',
                  color: 'var(--primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: 'var(--card-bg)'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isUser ? 'var(--primary)' : 'var(--gray-100)',
                      color: isUser ? '#ffffff' : 'var(--text-main)',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      boxShadow: 'var(--shadow-sm)',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      marginTop: '3px',
                      padding: '0 4px'
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
              );
            })}

            {isTyping && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '16px 16px 16px 2px',
                  backgroundColor: 'var(--gray-100)',
                  width: 'fit-content'
                }}
              >
                <Sparkles size={14} color="var(--primary)" className="animate-spin" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  FarmLink AI is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid var(--gray-200)',
              backgroundColor: 'var(--card-bg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'Stop Listening' : 'Voice Input (Speech-to-Text)'}
              style={{
                background: isListening ? 'var(--danger)' : 'var(--gray-100)',
                color: isListening ? '#ffffff' : 'var(--text-main)',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              placeholder={
                isListening
                  ? 'Listening... speak now...'
                  : activeTab === 'farmer'
                  ? 'Ask about crops, pests, soil NPK, prices...'
                  : 'Ask for recipes, nutrition, freshness tips...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
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
              disabled={!inputMessage.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: inputMessage.trim() ? 'var(--primary)' : 'var(--gray-300)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputMessage.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
