export interface ErrorResponse {
  success: false;
  errors: Array<{ message: string; field?: string }>;
  requestId?: string;
  timestamp?: string;
}
