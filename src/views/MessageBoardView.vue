<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { messageApi } from '@/api'
import { authState } from '@/stores/auth'
import { toast } from '@/composables/useToast'
import { ROLE_LABEL } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const user = computed(() => authState.user)

const all = ref([])
const loading = ref(true)
const tab = ref('all')
const keyword = ref('')
const submitting = ref(false)

const form = reactive({ title: '', content: '' })
const errors = reactive({})

async function load() {
  loading.value = true
  try {
    all.value = await messageApi.list({})
  } finally {
    loading.value = false
  }
}

const rows = computed(() => {
  let list = all.value.filter(
    (m) => m.status === 'published' || (user.value && m.authorId === user.value.id)
  )
  if (tab.value === 'mine') list = list.filter((m) => user.value && m.authorId === user.value.id)
  if (tab.value === 'replied') list = list.filter((m) => m.reply)
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(kw) ||
        m.content.toLowerCase().includes(kw) ||
        m.authorName.toLowerCase().includes(kw)
    )
  }
  return list
})

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.title.trim()) errors.title = '请填写留言标题'
  else if (form.title.trim().length < 4) errors.title = '标题至少 4 个字'
  if (!form.content.trim()) errors.content = '请填写留言内容'
  else if (form.content.trim().length < 10) errors.content = '请把问题描述清楚，至少 10 个字'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!user.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  if (!validate()) return
  submitting.value = true
  try {
    await messageApi.create({ title: form.title.trim(), content: form.content.trim() }, user.value)
    toast.success('留言已提交，管理员审核通过后公开展示')
    form.title = ''
    form.content = ''
    await load()
  } catch (e) {
    toast.error(e.message)
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="board">
    <div class="page-hero">
      <div class="container">
        <h1>在线留言板</h1>
        <p>招投标疑问集中答疑区 · 答复内容对所有投标人公开</p>
      </div>
    </div>

    <div class="container body">
      <div class="layout">
        <div class="list-col">
          <div class="toolbar card">
            <div class="tabs">
              <button :class="{ on: tab === 'all' }" @click="tab = 'all'">全部留言</button>
              <button :class="{ on: tab === 'replied' }" @click="tab = 'replied'">已答复</button>
              <button v-if="user" :class="{ on: tab === 'mine' }" @click="tab = 'mine'">
                我的留言
              </button>
            </div>
            <input v-model="keyword" class="input kw" placeholder="搜索留言标题或内容" />
          </div>

          <div v-if="loading" class="sk-block"></div>

          <div v-else-if="!rows.length" class="card empty">
            <div class="empty-icon">💬</div>
            <p>暂无相关留言</p>
          </div>

          <div v-else class="msg-list">
            <article v-for="m in rows" :key="m.id" class="card msg">
              <header class="msg-head">
                <div class="who">
                  <span class="avatar">{{ m.authorName.slice(0, 1) }}</span>
                  <div>
                    <strong>{{ m.authorName }}</strong>
                    <span class="role">{{ ROLE_LABEL[m.role] || '访客' }}</span>
                  </div>
                </div>
                <div class="meta">
                  <span
                    v-if="m.status === 'pending'"
                    class="tag tag-warn"
                    title="待管理员审核"
                  >待审核</span>
                  <span v-else-if="!m.reply" class="tag tag-brand">待答复</span>
                  <span class="time">{{ m.createdAt }}</span>
                </div>
              </header>

              <h3 class="msg-title">{{ m.title }}</h3>
              <p class="msg-body">{{ m.content }}</p>

              <div v-if="m.reply" class="reply">
                <div class="reply-head">
                  <span class="badge">官方答复</span>
                  <span class="time">{{ m.replyAt }}</span>
                </div>
                <p>{{ m.reply }}</p>
              </div>
            </article>
          </div>
        </div>

        <aside class="form-col">
          <div class="card form-card">
            <h3>我要留言</h3>
            <p class="form-tip">请勿在留言中填写报价等商业秘密，涉及资质材料请联系招标单位线下提交。</p>

            <template v-if="user">
              <div class="field">
                <label class="label">留言标题<span class="req">*</span></label>
                <input
                  v-model="form.title"
                  class="input"
                  :class="{ 'is-error': errors.title }"
                  placeholder="一句话概括问题，如「投标保证金能否用保函」"
                />
                <span v-if="errors.title" class="err-msg">{{ errors.title }}</span>
              </div>
              <div class="field">
                <label class="label">留言内容<span class="req">*</span></label>
                <textarea
                  v-model="form.content"
                  class="textarea"
                  :class="{ 'is-error': errors.content }"
                  placeholder="详细描述您的问题，可注明相关招标项目编号"
                ></textarea>
                <span v-if="errors.content" class="err-msg">{{ errors.content }}</span>
                <span class="hint">{{ form.content.length }} / 500 字</span>
              </div>
              <button class="btn btn-primary btn-block" :disabled="submitting" @click="submit">
                {{ submitting ? '提交中…' : '提交留言' }}
              </button>
              <p class="note">当前身份：{{ ROLE_LABEL[user.role] }} · {{ user.name }}</p>
            </template>

            <template v-else>
              <div class="login-tip">
                <span class="lock">🔒</span>
                <p>登录后可发布留言，答复将同步展示在本页面。</p>
              </div>
              <router-link to="/login" class="btn btn-primary btn-block">立即登录</router-link>
              <router-link to="/register" class="btn btn-ghost btn-block" style="margin-top: 9px">
                注册新账号
              </router-link>
            </template>
          </div>

          <div class="card rules-card">
            <h4>留言规范</h4>
            <ul>
              <li>留言需经管理员审核后公开</li>
              <li>请勿发布与招投标无关的内容</li>
              <li>涉及具体项目请注明项目编号</li>
              <li>恶意留言将被删除并限制账号</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-hero {
  background: linear-gradient(120deg, #143d75, #1b4b8f 65%, #2760a8);
  color: #fff;
  padding: 40px 0 44px;
}
.page-hero h1 {
  font-size: 28px;
  font-weight: 650;
  letter-spacing: -0.5px;
}
.page-hero p {
  margin-top: 9px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.65);
}

.body {
  padding-top: 24px;
  padding-bottom: 40px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 336px;
  gap: 20px;
  align-items: start;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 16px;
  gap: 14px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 4px;
}

.tabs button {
  height: 32px;
  padding: 0 14px;
  border: none;
  background: transparent;
  border-radius: 7px;
  font-size: 13.5px;
  color: var(--text-2);
  cursor: pointer;
}
.tabs button:hover {
  background: #f4f6fa;
}
.tabs button.on {
  background: var(--brand-50);
  color: var(--brand);
  font-weight: 600;
}

.kw {
  height: 34px;
  width: 240px;
  font-size: 13px;
}

.msg-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.msg {
  padding: 20px 22px;
}

.msg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #eef2f8;
  color: var(--brand);
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 14px;
}

