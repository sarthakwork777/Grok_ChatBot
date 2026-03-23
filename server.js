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

// --- SERVE FRONTEND FILES ---
// This tells Express to look into the "client" folder for your HTML/CSS/JS
app.use(express.static(path.join(__dirname, 'client')));

// Initialize Groq client
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1", 
});

// Chat history stored in server memory (Reset on server restart)
let chatHistory = [
    { role: "system", content: "You are a helpful AI assistant powered by Groq." }
];

// --- API ENDPOINT ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

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
        console.error("Groq API Error:", error.message);
        
        if (error.status === 400) {
            return res.status(400).json({ 
                error: "Model error", 
                details: "The selected model is unavailable." 
            });
        }

        res.status(500).json({ error: "Server Error", details: error.message });
    }
});

// --- CATCH-ALL ROUTE ---
// Ensures that if you visit the main URL, it loads your index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Handle Favicon requests to stop 404/CSP errors in console
app.get('/favicon.ico', (req, res) => res.status(204).end());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Nexus AI Server is live!`);
    console.log(`📡 Local Endpoint: http://localhost:${PORT}`);
});