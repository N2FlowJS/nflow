export type MessagePart = {
  role: 'user' | 'assistant' | 'system' | 'developer';
  // The content of the message, which can be a string or an object
  content: string;
};
