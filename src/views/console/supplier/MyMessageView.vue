<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { messageApi } from '@/api'
import BaseModal from '@/components/BaseModal.vue'
import { authState } from '@/stores/auth'
import { toast } from '@/composables/useToast'

const user = computed(() => authState.user)
const rows = ref([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const form = reactive({ title: '', content: '' })
const errors = reactive({})

const published = computed(() => rows.value.filter((m) => m.status === 'published').length)
const replied = computed(() => rows.value.filter((m) => m.reply).length)

async function load() {
  loading.value = true
  try {
    rows.value = await messageApi.list({ authorId: user.value.id })
  } finally {
    loading.value = false
  }
}

function openForm() {
  form.title = ''
  form.content = ''
  Object.keys(errors).forEach((k) => delete errors[k])
  showForm.value = true
}

async function submit() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.title.trim()) errors.title = '请填写留言标题'
  if (!form.content.trim()) errors.content = '请填写留言内容'
  else if (form.content.trim().length < 10) errors.content = '请把问题描述清楚，至少 10 个字'
  if (Object.keys(errors).length) return

  submitting.value = true
  try {
    await messageApi.create({ title: form.title.trim(), content: form.content.trim() }, user.value)
    toast.success('留言已提交，等待管理员审核')
    showForm.value = false
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
  <div>
    <div class="page-head">
      <div>
        <h1>我的留言</h1>
        <p class="sub">查看本人发布的问题与官方答复，留言审核通过后对全平台公开</p>
      </div>
      <button class="btn btn-primary" @click="openForm">＋ 发布留言</button>
    </div>

    <div class="summary card">
      <div><span>留言总数</span><strong>{{ rows.length }}</strong></div>
      <div><span>已公开</span><strong>{{ published }}</strong></div>
      <div><span>已答复</span><strong>{{ replied }}</strong></div>
      <div class="tip">提示：涉及具体项目的疑问，请在内容中注明招标项目编号，便于答复。</div>
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <div v-else-if="!rows.length" class="card empty">
      <div class="empty-icon">💬</div>
      <p>还没有发布过留言</p>
      <button class="btn btn-soft btn-sm" style="margin-top: 14px" @click="openForm">
        发布第一条留言
      </button>
    </div>

    <div v-else class="list">
      <article v-for="m in rows" :key="m.id" class="card msg">
        <header class="msg-head">
          <h3>{{ m.title }}</h3>
          <div class="badges">
            <span v-if="m.status === 'pending'" class="tag tag-warn">待审核</span>
            <span v-else-if="!m.reply" class="tag tag-brand">已公开 · 待答复</span>
            <span v-else class="tag tag-ok">已答复</span>
            <span class="time">{{ m.createdAt }}</span>
          </div>
        </header>
        <p class="body">{{ m.content }}</p>
        <div v-if="m.reply" class="reply">
          <div class="reply-head">
            <span class="badge">官方答复</span>
            <span class="time">{{ m.replyAt }}</span>
          </div>
          <p>{{ m.reply }}</p>
        </div>
        <p v-else-if="m.status === 'pending'" class="pending-tip">
          留言已提交，管理员审核通过后公开展示，请耐心等待。
        </p>
      </article>
    </div>

    <BaseModal v-if="showForm" title="发布留言" width="560px" @close="showForm = false">
      <div class="field">
        <label class="label">留言标题<span class="req">*</span></label>
        <input
          v-model="form.title"
          class="input"
          :class="{ 'is-error': errors.title }"
          placeholder="一句话概括问题"
        />
        <span v-if="errors.title" class="err-msg">{{ errors.title }}</span>
      </div>
      <div class="field">
        <label class="label">留言内容<span class="req">*</span></label>
        <textarea
          v-model="form.content"
          class="textarea"
          :class="{ 'is-error': errors.content }"
          placeholder="详细描述问题，如：JD-2026-0101 项目中 828D 系统可否用同等档次数控系统替代？"
        ></textarea>
        <span v-if="errors.content" class="err-msg">{{ errors.content }}</span>
        <span class="hint">{{ form.content.length }} 字</span>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="showForm = false">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? '提交中…' : '提交留言' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: 44px;
  padding: 18px 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.summary div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary span {
  font-size: 11.5px;
  color: var(--text-3);
}

.summary strong {
  font-size: 22px;
  font-weight: 650;
  letter-spacing: -0.4px;
  color: var(--brand);
}

.summary .tip {
  margin-left: auto;
  font-size: 12px;
  color: var(--text-3);
  max-width: 380px;
  line-height: 1.7;
  display: block;
}

.list {
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
  gap: 14px;
  flex-wrap: wrap;
}

.msg-head h3 {
  font-size: 15px;
  font-weight: 600;
}

.badges {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time {
  font-size: 11.5px;
  color: var(--text-3);
}

.body {
  margin-top: 10px;
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

.pending-tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--warn);
  background: var(--warn-50);
  border-radius: 8px;
  padding: 9px 12px;
}
</style>
