from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
class GenerateRequest(BaseModel):
    niche: str
    city: str = ""
    price_segment: str = ""
    extra: str = ""
SYSTEM_PROMPT = """Ты — эксперт-авитолог с опытом 8+ лет. Ты знаешь алгоритмы Авито лучше всех.
ПРАВИЛА АВИТО которые ты ВСЕГДА соблюдаешь:
- Заголовок: строго до 50 символов, ключевое слово стоит первым
- Первые 2 строки текста видны в превью — они должны цеплять мгновенно
- Запрещено: CAPS LOCK полностью, спецсимволы ★✓ и т.п., телефоны/ссылки в тексте
- Алгоритм ранжирования Авито любит: конкретные цифры, уникальный оффер, актуальные ключевые слова
- Текст 150–300 слов — оптимальный объём
- Структура текста: Боль клиента → Решение → Конкретный оффер → Доверие → Призыв к действию
ВСЕГДА отвечай строго в следующем формате JSON без лишних слов:
{
  "headlines": [
    {"text": "заголовок", "reason": "почему работает"},
    ...5 штук...
  ],
  "ad_text": "полный текст объявления",
  "photo_tips": ["совет 1", "совет 2", "...7 советов..."],
  "category": "рекомендуемая категория на Авито",
  "tags": ["тег1", "тег2", "тег3"],
  "strategy": "когда публиковать, какие платные услуги Авито использовать и почему"
}"""
@app.post("/generate")
async def generate(req: GenerateRequest):
    user_message = f"""
Ниша: {req.niche}
Город: {req.city if req.city else 'не указан'}
Ценовой сегмент: {req.price_segment if req.price_segment else 'не указан'}
Дополнительно: {req.extra if req.extra else 'нет'}
Создай продающее объявление для Авито. Верни ТОЛЬКО JSON.
"""
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}]
        )
        import json
        raw = message.content[0].text.strip()
        # Убираем возможные markdown-обёртки
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw.strip())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/health")
async def health():
    return {"status": "ok"}
