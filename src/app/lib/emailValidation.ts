export interface EmailValidationResult {
  isValidSyntax: boolean;
  isDisposable: boolean;
  suggestedCorrection: string | null;
  isValid: boolean;
  errorReason: string | null;
}

// Common disposable/temporary email provider domains
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "dispostable.com",
  "trashmail.com",
  "yopmail.com",
  "getnada.com",
  "sharklasers.com",
  "throwawaymail.com",
  "temp-mail.org",
  "fakeinbox.com",
  "crazymailing.com",
  "maildrop.cc",
  "mohmal.com",
]);

// Common domain typo mappings
const TYPO_MAP: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmeil.com": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yahoog.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
};

export function validateEmail(email: string): EmailValidationResult {
  const trimmed = email.trim().toLowerCase();
  
  // RFC 5322 regex
  const syntaxRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isValidSyntax = syntaxRegex.test(trimmed);

  if (!isValidSyntax) {
    return {
      isValidSyntax: false,
      isDisposable: false,
      suggestedCorrection: null,
      isValid: false,
      errorReason: "Invalid email format. (Example: user@domain.com)",
    };
  }

  const parts = trimmed.split("@");
  const domain = parts[1];

  // Disposable check
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);
  if (isDisposable) {
    return {
      isValidSyntax: true,
      isDisposable: true,
      suggestedCorrection: null,
      isValid: false,
      errorReason: "Disposable / temporary email addresses are not allowed.",
    };
  }

  // Typo suggestion check
  const suggestedDomain = TYPO_MAP[domain] || null;
  const suggestedCorrection = suggestedDomain ? `${parts[0]}@${suggestedDomain}` : null;

  return {
    isValidSyntax: true,
    isDisposable: false,
    suggestedCorrection,
    isValid: true,
    errorReason: suggestedCorrection ? `Did you mean ${suggestedCorrection}?` : null,
  };
}
