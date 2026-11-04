const STORAGE_KEY = 'mesbid_db_v1'

/** 深拷贝，避免调用方误改内存中的引用 */
export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function readDb() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

export function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

export function resetDb() {
  localStorage.removeItem(STORAGE_KEY)
}

/** 生成带前缀的递增 ID */
export function nextId(list, prefix) {
  const nums = list
    .map((item) => Number(String(item.id).replace(/\D/g, '')))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}

export { STORAGE_KEY }
