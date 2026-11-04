<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 10 }
})
const emit = defineEmits(['update:page'])

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const list = computed(() => {
  const arr = []
  const end = pages.value
  let start = Math.max(1, props.page - 2)
  if (start + 4 > end) start = Math.max(1, end - 4)
  for (let i = start; i <= end && arr.length < 5; i++) arr.push(i)
  return arr
})

function go(p) {
  if (p < 1 || p > pages.value || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <div v-if="total > pageSize" class="pager">
    <span class="total">共 {{ total }} 条</span>
    <button class="pg" :disabled="page === 1" @click="go(page - 1)">‹</button>
    <button v-for="p in list" :key="p" class="pg" :class="{ on: p === page }" @click="go(p)">
      {{ p }}
    </button>
    <button class="pg" :disabled="page === pages" @click="go(page + 1)">›</button>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  padding: 16px 4px 2px;
}
.total {
  font-size: 12.5px;
  color: var(--text-3);
  margin-right: 8px;
}
.pg {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text-2);
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s;
}
.pg:hover:not(:disabled) {
  border-color: var(--brand-400);
  color: var(--brand);
}
.pg.on {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.pg:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
