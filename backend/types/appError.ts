export type AppErrorType =
  | 'not_found'
  | 'validation'
  | 'conflict'
  | 'unauthorized'
  | 'forbidden';

export type AppError = {
  type: AppErrorType;
  message: string;
  field?: string;
};
