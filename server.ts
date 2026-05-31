import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini client to dodge crash-on-startup when key is not present
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // If it is the default placeholder, treat as missing/unconfigured
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return geminiClient;
}

// Map of vehicle rules for local analyzer fallback
const VEHICLES_MOCK = [
  { id: "2wheeler", name: "2-Wheeler (Scooter)", maxWeight: 20 },
  { id: "3wheeler", name: "3-Wheeler (Ape/Auto)", maxWeight: 500 },
  { id: "8ftace", name: "Tata Ace (8ft Tempo)", maxWeight: 800 },
  { id: "pickup", name: "Bolero Pickup (1.5T)", maxWeight: 1500 }
];

// Helper to analyze cargo locally if Gemini API keys are omitted
function analyzeCargoLocally(prompt: string) {
  const lower = prompt.toLowerCase();
  
  let category = "General Goods";
  let weightEstimate = 50;
  let suggestedVehicleId = "8ftace";
  let helperRecommendation = "Required: Driver only";
  let loadingTip = "Ensure cargo is bound securely.";
  let summary = "Local analytical dispatch estimated from cargo details.";

  if (lower.includes("doc") || lower.includes("key") || lower.includes("envelope") || lower.includes("paper") || lower.includes("laptop")) {
    category = "Documents & Small Parcels";
    weightEstimate = 3;
    suggestedVehicleId = "2wheeler";
    helperRecommendation = "None needed";
    loadingTip = "Carry in rain-shielded backpack.";
    summary = "Best cleared on a dynamic 2-wheeler due to compact dimensions.";
  } else if (lower.includes("tv") || lower.includes("fridge") || lower.includes("sofa") || lower.includes("bed") || lower.includes("almirah") || lower.includes("furniture") || lower.includes("table")) {
    category = "Furniture & Heavy Appliances";
    weightEstimate = 120;
    suggestedVehicleId = "8ftace";
    helperRecommendation = "Recommended: Driver + 1 Helper";
    loadingTip = "Wrap vertical edges with padding. Move upright.";
    summary = "Requires a stable flatbed platform like a Tata Ace Tempo.";
  } else if (lower.includes("box") || lower.includes("carton") || lower.includes("luggage") || lower.includes("bag") || lower.includes("clothes")) {
    category = "Household Shifting Items";
    weightEstimate = 80;
    suggestedVehicleId = "3wheeler";
    helperRecommendation = "Recommended: Driver loading assist";
    loadingTip = "Stack heavier boxes at bottom, lighter elements at peak.";
    summary = "Ideal payload for a nimble, medium scale 3-wheeler auto.";
  } else if (lower.includes("iron") || lower.includes("steel") || lower.includes("pipe") || lower.includes("cement") || lower.includes("brick") || lower.includes("pallet") || lower.includes("heavy") || lower.includes("industrial")) {
    category = "Industrial & Raw Construction Materials";
    weightEstimate = 950;
    suggestedVehicleId = "pickup";
    helperRecommendation = "Highly Required: Driver + 1-2 Helpers";
    loadingTip = "Use heavy wood bracing and heavy duty ratchet tie-downs.";
    summary = "Extreme payload weight requires commercial heavy-duty pickup capacity.";
  }

  return {
    category,
    weightEstimate,
    suggestedVehicleId,
    helperRecommendation,
    loadingTip,
    summary: `${summary} (Disclaimer: Running on local heuristics fallback because GEMINI_API_KEY is unset)`
  };
}

