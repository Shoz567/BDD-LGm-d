// src/types/chat.ts
export type ChatMode = 'comptoir' | 'gestion' | null;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatState {
  messages: Message[];
  mode: ChatMode;
  isLoading: boolean;
  error: string | null;
}
