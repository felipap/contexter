export async function tryCatch<T>(
  promise: Promise<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise
    return [data, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}

export async function catchAndComplain<T>(
  promise: Promise<T>,
): Promise<T | { error: string }> {
  try {
    const data = await promise
    return data
  } catch (error) {
    console.error('THREW:', error)
    return { error: error instanceof Error ? error.message : String(error) }
  }
}
