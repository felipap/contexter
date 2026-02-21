import { encryptText, computeSearchIndex } from '../lib/encryption'
import { apiRequest } from '../lib/contexter-api'
import { getEncryptionKey } from '../store'

type SearchIndex = {
  sourceField: string
  indexField: string
  normalize: (value: string) => string
}

export type FieldConfig = {
  encryptedFields: readonly string[]
  searchIndexes?: SearchIndex[]
  encryptedArrayFields?: readonly string[]
  searchIndexArrays?: SearchIndex[]
}

export function encryptItems<T>(
  items: T[],
  config: FieldConfig,
  encryptionKey: string,
): T[] {
  return items.map((item) => {
    const result = { ...item } as Record<string, unknown>

    if (config.searchIndexes) {
      for (const idx of config.searchIndexes) {
        const value = result[idx.sourceField]
        if (typeof value === 'string' && value) {
          result[idx.indexField] = computeSearchIndex(
            idx.normalize(value),
            encryptionKey,
          )
        }
      }
    }

    if (config.searchIndexArrays) {
      for (const idx of config.searchIndexArrays) {
        const values = result[idx.sourceField]
        if (Array.isArray(values)) {
          result[idx.indexField] = (values as string[])
            .map((v) => idx.normalize(v))
            .filter((v) => v.length > 0)
            .map((v) => computeSearchIndex(v, encryptionKey))
        }
      }
    }

    for (const field of config.encryptedFields) {
      const value = result[field]
      if (typeof value === 'string' && value) {
        result[field] = encryptText(value, encryptionKey)
      }
    }

    if (config.encryptedArrayFields) {
      for (const field of config.encryptedArrayFields) {
        const values = result[field]
        if (Array.isArray(values)) {
          result[field] = (values as string[]).map((v) =>
            encryptText(v, encryptionKey),
          )
        }
      }
    }

    return result as T
  })
}

export async function encryptAndUpload<T>({
  items,
  config,
  apiPath,
  bodyKey,
}: {
  items: T[]
  config: FieldConfig
  apiPath: string
  bodyKey: string
}): Promise<boolean> {
  const encryptionKey = getEncryptionKey()
  if (!encryptionKey) {
    return false
  }
  const encrypted = encryptItems(items, config, encryptionKey)
  await apiRequest({
    path: apiPath,
    body: { [bodyKey]: encrypted },
  })
  return true
}
