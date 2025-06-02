// __tests__/example.test.ts
function sum(a: number = 0, b: number = 0): number {
  return a + b
}

// Example test
describe('1. Sum function', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3)
  })

  it('should return 0 for no arguments', () => {
    expect(sum()).toBe(0)
  })
})
