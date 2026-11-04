<script setup>
import { computed, onMounted, ref } from 'vue'
import { tenderApi, bidApi } from '@/api'
import StatusTag from '@/components/StatusTag.vue'
import { confirm } from '@/composables/useConfirm'
import { toast } from '@/composables/useToast'
import { formatDate, formatWan, tenderStatus } from '@/utils/format'

const rows = ref([])
const bids = ref([])
const loading = ref(true)
const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = 10

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return rows.value.filter((t) => {
    if (statusFilter.value && tenderStatus(t.deadline).key !== statusFilter.value) return false
    if (!kw) return true
    return (
      t.name.toLowerCase().includes(kw) ||
      t.code.toLowerCase().includes(kw) ||
      t.tendererName.toLowerCase().includes(kw)
    )
  })
})

const paged = computed(() => {
  const s = (page.value - 1) * pageSize
  return filtered.value.slice(s, s + pageSize)
})

function bidsOf(id) {
  return bids.value.filter((b) => b.tenderId === id).length
}

async function load() {
  loading.value = true
  try {
    const [ts, bs] = await Promise.all([tenderApi.all(), bidApi.list({})])
    rows.value = ts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    bids.value = bs
  } finally {
    loading.value = false
  }
}

async function remove(t) {
  const ok = await confirm({
    title: '删除招标信息',
    message: `确定删除「${t.name}」（${t.code}）吗？该项目下 ${bidsOf(t.id)} 条投标记录将一并移除，操作不可恢复。`,
    confirmText: '删除',
    danger: true
  })
  if (!ok) return
  try {
    await tenderApi.remove(t.id)
    rows.value = rows.value.filter((r) => r.id !== t.id)
    bids.value = bids.value.filter((b) => b.tenderId !== t.id)
    toast.success('已删除该招标信息')
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
        <h1>招标信息总览</h1>
        <p class="sub">查看全平台招标项目，可下架违规公告；发布与修改由招标单位自行完成</p>
      </div>
    </div>

    <div class="card toolbar">
      <input v-model="keyword" class="input kw" placeholder="搜索设备名称、编号或招标单位" />
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
      <p>没有匹配的招标信息</p>
    </div>

    <div v-else class="card table-wrap">
      <table class="data">
        <thead>
          <tr>
            <th style="width: 146px">项目编号</th>
            <th>设备名称</th>
            <th style="width: 210px">招标单位</th>
            <th style="width: 108px">截止日期</th>
            <th style="width: 108px">保证金</th>
            <th style="width: 72px">投标</th>
            <th style="width: 92px">状态</th>
            <th style="width: 122px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in paged" :key="t.id">
            <td><span class="code-text">{{ t.code }}</span></td>
            <td>
              <strong class="t-name">{{ t.name }}</strong>
              <div class="sub">{{ t.model }}</div>
            </td>
            <td class="dim">{{ t.tendererName }}</td>
            <td>{{ formatDate(t.deadline) }}</td>
            <td>{{ formatWan(t.deposit) }}</td>
            <td>{{ bidsOf(t.id) }}</td>
            <td><StatusTag :deadline="t.deadline" /></td>
            <td>
              <div class="td-actions">
                <router-link :to="`/tenders/${t.id}`" class="btn btn-ghost btn-sm">预览</router-link>
                <button class="btn btn-danger btn-sm" @click="remove(t)">下架</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
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

.sub {
  font-size: 11.5px;
  color: var(--text-3);
  margin-top: 2px;
}

.dim {
  color: var(--text-2);
  font-size: 12.5px;
}
</style>
