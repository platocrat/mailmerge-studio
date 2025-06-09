jest.mock('next/server', () => ({ NextResponse: { json: jest.fn() } }))

import { isValidEmail } from '@/utils/misc'
import { rng } from '@/utils'
import * as miscUtils from '@/utils/misc/utils'
import { getConsoleMetadata, debounce, readableStreamToBuffer } from '@/utils/misc/utils'
import { traverse } from '@/lib/open-ai/utils'
import { getEncryptedItems, getDecryptedItems } from '@/utils/api/auth'
import { randomBytes } from 'crypto'

(global as any).performance = {
  timeOrigin: 0,
  now: () => 0
}

describe('isValidEmail', () => {
  it('validates a correct email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })
  it('rejects an incorrect email', () => {
    expect(isValidEmail('invalid-email')).toBe(false)
  })
})

describe('rng', () => {
  it('returns integer within range', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(rng(10)).toBe(5)
  })
})

describe('getConsoleMetadata', () => {
  it('formats metadata string', () => {
    const result = getConsoleMetadata('CLIENT', true, 'file.ts', 'fn()')
    expect(result).toMatch(/\[CLIENT LOG: --logTimestamp="\d+" --file-path="file.ts --function-name="fn\(\)"\]: /)
  })
})

describe('debounce', () => {
  it('delays execution', () => {
    jest.useFakeTimers()
    const fn = jest.fn()
    const d = debounce(fn, 100)
    d()
    expect(fn).not.toBeCalled()
    jest.advanceTimersByTime(100)
    expect(fn).toBeCalledTimes(1)
    jest.useRealTimers()
  })
})

describe('readableStreamToBuffer', () => {
  it('converts stream to buffer', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3]))
        controller.close()
      }
    })
    const buf = await readableStreamToBuffer('CLIENT', 'file', stream)
    expect(buf.equals(Buffer.from([1, 2, 3]))).toBe(true)
  })
  it('throws when stream is null', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(readableStreamToBuffer('CLIENT', 'file', null)).rejects.toThrow('No stream found in file response')
    spy.mockRestore()
  })
})

describe('traverse', () => {
  it('collects file ids', () => {
    const obj = {
      type: 'code_interpreter_call',
      results: [{ type: 'files', files: [{ file_id: 'a' }, { file_id: 'b' }] }]
    }
    const ids: string[] = []
    traverse(obj, ids)
    expect(ids).toEqual(['a', 'b'])
  })
})

describe('encrypt/decrypt helpers', () => {
  it('encrypts and decrypts items', () => {
    const secret = randomBytes(32)
    const items = [{ email: 'user@example.com' }, { data: 'hello' }]
    const encrypted = getEncryptedItems(items, secret)
    const decryptInput = Object.keys(encrypted).map(key => ({ [key]: encrypted[key] }))
    const decrypted = getDecryptedItems(decryptInput, secret)
    expect(decrypted).toEqual({ email: 'user@example.com', data: 'hello' })
  })
})
