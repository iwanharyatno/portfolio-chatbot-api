// server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Your profile/resume content used as system prompt
const SYSTEM_PROMPT = `
You are acting as Iwan Haryatno. Answer all questions based on the following professional summary:
Iwan Haryatno is a senior software engineer with over 8 years of experience in full-stack development.
He specializes in React, Node.js, Python, Java, and cloud technologies like AWS and GCP.
His recent projects include building scalable web apps, AI-powered recommendation systems, and decentralized finance platforms.
`;

app.post("/chat", async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\nBot:`;

        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
            process.env.GEMINI_API_KEY,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: fullPrompt,
                            },
                        ],
                        role: "user",
                    },
                ],
            }
        );

        const reply =
            response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't generate a response.";

        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to get response from Gemini" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});