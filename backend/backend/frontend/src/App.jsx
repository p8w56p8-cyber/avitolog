import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export default function App() {
  const [form, setForm] = useState({ niche: "", city: "", price_segment: "", extra: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    if (!form.niche.trim()) { setError("Укажите нишу"); return; }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Ошибка сервера");
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#00AEEF", fontSize: "2rem", marginBottom: 8 }}>🤖 ИИ-Авитолог</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Введите нишу — получите готовые заголовки, текст и советы по фото за 10 секунд
      </p>
      <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Ниша / товар / услуга *
        </label>
        <input
          placeholder="Например: ремонт квартир, продажа дивана, репетитор по математике"
          value={form.niche}
          onChange={e => setForm({ ...form, niche: e.target.value })}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd",
            fontSize: 16, boxSizing: "border-box", marginBottom: 16 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Город</label>
            <input
              placeholder="Москва"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8,
                border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Ценовой сегмент
            </label>
            <select
              value={form.price_segment}
              onChange={e => setForm({ ...form, price_segment: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8,
                border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box" }}
            >
              <option value="">Не важно</option>
              <option value="эконом">Эконом</option>
              <option value="средний">Средний</option>
              <option value="премиум">Премиум</option>
            </select>
          </div>
        </div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
          Дополнительно (УТП, особенности)
        </label>
        <textarea
          placeholder="Например: работаем без предоплаты, гарантия 2 года, выезд в день звонка"
          value={form.extra}
          onChange={e => setForm({ ...form, extra: e.target.value })}
          rows={3}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1px solid #ddd", fontSize: 16, boxSizing: "border-box", resize: "vertical" }}
        />
        {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 16, width: "100%", padding: "14px", borderRadius: 8,
            background: loading ? "#aaa" : "#00AEEF", color: "#fff", border: "none",
            fontSize: 18, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "⏳ Генерирую объявление..." : "🚀 Создать объявление"}
        </button>
      </div>
      {result && <ResultBlock result={result} />}
    </div>
  );
}
function ResultBlock({ result }) {
  const copy = (text) => navigator.clipboard.writeText(text);
  return (
    <div>
      {/* Заголовки */}
      <Section title="📝 ТОП-5 заголовков">
        {result.headlines?.map((h, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e0e0e0",
            borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <strong style={{ fontSize: 15 }}>{i + 1}. {h.text}</strong>
              <button onClick={() => copy(h.text)} style={copyBtn}>Копировать</button>
            </div>
            <p style={{ color: "#666", fontSize: 13, marginTop: 6 }}>💡 {h.reason}</p>
          </div>
        ))}
      </Section>
      {/* Текст объявления */}
      <Section title="📄 Текст объявления">
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <button onClick={() => copy(result.ad_text)} style={copyBtn}>Копировать текст</button>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif",
            fontSize: 14, lineHeight: 1.6, margin: 0 }}>{result.ad_text}</pre>
        </div>
      </Section>
      {/* Фото */}
      <Section title="📸 Рекомендации по фото">
        <ul style={{ paddingLeft: 20 }}>
          {result.photo_tips?.map((tip, i) => (
            <li key={i} style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>{tip}</li>
          ))}
        </ul>
      </Section>
      {/* Категория и теги */}
      <Section title="🏷 Категория и теги">
        <p><strong>Категория:</strong> {result.category}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {result.tags?.map((tag, i) => (
            <span key={i} style={{ background: "#e8f4fd", color: "#00AEEF",
              padding: "4px 12px", borderRadius: 20, fontSize: 13 }}>#{tag}</span>
          ))}
        </div>
      </Section>
      {/* Стратегия */}
      <Section title="🎯 Стратегия продвижения">
        <p style={{ fontSize: 14, lineHeight: 1.7 }}>{result.strategy}</p>
      </Section>
    </div>
  );
}
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 12, paddingBottom: 8,
        borderBottom: "2px solid #00AEEF" }}>{title}</h2>
      {children}
    </div>
  );
}
const copyBtn = {
  padding: "4px 12px", borderRadius: 6, border: "1px solid #00AEEF",
  background: "#fff", color: "#00AEEF", cursor: "pointer", fontSize: 12,
  whiteSpace: "nowrap", flexShrink: 0
};