// Logistical Cargo Analyzer Endpoint
app.post("/api/ai/analyze-cargo", async (req, res) => {
  const { cargoDescription } = req.body;
  
  if (!cargoDescription || typeof cargoDescription !== 'string') {
    return res.status(400).json({ error: "Missing active cargoDescription field in query body" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // API Key not present -> Degrade gracefully to smart pattern matcher
    const localResult = analyzeCargoLocally(cargoDescription);
    return res.json({
      ...localResult,
      success: true,
      mode: "local-heuristic"
    });
  }

  try {
    const prompt = `Analyze the typical weight/logistics profile of this request to transport: "${cargoDescription}"
Produce JSON with these accurate matching fields:
1. category: e.g., "Documents/Parcels", "Furniture/Appliances", "Household Shifting", "Electronics", "Commercial Goods", "Industrial Materials".
2. weightEstimate: Number, estimated total load weight in kg.
3. suggestedVehicleId: Choose exactly one corresponding vehicles limit key: "2wheeler" (weight < 20kg), "3wheeler" (weight < 500kg), "8ftace" (weight < 800kg), "pickup" (weight < 1500kg).
4. helperRecommendation: Suggest helper requirements like "Recommended: Driver only", "Recommended: Driver + 1 Helper", "Recommended: Driver + 2 Helpers", or "None needed".
5. loadingTip: Give 1 concise safety/packing instruction specifically relevant to moving these items.
6. summary: Provide a 1-sentence friendly logistics summary justifying why this vehicle fits best.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "Category index label of the items" },
            weightEstimate: { type: Type.NUMBER, description: "Estimated physical weight in kg" },
            suggestedVehicleId: { type: Type.STRING, description: "One of: '2wheeler', '3wheeler', '8ftace', 'pickup'" },
            helperRecommendation: { type: Type.STRING, description: "Helper recommendation line" },
            loadingTip: { type: Type.STRING, description: "One targeted packing and safety advice phrase" },
            summary: { type: Type.STRING, description: "Brief justification sentence" }
          },
          required: ["category", "weightEstimate", "suggestedVehicleId", "helperRecommendation", "loadingTip", "summary"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json({
      ...parsedData,
      success: true,
      mode: "api-gemini"
    });
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    // On unexpected fail, return the local heuristics
    const fallback = analyzeCargoLocally(cargoDescription);
    res.json({
      ...fallback,
      success: true,
      mode: "api-error-fallback",
      error_msg: error?.message || String(error)
    });
  }
});

// Endpoint for driver custom instructions suggestion
app.post("/api/ai/delivery-instructions", async (req, res) => {
  const { cargoDescription, pickupName, dropoffName } = req.body;
  const ai = getGeminiClient();

  const standardInstruction = "Keep fragile packages underneath secured items. Double-verify details with customers before departure.";

  if (!ai) {
    return res.json({
      instructions: `Please drive safely from ${pickupName || "source"} to ${dropoffName || "destination"}. Stack fragile goods safely.`,
      mode: "local-heuristic"
    });
  }

  try {
    const prompt = `Write a short, professional, 1-bullet-point dispatcher briefing advice for a loader-driver carrying "${cargoDescription || 'cargo'}" from "${pickupName || 'A'}" to "${dropoffName || 'B'}" under traffic constraints. Keep it under 25 words.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ 
      instructions: response.text?.trim() || standardInstruction,
      mode: "api-gemini"
    });
  } catch (error) {
    res.json({
      instructions: `Drive cautiously carrying industrial load. Verify tie-down security on load flatbeds.`,
      mode: "api-error-fallback"
    });
  }
});

