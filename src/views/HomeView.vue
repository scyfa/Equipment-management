<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { tenderApi, messageApi, statsApi } from '@/api'
import StatusTag from '@/components/StatusTag.vue'
import { formatDate, formatWan, daysUntil } from '@/utils/format'
import { authState, consoleHome } from '@/stores/auth'

const router = useRouter()
const keyword = ref('')
const tenders = ref([])
const messages = ref([])
const stats = ref({ tenders: 0, openTenders: 0, suppliers: 0, tenderers: 0, bids: 0, amount: 0 })
const loading = ref(true)

const flow = [
  { no: '01', title: '注册认证', desc: '厂家与招标单位分别注册，填写企业基本信息与统一社会信用代码。' },
  { no: '02', title: '发布公告', desc: '招标单位在线发布机电设备招标信息，明确型号、数量、截止日期与保证金。' },
  { no: '03', title: '在线投标', desc: '厂家检索招标公告，填写投标信息表单并提交，系统自动关联项目编号。' },
  { no: '04', title: '评标对接', desc: '招标单位查看投标单位与报价，平台留存全过程记录，便于归档与审计。' }
]

const roles = [
  {
    key: 'supplier',
    tag: '设备厂家',
    title: '我要投标',
    desc: '查询招标公告、提交投标资料、在线留言答疑',
    to: '/register',
    action: '厂家注册'
  },
  {
    key: 'tenderer',
    tag: '招标单位',
    title: '我要招标',
    desc: '发布与管理招标信息、查看投标情况与厂家资质',
    to: '/register?role=tenderer',
    action: '单位注册'
  },
  {
    key: 'admin',
    tag: '平台管理',
    title: '后台维护',
    desc: '厂家与招标单位信息维护、留言板审核与内容管理',
    to: '/login',
    action: '管理员登录'
  }
]

function search() {
  router.push({ path: '/tenders', query: keyword.value ? { keyword: keyword.value } : {} })
}

function goRole(item) {
  if (item.key === 'admin') {
    router.push('/login')
    return
  }
  if (authState.user) router.push(consoleHome(authState.user.role))
  else router.push(item.to)
}

