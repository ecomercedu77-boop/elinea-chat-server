import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "1mb" }));

// OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Autoriser les appels depuis ton site Shopify
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-session-id");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Test serveur
app.get("/", (req, res) => {
  res.send("ELINEA chat server OK");
});

// Route du chat
app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) {
      return res.status(400).json({ answer: "Message vide" });
    }

    const context = `
Produit : Rasoir ELINEA conçu pour peaux sensibles.
Livraison : Livraison rapide avec suivi.
Retours : Satisfait ou remboursé.
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions:
        "Tu es l’assistant officiel ELINEA. Réponds en français, clairement, et aide à l’achat.",
      input: `
CONTEXTE:
${context}

QUESTION CLIENT:
${message}
`,
      max_output_tokens: 250
    });

    res.json({
      answer: response.output_text
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: "Erreur serveur" });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ ELINEA Chat Server lancé sur le port", PORT);
});
