const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

require("dotenv").config();

const app = express();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 5000;


/* =================================
   OPENAI CONFIGURATION
================================= */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


/* =================================
   SERVER TEST
================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Tourister Server is running!",
  });
});


/* =================================
   TOURISTER AI
================================= */

app.post("/api/ai/chat", async (req, res) => {
  try {

    const { message } = req.body;


    /* =================================
       VALIDATION
    ================================= */

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }


    /* =================================
       AI REQUEST
    ================================= */

    const response = await openai.responses.create({

      model: "gpt-4.1-mini",

      input: [

        {
          role: "developer",

          content: `
You are Tourister AI.

You are an intelligent AI travel assistant integrated into the Tourister platform.

Your job is to help users plan and organize their travel.

You can help with:

- Complete travel planning
- Day-by-day itineraries
- Destination suggestions
- Budget planning
- Transportation guidance
- Hotel suggestions
- Tourist attractions
- Food recommendations
- Packing suggestions
- Travel safety
- Solo travel
- Family trips
- Student budget travel
- Weekend trips
- Adventure travel
- International travel guidance

IMPORTANT INSTRUCTIONS:

1. Be friendly and helpful.

2. Keep answers well structured.

3. When users provide:
   - destination
   - number of days
   - budget

   Create a clear DAY-BY-DAY itinerary.

4. Mention approximate budget categories when relevant:
   - Travel
   - Stay
   - Food
   - Activities
   - Local transport

5. Ask follow-up questions if important information is missing.

6. Do not make the answer unnecessarily long.

7. Use headings and bullet points when useful.

8. Your personality should feel like a smart,
   friendly and modern travel companion.

You are called:

TOURISTER AI
`,

        },

        {
          role: "user",
          content: message,
        },

      ],

    });


    /* =================================
       SEND RESPONSE TO FRONTEND
    ================================= */

    res.json({

      success: true,

      reply: response.output_text,

    });


  } catch (error) {

    console.error("Tourister AI Error:");

    console.error(error);


    res.status(500).json({

      success: false,

      message:
        "Tourister AI is currently unavailable. Please try again later.",

    });

  }

});


/* =================================
   START SERVER
================================= */

app.listen(PORT, () => {

  console.log(
    `Tourister Server running on http://localhost:${PORT}`
  );

});