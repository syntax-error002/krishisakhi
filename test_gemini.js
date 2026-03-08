require('dotenv').config();
const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function test() {
    console.log("Key:", key ? "Loaded" : "Missing");
    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    const payload = {
        contents: [{
            parts: [
                { text: "Explain how AI works in a few words" },
            ],
        }],
    };

    const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key
        },
        body: JSON.stringify(payload),
    });

    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
}

test();
