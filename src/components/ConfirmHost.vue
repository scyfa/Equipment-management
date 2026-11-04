<script setup>
import BaseModal from './BaseModal.vue'
import { confirmState } from '@/composables/useConfirm'

function done(value) {
  confirmState.visible = false
  const r = confirmState.resolver
  confirmState.resolver = null
  if (r) r(value)
}
</script>

<template>
  <BaseModal
    v-if="confirmState.visible"
    :title="confirmState.title"
    width="420px"
    @close="done(false)"
  >
    <p class="msg">{{ confirmState.message }}</p>
    <template #footer>
      <button class="btn btn-ghost" type="button" @click="done(false)">取消</button>
      <button
        class="btn"
        :class="confirmState.danger ? 'btn-primary danger' : 'btn-primary'"
        type="button"
        @click="done(true)"
      >
        {{ confirmState.confirmText }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.msg {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.75;
}
.danger {
  background: var(--danger);
  box-shadow: 0 6px 16px rgba(200, 63, 63, 0.24);
}
.danger:hover {
  background: #b23434;
}
</style>
