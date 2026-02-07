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

    const prompt = `
Ты учебный ИИ-ассистент.
Дай короткий, практичный ответ.

Задача: ${task.title}
Предмет: ${task.subject}
Дедлайн: ${task.dueDate}
Сложность (1-5): ${task.difficulty}
Часы: ${task.hours}

Сформируй:
1) Что делать сегодня (2–3 шага)
2) Как распределить до дедлайна
3) Один совет по концентрации

Пиши по-русски, кратко, без воды.
`;

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

    const data = await res.json();
    const text = data.output_text || "Нет ответа";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: e.message,
    };
  }
}
