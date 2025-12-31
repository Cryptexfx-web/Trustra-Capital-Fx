import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// --- FIREBASE ADMIN ---
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// --- GEMINI API UTILS ---
const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${process.env.GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "You are a professional financial advisor at TrustraCapitalFx." }] }
    })
  });

  if (!res.ok) throw new Error("Gemini API request failed");
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
};

// --- ROUTES ---

app.get("/", (req, res) => res.send("Trustra Backend is live!"));

app.post("/ai-analysis", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const text = await callGemini(prompt);
    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Analysis failed" });
  }
});

app.listen(port, () => console.log(`Backend running on port ${port}`));
