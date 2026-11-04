<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tenderApi } from '@/api'
import { authState } from '@/stores/auth'
import { toast } from '@/composables/useToast'
import { todayStr, formatMoney } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const user = computed(() => authState.user)
const isEdit = computed(() => !!route.params.id)

const categories = [
  '金属切削设备',
  '成型设备',
  '智能制造装备',
  '输配电设备',
  '通用动力设备',
  '环保设备',
  '起重运输设备',
  '检测仪器',
  '其他'
]
const units = ['台', '套', '件', '批', '组']

const form = reactive({
  code: '',
  name: '',
  model: '',
  category: '金属切削设备',
  quantity: 1,
  unit: '台',
  deadline: '',
  deposit: '',
  region: '',
  packing: '',
  description: ''
})

const errors = reactive({})
const loading = ref(false)
const saving = ref(false)

const minDate = todayStr()

function genCode() {
  const d = new Date()
  const tail = String(Math.floor(Math.random() * 9000) + 1000)
  return `JD-${d.getFullYear()}-${tail}`
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!/^JD-\d{4}-\d{4}$/.test(form.code.trim())) {
    errors.code = '项目编号格式为 JD-年份-4位序号，如 JD-2026-0112'
  }
  if (!form.name.trim()) errors.name = '请填写机电设备名称'
  if (!form.model.trim()) errors.model = '请填写型号'
  if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = '数量须大于 0'
  if (!form.deadline) errors.deadline = '请选择招标截止日期'
  else if (form.deadline < minDate) errors.deadline = '截止日期不能早于今天'
  if (form.deposit === '' || Number(form.deposit) < 0) errors.deposit = '请填写投标保证金'
  if (!form.packing.trim()) errors.packing = '请填写包装要求'
  if (!form.description.trim()) errors.description = '请填写技术要求与采购说明'
  else if (form.description.trim().length < 20) errors.description = '技术要求建议不少于 20 字'
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) {
    toast.error('请检查表单中标红项')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await tenderApi.update(route.params.id, { ...form })
      toast.success('招标信息已更新')
    } else {
      await tenderApi.create({ ...form }, user.value)
      toast.success('招标信息发布成功')
    }
    router.push('/console/tenderer/tenders')
  } catch (e) {
    toast.error(e.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const t = await tenderApi.get(route.params.id)
      if (t.tendererId !== user.value.id) {
        toast.error('无权编辑该招标项目')
        router.replace('/console/tenderer/tenders')
        return
      }
      Object.assign(form, {
        code: t.code,
        name: t.name,
        model: t.model,
        category: t.category,
        quantity: t.quantity,
        unit: t.unit,
        deadline: t.deadline,
        deposit: t.deposit,
        region: t.region,
        packing: t.packing,
        description: t.description
      })
    } catch (e) {
      toast.error(e.message)
      router.replace('/console/tenderer/tenders')
    } finally {
      loading.value = false
    }
  } else {
    form.code = genCode()
    form.region = user.value.address ? user.value.address.slice(0, 6) : ''
  }
})
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1>{{ isEdit ? '编辑招标信息' : '发布招标信息' }}</h1>
        <p class="sub">
          {{ isEdit ? '修改后立即对平台厂家可见，请谨慎变更截止日期与保证金' : '填写完整的机电设备招标信息表单，发布后在招标公告中展示' }}
        </p>
      </div>
      <button class="btn btn-ghost" @click="router.push('/console/tenderer/tenders')">返回列表</button>
    </div>

    <div v-if="loading" class="card empty"><p>加载中…</p></div>

    <form v-else class="layout" @submit.prevent="submit">
      <div class="main-col">
        <section class="card block">
          <h2 class="block-title">基本信息</h2>
          <div class="grid2">
            <div class="field">
              <label class="label">招标项目编号<span class="req">*</span></label>
              <div class="code-row">
                <input
                  v-model="form.code"
                  class="input"
                  :class="{ 'is-error': errors.code }"
                  placeholder="JD-2026-0001"
                />
                <button v-if="!isEdit" type="button" class="btn btn-ghost btn-sm" @click="form.code = genCode()">
                  重新生成
                </button>
              </div>
              <span v-if="errors.code" class="err-msg">{{ errors.code }}</span>
            </div>

            <div class="field">
              <label class="label">设备类别</label>
              <select v-model="form.category" class="select">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <div class="field">
              <label class="label">机电设备名称<span class="req">*</span></label>
              <input
                v-model="form.name"
                class="input"
                :class="{ 'is-error': errors.name }"
                placeholder="如：数控立式车床"
              />
              <span v-if="errors.name" class="err-msg">{{ errors.name }}</span>
            </div>

            <div class="field">
              <label class="label">型号<span class="req">*</span></label>
              <input
                v-model="form.model"
                class="input"
                :class="{ 'is-error': errors.model }"
                placeholder="如：VTL-1600 双柱立式"
              />
              <span v-if="errors.model" class="err-msg">{{ errors.model }}</span>
            </div>

            <div class="field">
              <label class="label">数量<span class="req">*</span></label>
              <div class="qty-row">
                <input
                  v-model="form.quantity"
                  type="number"
                  min="1"
                  class="input"
                  :class="{ 'is-error': errors.quantity }"
                />
                <select v-model="form.unit" class="select unit">
                  <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                </select>
              </div>
              <span v-if="errors.quantity" class="err-msg">{{ errors.quantity }}</span>
            </div>

            <div class="field">
              <label class="label">交付地点</label>
              <input v-model="form.region" class="input" placeholder="如：江苏·苏州" />
            </div>

            <div class="field">
              <label class="label">招标截止日期<span class="req">*</span></label>
              <input
                v-model="form.deadline"
                type="date"
                :min="minDate"
                class="input"
                :class="{ 'is-error': errors.deadline }"
              />
              <span v-if="errors.deadline" class="err-msg">{{ errors.deadline }}</span>
            </div>

            <div class="field">
              <label class="label">投标保证金（元）<span class="req">*</span></label>
              <input
                v-model="form.deposit"
                type="number"
                min="0"
                class="input"
                :class="{ 'is-error': errors.deposit }"
                placeholder="0"
              />
              <span v-if="errors.deposit" class="err-msg">{{ errors.deposit }}</span>
              <span v-else-if="form.deposit" class="hint">{{ formatMoney(form.deposit) }}</span>
            </div>
          </div>
        </section>

        <section class="card block">
          <h2 class="block-title">包装要求</h2>
          <div class="field">
            <textarea
              v-model="form.packing"
              class="textarea"
              :class="{ 'is-error': errors.packing }"
              placeholder="如：木箱整体包装，防潮防锈，符合 GB/T 13384 出口包装要求"
            ></textarea>
            <span v-if="errors.packing" class="err-msg">{{ errors.packing }}</span>
          </div>
        </section>

        <section class="card block">
          <h2 class="block-title">技术要求与采购说明</h2>
          <div class="field">
            <textarea
              v-model="form.description"
              class="textarea tall"
              :class="{ 'is-error': errors.description }"
              placeholder="说明主要技术参数、配套要求、交货期、安装调试与质保要求等"
            ></textarea>
            <span v-if="errors.description" class="err-msg">{{ errors.description }}</span>
            <span class="hint">{{ form.description.length }} 字</span>
          </div>
        </section>

        <div class="actions">
          <button type="button" class="btn btn-ghost" @click="router.push('/console/tenderer/tenders')">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? '保存中…' : isEdit ? '保存修改' : '发布招标信息' }}
          </button>
        </div>
      </div>

      <aside class="side-col">
        <div class="card side-card">
          <h3>发布前检查</h3>
          <ul class="check-list">
            <li>项目编号唯一，格式为 JD-年份-序号</li>
            <li>截止日期应留足不少于 20 天的投标期</li>
            <li>保证金金额与招标文件保持一致</li>
            <li>型号与数量须与采购计划相符</li>
            <li>技术要求应明确验收标准</li>
          </ul>
        </div>
        <div class="card side-card preview">
          <h3>公告预览</h3>
          <div class="pv-code">{{ form.code || 'JD-2026-XXXX' }}</div>
          <strong>{{ form.name || '机电设备名称' }}</strong>
          <p class="pv-model">{{ form.model || '型号' }}</p>
          <ul class="pv-list">
            <li><span>数量</span>{{ form.quantity || 0 }} {{ form.unit }}</li>
            <li><span>保证金</span>{{ form.deposit ? formatMoney(form.deposit) : '—' }}</li>
            <li><span>截止</span>{{ form.deadline || '—' }}</li>
            <li><span>单位</span>{{ user.name }}</li>
          </ul>
        </div>
      </aside>
    </form>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 288px;
  gap: 18px;
  align-items: start;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block {
  padding: 22px 24px;
}

