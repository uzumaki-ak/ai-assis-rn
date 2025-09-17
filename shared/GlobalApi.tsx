import axios from "axios";

export const AIChatmodel = async (messages: any) => {
  /* Send POST request using Axios */
  const response = await axios.post(
    "https://kravixstudio.com/api/v1/chat",
    {
      message: messages, // Messages to AI
      aiModel: "gpt-5", // Selected AI model
      outputType: "text", // 'text' or 'json'
    },
    {
      headers: {
        "Content-Type": "application/json", // Tell server we're sending JSON
        Authorization:
          "Bearer " + process.env.EXPO_PUBLIC_KRAVIX_STUDIO_API_KEY, // Replace with your API key
      },
    }
  );
  console.log(response.data);
  return response.data;
};

///!gemini
// import axios from "axios";

// export const AIChatmodel = async (messages: any) => {
//   try {
//     // Filter out system messages and format for Gemini
//     const formattedMessages = messages
//       .filter((msg: any) => msg.role !== "system")
//       .map((msg: any) => ({
//         role: msg.role === "assistant" ? "model" : "user",
//         parts: [{ text: msg.content }]
//       }));

//     // Handle system message separately if it exists
//     const systemMessage = messages.find((msg: any) => msg.role === "system");

//     // Gemini API endpoint
//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.EXPO_PUBLIC_GEMINI_API_KEY}`;

//     const requestBody = {
//       contents: formattedMessages,
//       generationConfig: {
//         temperature: 0.7,
//         topK: 1,
//         topP: 1,
//         maxOutputTokens: 2048,
//       }
//     };

//     // Add system instruction if available
//     if (systemMessage) {
//       requestBody.systemInstruction = {
//         parts: [{ text: systemMessage.content }]
//       };
//     }

//     const response = await axios.post(apiUrl, requestBody, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     // Extract the generated text from Gemini's response
//     const aiResponse = response.data.candidates[0].content.parts[0].text;

//     // Return in the same format as Kravix for compatibility
//     return {
//       aiResponse: aiResponse,
//       creditsDeducted: 0, // Gemini doesn't use credits
//       remainingCredits: 0,
//       tokensUsed: response.data.usageMetadata?.totalTokenCount || 0
//     };

//   } catch (error) {
//     console.error("Gemini API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };
