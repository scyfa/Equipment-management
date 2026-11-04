<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bidApi, tenderApi, userApi } from '@/api'
import StatusTag from '@/components/StatusTag.vue'
import BidFormModal from '@/components/BidFormModal.vue'
import { authState } from '@/stores/auth'
import { toast } from '@/composables/useToast'
import { daysUntil, formatDate, formatMoney, formatWan } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const tender = ref(null)
const owner = ref(null)
const myBid = ref(null)
const loading = ref(true)
const errorMsg = ref('')
const showBidForm = ref(false)

const user = computed(() => authState.user)
const days = computed(() => daysUntil(tender.value?.deadline))
const closed = computed(() => days.value !== null && days.value < 0)

const infoRows = computed(() => {
  if (!tender.value) return []
  const t = tender.value
  return [
    { label: '招标项目编号', value: t.code, mono: true },
    { label: '机电设备名称', value: t.name },
    { label: '型号', value: t.model },
    { label: '采购数量', value: `${t.quantity} ${t.unit}` },
    { label: '招标截止日期', value: formatDate(t.deadline) },
    { label: '投标保证金', value: formatMoney(t.deposit) },
    { label: '设备类别', value: t.category },
    { label: '交付地点', value: t.region || '见招标文件' },
    { label: '发布日期', value: formatDate(t.createdAt) }
  ]
})

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    const t = await tenderApi.get(route.params.id)
    tender.value = t
    owner.value = await userApi.get(t.tendererId)
    if (user.value?.role === 'supplier') {
      const mine = await bidApi.list({ tenderId: t.id, supplierId: user.value.id })
      myBid.value = mine[0] || null
    }
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

