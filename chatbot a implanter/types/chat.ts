// types/chat.ts
export type ChatMode = 'comptoir' | 'gestion' | null;

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
