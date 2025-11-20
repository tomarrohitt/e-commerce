export interface PrismaLikeError {
  code: string;
  meta?: {
    target?: string[];
    field_name?: string;
    [key: string]: unknown;
  };
}
