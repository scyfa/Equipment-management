<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  width: { type: String, default: '560px' },
  closeOnMask: { type: Boolean, default: true }
})
const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function onMask() {
  if (props.closeOnMask) close()
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="mask" @click.self="onMask">
    <div class="modal" :style="{ width }">
      <header class="modal-head">
        <h3>{{ title }}</h3>
        <button class="x" type="button" aria-label="关闭" @click="close">✕</button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="modal-foot">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(17, 30, 54, 0.42);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 20px 40px;
  overflow-y: auto;
  animation: fadein 0.18s ease;
}

.modal {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(12, 26, 50, 0.25);
  max-width: 100%;
  animation: pop 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line-soft);
}

.modal-head h3 {
  font-size: 16px;
  font-weight: 600;
}

.x {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-3);
  font-size: 14px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
}
.x:hover {
  background: #f2f4f8;
  color: var(--text);
}

.modal-body {
  padding: 22px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--line-soft);
  background: #fbfcfe;
  border-radius: 0 0 14px 14px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
