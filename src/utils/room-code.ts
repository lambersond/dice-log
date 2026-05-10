// Crockford-style alphabet: no I, L, O, 0, 1 to keep shared codes readable.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateRoomCode(length = 6): string {
  const buf = new Uint32Array(length)
  crypto.getRandomValues(buf)
  let code = ''
  for (const n of buf) code += ALPHABET[n % ALPHABET.length]
  return code
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase()
}
