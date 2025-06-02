import crypto from 'crypto'

describe('ClientCrypto Initialization Vector and Key Generation', () => {
  it('should generate a 128-bit AES-GCM key and IV, and export the key as JWK', async () => {
    // 1. Set the size of the key to 16 bytes (128 bits)
    const bytesSize = new Uint8Array(16)

    // 2. Create an initialization vector of 128 bit-length
    const iv = crypto.getRandomValues(bytesSize)
    console.log(`iv:`, iv.toString())

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
    console.log(`serializedJwk:`, serializedJwk)

    // Optionally, add assertions
    expect(jwk.kty).toBe('oct')
    expect(jwk.k).toBeDefined()
    expect(jwk.alg).toBe('A128GCM')
  })
}) 
