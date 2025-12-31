import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import admin from 'firebase-admin';

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN))
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

const authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// 🧠 Gemini (SECURE)
app.post('/api/ai', authCheck, async (req, res) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt }] }],
        systemInstruction: {
          parts: [{
            text: "Educational financial insights only. Not financial advice."
          }]
        }
      })
    }
  );

  const data = await response.json();
  res.json({
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  });
});

// 🛠 Admin balance update
app.post('/api/admin/balance', authCheck, async (req, res) => {
  const adminUser = await admin.auth().getUser(req.user.uid);
  if (!adminUser.customClaims?.admin) return res.sendStatus(403);

  await db.collection('users').doc(req.body.uid).update({
    balance: req.body.balance
  });

  res.json({ success: true });
});

app.listen(4000, () => console.log('Backend running on port 4000'));
