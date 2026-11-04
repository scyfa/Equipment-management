<script setup>
import { computed, onMounted, ref } from 'vue'
import { messageApi } from '@/api'
import BaseModal from '@/components/BaseModal.vue'
import { confirm } from '@/composables/useConfirm'
import { toast } from '@/composables/useToast'
import { ROLE_LABEL } from '@/utils/format'

const rows = ref([])
const loading = ref(true)
const tab = ref('pending')
const keyword = ref('')

const replying = ref(null)
const replyText = ref('')
const saving = ref(false)

const filtered = computed(() => {
  let list = [...rows.value]
  if (tab.value === 'pending') list = list.filter((m) => m.status === 'pending')
  if (tab.value === 'published') list = list.filter((m) => m.status === 'published')
  if (tab.value === 'unreplied') list = list.filter((m) => !m.reply)
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    list = list.filter(
      (m) => m.title.toLowerCase().includes(kw) || m.authorName.toLowerCase().includes(kw)
    )
  }
  return list
})

const counts = computed(() => ({
  all: rows.value.length,
  pending: rows.value.filter((m) => m.status === 'pending').length,
  published: rows.value.filter((m) => m.status === 'published').length,
  unreplied: rows.value.filter((m) => !m.reply).length
}))

async function load() {
  loading.value = true
  try {
    rows.value = await messageApi.list({})
  } finally {
    loading.value = false
  }
}

async function approve(m) {
  try {
    const updated = await messageApi.setStatus(m.id, 'published')
    const idx = rows.value.findIndex((r) => r.id === m.id)
    if (idx > -1) rows.value[idx] = updated
    toast.success('已通过审核，留言已公开')
  } catch (e) {
    toast.error(e.message)
  }
}

async function hide(m) {
  try {
    const updated = await messageApi.setStatus(m.id, 'pending')
    const idx = rows.value.findIndex((r) => r.id === m.id)
    if (idx > -1) rows.value[idx] = updated
    toast.info('已取消公开，留言转为待审核')
  } catch (e) {
    toast.error(e.message)
  }
}

function openReply(m) {
  replying.value = m
  replyText.value = m.reply || ''
}

async function saveReply() {
  if (!replyText.value.trim()) {
    toast.error('答复内容不能为空')
    return
  }
  saving.value = true
  try {
    const updated = await messageApi.reply(replying.value.id, replyText.value.trim())
    const idx = rows.value.findIndex((r) => r.id === updated.id)
    if (idx > -1) rows.value[idx] = updated
    toast.success('答复已发布，留言同步公开')
    replying.value = null
  } catch (e) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}

