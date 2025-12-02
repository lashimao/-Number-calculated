export interface Chapter {
    id: string;
    title: string;
    description: string;
    content: string; // Markdown content
    keyPoints: string[]; // Quick summary points
}

export interface PracticeProblem {
    question: string;
    solution: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: number;
}

export enum GeminiModel {
    FLASH = 'gemini-2.5-flash',
    PRO = 'gemini-3-pro-preview'
}