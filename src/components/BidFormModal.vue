<script setup>
import BaseModal from './BaseModal.vue'
import { computed, reactive, ref, watch } from 'vue'
import { bidApi } from '@/api'
import { authState } from '@/stores/auth'
import { toast } from '@/composables/useToast'
import { formatMoney, todayStr } from '@/utils/format'

const props = defineProps({
  tender: { type: Object, required: true }
})
const emit = defineEmits(['close', 'done'])

const user = computed(() => authState.user)
const submitting = ref(false)

const form = reactive({
  bidDate: todayStr(),
  bidderName: '',
  legalPerson: '',
  phone: '',
  manufacturer: '',
  produceDate: '',
  shelfLife: '',
  totalAmount: '',
  depositPaidDate: ''
})

const errors = reactive({})

watch(
  () => props.tender,
  (t) => {
    if (!t) return
    form.bidderName = user.value?.name || ''
    form.legalPerson = user.value?.contact || ''
    form.phone = user.value?.phone || ''
    form.manufacturer = user.value?.name || ''
  },
  { immediate: true }
)

const required = {
  bidDate: '请选择投标日期',
  bidderName: '请填写投标单位',
  legalPerson: '请填写法人姓名',
  phone: '请填写联系电话',
  manufacturer: '请填写产品生产厂家',
  produceDate: '请填写生产日期',
  shelfLife: '请填写保质期',
  totalAmount: '请填写投标总金额',
  depositPaidDate: '请选择保证金缴款日期'
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  for (const [key, msg] of Object.entries(required)) {
    const val = form[key]
    if (val === '' || val === null || val === undefined) errors[key] = msg
  }
  if (form.phone && !/^[0-9\-+() ]{7,20}$/.test(form.phone)) {
    errors.phone = '联系电话格式不正确'
  }
  if (form.totalAmount !== '' && Number(form.totalAmount) <= 0) {
    errors.totalAmount = '投标总金额须大于 0'
  }
  return Object.keys(errors).length === 0
}

async function submit() {
  if (!validate()) {
    toast.error('请完整填写投标信息')
    return
  }
  submitting.value = true
  try {
    await bidApi.create({ ...form, tenderId: props.tender.id }, user.value)
    toast.success('投标信息已提交，可在「我的投标」中查看')
    emit('done')
  } catch (e) {
    toast.error(e.message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal title="提交投标信息" width="680px" @close="emit('close')">
    <div class="project-bar">
      <div>
        <span class="pb-label">招标项目</span>
        <strong>{{ tender.name }}</strong>
      </div>
      <span class="code-text">{{ tender.code }}</span>
    </div>

    <div class="form-grid">
      <div class="field">
        <label class="label">招标项目编号</label>
        <input class="input readonly" :value="tender.code" readonly />
      </div>
      <div class="field">
        <label class="label">投标日期<span class="req">*</span></label>
        <input v-model="form.bidDate" type="date" class="input" :class="{ 'is-error': errors.bidDate }" />
        <span v-if="errors.bidDate" class="err-msg">{{ errors.bidDate }}</span>
      </div>

      <div class="field">
        <label class="label">投标单位<span class="req">*</span></label>
        <input
          v-model="form.bidderName"
          class="input"
          :class="{ 'is-error': errors.bidderName }"
          placeholder="填写企业全称"
        />
        <span v-if="errors.bidderName" class="err-msg">{{ errors.bidderName }}</span>
      </div>
      <div class="field">
        <label class="label">法人姓名<span class="req">*</span></label>
        <input
          v-model="form.legalPerson"
          class="input"
          :class="{ 'is-error': errors.legalPerson }"
          placeholder="法定代表人姓名"
        />
        <span v-if="errors.legalPerson" class="err-msg">{{ errors.legalPerson }}</span>
      </div>

      <div class="field">
        <label class="label">联系电话<span class="req">*</span></label>
        <input
          v-model="form.phone"
          class="input"
          :class="{ 'is-error': errors.phone }"
          placeholder="手机号或固定电话"
        />
        <span v-if="errors.phone" class="err-msg">{{ errors.phone }}</span>
      </div>
      <div class="field">
        <label class="label">产品生产厂家<span class="req">*</span></label>
        <input
          v-model="form.manufacturer"
          class="input"
          :class="{ 'is-error': errors.manufacturer }"
          placeholder="设备实际生产厂家"
        />
        <span v-if="errors.manufacturer" class="err-msg">{{ errors.manufacturer }}</span>
      </div>

      <div class="field">
        <label class="label">生产日期<span class="req">*</span></label>
        <input
          v-model="form.produceDate"
          type="month"
          class="input"
          :class="{ 'is-error': errors.produceDate }"
        />
        <span v-if="errors.produceDate" class="err-msg">{{ errors.produceDate }}</span>
      </div>
      <div class="field">
        <label class="label">保质期<span class="req">*</span></label>
        <input
          v-model="form.shelfLife"
          class="input"
          :class="{ 'is-error': errors.shelfLife }"
          placeholder="如：12 个月"
        />
        <span v-if="errors.shelfLife" class="err-msg">{{ errors.shelfLife }}</span>
      </div>

      <div class="field">
        <label class="label">投标总金额（元）<span class="req">*</span></label>
        <input
          v-model="form.totalAmount"
          type="number"
          min="0"
          class="input"
          :class="{ 'is-error': errors.totalAmount }"
          placeholder="0.00"
        />
        <span v-if="errors.totalAmount" class="err-msg">{{ errors.totalAmount }}</span>
        <span v-else class="hint">参考保证金：{{ formatMoney(tender.deposit) }}</span>
      </div>
      <div class="field">
        <label class="label">保证金缴款日期<span class="req">*</span></label>
        <input
          v-model="form.depositPaidDate"
          type="date"
          class="input"
          :class="{ 'is-error': errors.depositPaidDate }"
        />
        <span v-if="errors.depositPaidDate" class="err-msg">{{ errors.depositPaidDate }}</span>
      </div>
    </div>

    <p class="notice">
      提交后投标信息将同步至招标单位，投标截止前如需修改请联系招标单位。请确保填写内容真实有效。
    </p>

    <template #footer>
      <button class="btn btn-ghost" type="button" @click="emit('close')">取消</button>
      <button class="btn btn-primary" type="button" :disabled="submitting" @click="submit">
        {{ submitting ? '提交中…' : '确认提交投标' }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.project-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--brand-50);
  border: 1px solid #dce8f8;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.pb-label {
  font-size: 12px;
  color: var(--brand);
  margin-right: 10px;
}

.project-bar strong {
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 18px;
}

.readonly {
  background: #f6f8fb;
  color: var(--text-3);
}

.notice {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--text-3);
  background: #fafbfd;
  border-radius: 8px;
  padding: 10px 12px;
}

@media (max-width: 620px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
