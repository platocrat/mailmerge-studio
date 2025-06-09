export function traverse(obj: any, generatedFileIds: string[] = []): void {
  if (!obj) return
  if (Array.isArray(obj)) {
    obj.forEach((item) => traverse(item, generatedFileIds))
    return
  }
  if (typeof obj !== 'object') return

  if (
    obj.type === 'code_interpreter_call' &&
    Array.isArray(obj.results)
  ) {
    for (const res of obj.results) {
      if (res.type === 'files' && Array.isArray(res.files)) {
        for (const f of res.files) {
          if (f.file_id) generatedFileIds.push(f.file_id)
        }
      }
    }
  }

  for (const value of Object.values(obj)) {
    traverse(value, generatedFileIds)
  }
}
