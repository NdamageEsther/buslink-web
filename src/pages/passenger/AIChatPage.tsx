import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "assistant"; content: string; time: string; }

const SYSTEM_PROMPT = `You are BusLink Assistant, a helpful AI for Rwanda's BusLink bus ticketing platform. Help passengers with:
- Bus schedules and routes (Kigali to Musanze, Huye, Rubavu, Gisenyi, Rusizi, Nyamagabe etc.)
- Booking and cancellation procedures
- Payment methods (MTN Mobile Money, Airtel Money, bank cards)
- Bus agencies (YAHOO Transport, Volcano Express, Horizon Express, Kigali Coach, RITCO, Matunda, MUSANZE)
- Bus stations (Nyabugogo Terminal, Huye Station, Musanze Park, etc.)
- Ticket and QR code help
- Travel tips and safety

Be friendly, helpful and concise. Respond in the same language the user writes in (English, Kinyarwanda or French).`;

function formatTime() {
  return new Date().toLocaleTimeString("en-RW", { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTIONS = [
  "What buses go from Kigali to Musanze?",
  "How do I cancel my booking?",
  "How do I pay with MoMo?",
  "Which terminal is in Kigali?",
  "Are there buses on weekends?",
  "How early should I arrive?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "👋 Hello! I am BusLink Assistant. I can help you with bus schedules, bookings, payments, and any transport questions in Rwanda. How can I help you today?",
    time: formatTime(),
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text?: string) {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content, time: formatTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 1000,
          system:     SYSTEM_PROMPT,
          messages:   history,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data  = await response.json();
      const reply = data?.content?.[0]?.text ||
        "Sorry, I could not get a response. Please try again.";

      setMessages(prev => [...prev, {
        role: "assistant",
        content: reply,
        time: formatTime(),
      }]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again in a moment.",
        time: formatTime(),
      }]);
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={{
      maxWidth: "720px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 130px)",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* Chat header */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      }}>
        <div style={{ width: "44px", height: "44px", backgroundColor: "#1d4ed8", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#fff", margin: 0 }}>BusLink AI Assistant</h2>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: 0 }}>Always here to help • Powered by Claude AI</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#16a34a", borderRadius: "20px", padding: "4px 12px" }}>
          <div style={{ width: "6px", height: "6px", backgroundColor: "#fff", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#fff" }}>Online</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        paddingRight: "4px",
        paddingBottom: "8px",
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-end" }}>

            {/* Avatar */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", flexShrink: 0,
              backgroundColor: m.role === "assistant" ? "#0f172a" : "#1d4ed8",
              color: m.role === "assistant" ? "#60a5fa" : "#fff",
            }}>
              {m.role === "assistant" ? "🤖" : "👤"}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "4px", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                padding: "12px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                fontSize: "14px",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                backgroundColor: m.role === "user" ? "#1d4ed8" : "#fff",
                color: m.role === "user" ? "#fff" : "#1e293b",
                boxShadow: m.role === "assistant" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                border: m.role === "assistant" ? "1px solid #f1f5f9" : "none",
              }}>
                {m.content}
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8", paddingLeft: "4px", paddingRight: "4px" }}>{m.time}</span>
            </div>
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>🤖</div>
            <div style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {[0, 150, 300].map(delay => (
                  <div key={delay} style={{ width: "8px", height: "8px", backgroundColor: "#1d4ed8", borderRadius: "50%", animation: `bounce 1.2s ${delay}ms infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions — show only at start */}
      {messages.length === 1 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", marginTop: "4px" }}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              style={{ fontSize: "12px", color: "#1d4ed8", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 14px", borderRadius: "20px", cursor: "pointer", fontWeight: "500", transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#dbeafe")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#eff6ff")}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about buses, bookings, routes..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "13px 18px",
            border: "2px solid #e2e8f0",
            borderRadius: "14px",
            fontSize: "14px",
            color: "#1e293b",
            outline: "none",
            backgroundColor: "#fff",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.target.style.borderColor = "#1d4ed8")}
          onBlur={e => (e.target.style.borderColor = "#e2e8f0")}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            padding: "13px 20px",
            backgroundColor: !input.trim() || loading ? "#93c5fd" : "#1d4ed8",
            color: "#fff",
            border: "none",
            borderRadius: "14px",
            fontWeight: "700",
            fontSize: "14px",
            cursor: !input.trim() || loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.backgroundColor = "#1e40af"; }}
          onMouseLeave={e => { if (input.trim() && !loading) e.currentTarget.style.backgroundColor = "#1d4ed8"; }}
        >
          {loading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}