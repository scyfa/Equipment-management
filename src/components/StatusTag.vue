<script setup>
import { computed } from 'vue'
import { tenderStatus } from '@/utils/format'

const props = defineProps({
  deadline: { type: String, default: '' },
  showDays: { type: Boolean, default: false }
})

const st = computed(() => tenderStatus(props.deadline))
</script>

<template>
  <span class="tag" :class="st.cls">
    {{ st.label }}
    <template v-if="showDays && st.key === 'closing'">· 剩 {{ st.days }} 天</template>
  </span>
</template>
