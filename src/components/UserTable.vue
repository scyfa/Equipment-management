<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { bidApi, tenderApi, userApi } from '@/api'
import BaseModal from './BaseModal.vue'
import PagerBar from './PagerBar.vue'
import { confirm } from '@/composables/useConfirm'
import { toast } from '@/composables/useToast'
import { formatDate, formatMoney } from '@/utils/format'

const props = defineProps({
  role: { type: String, required: true }
})

const rows = ref([])
const tenders = ref([])
const bids = ref([])
const loading = ref(true)
const keyword = ref('')
const status = ref('')
const page = ref(1)
const pageSize = 8

const detail = ref(null)
const editing = ref(null)
const editForm = reactive({})
const saving = ref(false)

const isSupplier = computed(() => props.role === 'supplier')

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rows.value.filter((u) => {
    if (status.value && u.status !== status.value) return false
    if (!kw) return true
    return (
      u.name.toLowerCase().includes(kw) ||
      u.username.toLowerCase().includes(kw) ||
      (u.contact || '').toLowerCase().includes(kw) ||
      (u.phone || '').includes(kw) ||
      (u.license || '').toLowerCase().includes(kw)
    )
  })
})

const paged = computed(() => {
  const s = (page.value - 1) * pageSize
  return filtered.value.slice(s, s + pageSize)
})

function bidCountOf(id) {
  return bids.value.filter((b) => b.supplierId === id).length
}
function tenderCountOf(id) {
  return tenders.value.filter((t) => t.tendererId === id).length
}
function amountOf(id) {
  return bids.value.filter((b) => b.supplierId === id).reduce((s, b) => s + Number(b.totalAmount || 0), 0)
}

async function load() {
  loading.value = true
  try {
    const [users, ts, bs] = await Promise.all([
      userApi.list({ role: props.role }),
      tenderApi.all(),
      bidApi.list({})
    ])
    rows.value = users
    tenders.value = ts
    bids.value = bs
  } finally {
    loading.value = false
  }
}

async function toggle(u) {
  const next = u.status === 'active' ? '停用' : '启用'
  const ok = await confirm({
    title: `${next}账号`,
    message: `确定要${next}「${u.name}」的账号吗？${
      next === '停用' ? '停用后该账号将无法登录平台。' : ''
    }`,
    confirmText: next,
    danger: next === '停用'
  })
  if (!ok) return
  try {
    const updated = await userApi.toggleStatus(u.id)
    const idx = rows.value.findIndex((r) => r.id === u.id)
    if (idx > -1) rows.value[idx] = updated
    toast.success(`已${next}该账号`)
  } catch (e) {
    toast.error(e.message)
  }
}

async function remove(u) {
  const ok = await confirm({
    title: '删除用户',
    message: `确定删除「${u.name}」吗？该操作不可恢复，其登录账号将一并失效。`,
    confirmText: '删除',
    danger: true
  })
  if (!ok) return
  try {
    await userApi.remove(u.id)
    rows.value = rows.value.filter((r) => r.id !== u.id)
    toast.success('已删除该用户')
  } catch (e) {
    toast.error(e.message)
  }
}

function openEdit(u) {
  editing.value = u
  Object.assign(editForm, {
    name: u.name,
    license: u.license,
    contact: u.contact,
    phone: u.phone,
    email: u.email,
    address: u.address,
    intro: u.intro
  })
}

