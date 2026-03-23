const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client using the OpenAI compatible SDK
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY, 
    baseURL: "https://api.groq.com/openai/v1", 
});

let chatHistory = [
    { role: "system", content: "You are a helpful AI assistant powered by Groq." }
];

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    chatHistory.push({ role: "user", content: message });

    try {
        const response = await client.chat.completions.create({
            // CORRECT MODEL ID FOR 2026:
            model: "llama-3.3-70b-versatile", 
            messages: chatHistory,
            temperature: 0.7,
            max_tokens: 1024
        });

        const aiMessage = response.choices[0].message;
        
        // Keep history in memory for context
        chatHistory.push(aiMessage);
        
        res.json({ reply: aiMessage.content });

    } catch (error) {
        console.error("Groq API Error:", error.message);
        
        // Handle specific "Model Not Found" or "Decommissioned" errors
        if (error.status === 400) {
            return res.status(400).json({ 
                error: "Model error", 
                details: "The selected model is unavailable. Try 'llama-3.1-8b-instant'." 
            });
        }

        res.status(500).json({ error: "Server Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Groq Server is live!`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/chat`);
});