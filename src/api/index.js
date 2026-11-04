/**
 * 前端模拟数据接口层
 * ------------------------------------------------------------------
 * 说明：课程设计前端独立演示用。所有方法均返回 Promise，
 * 后续接入后端（Spring Boot / Node / PHP 等）时，只需把本文件内
 * 各方法改为真实 HTTP 请求，页面组件无需改动。
 */
import { seedUsers, seedTenders, seedBids, seedMessages } from '@/data/seed'
import {
  clone,
  nextId,
  readDb,
  resetDb,
  writeDb,
  STORAGE_KEY
} from './db'
import { daysUntil, todayStr } from '@/utils/format'

const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

function ensureDb() {
  let db = readDb()
  if (!db) {
    db = {
      version: 1,
      users: clone(seedUsers),
      tenders: clone(seedTenders),
      bids: clone(seedBids),
      messages: clone(seedMessages)
    }
    writeDb(db)
  }
  return db
}

function save(db) {
  writeDb(db)
}

function publicUser(user) {
  if (!user) return null
  const { password, ...rest } = user
  return rest
}

export function resetDatabase() {
  resetDb()
  localStorage.removeItem('mesbid_token')
  return ensureDb()
}

/* ============================ 账号 ============================ */

export const authApi = {
  async login({ username, password }) {
    await delay()
    const db = ensureDb()
    const user = db.users.find(
      (u) => u.username.toLowerCase() === String(username).trim().toLowerCase()
    )
    if (!user) throw new Error('账号不存在，请检查后重试')
    if (user.password !== password) throw new Error('密码不正确')
    if (user.status !== 'active') throw new Error('该账号已被管理员停用，请联系平台')
    return publicUser(user)
  },

  async register(payload) {
    await delay()
    const db = ensureDb()
    const username = String(payload.username || '').trim()
    if (!username) throw new Error('请填写登录账号')
    if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('该登录账号已被占用，请更换')
    }
    if (payload.license && db.users.some((u) => u.license === payload.license)) {
      throw new Error('该统一社会信用代码已注册')
    }
    const role = payload.role === 'tenderer' ? 'tenderer' : 'supplier'
    const user = {
      id: nextId(db.users, 'U'),
      role,
      username,
      password: payload.password,
      name: payload.name,
      contact: payload.contact || '',
      phone: payload.phone || '',
      email: payload.email || '',
      address: payload.address || '',
      license: payload.license || '',
      intro: payload.intro || '',
      status: 'active',
      createdAt: todayStr()
    }
    db.users.push(user)
    save(db)
    return publicUser(user)
  },

  async updateProfile(id, patch) {
    await delay()
    const db = ensureDb()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    Object.assign(user, patch, { id: user.id, role: user.role, username: user.username })
    save(db)
    return publicUser(user)
  },

  async changePassword(id, oldPwd, newPwd) {
    await delay()
    const db = ensureDb()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    if (user.password !== oldPwd) throw new Error('原密码不正确')
    user.password = newPwd
    save(db)
    return true
  }
}

/* ============================ 招标信息 ============================ */

