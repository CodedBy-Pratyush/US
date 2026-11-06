// One-time device tier detection. LOW = phones / weak devices.
const nav = typeof navigator !== 'undefined' ? navigator : {}
const coarse =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
export const IS_TOUCH = Boolean(coarse)
export const LOW =
  IS_TOUCH || (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4
export const DPR_MAX = LOW ? 1.25 : 1.6
