export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
  isValid: boolean;
}

export function validatePassword(password: string, confirmPassword?: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword !== undefined ? password === confirmPassword && confirmPassword.length > 0 : true;

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar && passwordsMatch;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    passwordsMatch,
    isValid,
  };
}
