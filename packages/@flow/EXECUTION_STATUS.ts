export const EXECUTION_STATUS = {
  IN_PROGRESS: 'in_progress',
  ENDED: 'ended',
  ERROR: 'error',
  WAITING: 'waiting',
  TOKEN: 'token',
  ADD_MESSAGE: 'add_message',
} as const;

export type EXECUTION_STATUS = (typeof EXECUTION_STATUS)[keyof typeof EXECUTION_STATUS];
