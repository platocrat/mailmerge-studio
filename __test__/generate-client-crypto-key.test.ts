// __test__/generate-client-crypto-key.test.ts
import crypto from 'crypto'

describe('ClientCrypto Initialization Vector and Key Generation', () => {
  it('should generate a 128-bit AES-GCM key and IV, and export the key as JWK', async () => {
    // 1. Set the size of the key to 16 bytes (128 bits)
    const bytesSize = new Uint8Array(16)

    // 2. Create an initialization vector of 128 bit-length
    if (crypto.webcrypto?.getRandomValues) {
      crypto.webcrypto.getRandomValues(bytesSize)
    } else {
      crypto.randomFillSync(bytesSize)
    }
    const iv = bytesSize

    // 3. Generate a new symmetric key (AES-GCM, 128 bits)
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 128,
      },
      true,
      ['encrypt', 'decrypt']
    )

    // 4. Export the `CryptoKey`
    const jwk = await crypto.subtle.exportKey('jwk', key)
    const serializedJwk = JSON.stringify(jwk)

    // Optionally, add assertions
    expect(iv.length).toBe(16)
    expect((key as CryptoKey).algorithm.name).toBe('AES-GCM')
    expect(jwk.kty).toBe('oct')
    expect(jwk.k).toBeDefined()
    expect(jwk.alg).toBe('A128GCM')
  })
})
