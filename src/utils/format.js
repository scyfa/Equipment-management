/** 通用格式化工具 */

export function formatDate(value) {
  if (!value) return '—'
  return String(value).slice(0, 10).replace(/-/g, '-')
}

export function formatDateTime(value) {
  if (!value) return '—'
  return String(value).replace('T', ' ').slice(0, 16)
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '—'
  const num = Number(value)
  if (Number.isNaN(num)) return String(value)
  return `¥ ${num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`
}

export function formatWan(value) {
  const num = Number(value || 0)
  if (!num) return '¥ 0'
  if (num >= 10000) return `¥ ${(num / 10000).toFixed(num % 10000 === 0 ? 0 : 1)} 万`
  return formatMoney(num)
}

export function todayStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** 距离截止日期的天数（负数表示已过期） */
export function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(`${dateStr}T23:59:59`)
  const now = new Date()
  return Math.ceil((target - now) / 86400000)
}

/** 招标状态：open 进行中 / closing 即将截止 / closed 已截止 */
export function tenderStatus(deadline) {
  const days = daysUntil(deadline)
  if (days === null) return { key: 'open', label: '进行中', cls: 'tag-ok', days }
  if (days < 0) return { key: 'closed', label: '已截止', cls: 'tag-muted', days }
  if (days <= 7) return { key: 'closing', label: '即将截止', cls: 'tag-warn', days }
  return { key: 'open', label: '进行中', cls: 'tag-ok', days }
}

export const ROLE_LABEL = {
  supplier: '设备厂家',
  tenderer: '招标单位',
  admin: '系统管理员'
}
