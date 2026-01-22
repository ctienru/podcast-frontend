export type ApiResponse<T> = {
  status: "ok" | "partial_success" | "error";
  data?: T;
  warning?: string;
  error?: {
    code: string;
    message: string;
  };
};