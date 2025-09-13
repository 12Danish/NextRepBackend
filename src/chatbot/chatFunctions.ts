// aiService.js - THIS IS YOUR AI CHAT CODE (LANGCHAIN + GOOGLE AI)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";
import { User } from "../models/UserModel";

// ===== AI CONFIGURATION =====
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash-exp",
});

// ===== AI MEMORY STORAGE =====
const userConversations = new Map(); // Stores conversation chains for each user

// ===== AI PROMPT TEMPLATE =====
const createPromptTemplate = (userDetails: any) => {
  const age = calculateAge(userDetails?.dob);

  console.log("[Prompt] Creating template for user:", userDetails?._id);

  return new PromptTemplate({
    template: `You are a fitness expert. Guide the user on their fitness and diet related queries.
Stay to the point and do not go off topic.

The details of the user are:
Age: {age}
Height: {height}
Weight: {weight}

Previous conversation:
{history}

Current message: {input}

Guide them on their queries based on their details and conversation history.
Return markdown code.`,
    inputVariables: ["history", "input"],
    partialVariables: {
      age: age.toString(),
      height: userDetails?.height?.toString() || "Not provided",
      weight: userDetails?.weight?.toString() || "Not provided",
    },
  });
};

// ===== MAIN AI FUNCTION =====
async function getResp(userId: string, userMsg: string) {
  try {
    console.log(
      "[AI] Received request for user:",
      userId,
      " | message:",
      userMsg
    );

    // Get user details from database
    const userDetails = await User.findById(userId);
    console.log("[AI] User found:", !!userDetails);

    // Create conversation chain if doesn't exist
    if (!userConversations.has(userId)) {
      console.log("[AI] Creating new conversation chain for user:", userId);

      const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
      });

      const prompt = createPromptTemplate(userDetails);

      const chain = new ConversationChain({
        llm: llm,
        memory: memory,
        prompt: prompt,
        verbose: false,
      });

      userConversations.set(userId, chain);
    } else {
      console.log("[AI] Using existing conversation chain for user:", userId);
    }

    // Get existing conversation chain
    const conversationChain = userConversations.get(userId);
    let response = { response: "" };

    try {
      // Generate AI response with conversation history
      response = await conversationChain.call({
        input: userMsg,
      });
    } catch (err) {
      console.log("Error:", err);
    }

    console.log("[AI] Response generated for user:", userId);
    console.log(response);
    return response.response;
  } catch (error) {
    console.error("[AI Error]:", error);
    throw error;
  }
}

// Clear conversation history for a user
function clearUserHistory(userId: string) {
  if (userConversations.has(userId)) {
    console.log("These are the user conversations");
    console.log(userConversations);
    userConversations.delete(userId);
    console.log("after delete");
    userConversations.delete(userId);

    console.log(`AI: Conversation history cleared for user: ${userId}`);
  }
}

// Calculate age from date of birth
function calculateAge(dob: any) {
  if (!dob) return "Not provided";

  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// ===== EXPORTS =====
export { getResp, clearUserHistory };
