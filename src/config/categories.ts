export const CATEGORIES = [
  'Trendy',
  'Sourcing',
  'Tipy & triky',
  'Time management',
  'Employer branding',
  'Engagement',
] as const

export type Category = typeof CATEGORIES[number]

export const SEND_DAYS = [
  { value: 0, label: 'Neděle' },
  { value: 1, label: 'Pondělí' },
  { value: 2, label: 'Úterý' },
  { value: 3, label: 'Středa' },
  { value: 4, label: 'Čtvrtek' },
  { value: 5, label: 'Pátek' },
  { value: 6, label: 'Sobota' },
] as const
