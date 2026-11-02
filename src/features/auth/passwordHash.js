// Password hashing with PBKDF2-SHA256 via the browser's Web Crypto API.
// Passwords are never stored: only a random per-user salt and the derived hash.

// OWASP's current guidance for PBKDF2-HMAC-SHA256. Stored per user so it can be raised later.
export const PBKDF2_ITERATIONS = 210_000

const encoder = new TextEncoder()

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes))
const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0))

export const isCryptoAvailable = () => typeof crypto !== 'undefined' && Boolean(crypto.subtle)

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return new Uint8Array(bits)
}

/** Returns { salt, hash, iterations } as storable strings/numbers. */
export async function hashPassword(password, iterations = PBKDF2_ITERATIONS) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt, iterations)
  return { salt: toBase64(salt), hash: toBase64(hash), iterations }
}

// Compares every byte even after a mismatch, so timing doesn't reveal how much matched.
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyPassword(password, { salt, hash, iterations }) {
  const candidate = await derive(password, fromBase64(salt), iterations)
  return constantTimeEqual(candidate, fromBase64(hash))
}
