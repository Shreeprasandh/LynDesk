interface OtpRecord {
  otp: string;
  expiresAt: number;
}

// In-memory OTP cache store for server routes
const globalOtpStore = globalThis as unknown as { _lyndeskOtpMap?: Map<string, OtpRecord> };
if (!globalOtpStore._lyndeskOtpMap) {
  globalOtpStore._lyndeskOtpMap = new Map<string, OtpRecord>();
}

export function storeOtp(email: string, otp: string) {
  const normalized = email.trim().toLowerCase();
  globalOtpStore._lyndeskOtpMap!.set(normalized, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
}

export function verifyOtpCode(email: string, otp: string): boolean {
  const normalized = email.trim().toLowerCase();
  const record = globalOtpStore._lyndeskOtpMap!.get(normalized);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    globalOtpStore._lyndeskOtpMap!.delete(normalized);
    return false;
  }
  if (record.otp === otp.trim()) {
    globalOtpStore._lyndeskOtpMap!.delete(normalized);
    return true;
  }
  return false;
}