export const tenderApi = {
  async list(params = {}) {
    await delay()
    const db = ensureDb()
    let rows = [...db.tenders]

    const keyword = (params.keyword || '').trim().toLowerCase()
    if (keyword) {
      rows = rows.filter(
        (t) =>
          t.name.toLowerCase().includes(keyword) ||
          t.code.toLowerCase().includes(keyword) ||
          t.model.toLowerCase().includes(keyword) ||
          t.tendererName.toLowerCase().includes(keyword)
      )
    }
    if (params.category) rows = rows.filter((t) => t.category === params.category)
    if (params.tendererId) rows = rows.filter((t) => t.tendererId === params.tendererId)
    if (params.region) rows = rows.filter((t) => t.region === params.region)
    if (params.status) {
      rows = rows.filter((t) => {
        const days = daysUntil(t.deadline)
        if (params.status === 'closed') return days < 0
        if (params.status === 'closing') return days >= 0 && days <= 7
        if (params.status === 'open') return days >= 0
        return true
      })
    }

    rows.sort((a, b) => {
      if (params.sort === 'deadline') return a.deadline.localeCompare(b.deadline)
      if (params.sort === 'quantity') return b.quantity - a.quantity
      return b.createdAt.localeCompare(a.createdAt)
    })

    const total = rows.length
    const page = Number(params.page || 1)
    const pageSize = Number(params.pageSize || 6)
    const start = (page - 1) * pageSize
    const items = rows.slice(start, start + pageSize).map((t) => ({
      ...t,
      bidCount: db.bids.filter((b) => b.tenderId === t.id).length
    }))

    return { items, total, page, pageSize }
  },

  async all() {
    await delay(80)
    return clone(ensureDb().tenders)
  },

  async get(id) {
    await delay()
    const db = ensureDb()
    const tender = db.tenders.find((t) => t.id === id || t.code === id)
    if (!tender) throw new Error('招标项目不存在或已被删除')
    return {
      ...clone(tender),
      bidCount: db.bids.filter((b) => b.tenderId === tender.id).length
    }
  },

  async create(payload, user) {
    await delay()
    const db = ensureDb()
    const id = nextId(db.tenders, 'T')
    const tender = {
      id,
      code: payload.code || `JD-${new Date().getFullYear()}-${id.slice(-4)}`,
      name: payload.name,
      model: payload.model || '',
      packing: payload.packing || '',
      quantity: Number(payload.quantity || 0),
      unit: payload.unit || '台',
      deadline: payload.deadline,
      deposit: Number(payload.deposit || 0),
      tendererId: user.id,
      tendererName: user.name,
      region: payload.region || '',
      category: payload.category || '其他',
      description: payload.description || '',
      createdAt: todayStr()
    }
    db.tenders.unshift(tender)
    save(db)
    return clone(tender)
  },

  async update(id, payload) {
    await delay()
    const db = ensureDb()
    const tender = db.tenders.find((t) => t.id === id)
    if (!tender) throw new Error('招标项目不存在')
    Object.assign(tender, {
      ...payload,
      quantity: Number(payload.quantity ?? tender.quantity),
      deposit: Number(payload.deposit ?? tender.deposit),
      id: tender.id,
      tendererId: tender.tendererId,
      tendererName: tender.tendererName
    })
    save(db)
    return clone(tender)
  },

  async remove(id) {
    await delay()
    const db = ensureDb()
    const idx = db.tenders.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('招标项目不存在')
    db.tenders.splice(idx, 1)
    const removedBids = db.bids.filter((b) => b.tenderId === id).length
    db.bids = db.bids.filter((b) => b.tenderId !== id)
    save(db)
    return { removedBids }
  },

  async categories() {
    const db = ensureDb()
    return [...new Set(db.tenders.map((t) => t.category))].filter(Boolean)
  }
}

/* ============================ 投标信息 ============================ */

export const bidApi = {
  async list(params = {}) {
    await delay()
    const db = ensureDb()
    let rows = [...db.bids]
    if (params.supplierId) rows = rows.filter((b) => b.supplierId === params.supplierId)
    if (params.tenderId) rows = rows.filter((b) => b.tenderId === params.tenderId)
    if (params.tendererId) {
      const ids = db.tenders.filter((t) => t.tendererId === params.tendererId).map((t) => t.id)
      rows = rows.filter((b) => ids.includes(b.tenderId))
    }
    const keyword = (params.keyword || '').trim().toLowerCase()
    if (keyword) {
      rows = rows.filter(
        (b) =>
          b.bidderName.toLowerCase().includes(keyword) ||
          b.tenderCode.toLowerCase().includes(keyword) ||
          b.tenderName.toLowerCase().includes(keyword)
      )
    }
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return clone(rows)
  },

  async create(payload, user) {
    await delay()
    const db = ensureDb()
    const tender = db.tenders.find((t) => t.id === payload.tenderId)
    if (!tender) throw new Error('招标项目不存在')
    if (db.bids.some((b) => b.tenderId === tender.id && b.supplierId === user.id)) {
      throw new Error('您已对本项目投标，请勿重复提交')
    }
    const bid = {
      id: nextId(db.bids, 'B'),
      tenderId: tender.id,
      tenderCode: tender.code,
      tenderName: tender.name,
      bidDate: payload.bidDate,
      bidderName: payload.bidderName || user.name,
      legalPerson: payload.legalPerson,
      phone: payload.phone,
      manufacturer: payload.manufacturer,
      produceDate: payload.produceDate,
      shelfLife: payload.shelfLife,
      totalAmount: Number(payload.totalAmount || 0),
      depositPaidDate: payload.depositPaidDate,
      supplierId: user.id,
      status: 'submitted',
      createdAt: todayStr()
    }
    db.bids.unshift(bid)
    save(db)
    return clone(bid)
  },

  async remove(id, user) {
    await delay()
    const db = ensureDb()
    const idx = db.bids.findIndex((b) => b.id === id)
    if (idx === -1) throw new Error('投标记录不存在')
    if (user.role !== 'admin' && db.bids[idx].supplierId !== user.id) {
      throw new Error('无权撤回他人的投标记录')
    }
    db.bids.splice(idx, 1)
    save(db)
    return true
  }
}

