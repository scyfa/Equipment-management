<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { bidApi, tenderApi } from '@/api'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import BaseModal from '@/components/BaseModal.vue'
import { authState } from '@/stores/auth'
import { confirm } from '@/composables/useConfirm'
import { toast } from '@/composables/useToast'
import { formatDate, formatMoney, tenderStatus } from '@/utils/format'

const router = useRouter()
const user = computed(() => authState.user)

const bids = ref([])
const tenders = ref([])
const loading = ref(true)
const keyword = ref('')
const detail = ref(null)

const tenderMap = computed(() => {
  const map = {}
  tenders.value.forEach((t) => (map[t.id] = t))
  return map
})

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return bids.value.filter((b) => {
    if (!kw) return true
    return (
      b.tenderName.toLowerCase().includes(kw) ||
      b.tenderCode.toLowerCase().includes(kw) ||
      b.manufacturer.toLowerCase().includes(kw)
    )
  })
})

const stats = computed(() => ({
  count: bids.value.length,
  active: bids.value.filter((b) => {
    const t = tenderMap.value[b.tenderId]
    return t && tenderStatus(t.deadline).key !== 'closed'
  }).length,
  amount: bids.value.reduce((s, b) => s + Number(b.totalAmount || 0), 0)
}))

async function load() {
  loading.value = true
  try {
    const [bs, ts] = await Promise.all([
      bidApi.list({ supplierId: user.value.id }),
      tenderApi.all()
    ])
    bids.value = bs
    tenders.value = ts
  } finally {
    loading.value = false
  }
}

async function withdraw(b) {
  const ok = await confirm({
    title: '撤回投标',
    message: `确定撤回对「${b.tenderName}」（${b.tenderCode}）的投标吗？撤回后如需再次投标需重新填写投标信息表单。`,
    confirmText: '撤回投标',
    danger: true
  })
  if (!ok) return
  try {
    await bidApi.remove(b.id, user.value)
    bids.value = bids.value.filter((r) => r.id !== b.id)
    toast.success('投标已撤回')
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
        <h1>我的投标</h1>
        <p class="sub">查看已提交的投标信息，投标截止前可撤回后重新提交</p>
      </div>
      <router-link to="/tenders" class="btn btn-primary">＋ 去投标</router-link>
    </div>

    <div class="stats">
      <StatCard label="累计投标" :value="stats.count" icon="📄" hint="已提交的投标记录" />
      <StatCard label="进行中" :value="stats.active" tone="ok" icon="🟢" hint="项目仍在投标期" />
      <StatCard label="投标总额" :value="formatMoney(stats.amount)" tone="warn" icon="💰" />
    </div>

    <div class="card toolbar">
      <input v-model="keyword" class="input kw" placeholder="搜索招标项目、编号或生产厂家" />
      <span class="count">共 {{ filtered.length }} 条</span>
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <div v-else-if="!filtered.length" class="card empty">
      <div class="empty-icon">📄</div>
      <p>还没有投标记录，去招标大厅看看适合的项目吧</p>
      <router-link to="/tenders" class="btn btn-soft btn-sm" style="margin-top: 14px">
        浏览招标公告
      </router-link>
    </div>

    <div v-else class="card table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th style="width: 156px">招标项目</th>
            <th>设备名称</th>
            <th style="width: 104px">投标日期</th>
            <th style="width: 120px">投标总金额</th>
            <th style="width: 112px">保证金缴款</th>
            <th style="width: 96px">项目状态</th>
            <th style="width: 152px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="b.id">
            <td><span class="code-text">{{ b.tenderCode }}</span></td>
            <td>
              <strong class="t-name">{{ b.tenderName }}</strong>
              <div class="sub">{{ b.manufacturer }}</div>
            </td>
            <td>{{ formatDate(b.bidDate) }}</td>
            <td class="money">{{ formatMoney(b.totalAmount) }}</td>
            <td>{{ formatDate(b.depositPaidDate) }}</td>
            <td>
              <StatusTag
                v-if="tenderMap[b.tenderId]"
                :deadline="tenderMap[b.tenderId].deadline"
              />
              <span v-else class="tag tag-muted">项目已删除</span>
            </td>
            <td>
              <div class="td-actions">
                <button class="btn btn-soft btn-sm" @click="detail = b">详情</button>
                <router-link :to="`/tenders/${b.tenderId}`" class="btn btn-ghost btn-sm">
                  查看公告
                </router-link>
                <button class="btn btn-danger btn-sm" @click="withdraw(b)">撤回</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal v-if="detail" title="我的投标信息" width="660px" @close="detail = null">
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
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
</style>
