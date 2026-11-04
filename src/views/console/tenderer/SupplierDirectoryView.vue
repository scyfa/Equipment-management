<script setup>
import { computed, onMounted, ref } from 'vue'
import { bidApi, userApi } from '@/api'
import BaseModal from '@/components/BaseModal.vue'
import { formatDate, formatMoney } from '@/utils/format'

const suppliers = ref([])
const bids = ref([])
const loading = ref(true)
const keyword = ref('')
const detail = ref(null)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return suppliers.value.filter((s) => {
    if (s.status !== 'active') return false
    if (!kw) return true
    return (
      s.name.toLowerCase().includes(kw) ||
      (s.address || '').toLowerCase().includes(kw) ||
      (s.intro || '').toLowerCase().includes(kw)
    )
  })
})

function bidsOf(id) {
  return bids.value.filter((b) => b.supplierId === id)
}

async function load() {
  loading.value = true
  try {
    const [us, bs] = await Promise.all([userApi.list({ role: 'supplier' }), bidApi.list({})])
    suppliers.value = us
    bids.value = bs
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>机电设备厂家信息</h1>
        <p class="sub">查看平台入驻的设备生产厂家资质与联系方式，便于邀标与商务对接</p>
      </div>
      <input v-model="keyword" class="input kw" placeholder="搜索厂家名称、地区或主营业务" />
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <div v-else-if="!filtered.length" class="card empty">
      <div class="empty-icon">🏭</div>
      <p>没有匹配的厂家信息</p>
    </div>

    <div v-else class="grid">
      <article v-for="s in filtered" :key="s.id" class="card sup">
        <div class="sup-top">
          <span class="logo">{{ s.name.slice(0, 1) }}</span>
          <div class="sup-txt">
            <h3>{{ s.name }}</h3>
            <p>{{ s.address || '—' }}</p>
          </div>
        </div>
        <p class="intro">{{ s.intro || '该厂家暂未填写企业简介。' }}</p>
        <div class="sup-meta">
          <div>
            <span>联系人</span>
            <strong>{{ s.contact || '—' }}</strong>
          </div>
          <div>
            <span>联系电话</span>
            <strong>{{ s.phone || '—' }}</strong>
          </div>
          <div>
            <span>平台投标</span>
            <strong>{{ bidsOf(s.id).length }} 次</strong>
          </div>
        </div>
        <div class="sup-foot">
          <span class="since">入驻 {{ formatDate(s.createdAt) }}</span>
          <button class="btn btn-soft btn-sm" @click="detail = s">查看详情</button>
        </div>
      </article>
    </div>

    <BaseModal v-if="detail" title="设备厂家详情" width="620px" @close="detail = null">
      <div class="d-head">
        <span class="logo big">{{ detail.name.slice(0, 1) }}</span>
        <div>
          <h3>{{ detail.name }}</h3>
          <p>入驻时间 {{ formatDate(detail.createdAt) }}</p>
        </div>
      </div>
      <div class="d-grid">
        <div><span>统一社会信用代码</span><strong class="mono">{{ detail.license || '—' }}</strong></div>
        <div><span>联系人</span><strong>{{ detail.contact || '—' }}</strong></div>
        <div><span>联系电话</span><strong>{{ detail.phone || '—' }}</strong></div>
        <div><span>电子邮箱</span><strong>{{ detail.email || '—' }}</strong></div>
        <div style="grid-column: span 2">
          <span>企业地址</span><strong>{{ detail.address || '—' }}</strong>
        </div>
        <div><span>平台投标次数</span><strong>{{ bidsOf(detail.id).length }} 次</strong></div>
        <div>
          <span>累计投标金额</span>
          <strong>{{ formatMoney(bidsOf(detail.id).reduce((s, b) => s + Number(b.totalAmount || 0), 0)) }}</strong>
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
  </div>
</template>

<style scoped>
.kw {
  height: 36px;
  width: 300px;
  font-size: 13px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.sup {
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.18s, border-color 0.18s;
}

.sup:hover {
  border-color: #c9dbef;
  box-shadow: 0 12px 30px rgba(16, 32, 64, 0.08);
}

.sup-top {
  display: flex;
  gap: 11px;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2c63ac, #123a72);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.logo.big {
  width: 48px;
  height: 48px;
  font-size: 19px;
  border-radius: 12px;
}

.sup-txt {
  min-width: 0;
}

.sup-txt h3 {
  font-size: 14.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sup-txt p {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intro {
  margin-top: 14px;
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 46px;
}

.sup-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px dashed var(--line);
}

.sup-meta div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.sup-meta span {
  font-size: 11px;
  color: var(--text-3);
}

.sup-meta strong {
  font-size: 12.5px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sup-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
}

.since {
  font-size: 11.5px;
  color: var(--text-3);
}

.d-head {
  display: flex;
  gap: 13px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-soft);
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

.mono {
  font-family: Consolas, monospace;
  letter-spacing: 0.2px;
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

@media (max-width: 1180px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 760px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