function openBid() {
  if (!user.value) {
    toast.info('请先登录后再投标')
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (user.value.role !== 'supplier') {
    toast.error('仅设备生产厂家账号可参与投标')
    return
  }
  if (closed.value) {
    toast.error('该项目已过投标截止时间')
    return
  }
  showBidForm.value = true
}

function onBidDone() {
  showBidForm.value = false
  load()
}

onMounted(load)
</script>

<template>
  <div class="detail-page">
    <div class="container crumb-bar">
      <router-link to="/">首页</router-link>
      <span>/</span>
      <router-link to="/tenders">招标公告</router-link>
      <span>/</span>
      <em>{{ tender?.name || '详情' }}</em>
    </div>

    <div v-if="loading" class="container"><div class="loading-block"></div></div>

    <div v-else-if="errorMsg" class="container">
      <div class="card empty">
        <div class="empty-icon">🔍</div>
        <p>{{ errorMsg }}</p>
        <button class="btn btn-soft btn-sm" style="margin-top: 14px" @click="router.push('/tenders')">
          返回公告列表
        </button>
      </div>
    </div>

    <div v-else class="container body">
      <!-- 标题区 -->
      <header class="head card">
        <div class="head-main">
          <div class="head-tags">
            <span class="code-text">{{ tender.code }}</span>
            <StatusTag :deadline="tender.deadline" show-days />
            <span class="tag tag-brand">{{ tender.category }}</span>
          </div>
          <h1>{{ tender.name }}</h1>
          <p class="model">型号规格：{{ tender.model }}</p>
          <div class="head-meta">
            <span>招标单位：{{ tender.tendererName }}</span>
            <span>发布时间：{{ formatDate(tender.createdAt) }}</span>
            <span>已有 {{ tender.bidCount }} 家单位投标</span>
          </div>
        </div>
        <div class="countdown" :class="{ over: closed }">
          <span class="cd-label">{{ closed ? '投标已截止' : '距投标截止' }}</span>
          <strong v-if="!closed">{{ days }}<small>天</small></strong>
          <strong v-else>—</strong>
          <span class="cd-date">{{ formatDate(tender.deadline) }}</span>
        </div>
      </header>

      <div class="layout">
        <div class="main-col">
          <section class="card block">
            <h2 class="block-title">招标基本信息</h2>
            <div class="info-grid">
              <div v-for="row in infoRows" :key="row.label" class="info-item">
                <span class="k">{{ row.label }}</span>
                <span class="v" :class="{ mono: row.mono }">{{ row.value || '—' }}</span>
              </div>
            </div>
          </section>

          <section class="card block">
            <h2 class="block-title">包装要求</h2>
            <p class="prose">{{ tender.packing || '详见招标文件。' }}</p>
          </section>

          <section class="card block">
            <h2 class="block-title">技术要求与采购说明</h2>
            <p class="prose">{{ tender.description || '详见招标文件。' }}</p>
          </section>

          <section v-if="owner" class="card block">
            <h2 class="block-title">招标单位信息</h2>
            <div class="owner">
              <span class="owner-logo">{{ owner.name.slice(0, 1) }}</span>
              <div class="owner-txt">
                <strong>{{ owner.name }}</strong>
                <p>{{ owner.intro || '暂无简介' }}</p>
                <div class="owner-lines">
                  <span>联系人：{{ owner.contact || '—' }}</span>
                  <span>电话：{{ owner.phone || '—' }}</span>
                  <span>地址：{{ owner.address || '—' }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="side-col">
          <div class="card side-card">
            <h3>关键信息</h3>
            <ul class="key-list">
              <li>
                <span>投标保证金</span>
                <strong class="hl">{{ formatMoney(tender.deposit) }}</strong>
              </li>
              <li>
                <span>采购数量</span>
                <strong>{{ tender.quantity }} {{ tender.unit }}</strong>
              </li>
              <li>
                <span>截止日期</span>
                <strong>{{ formatDate(tender.deadline) }}</strong>
              </li>
              <li>
                <span>交付地点</span>
                <strong>{{ tender.region || '见招标文件' }}</strong>
              </li>
            </ul>

            <template v-if="myBid">
              <div class="bid-done">
                <span class="done-ico">✓</span>
                <div>
                  <strong>您已提交投标</strong>
                  <p>投标日期 {{ myBid.bidDate }} · {{ formatWan(myBid.totalAmount) }}</p>
                </div>
              </div>
              <router-link to="/console/supplier/bids" class="btn btn-soft btn-block">
                查看我的投标
              </router-link>
            </template>
            <button v-else class="btn btn-primary btn-block" :disabled="closed" @click="openBid">
              {{ closed ? '已过投标截止时间' : '我要投标' }}
            </button>

            <router-link to="/messages" class="btn btn-ghost btn-block ask-btn">
              在线咨询 / 留言
            </router-link>
            <p class="side-tip">
              投标前请仔细阅读技术要求与包装要求，如有疑问请在留言板提出，答复对所有投标人公开。
            </p>
          </div>
        </aside>
      </div>
    </div>

    <BidFormModal
      v-if="showBidForm"
      :tender="tender"
      @close="showBidForm = false"
      @done="onBidDone"
    />
  </div>
</template>

<style scoped>
.detail-page {
  padding-bottom: 50px;
}

.crumb-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 20px;
  font-size: 12.5px;
  color: var(--text-3);
}

.crumb-bar a:hover {
  color: var(--brand);
}

.crumb-bar em {
  font-style: normal;
  color: var(--text-2);
}

.body {
  padding-top: 16px;
}

.loading-block {
  height: 420px;
  margin-top: 18px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef1f6 25%, #f8fafc 50%, #eef1f6 75%);
  background-size: 200% 100%;
  animation: shine 1.2s infinite linear;
}

@keyframes shine {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  padding: 26px 28px;
  border-top: 3px solid var(--brand);
}

.head-tags {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.head h1 {
  margin-top: 14px;
  font-size: 27px;
  font-weight: 650;
  letter-spacing: -0.6px;
}

.model {
  margin-top: 7px;
  font-size: 13.5px;
  color: var(--text-2);
}

.head-meta {
  display: flex;
  gap: 26px;
  flex-wrap: wrap;
  margin-top: 16px;
  font-size: 12.5px;
  color: var(--text-3);
}

.countdown {
  flex-shrink: 0;
  width: 148px;
  border-radius: 12px;
  background: linear-gradient(150deg, #f4f8ff, #eaf1fb);
  border: 1px solid #dbe7f7;
  padding: 16px 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: fit-content;
}

.cd-label {
  font-size: 11.5px;
  color: var(--brand);
}

.countdown strong {
  font-size: 34px;
  font-weight: 700;
  color: var(--brand);
  line-height: 1.1;
  letter-spacing: -1px;
}

.countdown small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 2px;
  color: var(--text-2);
}

.cd-date {
  font-size: 11.5px;
  color: var(--text-3);
}

.countdown.over {
  background: #f6f7f9;
  border-color: var(--line);
}
.countdown.over .cd-label {
  color: var(--text-3);
}
.countdown.over strong {
  color: var(--text-3);
  font-size: 26px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 306px;
  gap: 20px;
  margin-top: 20px;
  align-items: start;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.block {
  padding: 24px 26px;
}

.block-title {
  font-size: 15.5px;
  font-weight: 600;
  padding-left: 11px;
  border-left: 3px solid var(--brand);
  line-height: 1.1;
  margin-bottom: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.info-item {
  display: flex;
  gap: 14px;
  padding: 11px 0;
  border-bottom: 1px dashed var(--line-soft);
  font-size: 13.5px;
}

.info-item:nth-last-child(-n + 2) {
  border-bottom: none;
}

.info-item .k {
  width: 104px;
  flex-shrink: 0;
  color: var(--text-3);
  font-size: 13px;
}

.info-item .v {
  color: var(--text);
  font-weight: 500;
}

.info-item .v.mono {
  font-family: "JetBrains Mono", Consolas, monospace;
  color: var(--brand);
  letter-spacing: 0.3px;
}

.prose {
  font-size: 13.8px;
  line-height: 2;
  color: var(--text-2);
  white-space: pre-wrap;
}

.owner {
  display: flex;
  gap: 16px;
}

.owner-logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2c63ac, #123a72);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.owner-txt strong {
  font-size: 14.5px;
}

.owner-txt p {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.85;
  color: var(--text-2);
}

.owner-lines {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--text-3);
}

.side-col {
  position: sticky;
  top: 88px;
}

.side-card {
  padding: 22px;
}

.side-card h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 14px;
}

.key-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px dashed var(--line-soft);
  font-size: 13px;
}

.key-list li span {
  color: var(--text-3);
}

.key-list li strong {
  font-weight: 600;
}

.key-list li .hl {
  color: var(--accent);
  font-size: 15px;
}

.side-card .btn {
  margin-top: 16px;
}

.ask-btn {
  margin-top: 9px !important;
}

.bid-done {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 16px;
  background: var(--ok-50);
  border: 1px solid #cfeade;
  border-radius: 10px;
  padding: 12px;
}

.done-ico {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ok);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  flex-shrink: 0;
}

.bid-done strong {
  font-size: 13px;
  color: var(--ok);
}

.bid-done p {
  font-size: 11.5px;
  color: var(--text-2);
  margin-top: 2px;
}

.side-tip {
  margin-top: 14px;
  font-size: 11.5px;
  line-height: 1.85;
  color: var(--text-3);
}

@media (max-width: 940px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side-col {
    position: static;
  }
  .head {
    flex-direction: column;
  }
  .countdown {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
