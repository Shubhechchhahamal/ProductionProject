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
          },
          doNotStore: true
        })
      }
    );

    if (!response.ok) {
  const errorText = await response.text();
  console.error("Perspective API error response:", errorText);
  return true;
}

    const data = await response.json();

    const toxicity = data?.attributeScores?.TOXICITY?.summaryScore?.value ?? 0;
    const insult = data?.attributeScores?.INSULT?.summaryScore?.value ?? 0;
    const threat = data?.attributeScores?.THREAT?.summaryScore?.value ?? 0;

    console.log("Moderation scores:", { toxicity, insult, threat });

    if (toxicity > 0.75 || insult > 0.75 || threat > 0.6) {
      return false;
    }

    return true;

  } catch (error) {

    console.error("Moderation API error:", error);
    return true;

  }
}