.who strong {
  font-size: 13.5px;
  display: block;
}

.role {
  font-size: 11.5px;
  color: var(--text-3);
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 11.5px;
  color: var(--text-3);
}

.msg-title {
  margin-top: 14px;
  font-size: 15.5px;
  font-weight: 600;
}

.msg-body {
  margin-top: 8px;
  font-size: 13.5px;
  line-height: 1.95;
  color: var(--text-2);
}

.reply {
  margin-top: 14px;
  background: #f7faf8;
  border: 1px solid #e2efe9;
  border-radius: 10px;
  padding: 13px 15px;
}

.reply-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 7px;
}

.badge {
  font-size: 11px;
  color: var(--ok);
  background: #e2f3ea;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.reply p {
  font-size: 13px;
  line-height: 1.9;
  color: #34504a;
}

.form-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 88px;
}

.form-card {
  padding: 22px;
}

.form-card h3 {
  font-size: 16px;
  font-weight: 600;
}

.form-tip {
  margin: 8px 0 18px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--text-3);
}

.note {
  margin-top: 11px;
  font-size: 11.5px;
  color: var(--text-3);
  text-align: center;
}

.login-tip {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f8fafd;
  border: 1px dashed var(--line);
  border-radius: 9px;
  padding: 14px;
  margin-bottom: 16px;
}

.lock {
  font-size: 15px;
}

.login-tip p {
  font-size: 12.5px;
  color: var(--text-2);
  line-height: 1.7;
}

.rules-card {
  padding: 18px 20px;
}

.rules-card h4 {
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 10px;
}

.rules-card li {
  position: relative;
  padding-left: 13px;
  font-size: 12.5px;
  color: var(--text-3);
  line-height: 2;
}

.rules-card li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 11px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #c3ccda;
}

.sk-block {
  height: 300px;
  border-radius: 12px;
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

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .form-col {
    position: static;
  }
}
</style>