async function remove(m) {
  const ok = await confirm({
    title: '删除留言',
    message: `确定删除「${m.title}」吗？删除后留言与答复将一并移除，不可恢复。`,
    confirmText: '删除',
    danger: true
  })
  if (!ok) return
  try {
    await messageApi.remove(m.id)
    rows.value = rows.value.filter((r) => r.id !== m.id)
    toast.success('留言已删除')
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
        <h1>留言板管理</h1>
        <p class="sub">审核厂家留言、发布官方答复或删除不合规内容</p>
      </div>
      <span class="pending-tip" :class="{ on: counts.pending > 0 }">
        待审核 {{ counts.pending }} 条
      </span>
    </div>

    <div class="card toolbar">
      <div class="tabs">
        <button :class="{ on: tab === 'pending' }" @click="tab = 'pending'">
          待审核 <em>{{ counts.pending }}</em>
        </button>
        <button :class="{ on: tab === 'published' }" @click="tab = 'published'">
          已公开 <em>{{ counts.published }}</em>
        </button>
        <button :class="{ on: tab === 'unreplied' }" @click="tab = 'unreplied'">
          待答复 <em>{{ counts.unreplied }}</em>
        </button>
        <button :class="{ on: tab === 'all' }" @click="tab = 'all'">
          全部 <em>{{ counts.all }}</em>
        </button>
      </div>
      <input v-model="keyword" class="input kw" placeholder="搜索留言标题或留言人" />
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <div v-else-if="!filtered.length" class="card empty">
      <div class="empty-icon">✅</div>
      <p>该分类下暂无需处理的留言</p>
    </div>

    <div v-else class="list">
      <article v-for="m in filtered" :key="m.id" class="card item">
        <header class="i-head">
          <div class="who">
            <span class="avatar">{{ m.authorName.slice(0, 1) }}</span>
            <div>
              <strong>{{ m.authorName }}</strong>
              <span class="role">{{ ROLE_LABEL[m.role] || '访客' }} · {{ m.createdAt }}</span>
            </div>
          </div>
          <div class="badges">
            <span v-if="m.status === 'pending'" class="tag tag-warn">待审核</span>
            <span v-else class="tag tag-ok">已公开</span>
            <span v-if="!m.reply" class="tag tag-brand">未答复</span>
          </div>
        </header>

        <h3 class="i-title">{{ m.title }}</h3>
        <p class="i-body">{{ m.content }}</p>

        <div v-if="m.reply" class="reply">
          <div class="r-head">
            <span class="badge">官方答复</span>
            <span class="dim">{{ m.replyAt }}</span>
          </div>
          <p>{{ m.reply }}</p>
        </div>

        <footer class="i-foot">
          <button v-if="m.status === 'pending'" class="btn btn-primary btn-sm" @click="approve(m)">
            审核通过
          </button>
          <button v-else class="btn btn-ghost btn-sm" @click="hide(m)">取消公开</button>
          <button class="btn btn-soft btn-sm" @click="openReply(m)">
            {{ m.reply ? '修改答复' : '答复留言' }}
          </button>
          <button class="btn btn-danger btn-sm" @click="remove(m)">删除</button>
        </footer>
      </article>
    </div>

    <BaseModal
      v-if="replying"
      :title="replying.reply ? '修改答复' : '答复留言'"
      width="560px"
      @close="replying = null"
    >
      <div class="rp-q">
        <span class="qmark">问</span>
        <div>
          <strong>{{ replying.title }}</strong>
          <p>{{ replying.content }}</p>
        </div>
      </div>
      <div class="field" style="margin-top: 18px">
        <label class="label">答复内容<span class="req">*</span></label>
        <textarea
          v-model="replyText"
          class="textarea"
          placeholder="答复内容将对所有投标人公开，请准确、完整地表述"
        ></textarea>
        <span class="hint">发布答复后该留言将自动转为「已公开」状态</span>
      </div>
      <template #footer>
        <button class="btn btn-ghost" @click="replying = null">取消</button>
        <button class="btn btn-primary" :disabled="saving" @click="saveReply">
          {{ saving ? '发布中…' : '发布答复' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.pending-tip {
  font-size: 12.5px;
  color: var(--text-3);
  background: #f1f3f7;
  padding: 6px 13px;
  border-radius: 8px;
}

.pending-tip.on {
  background: var(--danger-50);
  color: var(--danger);
  font-weight: 500;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 14px;
  gap: 14px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tabs button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 13px;
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

.tabs em {
  font-style: normal;
  font-size: 11.5px;
  background: #e9edf5;
  color: var(--text-2);
  border-radius: 8px;
  padding: 0 6px;
  min-width: 18px;
  text-align: center;
}

.tabs button.on em {
  background: #d3e3f8;
  color: var(--brand);
}

.kw {
  height: 34px;
  width: 250px;
  font-size: 13px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.item {
  padding: 20px 22px;
}

.i-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: #eef2f8;
  color: var(--brand);
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 13px;
}

.who strong {
  display: block;
  font-size: 13px;
}

.role {
  font-size: 11.5px;
  color: var(--text-3);
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.i-title {
  margin-top: 13px;
  font-size: 15px;
  font-weight: 600;
}

.i-body {
  margin-top: 7px;
  font-size: 13.5px;
  line-height: 1.9;
  color: var(--text-2);
}

.reply {
  margin-top: 13px;
  background: #f7faf8;
  border: 1px solid #e2efe9;
  border-radius: 10px;
  padding: 12px 14px;
}

.r-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.badge {
  font-size: 11px;
  color: var(--ok);
  background: #e2f3ea;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.dim {
  font-size: 11.5px;
  color: var(--text-3);
}

.reply p {
  font-size: 13px;
  line-height: 1.9;
  color: #34504a;
}

.i-foot {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed var(--line-soft);
}

.rp-q {
  display: flex;
  gap: 10px;
  background: #f8fafd;
  border-radius: 10px;
  padding: 14px 16px;
}

.qmark {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--brand-50);
  color: var(--brand);
  font-size: 11.5px;
  font-weight: 600;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.rp-q strong {
  font-size: 13.5px;
}

.rp-q p {
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.85;
  color: var(--text-2);
}
</style>
