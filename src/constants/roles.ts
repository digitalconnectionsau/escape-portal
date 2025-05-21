// roles.ts
// src/constants/roles.ts

export const USER_ROLES = {
  SUPER_ADMIN: 'super-admin',
  COMPANY_ADMIN: 'company-admin',
  ORGANISER: 'organiser',
  FACILITATOR: 'facilitator',
  PLAYER: 'player',
};


export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
