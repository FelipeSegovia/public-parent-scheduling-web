export const PASSWORD_MIN_LENGTH = 8

export const PASSWORD_TOO_SHORT_MESSAGE = `La clave debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
export const PASSWORD_MISMATCH_MESSAGE = 'Las claves no coinciden.'

export function getPasswordErrors(
  password: string,
  confirmation: string,
): { password?: string; passwordConfirm?: string } {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { password: PASSWORD_TOO_SHORT_MESSAGE }
  }
  if (password !== confirmation) {
    return { passwordConfirm: PASSWORD_MISMATCH_MESSAGE }
  }
  return {}
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
