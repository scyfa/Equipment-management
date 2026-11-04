<script setup>
import { toastState } from '@/composables/useToast'
</script>

<template>
  <div class="toast-host">
    <transition-group name="toast">
      <div v-for="item in toastState.items" :key="item.id" class="toast" :class="`toast-${item.type}`">
        <span class="toast-icon">
          {{ item.type === 'error' ? '!' : item.type === 'info' ? 'i' : '✓' }}
        </span>
        <span>{{ item.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 42px;
  padding: 9px 18px 9px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: 0 10px 30px rgba(16, 32, 64, 0.14);
  font-size: 13.5px;
  color: var(--text);
  max-width: 460px;
}

.toast-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.toast-success .toast-icon {
  background: var(--ok);
}
.toast-error .toast-icon {
  background: var(--danger);
}
.toast-info .toast-icon {
  background: var(--brand-400);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}
</style>
