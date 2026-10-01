export const queryKeys = {
  slots: (weekStart: string) => ['slots', weekStart] as const,
  booking: (id: string) => ['booking', id] as const,
  me: () => ['auth', 'me'] as const,
}