onMounted(async () => {
  try {
    const [list, ov, msgs] = await Promise.all([
      tenderApi.list({ page: 1, pageSize: 8, sort: 'deadline' }),
      statsApi.overview(),
      messageApi.list({ status: 'published' })
    ])
    tenders.value = list.items.filter((t) => daysUntil(t.deadline) >= 0).slice(0, 3)
    stats.value = ov
    messages.value = msgs.slice(0, 3)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="container hero-inner">
        <div class="hero-copy">
          <span class="eyebrow">MECHANICAL &amp; ELECTRICAL EQUIPMENT BIDDING</span>
          <h1>机电设备<br /><em>在线招投标</em>平台</h1>
          <p class="lead">
            面向机电设备生产厂家与招标单位的一体化招投标服务：公告发布、在线投标、
            资质查询与留言答疑，全过程留痕、公开透明。
          </p>
          <div class="searchbar">
            <span class="s-ico">🔍</span>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索设备名称、招标项目编号，如「数控车床」「JD-2026-0101」"
              @keyup.enter="search"
            />
            <button class="btn btn-primary" @click="search">查询公告</button>
          </div>
          <div class="hero-metrics">
            <div>
              <strong>{{ stats.openTenders }}</strong>
              <span>在招项目</span>
            </div>
            <div>
              <strong>{{ stats.suppliers }}</strong>
              <span>入驻厂家</span>
            </div>
            <div>
              <strong>{{ stats.bids }}</strong>
              <span>累计投标</span>
            </div>
            <div>
              <strong>{{ formatWan(stats.amount) }}</strong>
              <span>投标总额</span>
            </div>
          </div>
        </div>

        <div class="hero-card rise">
          <div class="hc-head">
            <span class="dot"></span>
            <strong>临近截止</strong>
            <router-link to="/tenders" class="hc-more">全部 →</router-link>
          </div>
          <ul class="hc-list">
            <li v-for="t in tenders.slice(0, 3)" :key="t.id">
              <router-link :to="`/tenders/${t.id}`">
                <div class="hc-title">{{ t.name }}</div>
                <div class="hc-meta">
                  <span class="code-text">{{ t.code }}</span>
                  <span class="hc-day">
                    {{ daysUntil(t.deadline) >= 0 ? `剩 ${daysUntil(t.deadline)} 天` : '已截止' }}
                  </span>
                </div>
              </router-link>
            </li>
          </ul>
          <div class="hc-foot">
            保证金以万元计 · 数据实时更新
          </div>
        </div>
      </div>
    </section>

    <!-- 角色入口 -->
    <section class="section roles-section">
      <div class="container">
        <div class="role-grid">
          <article v-for="r in roles" :key="r.key" class="role-card" @click="goRole(r)">
            <span class="role-tag">{{ r.tag }}</span>
            <h3>{{ r.title }}</h3>
            <p>{{ r.desc }}</p>
            <span class="role-link">{{ r.action }} →</span>
          </article>
        </div>
      </div>
    </section>

    <!-- 最新公告 -->
    <section class="section">
      <div class="container">
        <div class="sec-head">
          <div>
            <h2>最新招标公告</h2>
            <p>按截止日期排序，优先展示临近开标项目</p>
          </div>
          <router-link to="/tenders" class="btn btn-ghost btn-sm">查看全部公告</router-link>
        </div>

        <div v-if="loading" class="loading-rows">
          <div v-for="i in 3" :key="i" class="skeleton"></div>
        </div>

        <div v-else class="tender-grid">
          <router-link
            v-for="t in tenders"
            :key="t.id"
            :to="`/tenders/${t.id}`"
            class="tender-card"
          >
            <div class="tc-top">
              <span class="code-text">{{ t.code }}</span>
              <StatusTag :deadline="t.deadline" show-days />
            </div>
            <h3>{{ t.name }}</h3>
            <p class="tc-model">{{ t.model }}</p>
            <div class="tc-specs">
              <span><i>数量</i>{{ t.quantity }} {{ t.unit }}</span>
              <span><i>保证金</i>{{ formatWan(t.deposit) }}</span>
              <span><i>截止</i>{{ formatDate(t.deadline) }}</span>
            </div>
            <div class="tc-foot">
              <span class="org">{{ t.tendererName }}</span>
              <span class="bids">{{ t.bidCount }} 家投标</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 流程 -->
    <section class="section flow-section">
      <div class="container">
        <div class="sec-head center">
          <div>
            <h2>四步完成一次招投标</h2>
            <p>从注册认证到评标对接，全流程线上化</p>
          </div>
        </div>
        <div class="flow-grid">
          <div v-for="f in flow" :key="f.no" class="flow-item">
            <span class="fno">{{ f.no }}</span>
            <h4>{{ f.title }}</h4>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 留言精选 -->
    <section class="section">
      <div class="container qa-wrap">
        <div class="qa-left">
          <h2>在线答疑</h2>
          <p>
            招投标过程中的技术参数、保证金、交货期等疑问，可在留言板提出，
            由招标单位或平台管理员统一答复，答复内容对所有投标人公开。
          </p>
          <router-link to="/messages" class="btn btn-primary">进入留言板</router-link>
        </div>
        <div class="qa-right">
          <article v-for="m in messages" :key="m.id" class="qa-item card">
            <div class="qa-q">
              <span class="qmark">问</span>
              <div>
                <h4>{{ m.title }}</h4>
                <p>{{ m.content }}</p>
              </div>
            </div>
            <div v-if="m.reply" class="qa-a">
              <span class="amark">答</span>
              <p>{{ m.reply }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-wrap">
      <div class="container cta">
        <div>
          <h2>还没有平台账号？</h2>
          <p>设备厂家与招标单位均可免费注册，注册后即可发布或参与机电设备招标项目。</p>
        </div>
        <div class="cta-btns">
          <router-link to="/register" class="btn btn-lg cta-main">注册成为设备厂家</router-link>
          <router-link to="/register?role=tenderer" class="btn btn-lg cta-sub">
            注册成为招标单位
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------------- HERO ---------------- */
.hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0d2a55 0%, #143d75 52%, #1b4b8f 100%);
  color: #fff;
  padding: 64px 0 72px;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(circle at 65% 40%, #000 10%, transparent 78%);
  -webkit-mask-image: radial-gradient(circle at 65% 40%, #000 10%, transparent 78%);
}

.hero::after {
  content: '';
  position: absolute;
  width: 560px;
  height: 560px;
  right: -160px;
  top: -220px;
  background: radial-gradient(circle, rgba(217, 154, 43, 0.22), transparent 62%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 56px;
  align-items: center;
}

.eyebrow {
  font-size: 10.5px;
  letter-spacing: 2.4px;
  color: rgba(255, 255, 255, 0.5);
}

.hero-copy h1 {
  margin-top: 16px;
  font-size: 46px;
  line-height: 1.22;
  font-weight: 700;
  letter-spacing: -1px;
}

.hero-copy h1 em {
  font-style: normal;
  background: linear-gradient(90deg, #f0c071, #d99a2b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lead {
  margin-top: 18px;
  max-width: 520px;
  font-size: 14.5px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.72);
}

.searchbar {
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 12px;
  padding: 7px 7px 7px 14px;
  max-width: 620px;
  box-shadow: 0 14px 38px rgba(6, 20, 44, 0.32);
}

.searchbar .s-ico {
  font-size: 14px;
  opacity: 0.6;
}

.searchbar input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--text);
  background: transparent;
  height: 38px;
}

.searchbar input::placeholder {
  color: #a8b2c1;
}

.hero-metrics {
  display: flex;
  gap: 40px;
  margin-top: 34px;
  flex-wrap: wrap;
}

.hero-metrics div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hero-metrics strong {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.4px;
}

.hero-metrics span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.hero-card {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  backdrop-filter: blur(14px);
  padding: 20px;
}

.hc-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.hc-head .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #56d3a0;
  box-shadow: 0 0 0 4px rgba(86, 211, 160, 0.16);
}

.hc-more {
  margin-left: auto;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}
.hc-more:hover {
  color: #fff;
}

.hc-list li + li {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.hc-list a {
  display: block;
  padding: 13px 2px;
  transition: transform 0.16s;
}
.hc-list a:hover {
  transform: translateX(3px);
}

.hc-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.hc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.hc-meta .code-text {
  color: #9dc0ef;
}

.hc-day {
  color: #f0c071;
}

.hc-foot {
  margin-top: 12px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
}

/* ---------------- 角色 ---------------- */
.roles-section {
  margin-top: -34px;
  position: relative;
  z-index: 2;
  padding-top: 0 !important;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.role-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 24px 24px 20px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(16, 32, 64, 0.07);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.role-card:hover {
  transform: translateY(-4px);
  border-color: #c9dbef;
  box-shadow: 0 18px 40px rgba(16, 32, 64, 0.12);
}

.role-tag {
  font-size: 11.5px;
  color: var(--brand);
  background: var(--brand-50);
  padding: 3px 9px;
  border-radius: 5px;
  font-weight: 500;
}

.role-card h3 {
  margin-top: 14px;
  font-size: 19px;
  font-weight: 600;
}

.role-card p {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-2);
  line-height: 1.8;
  min-height: 47px;
}

.role-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 13px;
  color: var(--brand);
  font-weight: 500;
}

/* ---------------- 通用 section ---------------- */
.section {
  padding: 62px 0 10px;
}

.sec-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.sec-head h2 {
  font-size: 26px;
  font-weight: 650;
  letter-spacing: -0.5px;
}

.sec-head p {
  margin-top: 7px;
  font-size: 13.5px;
  color: var(--text-3);
}

.sec-head.center {
  justify-content: center;
  text-align: center;
}

/* ---------------- 公告卡片 ---------------- */
.tender-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.tender-card {
  display: block;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 20px;
  transition: all 0.2s;
}

.tender-card:hover {
  border-color: #c3d8ef;
  box-shadow: 0 14px 34px rgba(16, 32, 64, 0.09);
  transform: translateY(-3px);
}

.tc-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.tender-card h3 {
  margin-top: 13px;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.tc-model {
  margin-top: 5px;
  font-size: 12.5px;
  color: var(--text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-specs {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
  font-size: 12.5px;
  color: var(--text-2);
}

.tc-specs i {
  font-style: normal;
  color: var(--text-3);
  margin-right: 4px;
}

.tc-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  font-size: 12px;
}

.org {
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.bids {
  color: var(--brand);
  background: var(--brand-50);
  padding: 2px 8px;
  border-radius: 4px;
}

.skeleton {
  height: 176px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef1f6 25%, #f7f9fc 50%, #eef1f6 75%);
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

/* ---------------- 流程 ---------------- */
.flow-section {
  background: #fff;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 62px 0 66px;
  margin-top: 62px;
}

.flow-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  margin-top: 10px;
}

.flow-item {
  position: relative;
  padding: 0 26px;
  border-left: 1px dashed var(--line);
}

.flow-item:first-child {
  border-left: none;
  padding-left: 0;
}

.fno {
  font-size: 30px;
  font-weight: 700;
  color: #dbe4f0;
  letter-spacing: -1px;
}

.flow-item h4 {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
}

.flow-item p {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.85;
  color: var(--text-2);
}

/* ---------------- 答疑 ---------------- */
.qa-wrap {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.5fr);
  gap: 48px;
  align-items: start;
}

.qa-left h2 {
  font-size: 26px;
  font-weight: 650;
  letter-spacing: -0.5px;
}

.qa-left p {
  margin: 14px 0 22px;
  font-size: 13.5px;
  line-height: 1.95;
  color: var(--text-2);
}

.qa-right {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.qa-item {
  padding: 18px 20px;
}

.qa-q,
.qa-a {
  display: flex;
  gap: 11px;
}

.qa-a {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--line);
}

.qmark,
.amark {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.qmark {
  background: var(--brand-50);
  color: var(--brand);
}
.amark {
  background: var(--ok-50);
  color: var(--ok);
}

.qa-q h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
}

.qa-q p,
.qa-a p {
  font-size: 13px;
  line-height: 1.85;
  color: var(--text-2);
}

/* ---------------- CTA ---------------- */
.cta-wrap {
  padding: 64px 0 0;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding: 40px 44px;
  border-radius: 18px;
  background: linear-gradient(120deg, #123a72, #1b4b8f 60%, #2c63ac);
  color: #fff;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
}

.cta::after {
  content: '';
  position: absolute;
  right: -60px;
  bottom: -100px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  border: 40px solid rgba(255, 255, 255, 0.05);
}

.cta h2 {
  font-size: 24px;
  font-weight: 650;
  letter-spacing: -0.4px;
}

.cta p {
  margin-top: 9px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 480px;
  line-height: 1.8;
}

.cta-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.cta-main {
  background: #fff;
  color: var(--brand);
  font-weight: 600;
}
.cta-main:hover {
  background: #f2f7ff;
}

.cta-sub {
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
}
.cta-sub:hover {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 1000px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 34px;
  }
  .hero-copy h1 {
    font-size: 36px;
  }
  .hero-card {
    max-width: 460px;
  }
  .role-grid,
  .tender-grid {
    grid-template-columns: 1fr;
  }
  .flow-grid {
    grid-template-columns: 1fr 1fr;
    row-gap: 30px;
  }
  .flow-item:nth-child(3) {
    border-left: none;
    padding-left: 0;
  }
  .qa-wrap {
    grid-template-columns: 1fr;
    gap: 26px;
  }
}
</style>
