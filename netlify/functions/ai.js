export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: "No OPENAI_API_KEY" };
    }

    const task = JSON.parse(event.body || "{}");
    const { title, subject, dueDate, difficulty, hours } = task;

    const prompt = `
Ты учебный ИИ-ассистент. Дай короткий, практичный ответ.

Задача: ${title}
Предмет: ${subject}
Дедлайн: ${dueDate}
Сложность (1-5): ${difficulty}
Часы: ${hours}

Сформируй:
1) Что делать сегодня (2–3 шага)
2) Как распределить до дедлайна (коротко)
3) Один совет по концентрации

Пиши по-русски, кратко, без воды.
`.trim();

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        input: prompt,
        text: { verbosity: "low" },
      }),
    });

    // Если API вернул ошибку, отдадим текст ошибки для дебага
    if (!res.ok) {
      const errText = await res.text();
      return {
        statusCode: res.status,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: errText || `HTTP ${res.status}`,
      };
    }

    const data = await res.json();

    // ✅ Надёжно вытаскиваем текст из Responses API
    let text = "";

    // Часто бывает так:
    if (typeof data.output_text === "string" && data.output_text.trim()) {
      text = data.output_text.trim();
    } else if (Array.isArray(data.output)) {
      // Иногда текст лежит в data.output[].content[].text
      for (const item of data.output) {
        if (item?.content && Array.isArray(item.content)) {
          for (const part of item.content) {
            if (part?.type === "output_text" && typeof part.text === "string" && part.text.trim()) {
              text = part.text.trim();
              break;
            }
          }
        }
        if (text) break;
      }
    }

    if (!text) text = "Нет ответа";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: String(e?.message || e),
    };
  }
}