// Chatbot Support Endpoint via OpenRouter
app.post("/api/support/chatbot", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid messages parameter." });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === "MY_OPENROUTER_API_KEY" || apiKey.trim() === "") {
    // If no key is set, use a smart local chatbot fallback
    const latestMessageObj = messages[messages.length - 1];
    const latestMessage = latestMessageObj?.text || latestMessageObj?.content || "";
    const responseText = getLocalSupportResponse(latestMessage);
    return res.json({
      text: responseText,
      mode: "local-simulation",
      disclaimer: "No OPENROUTER_API_KEY is configured in the environment. Running on intelligent local rule engine."
    });
  }

  try {
    // Format messages for OpenRouter format: { role: "user" | "assistant", content: string }
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === 'customer' ? 'user' : 'assistant',
      content: msg.text
    }));

    // Inject system instructions at the beginning to enforce behaving as a Porter Support Chatbot
    formattedMessages.unshift({
      role: "system",
      content: "You are the automated support chatbot for Porter Cargo Logistics. Help customers solve problems with booking, pricing, vehicles, driver allocation, payments, or cancellations. Keep your answers friendly, useful, and under 60 words. If the customer indicates they require human help, are extremely angry, or say 'human' or 'agent', politely guide them to click 'Request Support Agent' button, or state that they are being transferred."
    });

    let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ai.studio/build",
        "X-Title": "Porter Logistics Booking System"
      },
      body: JSON.stringify({
        model: "liquid/lfm-2.5-1.2b-instruct:free", 
        messages: formattedMessages
      })
    });

    if (!response.ok) {
      console.warn("Liquid LFM-2.5-1.2B:free failed, trying fallback to Gemini 2.5 Flash...");
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "Porter Logistics Booking System"
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash", 
          messages: formattedMessages
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API returned error:", errorText);
      throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const botText = data.choices?.[0]?.message?.content || "I apologize, I wasn't able to process that. Please try writing again or request a support agent.";
    
    return res.json({
      text: botText,
      mode: "openrouter-api"
    });

  } catch (error: any) {
    console.error("Open Router request failure, falling back to local simulation:", error);
    const latestMessageObj = messages[messages.length - 1];
    const latestMessage = latestMessageObj?.text || latestMessageObj?.content || "";
    const responseText = getLocalSupportResponse(latestMessage);
    return res.json({
      text: `${responseText} (OpenRouter lookup failed, falling back to helper system)`,
      mode: "local-simulation-fallback",
      error: error?.message || String(error)
    });
  }
});

function getLocalSupportResponse(userText: string): string {
  const text = userText.toLowerCase();
  
  if (text.includes("human") || text.includes("agent") || text.includes("person") || text.includes("support")) {
    return "Understood. Reaching out to a human support partner... Feel free to click the 'Request Support Agent' button at any time to connect instantly.";
  }
  if (text.includes("cancel") || text.includes("delete")) {
    return "You can cancel any active order directly from your tracking screen by clicking the 'Cancel Order' button. Refunds for online payments are settled immediately.";
  }
  if (text.includes("price") || text.includes("fare") || text.includes("charge") || text.includes("cost") || text.includes("money") || text.includes("fee")) {
    return "Porter calculates fares dynamically based on vehicle type and distance kilometers. Helpers/drivers also add fixed loading charges. You can see the full receipt breakdown details anytime is requested.";
  }
  if (text.includes("payment") || text.includes("card") || text.includes("cash") || text.includes("gpay") || text.includes("upi")) {
    return "We support Cash on Pickup, Cash on Dropoff, and Online UPI/Gateway payments. Online transactions redirect automatically to your banking flow for seamless settlement.";
  }
  if (text.includes("vehicle") || text.includes("truck") || text.includes("wheeler") || text.includes("scooter") || text.includes("auto")) {
    return "We support 2-Wheelers (up to 20kg), 3-Wheelers (up to 500kg), 8ft Tata Ace Tempos (up to 800kg), and Bolero Pickups (up to 1500kg). Pick the best vehicle based on weight!";
  }
  if (text.includes("delay") || text.includes("driver") || text.includes("slow") || text.includes("where")) {
    return "Our fleet is tracking live on the route blueprint map. In rare instances, traffic or route barriers cause delays. Our support agents can contact driver partners directly.";
  }
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("greetings")) {
    return "Hello! Welcome to Porter Automated Chat Support. How can I assist you with your booking, vehicle, helper charges, or payment methods today?";
  }
  
  return "I understand your query. For specialized logistics assistance, feel free to describe other questions, or click 'Request Support Agent' to be transferred to a live human support partner immediately!";
}

// Set up server assets & routing
async function init() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production Mode: Static file serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static build routing engaged.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Logistics Server running. Port: ${PORT}`);
  });
}

init();
