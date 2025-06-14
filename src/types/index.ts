export type ChatRole = "system" | "user" | "assistant" | "data";

export type ApiResponse<T> = T & {
  error?: string;
};
