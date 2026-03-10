export async function checkAIModeration(text: string) {

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are an AI moderation system.

Determine if the following message contains:
- hate speech
- harassment
- threats
- abusive language
- discrimination

Respond ONLY with:

SAFE
or
UNSAFE

Message:
${text}
`
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.json();

  const result =
    data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return result.includes("SAFE");
}