console.log("ENV TEST:", import.meta.env);
console.log("Perspective key:", import.meta.env.VITE_PERSPECTIVE_API_KEY);
export async function checkAIModeration(text: string): Promise<boolean> {

  const API_KEY = import.meta.env.VITE_PERSPECTIVE_API_KEY;

  if (!API_KEY) {
    console.error("Perspective API key missing");
    return true;
  }

  try {

    const response = await fetch(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          comment: { text },
          languages: ["en"],
          requestedAttributes: {
            TOXICITY: {},
            INSULT: {},
            THREAT: {}
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Perspective API request failed:", response.status);
      return true;
    }

    const data = await response.json();

    const toxicity = data?.attributeScores?.TOXICITY?.summaryScore?.value ?? 0;
    const insult = data?.attributeScores?.INSULT?.summaryScore?.value ?? 0;
    const threat = data?.attributeScores?.THREAT?.summaryScore?.value ?? 0;

    console.log("Moderation scores:", { toxicity, insult, threat });

    // moderation thresholds
    if (toxicity > 0.75 || insult > 0.75 || threat > 0.6) {
      return false; // block message
    }

    return true; // allow message

  } catch (error) {

    console.error("Moderation API error:", error);

    // if API fails, allow message so app doesn't break
    return true;
  }
}