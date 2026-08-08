/**
 * Partners sign in with a 4-digit PIN instead of a password.
 * The PIN is expanded into a longer, deterministic credential before it is sent
 * to the auth service (which requires longer secrets); the partner only ever
 * types the four digits.
 */
export const PIN_LENGTH = 4;

export function isValidPin(pin: string) {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, PIN_LENGTH);
}

export function pinToPassword(pin: string) {
  return `spx-partner-pin.${pin}.portal`;
}
