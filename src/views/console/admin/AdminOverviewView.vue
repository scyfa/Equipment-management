<script setup>
import { computed, onMounted, ref } from 'vue'
import { messageApi, statsApi, tenderApi } from '@/api'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { toast } from '@/composables/useToast'
import { formatDate, formatWan } from '@/utils/format'

const stats = ref({})
const tenders = ref([])
const pending = ref([])
const allMessages = ref([])
const loading = ref(true)

const categoryStats = computed(() => {
  const map = {}
  tenders.value.forEach((t) => {
    map[t.category] = (map[t.category] || 0) + 1
  })
  const max = Math.max(1, ...Object.values(map))
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count, pct: (count / max) * 100 }))
})

const recentTenders = computed(() =>
  [...tenders.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
)

async function load() {
  loading.value = true
  try {
    const [s, ts, msgs] = await Promise.all([
      statsApi.overview(),
      tenderApi.all(),
      messageApi.list({})
    ])
    stats.value = s
    tenders.value = ts
    allMessages.value = msgs
    pending.value = msgs.filter((m) => m.status === 'pending')
  } finally {
    loading.value = false
  }
}

async function approve(m) {
  try {
    await messageApi.setStatus(m.id, 'published')
    pending.value = pending.value.filter((r) => r.id !== m.id)
    stats.value = await statsApi.overview()
    toast.success('留言已审核通过并公开')
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
        <h1>平台数据概览</h1>
        <p class="sub">机电设备在线招投标系统运行情况，数据来自平台模拟数据库</p>
      </div>
      <div class="quick">
        <router-link to="/console/admin/suppliers" class="btn btn-ghost btn-sm">厂家管理</router-link>
        <router-link to="/console/admin/messages" class="btn btn-primary btn-sm">
          待审留言 {{ stats.pendingMessages || 0 }}
        </router-link>
      </div>
    </div>

    <div class="stats">
      <StatCard label="招标项目" :value="stats.tenders || 0" icon="📋" :hint="`其中在招 ${stats.openTenders || 0} 项`" />
      <StatCard label="设备厂家" :value="stats.suppliers || 0" tone="ok" icon="🏭" hint="平台注册厂家数" />
      <StatCard label="招标单位" :value="stats.tenderers || 0" tone="ok" icon="🏢" hint="平台注册单位数" />
      <StatCard label="投标记录" :value="stats.bids || 0" tone="warn" icon="📨" :hint="`总额 ${formatWan(stats.amount || 0)}`" />
    </div>

    <div class="cols">
      <section class="card panel">
        <header class="panel-head">
          <h2>最近发布的招标</h2>
          <router-link to="/console/admin/tenders" class="more">全部 →</router-link>
        </header>
        <div v-if="loading" class="empty"><p>加载中…</p></div>
        <table v-else class="data mini">
          <thead>
            <tr>
              <th>项目</th>
              <th style="width: 108px">截止</th>
              <th style="width: 84px">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in recentTenders" :key="t.id">
              <td>
                <div class="tt">{{ t.name }}</div>
                <div class="ts">{{ t.code }} · {{ t.tendererName }}</div>
              </td>
              <td class="dim">{{ formatDate(t.deadline) }}</td>
              <td><StatusTag :deadline="t.deadline" /></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="card panel">
        <header class="panel-head">
          <h2>设备类别分布</h2>
          <span class="more dim">按项目数</span>
        </header>
        <div class="bars">
          <div v-for="c in categoryStats" :key="c.name" class="bar-row">
            <span class="bar-label">{{ c.name }}</span>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: c.pct + '%' }"></div>
            </div>
            <span class="bar-val">{{ c.count }}</span>
          </div>
          <p v-if="!categoryStats.length" class="dim">暂无数据</p>
        </div>
      </section>
    </div>

    <section class="card panel">
      <header class="panel-head">
        <h2>待审核留言 <span v-if="pending.length" class="count-badge">{{ pending.length }}</span></h2>
        <router-link to="/console/admin/messages" class="more">留言板管理 →</router-link>
      </header>

      <div v-if="!pending.length" class="empty-block">
        <span>✓</span> 所有留言均已审核，暂无待处理事项
      </div>

      <ul v-else class="pend-list">
        <li v-for="m in pending" :key="m.id">
          <div class="p-main">
            <div class="p-title">{{ m.title }}</div>
            <p class="p-body">{{ m.content }}</p>
            <div class="p-meta">{{ m.authorName }} · {{ m.createdAt }}</div>
          </div>
          <div class="p-actions">
            <button class="btn btn-soft btn-sm" @click="approve(m)">审核通过</button>
            <router-link to="/console/admin/messages" class="btn btn-ghost btn-sm">去答复</router-link>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.quick {
  display: flex;
  gap: 8px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

.cols {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.panel {
  padding: 20px 22px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-head h2 {
  font-size: 14.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  font-weight: 500;
}

.more {
  font-size: 12.5px;
  color: var(--brand);
}

.mini {
  font-size: 13px;
}

.mini thead th {
  padding: 8px 10px;
  font-size: 12px;
}

.mini tbody td {
  padding: 10px;
}

.tt {
  font-weight: 500;
  font-size: 13px;
}

.ts {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
}

.dim {
  color: var(--text-3);
  font-size: 12.5px;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.bar-row {
  display: grid;
  grid-template-columns: 96px 1fr 26px;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  height: 8px;
  border-radius: 5px;
  background: #f0f3f8;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #2c63ac, #6b9bd8);
}

.bar-val {
  font-size: 12px;
  color: var(--text-2);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.empty-block {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--ok);
  background: var(--ok-50);
  border-radius: 9px;
  padding: 14px 16px;
}

.empty-block span {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ok);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 11px;
}

.pend-list {
  display: flex;
  flex-direction: column;
}

.pend-list li {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px dashed var(--line-soft);
  align-items: flex-start;
}

.pend-list li:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.p-title {
  font-size: 13.5px;
  font-weight: 600;
}

.p-body {
  margin-top: 5px;
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.p-meta {
  margin-top: 7px;
  font-size: 11.5px;
  color: var(--text-3);
}

.p-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 1180px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
