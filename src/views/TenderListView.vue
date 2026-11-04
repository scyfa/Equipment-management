<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tenderApi } from '@/api'
import StatusTag from '@/components/StatusTag.vue'
import PagerBar from '@/components/PagerBar.vue'
import { formatDate, formatWan } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.keyword || '')
const category = ref('')
const status = ref('')
const sort = ref('deadline')
const page = ref(1)
const pageSize = 8

const rows = ref([])
const total = ref(0)
const loading = ref(true)
const categories = ref([])

async function load() {
  loading.value = true
  try {
    const res = await tenderApi.list({
      keyword: keyword.value,
      category: category.value,
      status: status.value,
      sort: sort.value,
      page: page.value,
      pageSize
    })
    rows.value = res.items
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const visible = computed(() => rows.value)

function search() {
  page.value = 1
  router.replace({ path: '/tenders', query: keyword.value ? { keyword: keyword.value } : {} })
  load()
}

function reset() {
  keyword.value = ''
  category.value = ''
  status.value = ''
  sort.value = 'deadline'
  page.value = 1
  router.replace({ path: '/tenders' })
  load()
}

watch([category, sort, status], () => {
  page.value = 1
  load()
})
watch(page, load)

onMounted(async () => {
  categories.value = await tenderApi.categories()
  load()
})
</script>

<template>
  <div class="list-page">
    <div class="page-hero">
      <div class="container">
        <h1>招标公告</h1>
        <p>共 {{ total }} 条机电设备招标信息 · 数据每日更新</p>
      </div>
    </div>

    <div class="container body">
      <div class="filter card">
        <div class="f-search">
          <span class="ico">🔍</span>
          <input
            v-model="keyword"
            type="text"
            placeholder="输入设备名称、型号或招标项目编号"
            @keyup.enter="search"
          />
          <button class="btn btn-primary btn-sm" @click="search">搜索</button>
        </div>
        <div class="f-row">
          <label class="f-item">
            <span>设备类别</span>
            <select v-model="category" class="select">
              <option value="">全部类别</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>
          <label class="f-item">
            <span>公告状态</span>
            <select v-model="status" class="select">
              <option value="">全部状态</option>
              <option value="open">进行中</option>
              <option value="closing">即将截止</option>
              <option value="closed">已截止</option>
            </select>
          </label>
          <label class="f-item">
            <span>排序方式</span>
            <select v-model="sort" class="select">
              <option value="deadline">按截止日期</option>
              <option value="created">按发布时间</option>
              <option value="quantity">按采购数量</option>
            </select>
          </label>
          <button class="btn btn-ghost btn-sm reset" @click="reset">重置筛选</button>
        </div>
      </div>

      <div v-if="loading" class="loading-list">
        <div v-for="i in 4" :key="i" class="sk"></div>
      </div>

      <div v-else-if="!visible.length" class="card empty">
        <div class="empty-icon">📭</div>
        <p>没有符合条件招标公告，试试调整关键词或筛选条件</p>
        <button class="btn btn-soft btn-sm" style="margin-top: 14px" @click="reset">
          查看全部公告
        </button>
      </div>

      <div v-else class="card table-wrap">
        <table class="data">
          <thead>
            <tr>
              <th style="width: 148px">项目编号</th>
              <th>设备名称 / 型号</th>
              <th style="width: 96px">数量</th>
              <th style="width: 116px">保证金</th>
              <th style="width: 116px">截止日期</th>
              <th style="width: 100px">状态</th>
              <th style="width: 78px">投标</th>
              <th style="width: 86px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in visible" :key="t.id">
              <td><span class="code-text">{{ t.code }}</span></td>
              <td>
                <router-link :to="`/tenders/${t.id}`" class="t-name">{{ t.name }}</router-link>
                <div class="t-sub">{{ t.model }}</div>
              </td>
              <td>{{ t.quantity }} {{ t.unit }}</td>
              <td class="money">{{ formatWan(t.deposit) }}</td>
              <td>{{ formatDate(t.deadline) }}</td>
              <td><StatusTag :deadline="t.deadline" show-days /></td>
              <td>{{ t.bidCount }} 家</td>
              <td>
                <router-link :to="`/tenders/${t.id}`" class="btn btn-soft btn-sm">查看</router-link>
              </td>
            </tr>
          </tbody>
        </table>
        <PagerBar
          v-model:page="page"
          :total="total"
          :page-size="pageSize"
          class="pager-inline"
        />
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
  padding-top: 26px;
  padding-bottom: 40px;
}

.filter {
  padding: 18px 20px;
  margin-bottom: 18px;
}

.f-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line-soft);
}

.f-search .ico {
  opacity: 0.6;
  font-size: 14px;
}

.f-search input {
  flex: 1;
  height: 38px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
}

.f-search input:focus {
  border-color: var(--brand-400);
  box-shadow: 0 0 0 3px rgba(61, 111, 184, 0.12);
}

.f-row {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  padding-top: 15px;
  flex-wrap: wrap;
}

.f-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.f-item > span {
  font-size: 12px;
  color: var(--text-3);
}

.f-item .select {
  height: 34px;
  width: 148px;
  font-size: 13px;
}

.reset {
  margin-left: auto;
}

.t-name {
  font-weight: 500;
  color: var(--text);
}
.t-name:hover {
  color: var(--brand);
}

.t-sub {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}

.money {
  font-variant-numeric: tabular-nums;
  color: var(--text-2);
}

.pager-inline {
  padding: 14px 16px 12px;
  border-top: 1px solid var(--line-soft);
}

.loading-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sk {
  height: 82px;
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

.filter-note {
  margin-top: 12px;
  font-size: 12.5px;
  color: var(--text-3);
}
</style>