/* ============================ 留言板 ============================ */

export const messageApi = {
  async list(params = {}) {
    await delay()
    const db = ensureDb()
    let rows = [...db.messages]
    if (params.status) rows = rows.filter((m) => m.status === params.status)
    if (params.authorId) rows = rows.filter((m) => m.authorId === params.authorId)
    const keyword = (params.keyword || '').trim().toLowerCase()
    if (keyword) {
      rows = rows.filter(
        (m) =>
          m.title.toLowerCase().includes(keyword) ||
          m.content.toLowerCase().includes(keyword) ||
          m.authorName.toLowerCase().includes(keyword)
      )
    }
    rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    return clone(rows)
  },

  async create(payload, user) {
    await delay()
    const db = ensureDb()
    const msg = {
      id: nextId(db.messages, 'M'),
      authorId: user.id,
      authorName: user.name,
      role: user.role,
      title: payload.title,
      content: payload.content,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      status: 'pending',
      reply: '',
      replyAt: ''
    }
    db.messages.unshift(msg)
    save(db)
    return clone(msg)
  },

  async reply(id, content) {
    await delay()
    const db = ensureDb()
    const msg = db.messages.find((m) => m.id === id)
    if (!msg) throw new Error('留言不存在')
    msg.reply = content
    msg.replyAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    msg.status = 'published'
    save(db)
    return clone(msg)
  },

  async setStatus(id, status) {
    await delay()
    const db = ensureDb()
    const msg = db.messages.find((m) => m.id === id)
    if (!msg) throw new Error('留言不存在')
    msg.status = status
    save(db)
    return clone(msg)
  },

  async remove(id) {
    await delay()
    const db = ensureDb()
    const idx = db.messages.findIndex((m) => m.id === id)
    if (idx === -1) throw new Error('留言不存在')
    db.messages.splice(idx, 1)
    save(db)
    return true
  }
}

/* ============================ 用户管理（管理员） ============================ */

export const userApi = {
  async list(params = {}) {
    await delay()
    const db = ensureDb()
    let rows = db.users.filter((u) => u.role !== 'admin')
    if (params.role) rows = rows.filter((u) => u.role === params.role)
    if (params.status) rows = rows.filter((u) => u.status === params.status)
    const keyword = (params.keyword || '').trim().toLowerCase()
    if (keyword) {
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(keyword) ||
          u.username.toLowerCase().includes(keyword) ||
          (u.contact || '').toLowerCase().includes(keyword) ||
          (u.phone || '').includes(keyword)
      )
    }
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return clone(rows.map(publicUser))
  },

  async get(id) {
    await delay(80)
    const db = ensureDb()
    return publicUser(clone(db.users.find((u) => u.id === id)))
  },

  async update(id, patch) {
    await delay()
    const db = ensureDb()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    Object.assign(user, patch, { id: user.id, role: user.role })
    save(db)
    return publicUser(clone(user))
  },

  async toggleStatus(id) {
    await delay()
    const db = ensureDb()
    const user = db.users.find((u) => u.id === id)
    if (!user) throw new Error('用户不存在')
    user.status = user.status === 'active' ? 'disabled' : 'active'
    save(db)
    return publicUser(clone(user))
  },

  async remove(id) {
    await delay()
    const db = ensureDb()
    const idx = db.users.findIndex((u) => u.id === id)
    if (idx === -1) throw new Error('用户不存在')
    if (db.users[idx].role === 'admin') throw new Error('不能删除管理员账号')
    db.users.splice(idx, 1)
    save(db)
    return true
  }
}

/* ============================ 统计 ============================ */

export const statsApi = {
  async overview() {
    await delay(100)
    const db = ensureDb()
    const today = todayStr()
    return {
      tenders: db.tenders.length,
      openTenders: db.tenders.filter((t) => t.deadline >= today).length,
      suppliers: db.users.filter((u) => u.role === 'supplier').length,
      tenderers: db.users.filter((u) => u.role === 'tenderer').length,
      bids: db.bids.length,
      amount: db.bids.reduce((s, b) => s + Number(b.totalAmount || 0), 0),
      pendingMessages: db.messages.filter((m) => m.status === 'pending').length,
      messages: db.messages.length
    }
  }
}

export { STORAGE_KEY }