.block-title {
  font-size: 14.5px;
  font-weight: 600;
  padding-left: 10px;
  border-left: 3px solid var(--brand);
  line-height: 1.15;
  margin-bottom: 18px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}

.code-row,
.qty-row {
  display: flex;
  gap: 8px;
}

.code-row .input {
  flex: 1;
}

.qty-row .input {
  flex: 1;
}

.unit {
  width: 76px;
  flex-shrink: 0;
}

.tall {
  min-height: 132px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 0 10px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 84px;
}

.side-card {
  padding: 20px;
}

.side-card h3 {
  font-size: 13.5px;
  font-weight: 600;
  margin-bottom: 12px;
}

.check-list li {
  position: relative;
  padding-left: 15px;
  font-size: 12.5px;
  line-height: 1.9;
  color: var(--text-2);
}

.check-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--brand-400);
}

.preview {
  background: linear-gradient(160deg, #fbfdff, #f5f9ff);
}

.pv-code {
  font-family: Consolas, monospace;
  font-size: 11.5px;
  color: var(--brand);
  margin-bottom: 8px;
}

.preview strong {
  font-size: 14.5px;
  font-weight: 600;
  display: block;
}

.pv-model {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 3px;
}

.pv-list {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--line);
}

.pv-list li {
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  padding: 4px 0;
  color: var(--text);
}

.pv-list span {
  color: var(--text-3);
}

@media (max-width: 1080px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side-col {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .side-card {
    flex: 1;
    min-width: 260px;
  }
  .grid2 {
    grid-template-columns: 1fr;
  }
}
</style>
