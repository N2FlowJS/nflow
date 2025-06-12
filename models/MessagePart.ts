export type MessagePart = {
  role: 'user' | 'assistant' | 'system' | 'developer';
  content: string;
};
