import { GoogleGenAI } from "@google/genai";
import { GeminiModel, ChatMessage } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API_KEY is missing in environment variables.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const askGeminiTutor = async (
    currentQuestion: string, 
    history: ChatMessage[], 
    context: string
): Promise<string | null> => {
    const client = getClient();
    if (!client) return null;

    // Format history for the prompt
    // We take the last 10 messages to keep context relevant but not overwhelming, 
    // though Gemini 3 has a large window, we want to stay focused.
    const recentHistory = history.slice(-10); 
    const historyText = recentHistory.map(msg => 
        `${msg.role === 'user' ? '【学生】' : '【助教】'}: ${msg.content}`
    ).join('\n\n');

    const prompt = `
    你是一位《数值计算方法》课程的世界级专家助教。
    
    请根据以下提供的【课程讲义】内容和【历史对话】记录，回答学生的【最新问题】。
    
    要求：
    1. 回答要准确、深入浅出，适合大学生阅读。
    2. 如果涉及数学公式，必须使用 LaTeX 格式（行内公式用单 $ 包裹，独占一行用双 $$ 包裹）。
    3. 如果问题超出讲义范围，请利用你的专业知识补充回答，但请简要说明这是补充内容。
    4. 重点解释概念的物理意义、几何意义以及计算步骤的易错点。
    5. 语气亲切、鼓励性强。
    6. 联系上下文，如果学生在追问，请根据之前的对话逻辑回答。

    【课程讲义】:
    ${context}

    【历史对话】:
    ${historyText}

    【学生最新问题】:
    ${currentQuestion}
    `;

    try {
        const response = await client.models.generateContent({
            model: GeminiModel.PRO, // Using gemini-3-pro-preview
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 2048 } // Increased thinking budget for complex context
            }
        });

        return response.text || "抱歉，我无法生成回答，请稍后再试。";
    } catch (error) {
        console.error("Error asking Gemini:", error);
        return null;
    }
};