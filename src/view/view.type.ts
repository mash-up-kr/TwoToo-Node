export const HomeViewState = {
  BEFORE_CREATE: 'BEFORE_CREATE',
  BEFORE_MY_APPROVE: 'BEFORE_MY_APPROVE',
  BEFORE_PARTNER_APPROVE: 'BEFORE_PARTNER_APPROVE',
  EXPIRED_BY_NOT_APPROVED: 'EXPIRED_BY_NOT_APPROVED',
  APPROVED_BUT_BEFORE_START_DATE: 'APPROVED_BUT_BEFORE_START_DATE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETE: 'COMPLETE', // 완료 다음날
} as const;

export type HomeViewStateType = (typeof HomeViewState)[keyof typeof HomeViewState];
