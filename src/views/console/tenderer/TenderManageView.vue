<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { tenderApi, bidApi } from '@/api'
import StatusTag from '@/components/StatusTag.vue'
import StatCard from '@/components/StatCard.vue'
import { authState } from '@/stores/auth'
import { confirm } from '@/composables/useConfirm'
import { toast } from '@/composables/useToast'
import { formatDate, formatMoney, tenderStatus } from '@/utils/format'

const router = useRouter()
const user = computed(() => authState.user)

const rows = ref([])
const bids = ref([])
const loading = ref(true)
const keyword = ref('')
const statusFilter = ref('')

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rows.value.filter((t) => {
    if (statusFilter.value && tenderStatus(t.deadline).key !== statusFilter.value) return false
    if (!kw) return true
    return (
      t.name.toLowerCase().includes(kw) ||
      t.code.toLowerCase().includes(kw) ||
      t.model.toLowerCase().includes(kw)
    )
  })
})

const stats = computed(() => {
  const list = rows.value
  return {
    total: list.length,
    open: list.filter((t) => tenderStatus(t.deadline).key !== 'closed').length,
    closed: list.filter((t) => tenderStatus(t.deadline).key === 'closed').length,
    bids: bids.value.length,
    amount: list.reduce((s, t) => s + Number(t.deposit || 0), 0)
  }
})

function bidsOf(id) {
  return bids.value.filter((b) => b.tenderId === id).length
}

async function load() {
  loading.value = true
  try {
    const [ts, bs] = await Promise.all([
      tenderApi.all(),
      bidApi.list({ tendererId: user.value.id })
    ])
    rows.value = ts
      .filter((t) => t.tendererId === user.value.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    bids.value = bs
  } finally {
    loading.value = false
  }
}

async function remove(t) {
  const count = bidsOf(t.id)
  const ok = await confirm({
    title: '删除招标信息',
    message: `确定删除「${t.name}」（${t.code}）吗？${
      count ? `该项目下已有 ${count} 条投标记录，删除后记录将一并移除。` : ''
    }此操作不可恢复。`,
    confirmText: '删除',
    danger: true
  })
  if (!ok) return
  try {
    await tenderApi.remove(t.id)
    rows.value = rows.value.filter((r) => r.id !== t.id)
    bids.value = bids.value.filter((b) => b.tenderId !== t.id)
    toast.success('招标信息已删除')
  } catch (e) {
    toast.error(e.message)
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>招标信息管理</h1>
        <p class="sub">发布、修改、更新与查询本单位的机电设备招标信息</p>
      </div>
      <button class="btn btn-primary" @click="router.push('/console/tenderer/tenders/new')">
        ＋ 发布招标信息
      </button>
    </div>

    <div class="stats">
      <StatCard label="招标项目总数" :value="stats.total" icon="📋" hint="含进行中与已截止" />
      <StatCard label="进行中项目" :value="stats.open" tone="ok" icon="🟢" hint="仍在投标有效期内" />
      <StatCard label="已截止项目" :value="stats.closed" tone="warn" icon="⏱" hint="截止日期已过" />
      <StatCard label="收到投标" :value="stats.bids" icon="📨" hint="全部项目的投标记录" />
    </div>

    <div class="card toolbar">
      <input v-model="keyword" class="input kw" placeholder="搜索设备名称、型号或项目编号" />
      <select v-model="statusFilter" class="select st">
        <option value="">全部状态</option>
        <option value="open">进行中</option>
        <option value="closing">即将截止</option>
        <option value="closed">已截止</option>
      </select>
      <span class="count">共 {{ filtered.length }} 条</span>
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <div v-else-if="!filtered.length" class="card empty">
      <div class="empty-icon">📋</div>
      <p>暂无招标信息，点击右上角「发布招标信息」创建第一条公告</p>
    </div>

    <div v-else class="card table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th style="width: 146px">项目编号</th>
            <th>设备名称 / 型号</th>
            <th style="width: 84px">数量</th>
            <th style="width: 112px">保证金</th>
            <th style="width: 112px">截止日期</th>
            <th style="width: 96px">状态</th>
            <th style="width: 72px">投标</th>
            <th style="width: 214px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id">
            <td><span class="code-text">{{ t.code }}</span></td>
            <td>
              <strong class="t-name">{{ t.name }}</strong>
              <div class="t-sub">{{ t.model }}</div>
            </td>
            <td>{{ t.quantity }} {{ t.unit }}</td>
            <td>{{ formatMoney(t.deposit) }}</td>
            <td>{{ formatDate(t.deadline) }}</td>
            <td><StatusTag :deadline="t.deadline" /></td>
            <td>
              <span class="num">{{ bidsOf(t.id) }}</span>
            </td>
            <td>
              <div class="td-actions">
                <router-link :to="`/tenders/${t.id}`" class="btn btn-ghost btn-sm">预览</router-link>
                <button
                  class="btn btn-soft btn-sm"
                  @click="router.push(`/console/tenderer/tenders/${t.id}/edit`)"
                >
                  编辑
                </button>
                <button
                  class="btn btn-ghost btn-sm"
                  @click="router.push(`/console/tenderer/bids?tenderId=${t.id}`)"
                >
                  投标记录
                </button>
                <button class="btn btn-danger btn-sm" @click="remove(t)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

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

.t-name {
  font-size: 13.5px;
  font-weight: 500;
}

.t-sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
}

.num {
  font-weight: 600;
  color: var(--brand);
}

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
