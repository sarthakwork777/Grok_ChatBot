const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Initialize Groq (OpenAI-compatible)
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// Chat memory
let chatHistory = [
    { role: "system", content: "You are a helpful AI assistant powered by Groq." }
];

// ---------------- API ROUTE ----------------
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }

    chatHistory.push({ role: "user", content: message });

    try {
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: chatHistory,
            temperature: 0.7,
            max_tokens: 1024
        });

        const aiMessage = response.choices[0].message;

        chatHistory.push(aiMessage);

        res.json({ reply: aiMessage.content });

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({
            error: "Server Error",
            details: error.message
        });
    }
});

// ---------------- OPTIONAL ROUTES ----------------

// Prevent favicon error
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ---------------- FIXED CATCH-ALL ----------------
// ⚠️ Express 5 safe fallback (NO /* or /:path*)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------------- SERVER START ----------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n🚀 Nexus AI Server is live!`);
    console.log(`📡 URL: http://localhost:${PORT}\n`);
});