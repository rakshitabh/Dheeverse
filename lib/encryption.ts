// E2E Encryption utilities for journal data
// Uses Web Crypto API for client-side encryption

const ENCRYPTION_KEY_NAME = "dheeverse-encryption-key"

// Generate a new encryption key
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
}

// Export key to storage format
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

// Import key from storage format
async function importKey(keyData: string): Promise<CryptoKey> {
  const keyBytes = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0))
  return await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"])
}

// Get or create encryption key
export async function getEncryptionKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(ENCRYPTION_KEY_NAME)
  if (stored) {
    return await importKey(stored)
  }

  const newKey = await generateKey()
  const exported = await exportKey(newKey)
  localStorage.setItem(ENCRYPTION_KEY_NAME, exported)
  return newKey
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
  const key = await getEncryptionKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()

  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(data))

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

// Decrypt data
export async function decryptData(encryptedData: string): Promise<string> {
  const key = await getEncryptionKey()
  const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0))

  const iv = combined.slice(0, 12)
  const data = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data)

  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}