async function saveEdit() {
  if (!editForm.name.trim()) {
    toast.error('企业名称不能为空')
    return
  }
  saving.value = true
  try {
    const updated = await userApi.update(editing.value.id, { ...editForm })
    const idx = rows.value.findIndex((r) => r.id === updated.id)
    if (idx > -1) rows.value[idx] = updated
    toast.success('资料已更新')
    editing.value = null
  } catch (e) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="user-table">
    <div class="card toolbar">
      <input
        v-model="keyword"
        class="input kw"
        :placeholder="isSupplier ? '搜索企业名称、联系人或信用代码' : '搜索单位名称、联系人或信用代码'"
      />
      <select v-model="status" class="select st">
        <option value="">全部状态</option>
        <option value="active">正常</option>
        <option value="disabled">已停用</option>
      </select>
      <span class="count">共 {{ filtered.length }} 家</span>
    </div>

    <div v-if="loading" class="card empty"><p>数据加载中…</p></div>

    <div v-else-if="!filtered.length" class="card empty">
      <div class="empty-icon">🏭</div>
      <p>没有匹配的记录</p>
    </div>

    <div v-else class="card table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th>企业名称</th>
            <th style="width: 178px">统一社会信用代码</th>
            <th style="width: 150px">联系人 / 电话</th>
            <th style="width: 104px">注册时间</th>
            <th style="width: 92px">{{ isSupplier ? '投标数' : '招标数' }}</th>
            <th style="width: 82px">状态</th>
            <th style="width: 196px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in paged" :key="u.id">
            <td>
              <button class="name-btn" @click="detail = u">{{ u.name }}</button>
              <div class="sub">{{ u.address || '—' }}</div>
            </td>
            <td><span class="mono">{{ u.license || '—' }}</span></td>
            <td>
              <div>{{ u.contact || '—' }}</div>
              <div class="sub">{{ u.phone || '—' }}</div>
            </td>
            <td>{{ formatDate(u.createdAt) }}</td>
            <td>
              <span class="num">{{ isSupplier ? bidCountOf(u.id) : tenderCountOf(u.id) }}</span>
            </td>
            <td>
              <span class="tag" :class="u.status === 'active' ? 'tag-ok' : 'tag-muted'">
                {{ u.status === 'active' ? '正常' : '已停用' }}
              </span>
            </td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm" @click="detail = u">详情</button>
                <button class="btn btn-soft btn-sm" @click="openEdit(u)">编辑</button>
                <button class="btn btn-ghost btn-sm" @click="toggle(u)">
                  {{ u.status === 'active' ? '停用' : '启用' }}
                </button>
                <button class="btn btn-danger btn-sm" @click="remove(u)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <PagerBar v-model:page="page" :total="filtered.length" :page-size="pageSize" class="pager" />
    </div>

    <!-- 详情 -->
    <BaseModal v-if="detail" :title="isSupplier ? '设备厂家详情' : '招标单位详情'" width="620px" @close="detail = null">
      <div class="d-head">
        <span class="d-logo">{{ detail.name.slice(0, 1) }}</span>
        <div>
          <h3>{{ detail.name }}</h3>
          <p>
            {{ detail.role === 'supplier' ? '机电设备生产厂家' : '招标单位' }} ·
            注册于 {{ formatDate(detail.createdAt) }}
          </p>
        </div>
        <span class="tag" :class="detail.status === 'active' ? 'tag-ok' : 'tag-muted'" style="margin-left: auto">
          {{ detail.status === 'active' ? '正常' : '已停用' }}
        </span>
      </div>

      <div class="d-grid">
        <div><span>登录账号</span><strong>{{ detail.username }}</strong></div>
        <div><span>统一社会信用代码</span><strong class="mono">{{ detail.license || '—' }}</strong></div>
        <div><span>联系人</span><strong>{{ detail.contact || '—' }}</strong></div>
        <div><span>联系电话</span><strong>{{ detail.phone || '—' }}</strong></div>
        <div><span>电子邮箱</span><strong>{{ detail.email || '—' }}</strong></div>
        <div><span>企业地址</span><strong>{{ detail.address || '—' }}</strong></div>
        <div v-if="isSupplier">
          <span>投标次数</span><strong>{{ bidCountOf(detail.id) }} 次</strong>
        </div>
        <div v-if="isSupplier">
          <span>投标总额</span><strong>{{ formatMoney(amountOf(detail.id)) }}</strong>
        </div>
        <div v-if="!isSupplier">
          <span>发布招标</span><strong>{{ tenderCountOf(detail.id) }} 项</strong>
        </div>
      </div>

      <div class="d-intro">
        <span>企业简介</span>
        <p>{{ detail.intro || '暂无简介' }}</p>
      </div>

      <template #footer>
        <button class="btn btn-ghost" @click="detail = null">关闭</button>
      </template>
    </BaseModal>

    <!-- 编辑 -->
    <BaseModal v-if="editing" title="编辑企业资料" width="620px" @close="editing = null">
      <div class="form-row">
        <div class="field">
          <label class="label">企业名称<span class="req">*</span></label>
          <input v-model="editForm.name" class="input" />
        </div>
        <div class="field">
          <label class="label">统一社会信用代码</label>
          <input v-model="editForm.license" class="input" maxlength="18" />
        </div>
        <div class="field">
          <label class="label">联系人</label>
          <input v-model="editForm.contact" class="input" />
        </div>
        <div class="field">
          <label class="label">联系电话</label>
          <input v-model="editForm.phone" class="input" />
        </div>
        <div class="field">
          <label class="label">电子邮箱</label>
          <input v-model="editForm.email" class="input" />
        </div>
        <div class="field">
          <label class="label">企业地址</label>
          <input v-model="editForm.address" class="input" />
        </div>
      </div>
      <div class="field">
        <label class="label">企业简介</label>
        <textarea v-model="editForm.intro" class="textarea"></textarea>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="editing = null">取消</button>
        <button class="btn btn-primary" :disabled="saving" @click="saveEdit">
          {{ saving ? '保存中…' : '保存修改' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.kw {
  height: 36px;
  width: 320px;
  font-size: 13px;
}

.st {
  height: 36px;
  width: 132px;
  font-size: 13px;
}

.count {
  margin-left: auto;
  font-size: 12.5px;
  color: var(--text-3);
}

.name-btn {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  text-align: left;
}
.name-btn:hover {
  color: var(--brand);
  text-decoration: underline;
}

.sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mono {
  font-family: Consolas, monospace;
  font-size: 12px;
  color: var(--text-2);
  letter-spacing: 0.2px;
}

.num {
  font-weight: 600;
  color: var(--brand);
}

.pager {
  border-top: 1px solid var(--line-soft);
  padding: 12px 16px;
}

.d-head {
  display: flex;
  gap: 13px;
  align-items: center;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line-soft);
}

.d-logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2c63ac, #123a72);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 600;
}

.d-head h3 {
  font-size: 15.5px;
  font-weight: 600;
}

.d-head p {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 3px;
}

.d-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
  padding: 18px 0;
}

.d-grid div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.d-grid span {
  font-size: 11.5px;
  color: var(--text-3);
}

.d-grid strong {
  font-size: 13px;
  font-weight: 500;
}

.d-intro {
  border-top: 1px dashed var(--line);
  padding-top: 14px;
}

.d-intro span {
  font-size: 11.5px;
  color: var(--text-3);
}

.d-intro p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--text-2);
}
</style>
