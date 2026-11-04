<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bidApi, tenderApi } from '@/api'
import StatCard from '@/components/StatCard.vue'
import BaseModal from '@/components/BaseModal.vue'
import { authState } from '@/stores/auth'
import { toast } from '@/composables/useToast'
import { formatDate, formatMoney } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const user = computed(() => authState.user)

const bids = ref([])
const tenders = ref([])
const loading = ref(true)
const keyword = ref('')
const tenderFilter = ref(route.query.tenderId || '')
const detail = ref(null)

const myTenders = computed(() => tenders.value.filter((t) => t.tendererId === user.value.id))

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return bids.value.filter((b) => {
    if (tenderFilter.value && b.tenderId !== tenderFilter.value) return false
    if (!kw) return true
    return (
      b.bidderName.toLowerCase().includes(kw) ||
      b.legalPerson.toLowerCase().includes(kw) ||
      b.tenderCode.toLowerCase().includes(kw) ||
      b.tenderName.toLowerCase().includes(kw)
    )
  })
})

const stats = computed(() => ({
  count: bids.value.length,
  projects: new Set(bids.value.map((b) => b.tenderId)).size,
  amount: bids.value.reduce((s, b) => s + Number(b.totalAmount || 0), 0),
  avg: bids.value.length
    ? bids.value.reduce((s, b) => s + Number(b.totalAmount || 0), 0) / bids.value.length
    : 0
}))

async function load() {
  loading.value = true
  try {
    const [bs, ts] = await Promise.all([
      bidApi.list({ tendererId: user.value.id }),
      tenderApi.all()
    ])
    bids.value = bs
    tenders.value = ts
  } finally {
    loading.value = false
  }
}

function clearFilter() {
  tenderFilter.value = ''
  router.replace('/console/tenderer/bids')
}

function exportCsv() {  if (!filtered.value.length) {
    toast.error('暂无可导出的投标记录')
    return
  }
  const header = [
    '投标日期',
    '招标项目编号',
    '招标项目名称',
    '投标单位',
    '法人姓名',
    '联系电话',
    '产品生产厂家',
    '生产日期',
    '保质期',
    '投标总金额',
    '保证金缴款日期'
  ]
  const lines = filtered.value.map((b) =>
    [
      b.bidDate,
      b.tenderCode,
      b.tenderName,
      b.bidderName,
      b.legalPerson,
      b.phone,
      b.manufacturer,
      b.produceDate,
      b.shelfLife,
      b.totalAmount,
      b.depositPaidDate
    ]
      .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
      .join(',')
  )
  const csv = '\ufeff' + [header.join(','), ...lines].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `投标信息汇总_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  toast.success('已导出 CSV 文件')
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>投标情况</h1>
        <p class="sub">查看各投标单位提交的投标信息表单，可按项目筛选并导出汇总</p>
      </div>
      <button class="btn btn-ghost" @click="exportCsv">导出 CSV</button>
    </div>

    <div class="stats">
      <StatCard label="收到投标" :value="stats.count" icon="📨" hint="全部项目的投标记录" />
      <StatCard label="涉及项目" :value="stats.projects" icon="📋" hint="已有单位投标的项目数" />
      <StatCard label="投标总额" :value="formatMoney(stats.amount)" tone="warn" icon="💰" />
      <StatCard label="平均报价" :value="formatMoney(Math.round(stats.avg))" tone="ok" icon="📊" />
    </div>

    <div class="card toolbar">
      <select v-model="tenderFilter" class="select proj">
        <option value="">全部招标项目</option>
        <option v-for="t in myTenders" :key="t.id" :value="t.id">
          {{ t.code }} · {{ t.name }}
        </option>
      </select>
      <input v-model="keyword" class="input kw" placeholder="搜索投标单位、法人或项目" />
      <button v-if="tenderFilter" class="btn btn-ghost btn-sm" @click="clearFilter">清除筛选</button>
      <span class="count">共 {{ filtered.length }} 条</span>
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <div v-else-if="!filtered.length" class="card empty">
      <div class="empty-icon">📨</div>
      <p>暂无投标记录，等待设备厂家参与投标</p>
    </div>

    <div v-else class="card table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th style="width: 156px">招标项目</th>
            <th>投标单位</th>
            <th style="width: 104px">法人</th>
            <th style="width: 126px">联系电话</th>
            <th style="width: 104px">投标日期</th>
            <th style="width: 122px">投标总金额</th>
            <th style="width: 116px">保证金缴款</th>
            <th style="width: 76px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="b.id">
            <td>
              <span class="code-text">{{ b.tenderCode }}</span>
              <div class="sub">{{ b.tenderName }}</div>
            </td>
            <td>
              <strong class="t-name">{{ b.bidderName }}</strong>
              <div class="sub">{{ b.manufacturer }}</div>
            </td>
            <td>{{ b.legalPerson }}</td>
            <td>{{ b.phone }}</td>
            <td>{{ formatDate(b.bidDate) }}</td>
            <td class="money">{{ formatMoney(b.totalAmount) }}</td>
            <td>{{ formatDate(b.depositPaidDate) }}</td>
            <td>
              <button class="btn btn-soft btn-sm" @click="detail = b">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal v-if="detail" title="投标信息表单" width="660px" @close="detail = null">
      <div class="d-top">
        <div>
          <span class="code-text">{{ detail.tenderCode }}</span>
          <h3>{{ detail.tenderName }}</h3>
        </div>
        <strong class="d-amount">{{ formatMoney(detail.totalAmount) }}</strong>
      </div>
      <div class="d-grid">
        <div><span>投标日期</span><strong>{{ formatDate(detail.bidDate) }}</strong></div>
        <div><span>投标单位</span><strong>{{ detail.bidderName }}</strong></div>
        <div><span>法人姓名</span><strong>{{ detail.legalPerson }}</strong></div>
        <div><span>联系电话</span><strong>{{ detail.phone }}</strong></div>
        <div><span>招标项目编号</span><strong class="mono">{{ detail.tenderCode }}</strong></div>
        <div><span>产品生产厂家</span><strong>{{ detail.manufacturer }}</strong></div>
        <div><span>生产日期</span><strong>{{ detail.produceDate }}</strong></div>
        <div><span>保质期</span><strong>{{ detail.shelfLife }}</strong></div>
        <div><span>投标总金额</span><strong>{{ formatMoney(detail.totalAmount) }}</strong></div>
        <div><span>保证金缴款日期</span><strong>{{ formatDate(detail.depositPaidDate) }}</strong></div>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="detail = null">关闭</button>
        <router-link :to="`/tenders/${detail.tenderId}`" class="btn btn-soft">查看招标项目</router-link>
      </template>
    </BaseModal>
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
  flex-wrap: wrap;
}

.proj {
  height: 36px;
  width: 268px;
  font-size: 13px;
}

.kw {
  height: 36px;
  width: 250px;
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

.sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
}

.money {
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.d-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-soft);
}

.d-top h3 {
  font-size: 17px;
  font-weight: 600;
  margin-top: 6px;
}

.d-amount {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.4px;
}

.d-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 22px;
  padding-top: 18px;
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
  font-size: 13.5px;
  font-weight: 500;
}

.mono {
  font-family: Consolas, monospace;
  color: var(--brand);
}

@media (max-width: 1100px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
