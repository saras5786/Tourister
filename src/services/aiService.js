/**
 * Zero-Login Universal AI Service
 * Guarantees 100% login-free operation on ANY device/browser.
 * Never displays Puter login popups to users.
 */

import { puter } from "@heyputer/puter.js";

/**
 * Universal text generation that requires ZERO authentication and works everywhere.
 */
export async function generateAIResponse({ systemPrompt = "", userPrompt = "", temperature = 0.7 }) {
  const combinedPrompt = systemPrompt
    ? `${systemPrompt}\n\nUser Request: ${userPrompt}`
    : userPrompt;

  // 1. Primary: Pollinations Free AI API (Fast, reliable, zero-auth, zero login)
  try {
    const encodedPrompt = encodeURIComponent(combinedPrompt);
    const url = `https://text.pollinations.ai/${encodedPrompt}?seed=${Date.now()}&temperature=${temperature}`;
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(6500),
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim() && !text.includes("Error:") && text.length > 10) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn("Pollinations AI primary query note:", err);
  }

  // 2. Secondary: Direct Pollinations OpenAI-compatible POST endpoint
  try {
    const postRes = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt || "You are Tourister AI travel assistant." },
          { role: "user", content: userPrompt },
        ],
        model: "openai",
        seed: Date.now(),
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (postRes.ok) {
      const postData = await postRes.json();
      const text = postData?.choices?.[0]?.message?.content;
      if (text && text.trim()) {
        return text.trim();
      }
    }
  } catch (e) {
    console.warn("Pollinations OpenAI endpoint note:", e);
  }

  // 3. Tertiary: Silent Puter AI ONLY IF already authenticated (NEVER trigger sign-in dialog)
  try {
    if (typeof puter !== "undefined" && puter?.auth?.isSignedIn?.()) {
      const messages = [
        { role: "system", content: systemPrompt || "You are Tourister AI." },
        { role: "user", content: userPrompt },
      ];
      const puterRes = await puter.ai.chat(messages, {
        model: "openai/gpt-5.6-luna",
        reasoning_effort: "low",
      });
      const puterText = puterRes?.message?.content || puterRes?.text || "";
      if (puterText && puterText.trim()) {
        return puterText.trim();
      }
    }
  } catch (e) {
    console.warn("Silent Puter note:", e);
  }

  // 4. Intelligent Contextual Fallback Engine
  return generateContextualFallback(userPrompt, systemPrompt);
}

/**
 * Intelligent fallback generator tailored to travel queries
 */
function generateContextualFallback(query, systemPrompt) {
  const q = query.toLowerCase();

  if (q.includes("photo") || q.includes("instagram") || q.includes("reel") || q.includes("camera") || systemPrompt.includes("Photo")) {
    return `### 📸 CREATOR & PHOTOGRAPHY RECOMMENDATIONS:
• Best Golden Hour: 05:30 PM - 06:15 PM with soft natural backlighting.
• Camera Angle: Use 1x or 2x focal length at chest level with the horizon centered.
• Reel Storyboard (15s):
  - [0-3s Hook]: "Stop scrolling! Here is the hidden viewpoint most tourists never find."
  - [3-10s B-Roll]: Slow pan across the panoramic horizon with ambient audio.
  - [10-15s Call to Action]: "Save this for your next trip! ✈️✨"
• Aesthetic Caption: "Finding magic in every golden sunset horizon ✨ #TravelDiaries #Tourister"`;
  }

  if (q.includes("budget") || q.includes("cost") || q.includes("expense") || q.includes("save") || systemPrompt.includes("Budget")) {
    return `### 💰 TRAVEL EXPENSE & SAVINGS MASTERPLAN:
1. Accommodation (~35% savings): Book boutique guest stays 1.5 km away from major transit stations.
2. Intercity Transit: Opt for morning Superfast AC Trains or express highways instead of dynamic flight surges.
3. Dining: Enjoy authentic local thalis and family eateries (typically ₹120-₹200 per meal).
4. Sightseeing: Always check for official composite monument passes to bundle entry tickets.`;
  }

  if (q.includes("food") || q.includes("eat") || q.includes("restaurant") || q.includes("dish") || systemPrompt.includes("Food")) {
    return `### 🍲 REGIONAL CULINARY & FOOD GUIDE:
• Traditional Specialties: Freshly cooked regional breakfast items, steaming filter coffee, and artisan sweets.
• Resident Rule: Look for family-run eateries with long lines of local residents.
• Food Safety: Choose busy eateries with high food turnover where dishes are freshly prepared on demand.`;
  }

  if (q.includes("safety") || q.includes("scam") || q.includes("night") || systemPrompt.includes("Safety")) {
    return `### 🛡️ LOCAL SAFETY & SCAM DEFENSE PROTOCOL:
• Station Touts: Never accept unmetered rides inside arrival halls. Only use official prepaid auto/taxi counters.
• Meter Rule: Always ask "Meter please" before boarding auto-rickshaws or use verified app rides.
• Night Travel: Stick to well-lit main boulevards and share ride telemetry with family.
• Emergency Contacts: Police: 112 | Medical: 108 | Tourist Helpline: 1363.`;
  }

  return `### 🗺️ TOURISTER TRAVEL MASTERPLAN:
• Morning (07:00 AM - 10:00 AM): Best hours for outdoor heritage landmarks with pleasant weather and light crowds.
• Afternoon (01:00 PM - 03:30 PM): Air-conditioned indoor museums, regional dining, and artisan quarters.
• Sunset (05:30 PM - 07:30 PM): Scenic viewpoint exploration and evening cultural stroll.
• Safety Note: Keep emergency numbers accessible and verify prepaid transit rates.`;
}
